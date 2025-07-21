-- Allow authenticated users to view contact messages
CREATE POLICY "Allow authenticated users to view contacts" 
ON public.contacts 
FOR SELECT 
TO authenticated
USING (true);