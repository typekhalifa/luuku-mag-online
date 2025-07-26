-- Fix search path security warnings for existing functions
CREATE OR REPLACE FUNCTION public.auto_moderate_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  spam_keywords text[] := ARRAY['spam', 'scam', 'buy now', 'click here', 'free money'];
  keyword text;
BEGIN
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
  
  -- Check for excessive caps (more than 50% uppercase)
  IF LENGTH(REGEXP_REPLACE(NEW.content, '[^A-Z]', '', 'g')) > LENGTH(NEW.content) * 0.5 AND LENGTH(NEW.content) > 10 THEN
    NEW.status := 'flagged';
    NEW.flag_reason := 'Auto-flagged for excessive caps';
  END IF;
  
  -- Auto-approve short, clean comments (basic heuristic)
  IF NEW.status IS NULL AND LENGTH(NEW.content) < 100 AND NEW.content !~ '[^a-zA-Z0-9\s\.,\!\?]' THEN
    NEW.status := 'approved';
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_comment_reaction_counts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.reaction_type = 'like' THEN
      UPDATE public.comments SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction_type = 'dislike' THEN
      UPDATE public.comments SET dislikes_count = COALESCE(dislikes_count, 0) + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.reaction_type = 'like' THEN
      UPDATE public.comments SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction_type = 'dislike' THEN
      UPDATE public.comments SET dislikes_count = GREATEST(COALESCE(dislikes_count, 0) - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle reaction type change
    IF OLD.reaction_type = 'like' THEN
      UPDATE public.comments SET likes_count = GREATEST(COALESCE(likes_count, 0) - 1, 0) WHERE id = OLD.comment_id;
    ELSIF OLD.reaction_type = 'dislike' THEN
      UPDATE public.comments SET dislikes_count = GREATEST(COALESCE(dislikes_count, 0) - 1, 0) WHERE id = OLD.comment_id;
    END IF;
    
    IF NEW.reaction_type = 'like' THEN
      UPDATE public.comments SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = NEW.comment_id;
    ELSIF NEW.reaction_type = 'dislike' THEN
      UPDATE public.comments SET dislikes_count = COALESCE(dislikes_count, 0) + 1 WHERE id = NEW.comment_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;