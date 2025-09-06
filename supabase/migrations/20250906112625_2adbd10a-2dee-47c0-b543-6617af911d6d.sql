-- Add RLS policy to allow admins to update contact messages
CREATE POLICY "Admins can update contacts" 
ON public.contacts 
FOR UPDATE 
USING (get_current_user_role() = 'admin'::app_role);