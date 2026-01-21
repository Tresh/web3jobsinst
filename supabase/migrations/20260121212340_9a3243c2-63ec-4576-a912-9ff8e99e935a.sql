-- ===========================================
-- SCHOLARSHIP PROGRAMS AND APPLICATIONS
-- ===========================================

-- Scholarship Programs table (admin-managed)
CREATE TABLE public.scholarship_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  max_applications INTEGER,
  application_deadline TIMESTAMP WITH TIME ZONE,
  telegram_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scholarship_programs ENABLE ROW LEVEL SECURITY;

-- Anyone can view active programs
CREATE POLICY "Anyone can view active programs"
ON public.scholarship_programs FOR SELECT
USING (is_active = true);

-- Admins can manage programs
CREATE POLICY "Admins can manage programs"
ON public.scholarship_programs FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- ===========================================
-- SCHOLARSHIP APPLICATIONS
-- ===========================================

CREATE TYPE public.scholarship_status AS ENUM ('pending', 'approved', 'rejected', 'waitlist');

CREATE TABLE public.scholarship_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  program_id UUID NOT NULL REFERENCES public.scholarship_programs(id) ON DELETE CASCADE,
  status public.scholarship_status NOT NULL DEFAULT 'pending',
  
  -- Section 1: Basic Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram_username TEXT NOT NULL,
  twitter_handle TEXT NOT NULL,
  country TEXT NOT NULL,
  age_range TEXT NOT NULL,
  
  -- Section 2: Entry Requirements
  followed_accounts JSONB NOT NULL DEFAULT '[]'::jsonb,
  retweet_link TEXT NOT NULL,
  tag_tweet_link TEXT NOT NULL,
  
  -- Section 3: Intent Filtering
  why_scholarship TEXT NOT NULL,
  main_goal TEXT NOT NULL,
  hours_per_week TEXT NOT NULL,
  
  -- Section 4: Skill Track
  preferred_track TEXT NOT NULL,
  made_money_online TEXT NOT NULL,
  how_made_money TEXT,
  
  -- Section 5: Proof of Work
  willing_public_twitter BOOLEAN NOT NULL DEFAULT false,
  willing_public_ranking BOOLEAN NOT NULL DEFAULT false,
  
  -- Section 6: Agreement
  understands_performance_based BOOLEAN NOT NULL DEFAULT false,
  understands_credit_unlock BOOLEAN NOT NULL DEFAULT false,
  agrees_community_rules BOOLEAN NOT NULL DEFAULT false,
  
  -- Optional
  intro_video_url TEXT,
  
  -- Admin notes
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Each user can only apply once per program
  UNIQUE(user_id, program_id)
);

-- Enable RLS
ALTER TABLE public.scholarship_applications ENABLE ROW LEVEL SECURITY;

-- Users can view their own applications
CREATE POLICY "Users can view own applications"
ON public.scholarship_applications FOR SELECT
USING (auth.uid() = user_id);

-- Users can create applications for themselves
CREATE POLICY "Users can create own applications"
ON public.scholarship_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending applications
CREATE POLICY "Users can update own pending applications"
ON public.scholarship_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all applications
CREATE POLICY "Admins can view all applications"
ON public.scholarship_applications FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admins can update applications
CREATE POLICY "Admins can update applications"
ON public.scholarship_applications FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===========================================
-- USER ONBOARDING STATE
-- ===========================================

-- Add onboarding columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER NOT NULL DEFAULT 0;

-- ===========================================
-- PASSWORD RESET THROTTLING
-- ===========================================

CREATE TABLE public.password_reset_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  last_attempt_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  locked_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS (public insert, no direct read)
ALTER TABLE public.password_reset_attempts ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (rate limiting handled by edge function)
CREATE POLICY "Anyone can create reset attempts"
ON public.password_reset_attempts FOR INSERT
WITH CHECK (true);

-- Only admins can view
CREATE POLICY "Admins can view reset attempts"
ON public.password_reset_attempts FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- ===========================================
-- STORAGE BUCKET FOR INTRO VIDEOS
-- ===========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('scholarship-videos', 'scholarship-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for scholarship videos
CREATE POLICY "Users can upload scholarship videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'scholarship-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view scholarship videos"
ON storage.objects FOR SELECT
USING (bucket_id = 'scholarship-videos');

CREATE POLICY "Users can update own scholarship videos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'scholarship-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own scholarship videos"
ON storage.objects FOR DELETE
USING (bucket_id = 'scholarship-videos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE TRIGGER update_scholarship_programs_updated_at
BEFORE UPDATE ON public.scholarship_programs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarship_applications_updated_at
BEFORE UPDATE ON public.scholarship_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();