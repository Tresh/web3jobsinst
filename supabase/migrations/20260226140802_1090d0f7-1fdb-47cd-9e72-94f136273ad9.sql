-- Allow approved scholars to insert their own module progress records
CREATE POLICY "Approved scholars can insert own progress"
ON public.scholarship_module_progress
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.scholarship_applications
    WHERE user_id = auth.uid()
    AND status = 'approved'
  )
);