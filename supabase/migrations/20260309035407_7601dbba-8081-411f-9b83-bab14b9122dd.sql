
-- Affiliate links table
CREATE TABLE public.affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL CHECK (product_type IN ('course', 'product')),
  referral_code TEXT NOT NULL UNIQUE,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 30.00,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Affiliate sales table
CREATE TABLE public.affiliate_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_link_id UUID NOT NULL REFERENCES public.affiliate_links(id) ON DELETE CASCADE,
  affiliate_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_email TEXT,
  buyer_name TEXT,
  product_id TEXT NOT NULL,
  product_type TEXT NOT NULL,
  product_title TEXT NOT NULL,
  sale_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Affiliate payouts table
CREATE TABLE public.affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  payout_method TEXT NOT NULL CHECK (payout_method IN ('usdc_base', 'solana', 'paypal', 'bank_transfer')),
  wallet_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for affiliate_links
CREATE POLICY "Users can view own affiliate links" ON public.affiliate_links FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create own affiliate links" ON public.affiliate_links FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own affiliate links" ON public.affiliate_links FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all affiliate links" ON public.affiliate_links FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for affiliate_sales
CREATE POLICY "Users can view own affiliate sales" ON public.affiliate_sales FOR SELECT TO authenticated USING (auth.uid() = affiliate_user_id);
CREATE POLICY "Admins can view all affiliate sales" ON public.affiliate_sales FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert affiliate sales" ON public.affiliate_sales FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS policies for affiliate_payouts
CREATE POLICY "Users can view own payouts" ON public.affiliate_payouts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can request payouts" ON public.affiliate_payouts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all payouts" ON public.affiliate_payouts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update payouts" ON public.affiliate_payouts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at triggers
CREATE TRIGGER update_affiliate_links_updated_at BEFORE UPDATE ON public.affiliate_links FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_affiliate_payouts_updated_at BEFORE UPDATE ON public.affiliate_payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique affiliate referral code
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..10 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;
