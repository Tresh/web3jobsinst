
-- Create tutor_applications table
CREATE TABLE public.tutor_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  expertise TEXT NOT NULL,
  experience TEXT NOT NULL,
  portfolio_url TEXT,
  pitch TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (even unauthenticated)
CREATE POLICY "Anyone can submit tutor applications"
ON public.tutor_applications
FOR INSERT
WITH CHECK (true);

-- Users can view their own applications
CREATE POLICY "Users can view own tutor applications"
ON public.tutor_applications
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all tutor applications"
ON public.tutor_applications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update tutor applications"
ON public.tutor_applications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete tutor applications"
ON public.tutor_applications
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_tutor_applications_updated_at
BEFORE UPDATE ON public.tutor_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
