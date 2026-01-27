-- Drop and recreate get_referrer_stats to show ALL approved scholars
DROP FUNCTION IF EXISTS public.get_referrer_stats();

CREATE OR REPLACE FUNCTION public.get_referrer_stats()
RETURNS TABLE (
  referrer_user_id uuid,
  referrer_name text,
  referrer_email text,
  referral_code text,
  is_enabled boolean,
  total_referrals bigint,
  approved_referrals bigint,
  total_wji_earned bigint,
  fraud_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sa.user_id as referrer_user_id,
    sa.full_name as referrer_name,
    sa.email as referrer_email,
    COALESCE(src.referral_code, '') as referral_code,
    COALESCE(src.is_enabled, true) as is_enabled,
    COALESCE((
      SELECT COUNT(*) 
      FROM scholar_referrals sr 
      WHERE sr.referrer_user_id = sa.user_id
    ), 0) as total_referrals,
    COALESCE((
      SELECT COUNT(*) 
      FROM scholar_referrals sr 
      JOIN scholarship_applications ref_app ON sr.referred_user_id = ref_app.user_id
      WHERE sr.referrer_user_id = sa.user_id AND ref_app.status = 'approved'
    ), 0) as approved_referrals,
    COALESCE((
      SELECT SUM(wt.amount) 
      FROM wji_transactions wt 
      WHERE wt.user_id = sa.user_id AND wt.transaction_type = 'referral_bonus'
    ), 0) as total_wji_earned,
    COALESCE((
      SELECT COUNT(*) 
      FROM referral_fraud_flags rff 
      WHERE rff.referrer_user_id = sa.user_id
    ), 0) as fraud_count
  FROM scholarship_applications sa
  LEFT JOIN scholar_referral_codes src ON sa.user_id = src.user_id
  WHERE sa.status = 'approved'
  ORDER BY total_referrals DESC, sa.full_name ASC;
END;
$$;