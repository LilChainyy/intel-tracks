-- 1. Remove the insecure public update policy
DROP POLICY IF EXISTS "Anyone can increment referral code usage" ON public.referral_codes;

-- 2. Create a restricted policy that blocks all client-side updates
-- This forces all usage increments to go through your 'increment_referral_code_use' function
CREATE POLICY "Restrict updates to service role"
ON public.referral_codes
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- 3. Double-check that standard users cannot update the table directly
-- (They will still be able to SELECT to validate codes based on the previous policies)
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;