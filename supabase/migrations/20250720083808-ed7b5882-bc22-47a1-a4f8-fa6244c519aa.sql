-- Add rate limiting for newsletter subscriptions
-- Create a table to track subscription attempts by IP
CREATE TABLE IF NOT EXISTS public.subscription_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  email TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.subscription_attempts ENABLE ROW LEVEL SECURITY;

-- Allow public to insert attempts
CREATE POLICY "Allow public to track subscription attempts" 
ON public.subscription_attempts 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Add unique constraint to prevent duplicate emails
ALTER TABLE public.subscriptions 
ADD CONSTRAINT unique_subscription_email UNIQUE (email);

-- Add email validation constraint to subscriptions table  
ALTER TABLE public.subscriptions 
ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');