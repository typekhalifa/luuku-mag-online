-- Add DELETE policy for admins on newsletter_subscriptions
CREATE POLICY "Admins can delete subscriptions"
ON public.newsletter_subscriptions
FOR DELETE
USING (get_current_user_role() = 'admin'::app_role);