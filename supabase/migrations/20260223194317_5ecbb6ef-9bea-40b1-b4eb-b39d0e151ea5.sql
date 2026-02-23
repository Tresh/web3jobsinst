
-- LearnFi Programs table
CREATE TABLE public.learnfi_programs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Program info
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT NOT NULL DEFAULT 'beginner',
  duration_days INTEGER NOT NULL DEFAULT 30,
  
  -- Project/Partner info
  project_name TEXT NOT NULL,
  project_logo_url TEXT,
  project_website TEXT,
  partner_name TEXT,
  partner_email TEXT,
  
  -- Rewards
  reward_type TEXT NOT NULL DEFAULT 'xp',
  reward_amount NUMERIC,
  reward_token_symbol TEXT,
  reward_pool_size NUMERIC,
  reward_distribution_method TEXT DEFAULT 'manual',
  
  -- Chain/wallet info for on-chain rewards (Phase 2)
  chain_network TEXT,
  token_contract_address TEXT,
  
  -- Status & counts
  status TEXT NOT NULL DEFAULT 'pending_approval',
  participants_count INTEGER NOT NULL DEFAULT 0,
  max_participants INTEGER,
  
  -- Admin
  created_by UUID,
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learnfi_programs ENABLE ROW LEVEL SECURITY;

-- Anyone can view live/coming_soon programs (public page)
CREATE POLICY "Anyone can view published learnfi programs"
ON public.learnfi_programs FOR SELECT
USING (status IN ('live', 'coming_soon', 'closed'));

-- Admins can manage all programs
CREATE POLICY "Admins can manage all learnfi programs"
ON public.learnfi_programs FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can submit a program proposal (public form)
CREATE POLICY "Anyone can submit learnfi program proposals"
ON public.learnfi_programs FOR INSERT
WITH CHECK (status = 'pending_approval');

-- Creators can view their own submissions
CREATE POLICY "Creators can view own learnfi programs"
ON public.learnfi_programs FOR SELECT
USING (created_by = auth.uid());

-- LearnFi Participants table
CREATE TABLE public.learnfi_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.learnfi_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  total_xp INTEGER NOT NULL DEFAULT 0,
  missions_completed INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_active_at TIMESTAMPTZ DEFAULT now(),
  
  -- Wallet for on-chain rewards (Phase 2)
  wallet_address TEXT,
  
  UNIQUE(program_id, user_id)
);

ALTER TABLE public.learnfi_participants ENABLE ROW LEVEL SECURITY;

-- Anyone can view participant counts (for leaderboard)
CREATE POLICY "Anyone can view learnfi participants"
ON public.learnfi_participants FOR SELECT
USING (true);

-- Authenticated users can join programs
CREATE POLICY "Authenticated users can join learnfi programs"
ON public.learnfi_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update own participation
CREATE POLICY "Users can update own learnfi participation"
ON public.learnfi_participants FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all participants
CREATE POLICY "Admins can manage all learnfi participants"
ON public.learnfi_participants FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Update timestamp trigger
CREATE TRIGGER update_learnfi_programs_updated_at
BEFORE UPDATE ON public.learnfi_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-increment participant count
CREATE OR REPLACE FUNCTION public.update_learnfi_participant_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.learnfi_programs
    SET participants_count = participants_count + 1
    WHERE id = NEW.program_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.learnfi_programs
    SET participants_count = participants_count - 1
    WHERE id = OLD.program_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_learnfi_participant_count_trigger
AFTER INSERT OR DELETE ON public.learnfi_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_learnfi_participant_count();
