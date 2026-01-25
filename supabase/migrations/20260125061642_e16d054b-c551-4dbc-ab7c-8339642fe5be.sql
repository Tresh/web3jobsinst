-- Create scholarship_daily_checkins table for tracking daily check-ins
CREATE TABLE public.scholarship_daily_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  application_id UUID NOT NULL,
  check_in_date DATE NOT NULL,
  streak_day INTEGER NOT NULL DEFAULT 1,
  xp_awarded INTEGER NOT NULL DEFAULT 1,
  bonus_xp INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure one check-in per user per day
  CONSTRAINT unique_user_daily_checkin UNIQUE (user_id, check_in_date)
);

-- Add streak tracking columns to scholarship_applications
ALTER TABLE public.scholarship_applications
ADD COLUMN IF NOT EXISTS current_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS highest_streak INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_check_in_date DATE;

-- Enable RLS on the new table
ALTER TABLE public.scholarship_daily_checkins ENABLE ROW LEVEL SECURITY;

-- Users can view their own check-ins
CREATE POLICY "Users can view own checkins"
ON public.scholarship_daily_checkins
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own check-ins
CREATE POLICY "Users can create own checkins"
ON public.scholarship_daily_checkins
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all check-ins
CREATE POLICY "Admins can manage checkins"
ON public.scholarship_daily_checkins
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create index for efficient queries
CREATE INDEX idx_checkins_user_date ON public.scholarship_daily_checkins (user_id, check_in_date DESC);