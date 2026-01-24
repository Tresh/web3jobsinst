-- Create storage bucket for scholar photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('scholar-photos', 'scholar-photos', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policy: Users can upload to their own folder
CREATE POLICY "Users can upload own scholar photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'scholar-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Users can update their own photos
CREATE POLICY "Users can update own scholar photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'scholar-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Users can delete their own photos
CREATE POLICY "Users can delete own scholar photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'scholar-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS policy: Public read access for all scholar photos
CREATE POLICY "Scholar photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'scholar-photos');