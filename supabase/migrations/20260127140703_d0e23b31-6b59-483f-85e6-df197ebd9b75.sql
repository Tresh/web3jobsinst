-- Add INSERT policies for scholar_referrals so referral tracking works
CREATE POLICY "System can insert referrals"
  ON public.scholar_referrals FOR INSERT
  WITH CHECK (true);

-- Add INSERT policy for scholar_referral_codes
CREATE POLICY "System can insert referral codes"
  ON public.scholar_referral_codes FOR INSERT
  WITH CHECK (true);

-- Add INSERT and UPDATE policies for wji_balances
CREATE POLICY "System can insert WJI balances"
  ON public.wji_balances FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update WJI balances"
  ON public.wji_balances FOR UPDATE
  USING (true);

-- Add INSERT policy for wji_transactions
CREATE POLICY "System can insert WJI transactions"
  ON public.wji_transactions FOR INSERT
  WITH CHECK (true);