-- Allow program creators to update their own programs
CREATE POLICY "Creators can update own learnfi programs"
ON public.learnfi_programs
FOR UPDATE
USING (created_by = auth.uid());
