-- Create referral_codes table
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Public can read codes to validate them
CREATE POLICY "Anyone can validate referral codes"
ON public.referral_codes
FOR SELECT
USING (true);

-- Insert some initial referral codes for testing
INSERT INTO public.referral_codes (code, is_active) VALUES
  ('ALLTIME2026', true),
  ('20Al1', true),
  ('20Al21', true);