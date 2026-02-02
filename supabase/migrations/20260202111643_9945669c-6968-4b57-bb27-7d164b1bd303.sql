-- =====================================================
-- BOOTCAMP SYSTEM DATABASE SCHEMA
-- =====================================================

-- Bootcamp status enum
CREATE TYPE public.bootcamp_status AS ENUM ('draft', 'pending_approval', 'approved', 'active', 'completed', 'rejected', 'cancelled');

-- Bootcamp type enum
CREATE TYPE public.bootcamp_type AS ENUM ('free', 'paid');

-- Bootcamp pricing tier enum
CREATE TYPE public.bootcamp_pricing_model AS ENUM ('fixed_fee', 'revenue_share');

-- =====================================================
-- BOOTCAMPS TABLE (Main bootcamp records)
-- =====================================================
CREATE TABLE public.bootcamps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL DEFAULT 20,
  host_user_id UUID NOT NULL,
  host_name TEXT NOT NULL,
  bootcamp_type public.bootcamp_type NOT NULL DEFAULT 'free',
  pricing_model public.bootcamp_pricing_model,
  price_amount DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  revenue_share_percent INTEGER,
  max_participants INTEGER NOT NULL DEFAULT 100,
  current_participants INTEGER NOT NULL DEFAULT 0,
  status public.bootcamp_status NOT NULL DEFAULT 'draft',
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  registration_open BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  cover_image_url TEXT,
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bootcamps ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bootcamps
CREATE POLICY "Anyone can view active/approved bootcamps"
  ON public.bootcamps FOR SELECT
  USING (status IN ('approved', 'active', 'completed'));

CREATE POLICY "Hosts can view their own bootcamps"
  ON public.bootcamps FOR SELECT
  USING (auth.uid() = host_user_id);

CREATE POLICY "Authenticated users can create bootcamps"
  ON public.bootcamps FOR INSERT
  WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their own pending bootcamps"
  ON public.bootcamps FOR UPDATE
  USING (auth.uid() = host_user_id AND status IN ('draft', 'pending_approval'));

CREATE POLICY "Admins can manage all bootcamps"
  ON public.bootcamps FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- BOOTCAMP PARTICIPANTS TABLE
-- =====================================================
CREATE TABLE public.bootcamp_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bootcamp_id UUID NOT NULL REFERENCES public.bootcamps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  total_xp INTEGER NOT NULL DEFAULT 0,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(bootcamp_id, user_id)
);

-- Enable RLS
ALTER TABLE public.bootcamp_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for participants
CREATE POLICY "Participants can view other participants in same bootcamp"
  ON public.bootcamp_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bootcamp_participants bp
      WHERE bp.bootcamp_id = bootcamp_participants.bootcamp_id
      AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join bootcamps"
  ON public.bootcamp_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON public.bootcamp_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all participants"
  ON public.bootcamp_participants FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- BOOTCAMP TASKS TABLE
-- =====================================================
CREATE TABLE public.bootcamp_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bootcamp_id UUID NOT NULL REFERENCES public.bootcamps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL DEFAULT 'custom',
  xp_value INTEGER NOT NULL DEFAULT 10,
  day_number INTEGER,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  external_link TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bootcamp_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tasks
CREATE POLICY "Participants can view published tasks"
  ON public.bootcamp_tasks FOR SELECT
  USING (
    is_published = true AND
    EXISTS (
      SELECT 1 FROM public.bootcamp_participants bp
      WHERE bp.bootcamp_id = bootcamp_tasks.bootcamp_id
      AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can manage their bootcamp tasks"
  ON public.bootcamp_tasks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bootcamps b
      WHERE b.id = bootcamp_tasks.bootcamp_id
      AND b.host_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bootcamps b
      WHERE b.id = bootcamp_tasks.bootcamp_id
      AND b.host_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all tasks"
  ON public.bootcamp_tasks FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- BOOTCAMP TASK SUBMISSIONS TABLE
-- =====================================================
CREATE TABLE public.bootcamp_task_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.bootcamp_tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  bootcamp_id UUID NOT NULL REFERENCES public.bootcamps(id) ON DELETE CASCADE,
  submission_text TEXT,
  submission_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  xp_awarded INTEGER,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Enable RLS
ALTER TABLE public.bootcamp_task_submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submissions
CREATE POLICY "Users can view their own submissions"
  ON public.bootcamp_task_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create submissions"
  ON public.bootcamp_task_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update pending submissions"
  ON public.bootcamp_task_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Hosts can view/manage submissions in their bootcamps"
  ON public.bootcamp_task_submissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bootcamps b
      WHERE b.id = bootcamp_task_submissions.bootcamp_id
      AND b.host_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bootcamps b
      WHERE b.id = bootcamp_task_submissions.bootcamp_id
      AND b.host_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all submissions"
  ON public.bootcamp_task_submissions FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- BOOTCAMP MESSAGES TABLE (Real-time chat)
-- =====================================================
CREATE TABLE public.bootcamp_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bootcamp_id UUID NOT NULL REFERENCES public.bootcamps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'message',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bootcamp_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for messages
CREATE POLICY "Participants can view messages in their bootcamps"
  ON public.bootcamp_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bootcamp_participants bp
      WHERE bp.bootcamp_id = bootcamp_messages.bootcamp_id
      AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.bootcamp_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.bootcamp_participants bp
      WHERE bp.bootcamp_id = bootcamp_messages.bootcamp_id
      AND bp.user_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can manage messages"
  ON public.bootcamp_messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.bootcamps b
      WHERE b.id = bootcamp_messages.bootcamp_id
      AND b.host_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bootcamps b
      WHERE b.id = bootcamp_messages.bootcamp_id
      AND b.host_user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all messages"
  ON public.bootcamp_messages FOR ALL
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update bootcamp participant XP on task approval
CREATE OR REPLACE FUNCTION public.update_bootcamp_participant_xp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.status = 'approved' AND NEW.xp_awarded IS NOT NULL AND NEW.xp_awarded > 0 THEN
    IF (OLD.status IS DISTINCT FROM 'approved') OR (OLD.xp_awarded IS NULL AND NEW.xp_awarded IS NOT NULL) THEN
      UPDATE public.bootcamp_participants
      SET total_xp = total_xp + NEW.xp_awarded,
          tasks_completed = tasks_completed + 1,
          last_active_at = now()
      WHERE bootcamp_id = NEW.bootcamp_id AND user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_bootcamp_xp_on_approval
  AFTER INSERT OR UPDATE ON public.bootcamp_task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bootcamp_participant_xp();

-- Update participant count on join
CREATE OR REPLACE FUNCTION public.update_bootcamp_participant_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.bootcamps
    SET current_participants = current_participants + 1
    WHERE id = NEW.bootcamp_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.bootcamps
    SET current_participants = current_participants - 1
    WHERE id = OLD.bootcamp_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER update_participant_count
  AFTER INSERT OR DELETE ON public.bootcamp_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_bootcamp_participant_count();

-- Leaderboard function for bootcamps
CREATE OR REPLACE FUNCTION public.get_bootcamp_leaderboard(p_bootcamp_id UUID)
RETURNS TABLE(
  user_id UUID,
  user_name TEXT,
  user_avatar TEXT,
  total_xp INTEGER,
  tasks_completed INTEGER,
  rank BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    bp.user_id,
    COALESCE(p.full_name, 'Anonymous') as user_name,
    p.avatar_url as user_avatar,
    bp.total_xp,
    bp.tasks_completed,
    ROW_NUMBER() OVER (ORDER BY bp.total_xp DESC, bp.joined_at ASC) as rank
  FROM public.bootcamp_participants bp
  LEFT JOIN public.profiles p ON bp.user_id = p.user_id
  WHERE bp.bootcamp_id = p_bootcamp_id
  ORDER BY bp.total_xp DESC, bp.joined_at ASC
$$;

-- Insert the three default bootcamps
INSERT INTO public.bootcamps (
  title, description, duration_days, host_user_id, host_name, bootcamp_type, 
  max_participants, status, registration_open
) VALUES 
(
  '20 Days Job Hunting Bootcamp',
  'Master the art of landing your dream Web3 job. Learn resume optimization, interview techniques, networking strategies, and how to stand out in the competitive Web3 job market.',
  20,
  '00000000-0000-0000-0000-000000000000',
  'Web3Righteousness',
  'free',
  1000,
  'approved',
  true
),
(
  '20 Days Content Bootcamp',
  'Build your personal brand through consistent, high-quality content. Learn content strategy, writing techniques, engagement tactics, and how to grow your audience in the Web3 space.',
  20,
  '00000000-0000-0000-0000-000000000000',
  'Web3Righteousness',
  'free',
  1000,
  'approved',
  true
),
(
  '20 Days X Monetization Bootcamp',
  'Turn your X (Twitter) presence into a revenue stream. Learn monetization strategies, brand partnerships, community building, and how to create sustainable income from your social presence.',
  20,
  '00000000-0000-0000-0000-000000000000',
  'Web3Righteousness',
  'free',
  1000,
  'approved',
  true
);

-- Updated at triggers
CREATE TRIGGER update_bootcamps_updated_at
  BEFORE UPDATE ON public.bootcamps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bootcamp_tasks_updated_at
  BEFORE UPDATE ON public.bootcamp_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bootcamp_submissions_updated_at
  BEFORE UPDATE ON public.bootcamp_task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.bootcamp_messages;