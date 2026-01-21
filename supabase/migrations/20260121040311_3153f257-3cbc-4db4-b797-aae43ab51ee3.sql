-- Create function to increment referral code usage
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