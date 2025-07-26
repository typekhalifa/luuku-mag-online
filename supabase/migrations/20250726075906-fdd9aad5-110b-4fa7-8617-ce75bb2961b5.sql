-- Create site_settings table for centralized configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  setting_key text NOT NULL UNIQUE,
  setting_value jsonb NOT NULL,
  setting_type text NOT NULL DEFAULT 'general'
);

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for site_settings
CREATE POLICY "Authenticated users can view site settings"
  ON public.site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin users can manage site settings"
  ON public.site_settings FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role = 'admin'
    )
  );

-- Insert default site settings
INSERT INTO public.site_settings (setting_key, setting_value, setting_type) VALUES
  ('site_name', '"Luuku Magazine"', 'general'),
  ('site_description', '"Your trusted source for news and updates"', 'general'),
  ('site_url', '"https://luuku-mag-online.vercel.app"', 'general'),
  ('contact_email', '"contact@luukumag.com"', 'general'),
  ('social_media', '{"facebook":"","twitter":"","instagram":"","linkedin":""}', 'social'),
  ('features', '{"commentsEnabled":true,"likesEnabled":true,"newsletterEnabled":true,"donationsEnabled":true}', 'features'),
  ('seo_meta', '{"metaTitle":"Luuku Magazine - Latest News & Updates","metaDescription":"Stay informed with the latest news, technology updates, and opportunities from around the world.","metaKeywords":"news, technology, world, opportunities, magazine"}', 'seo')
ON CONFLICT (setting_key) DO NOTHING;

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create admin_invites table for tracking admin invitations
CREATE TABLE IF NOT EXISTS public.admin_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'editor',
  invited_by uuid REFERENCES auth.users(id),
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  used boolean NOT NULL DEFAULT false
);

-- Enable RLS on admin_invites
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admin_invites
CREATE POLICY "Admin users can manage invites"
  ON public.admin_invites FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role = 'admin'
    )
  );