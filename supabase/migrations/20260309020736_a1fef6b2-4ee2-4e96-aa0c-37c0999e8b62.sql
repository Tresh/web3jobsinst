
-- Platform courses table (admin-managed, Vimeo-based)
CREATE TABLE public.platform_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'Foundations',
  level text NOT NULL DEFAULT 'Beginner',
  duration text,
  video_url text,
  cover_image_url text,
  video_duration text,
  skill_outcome text,
  is_published boolean NOT NULL DEFAULT false,
  is_coming_soon boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses"
  ON public.platform_courses FOR SELECT
  USING (is_published = true);

-- Admins can manage all courses
CREATE POLICY "Admins can manage all courses"
  ON public.platform_courses FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Platform course modules (lessons within a course)
CREATE TABLE public.platform_course_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.platform_courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  video_url text,
  video_duration text,
  cover_image_url text,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  is_free_preview boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published course modules"
  ON public.platform_course_modules FOR SELECT
  USING (is_published = true AND EXISTS (
    SELECT 1 FROM public.platform_courses c WHERE c.id = platform_course_modules.course_id AND c.is_published = true
  ));

CREATE POLICY "Admins can manage all course modules"
  ON public.platform_course_modules FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
