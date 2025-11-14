-- Add newsletter_subscriptions table with proper structure
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  unsubscribe_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex')
);

-- Enable RLS
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can subscribe" ON public.newsletter_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can check subscription status" ON public.newsletter_subscriptions
  FOR SELECT USING (true);

CREATE POLICY "Admins can view all subscriptions" ON public.newsletter_subscriptions
  FOR SELECT USING (get_current_user_role() = 'admin');

CREATE POLICY "Admins can manage subscriptions" ON public.newsletter_subscriptions
  FOR ALL USING (get_current_user_role() = 'admin');

CREATE POLICY "Public can unsubscribe with token" ON public.newsletter_subscriptions
  FOR UPDATE USING (true);

-- Add missing columns to contacts table for replies
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS replied BOOLEAN DEFAULT false;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS reply_message TEXT;
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS subject TEXT DEFAULT 'Contact Form Message';

-- Migrate existing subscriptions if any
INSERT INTO public.newsletter_subscriptions (email, subscribed_at)
SELECT email, subscribed_at FROM public.subscriptions
ON CONFLICT (email) DO NOTHING;