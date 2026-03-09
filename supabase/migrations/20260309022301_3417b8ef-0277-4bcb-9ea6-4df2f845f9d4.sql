
-- =============================================
-- 1. COURSE LESSONS TABLE (3rd level: Course → Module → Lesson)
-- =============================================
CREATE TABLE public.platform_course_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.platform_course_modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  video_duration text,
  cover_image_url text,
  resources jsonb DEFAULT '[]'::jsonb,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  is_free_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_course_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published lessons"
  ON public.platform_course_lessons FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all lessons"
  ON public.platform_course_lessons FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Add resources column to courses for course-level resources
ALTER TABLE public.platform_courses ADD COLUMN IF NOT EXISTS resources jsonb DEFAULT '[]'::jsonb;
-- Add instructor field
ALTER TABLE public.platform_courses ADD COLUMN IF NOT EXISTS instructor text;
-- Add total_duration field  
ALTER TABLE public.platform_courses ADD COLUMN IF NOT EXISTS total_duration text;

-- =============================================
-- 2. CAMPAIGNS TABLES (DB-backed)
-- =============================================
CREATE TABLE public.platform_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'social',
  reward text,
  max_participants integer NOT NULL DEFAULT 1000,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'draft',
  project text,
  requirements jsonb DEFAULT '[]'::jsonb,
  cover_image_url text,
  created_by uuid,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published campaigns"
  ON public.platform_campaigns FOR SELECT
  USING (is_published = true);

CREATE POLICY "Admins can manage all campaigns"
  ON public.platform_campaigns FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.campaign_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.platform_campaigns(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'joined',
  submission_url text,
  submission_text text,
  submission_proof_url text,
  reviewed_at timestamptz,
  reviewed_by uuid,
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, user_id)
);

ALTER TABLE public.campaign_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own campaign participation"
  ON public.campaign_participants FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can join campaigns"
  ON public.campaign_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own submissions"
  ON public.campaign_participants FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND status IN ('joined', 'submitted'));

CREATE POLICY "Admins can manage all campaign participants"
  ON public.campaign_participants FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
