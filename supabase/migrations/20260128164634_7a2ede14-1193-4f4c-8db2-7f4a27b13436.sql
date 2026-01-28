-- Create enum for bug report status
CREATE TYPE public.bug_report_status AS ENUM ('new', 'in_review', 'resolved', 'ignored');

-- Create bug_reports table
CREATE TABLE public.bug_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_email TEXT,
  reporter_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  page_url TEXT,
  device_info TEXT,
  browser_info TEXT,
  screenshot_urls TEXT[] DEFAULT '{}',
  status public.bug_report_status NOT NULL DEFAULT 'new',
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert bug reports (public feature)
CREATE POLICY "Anyone can submit bug reports"
ON public.bug_reports
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Authenticated users can view their own reports
CREATE POLICY "Users can view their own bug reports"
ON public.bug_reports
FOR SELECT
TO authenticated
USING (reporter_user_id = auth.uid());

-- Policy: Admins and moderators can view all reports
CREATE POLICY "Admins can view all bug reports"
ON public.bug_reports
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Policy: Admins and moderators can update reports
CREATE POLICY "Admins can update bug reports"
ON public.bug_reports
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Policy: Only admins can delete reports
CREATE POLICY "Admins can delete bug reports"
ON public.bug_reports
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_bug_reports_updated_at
BEFORE UPDATE ON public.bug_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for bug report screenshots
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bug-report-screenshots', 
  'bug-report-screenshots', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
);

-- Storage policy: Anyone can upload screenshots
CREATE POLICY "Anyone can upload bug report screenshots"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'bug-report-screenshots');

-- Storage policy: Anyone can view bug report screenshots
CREATE POLICY "Anyone can view bug report screenshots"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'bug-report-screenshots');