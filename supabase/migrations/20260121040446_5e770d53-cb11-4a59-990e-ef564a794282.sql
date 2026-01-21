-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can increment referral code usage" ON public.referral_codes;

-- Grant execute permission on the increment function to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.increment_referral_code_use(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_referral_code_use(TEXT) TO anon;