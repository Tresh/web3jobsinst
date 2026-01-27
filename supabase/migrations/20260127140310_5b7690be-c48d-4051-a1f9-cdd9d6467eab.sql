-- =============================================
-- WJI REFERRAL SYSTEM - ISOLATED FROM XP
-- Time-boxed until Sunday 23:59 UTC
-- =============================================

-- 1. Scholar referral codes (one per approved scholar)
CREATE TABLE public.scholar_referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  referral_code TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Referral relationships (track who referred whom)
CREATE TABLE public.scholar_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID NOT NULL UNIQUE,
  referral_code TEXT NOT NULL,
  signup_ip TEXT,
  wji_awarded BOOLEAN DEFAULT false,
  wji_awarded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. WJI balance (separate from XP)
CREATE TABLE public.wji_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. WJI transaction ledger (audit trail)
CREATE TABLE public.wji_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- 'referral', 'task', 'course', 'module'
  reference_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 5. Referral fraud flags (for admin visibility)
CREATE TABLE public.referral_fraud_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL,
  referred_user_id UUID,
  rule_triggered TEXT NOT NULL, -- 'self_referral', 'ip_abuse', 'referral_cap_exceeded'
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scholar_referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholar_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wji_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wji_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_fraud_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scholar_referral_codes
CREATE POLICY "Users can view their own referral code"
  ON public.scholar_referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all referral codes"
  ON public.scholar_referral_codes FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update referral codes"
  ON public.scholar_referral_codes FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for scholar_referrals
CREATE POLICY "Users can view referrals they made"
  ON public.scholar_referrals FOR SELECT
  USING (auth.uid() = referrer_user_id);

CREATE POLICY "Admins can view all referrals"
  ON public.scholar_referrals FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for wji_balances
CREATE POLICY "Users can view their own WJI balance"
  ON public.wji_balances FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all WJI balances"
  ON public.wji_balances FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for wji_transactions
CREATE POLICY "Users can view their own WJI transactions"
  ON public.wji_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all WJI transactions"
  ON public.wji_transactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for referral_fraud_flags
CREATE POLICY "Admins can view fraud flags"
  ON public.referral_fraud_flags FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert fraud flags"
  ON public.referral_fraud_flags FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Indexes for performance
CREATE INDEX idx_scholar_referrals_referrer ON public.scholar_referrals(referrer_user_id);
CREATE INDEX idx_scholar_referrals_referred ON public.scholar_referrals(referred_user_id);
CREATE INDEX idx_wji_transactions_user ON public.wji_transactions(user_id);
CREATE INDEX idx_referral_fraud_flags_referrer ON public.referral_fraud_flags(referrer_user_id);

-- Trigger to update wji_balances.updated_at
CREATE TRIGGER update_wji_balances_updated_at
  BEFORE UPDATE ON public.wji_balances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

-- Function to get referrer stats for admin dashboard
CREATE OR REPLACE FUNCTION public.get_referrer_stats()
RETURNS TABLE (
  referrer_user_id UUID,
  referrer_name TEXT,
  referrer_email TEXT,
  referral_code TEXT,
  is_enabled BOOLEAN,
  total_referrals BIGINT,
  approved_referrals BIGINT,
  total_wji_earned BIGINT,
  fraud_count BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    src.user_id as referrer_user_id,
    sa.full_name as referrer_name,
    sa.email as referrer_email,
    src.referral_code,
    src.is_enabled,
    COALESCE((SELECT COUNT(*) FROM scholar_referrals sr WHERE sr.referrer_user_id = src.user_id), 0) as total_referrals,
    COALESCE((SELECT COUNT(*) FROM scholar_referrals sr 
      JOIN scholarship_applications sapp ON sr.referred_user_id = sapp.user_id 
      WHERE sr.referrer_user_id = src.user_id AND sapp.status = 'approved'), 0) as approved_referrals,
    COALESCE((SELECT SUM(wt.amount) FROM wji_transactions wt 
      WHERE wt.user_id = src.user_id AND wt.transaction_type = 'referral'), 0) as total_wji_earned,
    COALESCE((SELECT COUNT(*) FROM referral_fraud_flags rff WHERE rff.referrer_user_id = src.user_id), 0) as fraud_count
  FROM scholar_referral_codes src
  JOIN scholarship_applications sa ON src.user_id = sa.user_id
  WHERE sa.status = 'approved'
  ORDER BY total_referrals DESC;
$$;

-- Function to get referred users by referrer
CREATE OR REPLACE FUNCTION public.get_referred_users(p_referrer_id UUID)
RETURNS TABLE (
  referred_user_id UUID,
  referred_name TEXT,
  referred_email TEXT,
  signup_date TIMESTAMP WITH TIME ZONE,
  scholarship_status TEXT,
  approval_date TIMESTAMP WITH TIME ZONE,
  wji_generated INTEGER
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    sr.referred_user_id,
    COALESCE(sa.full_name, p.full_name) as referred_name,
    COALESCE(sa.email, p.email) as referred_email,
    sr.created_at as signup_date,
    COALESCE(sa.status::text, 'no_application') as scholarship_status,
    sa.reviewed_at as approval_date,
    CASE WHEN sr.wji_awarded THEN 1 ELSE 0 END as wji_generated
  FROM scholar_referrals sr
  LEFT JOIN scholarship_applications sa ON sr.referred_user_id = sa.user_id
  LEFT JOIN profiles p ON sr.referred_user_id = p.user_id
  WHERE sr.referrer_user_id = p_referrer_id
  ORDER BY sr.created_at DESC;
$$;