
-- Drop the existing check constraint on unlock_type and recreate with 'immediate' included
ALTER TABLE public.scholarship_modules DROP CONSTRAINT IF EXISTS scholarship_modules_unlock_type_check;
ALTER TABLE public.scholarship_modules ADD CONSTRAINT scholarship_modules_unlock_type_check CHECK (unlock_type IN ('day', 'task', 'manual', 'immediate'));
