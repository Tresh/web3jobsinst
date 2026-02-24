-- Add approval fields to talent_profiles
ALTER TABLE public.talent_profiles 
  ADD COLUMN is_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN admin_notes text DEFAULT NULL;

-- Update public viewing policy to require approval
DROP POLICY "Public can view published talent profiles" ON public.talent_profiles;

CREATE POLICY "Public can view published approved talent profiles"
ON public.talent_profiles
FOR SELECT
USING (is_published = true AND is_approved = true);

-- Admin full access
CREATE POLICY "Admins can manage all talent profiles"
ON public.talent_profiles
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));