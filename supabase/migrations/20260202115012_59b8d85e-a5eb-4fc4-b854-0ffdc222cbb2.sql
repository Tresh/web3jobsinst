-- Bootcamp Applications Table (for join form submissions)
CREATE TABLE public.bootcamp_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bootcamp_id UUID NOT NULL REFERENCES public.bootcamps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  why_join TEXT NOT NULL,
  goals TEXT NOT NULL,
  skill_level TEXT NOT NULL DEFAULT 'beginner',
  availability_commitment BOOLEAN NOT NULL DEFAULT true,
  agreed_to_rules BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(bootcamp_id, user_id)
);

-- Bootcamp Community Topics Table
CREATE TABLE public.bootcamp_community_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bootcamp_id UUID NOT NULL REFERENCES public.bootcamps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '💬',
  order_index INTEGER NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add topic_id to bootcamp_messages for topic-based messaging
ALTER TABLE public.bootcamp_messages 
ADD COLUMN topic_id UUID REFERENCES public.bootcamp_community_topics(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.bootcamp_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_community_topics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bootcamp_applications
CREATE POLICY "Users can view their own applications"
ON public.bootcamp_applications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applications"
ON public.bootcamp_applications FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
ON public.bootcamp_applications FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update applications"
ON public.bootcamp_applications FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Bootcamp hosts can view their bootcamp applications"
ON public.bootcamp_applications FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamps 
    WHERE id = bootcamp_id AND host_user_id = auth.uid()
  )
);

CREATE POLICY "Bootcamp hosts can update their bootcamp applications"
ON public.bootcamp_applications FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamps 
    WHERE id = bootcamp_id AND host_user_id = auth.uid()
  )
);

-- RLS Policies for bootcamp_community_topics
CREATE POLICY "Participants can view topics"
ON public.bootcamp_community_topics FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamp_participants 
    WHERE bootcamp_id = bootcamp_community_topics.bootcamp_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage topics"
ON public.bootcamp_community_topics FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Bootcamp hosts can manage topics"
ON public.bootcamp_community_topics FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamps 
    WHERE id = bootcamp_id AND host_user_id = auth.uid()
  )
);

-- Update bootcamp_messages RLS to check topic access
CREATE POLICY "Participants can view topic messages"
ON public.bootcamp_messages FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamp_participants 
    WHERE bootcamp_id = bootcamp_messages.bootcamp_id 
    AND user_id = auth.uid()
  )
);

-- Function to create default topics when bootcamp is approved/active
CREATE OR REPLACE FUNCTION public.create_default_bootcamp_topics()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create topics when status changes to 'approved' or 'active'
  IF (NEW.status IN ('approved', 'active')) AND (OLD.status NOT IN ('approved', 'active')) THEN
    -- Check if topics already exist
    IF NOT EXISTS (SELECT 1 FROM bootcamp_community_topics WHERE bootcamp_id = NEW.id) THEN
      INSERT INTO bootcamp_community_topics (bootcamp_id, title, icon, order_index, is_default) VALUES
        (NEW.id, 'General', '📌', 1, true),
        (NEW.id, 'Daily Challenges', '🎯', 2, true),
        (NEW.id, 'Insights & Learnings', '💡', 3, true),
        (NEW.id, 'Live Chat', '💬', 4, true),
        (NEW.id, 'Feedback & Wins', '🧠', 5, true),
        (NEW.id, 'Support', '🆘', 6, true);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating topics
CREATE TRIGGER create_bootcamp_topics_trigger
AFTER UPDATE ON public.bootcamps
FOR EACH ROW
EXECUTE FUNCTION public.create_default_bootcamp_topics();

-- Function to add participant after application approval
CREATE OR REPLACE FUNCTION public.handle_bootcamp_application_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When application is approved, add user as participant
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    INSERT INTO public.bootcamp_participants (bootcamp_id, user_id)
    VALUES (NEW.bootcamp_id, NEW.user_id)
    ON CONFLICT (bootcamp_id, user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for auto-adding participants on approval
CREATE TRIGGER handle_application_approval_trigger
AFTER UPDATE ON public.bootcamp_applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_bootcamp_application_approval();

-- Update timestamps trigger
CREATE TRIGGER update_bootcamp_applications_updated_at
BEFORE UPDATE ON public.bootcamp_applications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bootcamp_community_topics_updated_at
BEFORE UPDATE ON public.bootcamp_community_topics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();