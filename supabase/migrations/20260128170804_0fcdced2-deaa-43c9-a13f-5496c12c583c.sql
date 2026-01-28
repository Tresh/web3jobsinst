-- Allow authenticated users to look up any referral code (for referral tracking)
CREATE POLICY "Authenticated users can look up referral codes"
ON public.scholar_referral_codes
FOR SELECT
USING (auth.uid() IS NOT NULL);