-- 1. Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow anyone (including guests) to check if a code exists/is valid
-- This is necessary for the UI to show "Code Valid" before they sign up
DROP POLICY IF EXISTS "Anyone can validate referral codes" ON public.referral_codes;
CREATE POLICY "Anyone can validate referral codes"
ON public.referral_codes
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- 4. Secure Function to Increment Referral Code
-- This version adds a check to ensure only registered users can "burn" a use
CREATE OR REPLACE FUNCTION public.increment_referral_code_use(code_text TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Security Guard: Reject if the caller is not authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Only registered users can apply referral codes.';
  END IF;

  UPDATE public.referral_codes
  SET current_uses = current_uses + 1,
      updated_at = NOW()
  WHERE UPPER(TRIM(code)) = UPPER(TRIM(code_text))
    AND is_active = true
    AND (max_uses IS NULL OR current_uses < max_uses)
    AND (expires_at IS NULL OR expires_at > NOW());

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referral code is invalid, expired, or at max capacity.';
  END IF;
END;
$$;

-- 5. Permissions
-- Only authenticated users can execute the increment logic
REVOKE ALL ON FUNCTION public.increment_referral_code_use(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_referral_code_use(TEXT) TO authenticated;

-- 6. Seed/Cleanup Initial Codes
DELETE FROM public.referral_codes 
WHERE code IN ('EARLY2024', 'BETAUSER', 'INVESTOR');

INSERT INTO public.referral_codes (code, is_active, max_uses) 
VALUES
  ('ALLTIME2026', true, NULL),
  ('20Al1', true, 100),
  ('20Al21', true, 50)
ON CONFLICT (code) DO NOTHING;

-- 7. Apply the Update Trigger
DROP TRIGGER IF EXISTS set_referral_codes_updated_at ON public.referral_codes;
CREATE TRIGGER set_referral_codes_updated_at
    BEFORE UPDATE ON public.referral_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();