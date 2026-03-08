
-- Institution applications table
CREATE TABLE public.institution_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  organization_name TEXT NOT NULL,
  website TEXT NOT NULL,
  ecosystem_category TEXT NOT NULL,
  official_email TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  role_in_org TEXT NOT NULL,
  why_portal TEXT NOT NULL,
  what_to_teach TEXT NOT NULL,
  planned_courses TEXT NOT NULL,
  has_certifications BOOLEAN NOT NULL DEFAULT false,
  hiring_needs TEXT,
  community_size TEXT NOT NULL,
  logo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.institution_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit institution applications"
  ON public.institution_applications FOR INSERT
  WITH CHECK (true);

-- Users can view own applications
CREATE POLICY "Users can view own institution applications"
  ON public.institution_applications FOR SELECT
  USING (user_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage institution applications"
  ON public.institution_applications FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at trigger
CREATE TRIGGER update_institution_applications_updated_at
  BEFORE UPDATE ON public.institution_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
