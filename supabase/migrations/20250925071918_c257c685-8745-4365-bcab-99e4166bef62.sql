-- Create donations table to track all donation transactions
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  donor_name TEXT,
  donor_email TEXT,
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS on donations table
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Create policies for donations
CREATE POLICY "Admins can view all donations"
  ON public.donations
  FOR SELECT
  USING (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Admins can update donation status"
  ON public.donations
  FOR UPDATE
  USING (get_current_user_role() = 'admin'::app_role);

CREATE POLICY "Public can insert donations"
  ON public.donations
  FOR INSERT
  WITH CHECK (true);

-- Add trigger for updated_at
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();