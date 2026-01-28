-- Backfill WJI awards for referrals where referred user already completed their first task
-- This handles referrals that existed before the trigger was created

-- Step 1: Update scholar_referrals to mark as awarded where referred user has approved task
UPDATE public.scholar_referrals sr
SET 
  wji_awarded = true,
  wji_awarded_at = now()
WHERE sr.wji_awarded = false
  AND EXISTS (
    SELECT 1 FROM public.scholarship_task_submissions sts
    WHERE sts.user_id = sr.referred_user_id
      AND sts.status = 'approved'
  );

-- Step 2: Create or update WJI balances for referrers who should have earned WJI
INSERT INTO public.wji_balances (user_id, balance, created_at, updated_at)
SELECT 
  sr.referrer_user_id,
  COUNT(*)::integer as balance,
  now(),
  now()
FROM public.scholar_referrals sr
WHERE sr.wji_awarded = true
GROUP BY sr.referrer_user_id
ON CONFLICT (user_id) 
DO UPDATE SET 
  balance = EXCLUDED.balance,
  updated_at = now();

-- Step 3: Create WJI transaction records for referrals that were just backfilled
INSERT INTO public.wji_transactions (user_id, amount, transaction_type, description, reference_id)
SELECT 
  sr.referrer_user_id,
  1,
  'referral_bonus',
  'Referral bonus: referred user completed first task (backfill)',
  sr.id::text
FROM public.scholar_referrals sr
WHERE sr.wji_awarded = true
  AND NOT EXISTS (
    SELECT 1 FROM public.wji_transactions wt 
    WHERE wt.reference_id = sr.id::text 
      AND wt.transaction_type = 'referral_bonus'
  );