-- 1. Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow anyone (including guests) to validate codes (SELECT only)
-- This allows the UI to check if a code is real before the user submits their signup form.
DROP POLICY IF EXISTS "Anyone can validate referral codes" ON public.referral_codes;
CREATE POLICY "Anyone can validate referral codes"
ON public.referral_codes
FOR SELECT
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > NOW())
  AND (max_uses IS NULL OR current_uses < max_uses)
);

-- 4. Prevent direct client-side updates to referral codes
-- Only the service_role (your backend/functions) should increment usage
DROP POLICY IF EXISTS "Prevent public updates to referral codes" ON public.referral_codes;
CREATE POLICY "Prevent public updates to referral codes"
ON public.referral_codes
FOR UPDATE
TO service_role
USING (true);

-- 5. Insert initial referral codes for 2026
-- Using ON CONFLICT to prevent duplicate errors on re-runs
INSERT INTO public.referral_codes (code, is_active) VALUES
  ('ALLTIME2026', true),
  ('20Al1', true),
  ('20Al21', true)
ON CONFLICT (code) DO NOTHING;

-- 6. Apply automated timestamp trigger
DROP TRIGGER IF EXISTS set_referral_codes_updated_at ON public.referral_codes;
CREATE TRIGGER set_referral_codes_updated_at
    BEFORE UPDATE ON public.referral_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();