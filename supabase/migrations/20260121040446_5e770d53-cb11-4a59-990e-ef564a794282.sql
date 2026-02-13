-- 1. Remove the permissive UPDATE policy
-- This ensures guests cannot bypass your logic via direct table updates
DROP POLICY IF EXISTS "Anyone can increment referral code usage" ON public.referral_codes;

-- 2. Revoke all existing permissions to reset the baseline
REVOKE ALL ON FUNCTION public.increment_referral_code_use(TEXT) FROM public;
REVOKE ALL ON FUNCTION public.increment_referral_code_use(TEXT) FROM anon;

-- 3. Grant execution ONLY to authenticated users
-- This prevents any guest (anon) from incrementing a code
GRANT EXECUTE ON FUNCTION public.increment_referral_code_use(TEXT) TO authenticated;

-- 4. Ensure RLS is active and restrictive
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- 5. Standard Select Policy
-- Guests can still 'see' if a code exists (to validate on the signup form),
-- but they cannot change its state.
DROP POLICY IF EXISTS "Anyone can validate referral codes" ON public.referral_codes;
CREATE POLICY "Anyone can validate referral codes"
ON public.referral_codes
FOR SELECT
USING (is_active = true);