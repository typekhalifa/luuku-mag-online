-- Fix missing RLS policies for user_roles table
CREATE POLICY "Admin users can manage user roles" 
ON public.user_roles 
FOR ALL 
USING (auth.uid() IN (
  SELECT user_id FROM public.user_roles WHERE role = 'admin'
));

CREATE POLICY "Users can view their own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Add rate limiting table for security
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  action_type text NOT NULL,
  attempt_count integer DEFAULT 1,
  last_attempt timestamp with time zone DEFAULT now(),
  reset_after timestamp with time zone DEFAULT (now() + interval '1 hour')
);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public to track rate limits" 
ON public.rate_limits 
FOR ALL 
USING (true);

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _ip_address inet,
  _action_type text,
  _max_attempts integer DEFAULT 5,
  _window_minutes integer DEFAULT 60
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_attempts integer;
BEGIN
  -- Clean up old entries
  DELETE FROM public.rate_limits 
  WHERE reset_after < now();
  
  -- Get current attempt count
  SELECT COALESCE(attempt_count, 0) INTO current_attempts
  FROM public.rate_limits
  WHERE ip_address = _ip_address 
    AND action_type = _action_type
    AND reset_after > now();
  
  -- Check if limit exceeded
  IF current_attempts >= _max_attempts THEN
    RETURN false;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO public.rate_limits (ip_address, action_type, attempt_count, reset_after)
  VALUES (_ip_address, _action_type, 1, now() + (interval '1 minute' * _window_minutes))
  ON CONFLICT (ip_address, action_type) 
  DO UPDATE SET 
    attempt_count = rate_limits.attempt_count + 1,
    last_attempt = now();
  
  RETURN true;
END;
$$;

-- Add content security function
CREATE OR REPLACE FUNCTION public.sanitize_content(_content text) 
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Remove potentially dangerous content
  _content := regexp_replace(_content, '<script[^>]*>.*?</script>', '', 'gi');
  _content := regexp_replace(_content, 'javascript:', '', 'gi');
  _content := regexp_replace(_content, 'on\w+\s*=', '', 'gi');
  _content := regexp_replace(_content, '<iframe[^>]*>.*?</iframe>', '', 'gi');
  
  -- Limit length
  IF length(_content) > 10000 THEN
    _content := substring(_content from 1 for 10000);
  END IF;
  
  RETURN _content;
END;
$$;

-- Update comments table to use content sanitization
CREATE OR REPLACE FUNCTION public.auto_moderate_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  spam_keywords text[] := ARRAY['spam', 'scam', 'buy now', 'click here', 'free money', 'viagra', 'casino', 'lottery'];
  keyword text;
  cleaned_content text;
BEGIN
  -- Sanitize content first
  NEW.content := public.sanitize_content(NEW.content);
  
  -- Check for spam keywords
  FOREACH keyword IN ARRAY spam_keywords
  LOOP
    IF LOWER(NEW.content) LIKE '%' || keyword || '%' THEN
      NEW.status := 'flagged';
      NEW.is_spam := true;
      NEW.flag_reason := 'Auto-flagged for suspicious content: ' || keyword;
      EXIT;
    END IF;
  END LOOP;
  
  -- Check for excessive caps (more than 60% uppercase)
  IF LENGTH(REGEXP_REPLACE(NEW.content, '[^A-Z]', '', 'g')) > LENGTH(NEW.content) * 0.6 AND LENGTH(NEW.content) > 10 THEN
    NEW.status := 'flagged';
    NEW.flag_reason := 'Auto-flagged for excessive caps';
  END IF;
  
  -- Check for repeated characters (spam pattern)
  IF NEW.content ~ '(.)\1{4,}' THEN
    NEW.status := 'flagged';
    NEW.flag_reason := 'Auto-flagged for repeated characters';
  END IF;
  
  -- Auto-approve short, clean comments
  IF NEW.status IS NULL AND LENGTH(NEW.content) < 100 AND NEW.content !~ '[^a-zA-Z0-9\s\.,\!\?\-_]' THEN
    NEW.status := 'approved';
  END IF;
  
  RETURN NEW;
END;
$$;