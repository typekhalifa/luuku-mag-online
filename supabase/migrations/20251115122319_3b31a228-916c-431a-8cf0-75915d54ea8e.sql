-- Create newsletter campaigns table to store campaign history
CREATE TABLE IF NOT EXISTS public.newsletter_campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  template_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  recipients_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.newsletter_campaigns ENABLE ROW LEVEL SECURITY;

-- Admin users can manage campaigns
CREATE POLICY "Admins can manage campaigns"
ON public.newsletter_campaigns
FOR ALL
USING (get_current_user_role() = 'admin'::app_role);

-- Create index for better performance
CREATE INDEX idx_newsletter_campaigns_status ON public.newsletter_campaigns(status);
CREATE INDEX idx_newsletter_campaigns_created_at ON public.newsletter_campaigns(created_at DESC);