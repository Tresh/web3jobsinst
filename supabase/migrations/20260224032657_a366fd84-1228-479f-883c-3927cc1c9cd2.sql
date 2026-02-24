
-- Create program edit requests table
CREATE TABLE public.learnfi_edit_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  program_id UUID NOT NULL REFERENCES public.learnfi_programs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.learnfi_edit_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own edit requests
CREATE POLICY "Users can create own edit requests"
ON public.learnfi_edit_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own edit requests
CREATE POLICY "Users can view own edit requests"
ON public.learnfi_edit_requests FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all edit requests"
ON public.learnfi_edit_requests FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update
CREATE POLICY "Admins can update edit requests"
ON public.learnfi_edit_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete
CREATE POLICY "Admins can delete edit requests"
ON public.learnfi_edit_requests FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Timestamp trigger
CREATE TRIGGER update_learnfi_edit_requests_updated_at
BEFORE UPDATE ON public.learnfi_edit_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add edit_mode column to learnfi_programs to track if editing is allowed
ALTER TABLE public.learnfi_programs ADD COLUMN IF NOT EXISTS edit_allowed BOOLEAN DEFAULT false;
