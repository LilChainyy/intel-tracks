-- Allow updating referral codes (for incrementing usage count)
CREATE POLICY "Anyone can increment referral code usage"
ON public.referral_codes
FOR UPDATE
USING (true)
WITH CHECK (true);