-- Add new columns to scholarship_modules for video content and cover images
ALTER TABLE public.scholarship_modules
ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_duration TEXT,
ADD COLUMN IF NOT EXISTS xp_value INTEGER DEFAULT 0;

-- Create storage bucket for module cover images
INSERT INTO storage.buckets (id, name, public)
VALUES ('module-covers', 'module-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for module cover images
-- Allow anyone to view module covers (public bucket)
CREATE POLICY "Anyone can view module covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'module-covers');

-- Allow admins to upload module covers
CREATE POLICY "Admins can upload module covers"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'module-covers' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admins to update module covers
CREATE POLICY "Admins can update module covers"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'module-covers' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Allow admins to delete module covers
CREATE POLICY "Admins can delete module covers"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'module-covers' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);