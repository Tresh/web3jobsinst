-- Create a storage bucket for product files (PDFs, ZIPs, etc.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-files', 'product-files', true);

-- Allow anyone to read product files
CREATE POLICY "Anyone can read product files"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-files');

-- Allow admins to upload product files
CREATE POLICY "Admins can upload product files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-files'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update product files
CREATE POLICY "Admins can update product files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-files'
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete product files
CREATE POLICY "Admins can delete product files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-files'
  AND public.has_role(auth.uid(), 'admin')
);