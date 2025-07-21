-- Add RLS policy to allow authenticated users (admins) to view subscriptions
CREATE POLICY "Allow authenticated users to view subscriptions" 
ON public.subscriptions 
FOR SELECT 
TO authenticated
USING (true);