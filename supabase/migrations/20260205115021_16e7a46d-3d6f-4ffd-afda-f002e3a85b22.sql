-- Create table for daily progress/milestone logs
CREATE TABLE public.bootcamp_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bootcamp_id UUID NOT NULL REFERENCES public.bootcamps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  worked_on TEXT,
  progress_notes TEXT,
  wins TEXT,
  blockers TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bootcamp_id, user_id, log_date)
);

-- Enable RLS
ALTER TABLE public.bootcamp_progress_logs ENABLE ROW LEVEL SECURITY;

-- Policies: Users can manage their own progress logs
CREATE POLICY "Users can view their own progress logs"
ON public.bootcamp_progress_logs
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress logs"
ON public.bootcamp_progress_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress logs"
ON public.bootcamp_progress_logs
FOR UPDATE
USING (auth.uid() = user_id);

-- Bootcamp hosts can view all participant progress logs
CREATE POLICY "Bootcamp hosts can view participant progress logs"
ON public.bootcamp_progress_logs
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamps b
    WHERE b.id = bootcamp_id
    AND b.host_user_id = auth.uid()
  )
);

-- Create index for efficient querying
CREATE INDEX idx_bootcamp_progress_logs_bootcamp_user ON public.bootcamp_progress_logs(bootcamp_id, user_id);
CREATE INDEX idx_bootcamp_progress_logs_date ON public.bootcamp_progress_logs(log_date);

-- Create function to auto-create default topics when bootcamp is approved
CREATE OR REPLACE FUNCTION public.create_default_bootcamp_topics()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run when status changes to 'approved' or 'active'
  IF (NEW.status IN ('approved', 'active') AND OLD.status NOT IN ('approved', 'active', 'completed')) THEN
    -- Check if topics already exist
    IF NOT EXISTS (SELECT 1 FROM public.bootcamp_community_topics WHERE bootcamp_id = NEW.id) THEN
      -- Insert default topics
      INSERT INTO public.bootcamp_community_topics (bootcamp_id, title, icon, description, order_index, is_default)
      VALUES
        (NEW.id, 'General Discussion', '💬', 'Open conversation, announcements, and peer discussion', 1, true),
        (NEW.id, 'Daily Motivation', '🔥', 'Short messages, encouragement, and momentum building', 2, true),
        (NEW.id, 'Help & Support', '🆘', 'Questions, support, and peer assistance', 3, true);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating topics
DROP TRIGGER IF EXISTS trigger_create_default_bootcamp_topics ON public.bootcamps;
CREATE TRIGGER trigger_create_default_bootcamp_topics
  AFTER UPDATE ON public.bootcamps
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_bootcamp_topics();