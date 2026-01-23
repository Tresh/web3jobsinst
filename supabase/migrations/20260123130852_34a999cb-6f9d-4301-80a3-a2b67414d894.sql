-- Add rejection_reason to scholarship_applications
ALTER TABLE public.scholarship_applications 
ADD COLUMN IF NOT EXISTS rejection_reason text;

-- Add scholarship_start_date to track 30-day progress
ALTER TABLE public.scholarship_applications 
ADD COLUMN IF NOT EXISTS scholarship_start_date timestamp with time zone;

-- Add total_xp to track user XP
ALTER TABLE public.scholarship_applications 
ADD COLUMN IF NOT EXISTS total_xp integer NOT NULL DEFAULT 0;

-- Create scholarship_tasks table
CREATE TABLE public.scholarship_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.scholarship_programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  task_type text NOT NULL CHECK (task_type IN ('retweet', 'x_post', 'video_upload', 'complete_lesson', 'submit_link', 'custom')),
  xp_value integer NOT NULL DEFAULT 10,
  due_date timestamp with time zone,
  is_global boolean NOT NULL DEFAULT false,
  is_published boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create scholarship_task_assignments table (for assigning to specific users)
CREATE TABLE public.scholarship_task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.scholarship_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Create scholarship_task_submissions table
CREATE TABLE public.scholarship_task_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid REFERENCES public.scholarship_tasks(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  submission_text text,
  submission_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason text,
  xp_awarded integer,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Create scholarship_modules table
CREATE TABLE public.scholarship_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES public.scholarship_programs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  unlock_type text NOT NULL DEFAULT 'day' CHECK (unlock_type IN ('day', 'task', 'manual')),
  unlock_day integer,
  unlock_task_id uuid REFERENCES public.scholarship_tasks(id) ON DELETE SET NULL,
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create scholarship_module_progress table
CREATE TABLE public.scholarship_module_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid REFERENCES public.scholarship_modules(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'completed')),
  unlocked_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(module_id, user_id)
);

-- Create scholarship_notifications table
CREATE TABLE public.scholarship_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL CHECK (type IN ('status_change', 'new_task', 'task_approved', 'task_rejected', 'module_unlocked')),
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.scholarship_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_module_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarship_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for scholarship_tasks
CREATE POLICY "Admins can manage tasks" ON public.scholarship_tasks
FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Approved scholars can view published tasks" ON public.scholarship_tasks
FOR SELECT USING (
  is_published = true AND (
    is_global = true OR
    EXISTS (
      SELECT 1 FROM public.scholarship_task_assignments
      WHERE task_id = scholarship_tasks.id AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.scholarship_applications
      WHERE user_id = auth.uid() AND status = 'approved' AND program_id = scholarship_tasks.program_id
    )
  )
);

-- RLS Policies for scholarship_task_assignments
CREATE POLICY "Admins can manage assignments" ON public.scholarship_task_assignments
FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their assignments" ON public.scholarship_task_assignments
FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for scholarship_task_submissions
CREATE POLICY "Admins can manage submissions" ON public.scholarship_task_submissions
FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own submissions" ON public.scholarship_task_submissions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own submissions" ON public.scholarship_task_submissions
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update pending submissions" ON public.scholarship_task_submissions
FOR UPDATE USING (user_id = auth.uid() AND status = 'pending');

-- RLS Policies for scholarship_modules
CREATE POLICY "Admins can manage modules" ON public.scholarship_modules
FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Approved scholars can view published modules" ON public.scholarship_modules
FOR SELECT USING (
  is_published = true AND
  EXISTS (
    SELECT 1 FROM public.scholarship_applications
    WHERE user_id = auth.uid() AND status = 'approved' AND program_id = scholarship_modules.program_id
  )
);

-- RLS Policies for scholarship_module_progress
CREATE POLICY "Admins can manage progress" ON public.scholarship_module_progress
FOR ALL USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own progress" ON public.scholarship_module_progress
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own progress" ON public.scholarship_module_progress
FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for scholarship_notifications
CREATE POLICY "Users can view own notifications" ON public.scholarship_notifications
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.scholarship_notifications
FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can create notifications" ON public.scholarship_notifications
FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at columns
CREATE TRIGGER update_scholarship_tasks_updated_at
BEFORE UPDATE ON public.scholarship_tasks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarship_task_submissions_updated_at
BEFORE UPDATE ON public.scholarship_task_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarship_modules_updated_at
BEFORE UPDATE ON public.scholarship_modules
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scholarship_module_progress_updated_at
BEFORE UPDATE ON public.scholarship_module_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate user rank
CREATE OR REPLACE FUNCTION public.get_scholarship_leaderboard(p_program_id uuid)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  total_xp integer,
  rank bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    sa.user_id,
    sa.full_name,
    sa.total_xp,
    ROW_NUMBER() OVER (ORDER BY sa.total_xp DESC, sa.created_at ASC) as rank
  FROM public.scholarship_applications sa
  WHERE sa.program_id = p_program_id AND sa.status = 'approved'
  ORDER BY sa.total_xp DESC, sa.created_at ASC
$$;