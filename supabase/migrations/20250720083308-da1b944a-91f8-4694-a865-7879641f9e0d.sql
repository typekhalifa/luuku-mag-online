-- Allow authenticated users (admins) to update comment status and moderation fields
CREATE POLICY "Allow authenticated users to moderate comments" 
ON public.comments 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);