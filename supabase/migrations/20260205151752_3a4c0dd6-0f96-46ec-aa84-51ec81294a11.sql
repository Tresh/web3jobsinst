-- Create talent_profiles table
CREATE TABLE public.talent_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT NOT NULL,
  bio TEXT,
  category TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  portfolio_links TEXT[] DEFAULT '{}',
  hourly_rate INTEGER,
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy')),
  rating NUMERIC(2,1) DEFAULT 5.0,
  completed_projects INTEGER DEFAULT 0,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_github TEXT,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can view published talent profiles
CREATE POLICY "Public can view published talent profiles"
ON public.talent_profiles
FOR SELECT
USING (is_published = true);

-- Users can view their own profile even if not published
CREATE POLICY "Users can view own talent profile"
ON public.talent_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own talent profile
CREATE POLICY "Users can create own talent profile"
ON public.talent_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own talent profile
CREATE POLICY "Users can update own talent profile"
ON public.talent_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own talent profile
CREATE POLICY "Users can delete own talent profile"
ON public.talent_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_talent_profiles_updated_at
BEFORE UPDATE ON public.talent_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add headline column to profiles table for global user identity
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline TEXT;