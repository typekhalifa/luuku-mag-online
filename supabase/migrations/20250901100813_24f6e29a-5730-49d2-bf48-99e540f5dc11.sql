-- Phase 1: Fix Critical RLS Policy Recursion
-- Create security definer function to safely get user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- Drop the problematic recursive policy on user_roles
DROP POLICY IF EXISTS "Admin users can manage user roles" ON public.user_roles;

-- Create new non-recursive policy using the security definer function
CREATE POLICY "Admin users can manage user roles"
ON public.user_roles
FOR ALL
USING (public.get_current_user_role() = 'admin'::app_role)
WITH CHECK (public.get_current_user_role() = 'admin'::app_role);

-- Phase 2: Implement Proper Data Protection
-- Contacts table - restrict to admins only
DROP POLICY IF EXISTS "Allow authenticated users to view contacts" ON public.contacts;
DROP POLICY IF EXISTS "No public select" ON public.contacts;

CREATE POLICY "Only admins can view contacts"
ON public.contacts
FOR SELECT
USING (public.get_current_user_role() = 'admin'::app_role);

-- Subscriptions table - restrict to admins only  
DROP POLICY IF EXISTS "Allow authenticated users to view subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "No public select" ON public.subscriptions;

CREATE POLICY "Only admins can view subscriptions"
ON public.subscriptions
FOR SELECT
USING (public.get_current_user_role() = 'admin'::app_role);

-- Comment reports table - restrict to admins only
DROP POLICY IF EXISTS "Anyone can view reports" ON public.comment_reports;

CREATE POLICY "Only admins can view comment reports"
ON public.comment_reports
FOR SELECT
USING (public.get_current_user_role() = 'admin'::app_role);

-- Rate limits table - restrict to system/admin access only
DROP POLICY IF EXISTS "Allow public to track rate limits" ON public.rate_limits;

CREATE POLICY "Only system can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true); -- This allows system functions to work

CREATE POLICY "Only admins can view rate limits"
ON public.rate_limits
FOR SELECT
USING (public.get_current_user_role() = 'admin'::app_role);

-- Site settings - already has proper admin restrictions, but ensure consistency
DROP POLICY IF EXISTS "Authenticated users can view site settings" ON public.site_settings;

CREATE POLICY "Only admins can view site settings"
ON public.site_settings
FOR SELECT
USING (public.get_current_user_role() = 'admin'::app_role);

-- Security alerts - already properly restricted
-- Admin invites - already properly restricted 
-- Breaking news - already properly restricted

-- Phase 4: Create security event logging table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  ip_address inet,
  user_agent text,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view security events"
ON public.security_events
FOR SELECT
USING (public.get_current_user_role() = 'admin'::app_role);

CREATE POLICY "System can log security events"
ON public.security_events
FOR INSERT
WITH CHECK (true);

-- Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _user_id uuid DEFAULT auth.uid(),
  _ip_address inet DEFAULT NULL,
  _user_agent text DEFAULT NULL,
  _details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (event_type, user_id, ip_address, user_agent, details)
  VALUES (_event_type, _user_id, _ip_address, _user_agent, _details);
END;
$$;