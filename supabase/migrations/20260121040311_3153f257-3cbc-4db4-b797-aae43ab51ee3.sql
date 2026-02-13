-- Create function to securely increment referral code usage
CREATE OR REPLACE FUNCTION public.increment_referral_code_use(code_text TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    target_code TEXT := UPPER(TRIM(code_text));
BEGIN
  -- 1. Security Guard: Prevent guests from executing this logic
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Only registered users can apply referral codes.';
  END IF;

  -- 2. Atomic Update: Only increment if the code is valid and has room
  UPDATE public.referral_codes
  SET 
    current_uses = current_uses + 1,
    updated_at = NOW()
  WHERE code = target_code
    AND is_active = true
    AND (max_uses IS NULL OR current_uses < max_uses)
    AND (expires_at IS NULL OR expires_at > NOW());

  -- 3. Validation: If no rows were affected, the code was either wrong or invalid
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Referral code is invalid, expired, or at maximum capacity.';
  END IF;
END;
$$;

-- 4. Restrict Execution Permissions
-- Remove public execution to prevent any anonymous calls
REVOKE ALL ON FUNCTION public.increment_referral_code_use(TEXT) FROM public;
GRANT EXECUTE ON FUNCTION public.increment_referral_code_use(TEXT) TO authenticated;