-- Backfill missing referral records for users who signed up with referral codes
INSERT INTO public.scholar_referrals (referrer_user_id, referred_user_id, referral_code, created_at, wji_awarded)
SELECT 
  rc.user_id as referrer_user_id,
  u.id as referred_user_id,
  u.raw_user_meta_data->>'referral_code' as referral_code,
  u.created_at,
  false as wji_awarded
FROM auth.users u
JOIN public.scholar_referral_codes rc 
  ON rc.referral_code = u.raw_user_meta_data->>'referral_code'
WHERE u.raw_user_meta_data->>'referral_code' IS NOT NULL
  AND rc.user_id != u.id
  AND NOT EXISTS (
    SELECT 1 FROM public.scholar_referrals sr 
    WHERE sr.referred_user_id = u.id
  )
ON CONFLICT DO NOTHING;