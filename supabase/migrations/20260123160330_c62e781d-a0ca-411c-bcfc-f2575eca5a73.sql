-- Add new columns to scholarship_tasks table
ALTER TABLE public.scholarship_tasks 
ADD COLUMN IF NOT EXISTS external_link text,
ADD COLUMN IF NOT EXISTS start_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'ended'));

-- Update existing tasks: set published ones to 'active', unpublished to 'draft'
UPDATE public.scholarship_tasks 
SET status = CASE WHEN is_published = true THEN 'active' ELSE 'draft' END;

-- Drop the old task_type check constraint and add new one with more types
ALTER TABLE public.scholarship_tasks DROP CONSTRAINT IF EXISTS scholarship_tasks_task_type_check;
ALTER TABLE public.scholarship_tasks 
ADD CONSTRAINT scholarship_tasks_task_type_check 
CHECK (task_type IN ('retweet', 'x_post', 'video_upload', 'complete_lesson', 'submit_link', 'custom', 'like_x_post', 'comment_x_post', 'create_x_post'));

-- Add trigger for updated_at if not exists
DROP TRIGGER IF EXISTS update_scholarship_tasks_updated_at ON public.scholarship_tasks;
CREATE TRIGGER update_scholarship_tasks_updated_at
BEFORE UPDATE ON public.scholarship_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();