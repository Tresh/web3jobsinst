
-- LearnFi Modules table
CREATE TABLE public.learnfi_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.learnfi_programs(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  video_url TEXT,
  video_duration TEXT,
  cover_image_url TEXT,
  xp_value INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.learnfi_modules ENABLE ROW LEVEL SECURITY;

-- Anyone can view published modules of published programs
CREATE POLICY "Anyone can view published learnfi modules"
ON public.learnfi_modules FOR SELECT
USING (is_published = true AND EXISTS (
  SELECT 1 FROM public.learnfi_programs p
  WHERE p.id = learnfi_modules.program_id
  AND p.status IN ('live', 'coming_soon', 'closed')
));

-- Admins can manage all modules
CREATE POLICY "Admins can manage all learnfi modules"
ON public.learnfi_modules FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_learnfi_modules_updated_at
BEFORE UPDATE ON public.learnfi_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LearnFi Missions table
CREATE TABLE public.learnfi_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.learnfi_programs(id) ON DELETE CASCADE,
  module_id UUID REFERENCES public.learnfi_modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL DEFAULT 'submission',
  external_link TEXT,
  xp_value INTEGER NOT NULL DEFAULT 10,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.learnfi_missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published learnfi missions"
ON public.learnfi_missions FOR SELECT
USING (is_published = true AND EXISTS (
  SELECT 1 FROM public.learnfi_programs p
  WHERE p.id = learnfi_missions.program_id
  AND p.status IN ('live', 'coming_soon', 'closed')
));

CREATE POLICY "Admins can manage all learnfi missions"
ON public.learnfi_missions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_learnfi_missions_updated_at
BEFORE UPDATE ON public.learnfi_missions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- LearnFi Mission Submissions table
CREATE TABLE public.learnfi_mission_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID NOT NULL REFERENCES public.learnfi_missions(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES public.learnfi_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  submission_text TEXT,
  submission_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  xp_awarded INTEGER,
  rejection_reason TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(mission_id, user_id)
);

ALTER TABLE public.learnfi_mission_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learnfi submissions"
ON public.learnfi_mission_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own learnfi submissions"
ON public.learnfi_mission_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending learnfi submissions"
ON public.learnfi_mission_submissions FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all learnfi submissions"
ON public.learnfi_mission_submissions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_learnfi_mission_submissions_updated_at
BEFORE UPDATE ON public.learnfi_mission_submissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger to update participant XP when submission approved
CREATE OR REPLACE FUNCTION public.update_learnfi_participant_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.xp_awarded IS NOT NULL AND NEW.xp_awarded > 0 THEN
    IF (OLD.status IS DISTINCT FROM 'approved') OR (OLD.xp_awarded IS NULL AND NEW.xp_awarded IS NOT NULL) THEN
      UPDATE public.learnfi_participants
      SET total_xp = total_xp + NEW.xp_awarded,
          missions_completed = missions_completed + 1,
          last_active_at = now()
      WHERE program_id = NEW.program_id AND user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_learnfi_participant_xp_trigger
AFTER UPDATE ON public.learnfi_mission_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_learnfi_participant_xp();

-- Leaderboard function
CREATE OR REPLACE FUNCTION public.get_learnfi_leaderboard(p_program_id uuid)
RETURNS TABLE(user_id uuid, user_name text, user_avatar text, total_xp integer, missions_completed integer, rank bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT
    lp.user_id,
    COALESCE(p.full_name, 'Anonymous') as user_name,
    p.avatar_url as user_avatar,
    lp.total_xp,
    lp.missions_completed,
    ROW_NUMBER() OVER (ORDER BY lp.total_xp DESC, lp.joined_at ASC) as rank
  FROM public.learnfi_participants lp
  LEFT JOIN public.profiles p ON lp.user_id = p.user_id
  WHERE lp.program_id = p_program_id
  ORDER BY lp.total_xp DESC, lp.joined_at ASC;
$$;
