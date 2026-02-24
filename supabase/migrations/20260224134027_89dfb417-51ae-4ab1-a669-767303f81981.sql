
-- Add file URL column to POW submissions
ALTER TABLE public.scholarship_pow_submissions
ADD COLUMN IF NOT EXISTS submission_file_url text NULL;

-- Create storage bucket for POW file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('pow-submissions', 'pow-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for POW submissions bucket
CREATE POLICY "Authenticated users can upload POW files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'pow-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view POW files"
ON storage.objects FOR SELECT
USING (bucket_id = 'pow-submissions');

CREATE POLICY "Users can update their own POW files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'pow-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own POW files"
ON storage.objects FOR DELETE
USING (bucket_id = 'pow-submissions' AND auth.uid()::text = (storage.foldername(name))[1]);
