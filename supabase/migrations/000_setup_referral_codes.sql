-- ============================================
-- REFERRAL CODES SETUP
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Step 2: Enable RLS
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Step 3: Policy to allow anyone to validate referral codes
DROP POLICY IF EXISTS "Anyone can validate referral codes" ON public.referral_codes;
CREATE POLICY "Anyone can validate referral codes"
ON public.referral_codes
FOR SELECT
USING (true);

-- Step 4: Create function to increment referral code usage
CREATE OR REPLACE FUNCTION public.increment_referral_code_use(code_text TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.referral_codes
  SET current_uses = current_uses + 1
  WHERE code = UPPER(TRIM(code_text));
END;
$$;

-- Step 5: Grant execute permission on the increment function
GRANT EXECUTE ON FUNCTION public.increment_referral_code_use(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_referral_code_use(TEXT) TO anon;

-- Step 6: Clean up old referral codes (if they exist)
DELETE FROM public.referral_codes 
WHERE code IN ('EARLY2024', 'BETAUSER', 'INVESTOR');

-- Step 7: Insert initial referral codes (only if they don't exist)
INSERT INTO public.referral_codes (code, is_active) 
VALUES
  ('ALLTIME2026', true),
  ('20Al1', true),
  ('20Al21', true)
ON CONFLICT (code) DO NOTHING;

-- Verify the setup
SELECT 'Referral codes setup complete!' as status;
SELECT code, is_active, current_uses, max_uses, expires_at 
FROM public.referral_codes 
ORDER BY created_at;
