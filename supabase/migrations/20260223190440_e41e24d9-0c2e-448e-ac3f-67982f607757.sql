
-- =============================================
-- 1. Scholarship Offers table
-- =============================================
CREATE TABLE public.scholarship_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.scholarship_programs(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'job',
  reward_type TEXT NOT NULL DEFAULT 'paid',
  deadline TIMESTAMP WITH TIME ZONE,
  external_link TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarship_offers ENABLE ROW LEVEL SECURITY;

-- Admins can fully manage offers
CREATE POLICY "Admins can manage offers"
  ON public.scholarship_offers FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Approved scholars can view live offers
CREATE POLICY "Scholars can view live offers"
  ON public.scholarship_offers FOR SELECT
  USING (
    status = 'live' AND EXISTS (
      SELECT 1 FROM scholarship_applications
      WHERE scholarship_applications.user_id = auth.uid()
        AND scholarship_applications.status = 'approved'::scholarship_status
    )
  );

-- Timestamp trigger
CREATE TRIGGER update_scholarship_offers_updated_at
  BEFORE UPDATE ON public.scholarship_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 2. Proof of Work Assignments table
-- =============================================
CREATE TABLE public.scholarship_pow_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID REFERENCES public.scholarship_programs(id),
  title TEXT NOT NULL,
  instructions TEXT,
  xp_reward INTEGER DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarship_pow_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage POW assignments"
  ON public.scholarship_pow_assignments FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Scholars can view published POW assignments"
  ON public.scholarship_pow_assignments FOR SELECT
  USING (
    is_published = true AND EXISTS (
      SELECT 1 FROM scholarship_applications
      WHERE scholarship_applications.user_id = auth.uid()
        AND scholarship_applications.status = 'approved'::scholarship_status
    )
  );

CREATE TRIGGER update_scholarship_pow_assignments_updated_at
  BEFORE UPDATE ON public.scholarship_pow_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 3. Proof of Work Submissions table
-- =============================================
CREATE TABLE public.scholarship_pow_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.scholarship_pow_assignments(id),
  user_id UUID NOT NULL,
  submission_url TEXT,
  submission_text TEXT,
  file_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  feedback TEXT,
  xp_awarded INTEGER,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.scholarship_pow_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage POW submissions"
  ON public.scholarship_pow_submissions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own POW submissions"
  ON public.scholarship_pow_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own POW submissions"
  ON public.scholarship_pow_submissions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update pending POW submissions"
  ON public.scholarship_pow_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

CREATE TRIGGER update_scholarship_pow_submissions_updated_at
  BEFORE UPDATE ON public.scholarship_pow_submissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
