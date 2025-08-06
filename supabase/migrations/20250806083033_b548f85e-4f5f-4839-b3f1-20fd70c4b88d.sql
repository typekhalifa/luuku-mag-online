-- Create DDoS protection tables and functions
CREATE TABLE IF NOT EXISTS public.ddos_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address INET NOT NULL,
  blocked_until TIMESTAMP WITH TIME ZONE NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ip_address)
);

CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  ip_address INET,
  details JSONB,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.ddos_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Admin-only access policies
CREATE POLICY "Admins can view DDoS blocks" ON public.ddos_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can manage DDoS blocks" ON public.ddos_blocks
  FOR ALL USING (true);

CREATE POLICY "Admins can view security alerts" ON public.security_alerts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create security alerts" ON public.security_alerts
  FOR INSERT WITH CHECK (true);

-- Function to check if IP is blocked
CREATE OR REPLACE FUNCTION public.is_ip_blocked(check_ip INET)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.ddos_blocks 
    WHERE ip_address = check_ip 
    AND blocked_until > now()
  );
END;
$$;

-- Function to auto-cleanup expired blocks
CREATE OR REPLACE FUNCTION public.cleanup_expired_blocks()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.ddos_blocks 
  WHERE blocked_until < now();
END;
$$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ddos_blocks_ip_time ON public.ddos_blocks(ip_address, blocked_until);
CREATE INDEX IF NOT EXISTS idx_security_alerts_created ON public.security_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_severity ON public.security_alerts(severity, created_at DESC);