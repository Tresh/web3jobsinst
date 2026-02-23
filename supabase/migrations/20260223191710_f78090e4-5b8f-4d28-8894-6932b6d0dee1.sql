
-- Create internship_profiles table
CREATE TABLE public.internship_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  -- Identity
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram_username TEXT,
  twitter_handle TEXT,
  portfolio_link TEXT,
  profile_photo_url TEXT,
  -- Skills
  primary_skill_category TEXT NOT NULL DEFAULT 'general',
  skill_level TEXT NOT NULL DEFAULT 'beginner',
  tools_known TEXT[] DEFAULT '{}',
  experience_description TEXT,
  -- Preferences
  paid_preference TEXT NOT NULL DEFAULT 'both', -- paid, unpaid, both
  hours_per_week TEXT NOT NULL DEFAULT '10-20',
  work_mode TEXT NOT NULL DEFAULT 'remote', -- remote, hybrid, onsite
  open_to_immediate BOOLEAN NOT NULL DEFAULT true,
  -- Visibility & Status
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  internship_status TEXT NOT NULL DEFAULT 'open_to_internship', -- active_intern, open_to_internship, currently_placed, not_available
  admin_notes TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.internship_profiles ENABLE ROW LEVEL SECURITY;

-- Public can view approved, public profiles
CREATE POLICY "Anyone can view public approved intern profiles"
ON public.internship_profiles
FOR SELECT
USING (is_public = true AND is_approved = true);

-- Approved scholars can create their own profile
CREATE POLICY "Approved scholars can create own intern profile"
ON public.internship_profiles
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.scholarship_applications
    WHERE scholarship_applications.user_id = auth.uid()
    AND scholarship_applications.status = 'approved'
  )
);

-- Users can update their own profile
CREATE POLICY "Users can update own intern profile"
ON public.internship_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can view their own profile
CREATE POLICY "Users can view own intern profile"
ON public.internship_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all profiles
CREATE POLICY "Admins can manage all intern profiles"
ON public.internship_profiles
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_internship_profiles_updated_at
BEFORE UPDATE ON public.internship_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
