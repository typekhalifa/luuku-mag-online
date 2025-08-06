-- Fix search_path for security functions
CREATE OR REPLACE FUNCTION public.is_ip_blocked(check_ip INET)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.ddos_blocks 
    WHERE ip_address = check_ip 
    AND blocked_until > now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_expired_blocks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.ddos_blocks 
  WHERE blocked_until < now();
END;
$$;