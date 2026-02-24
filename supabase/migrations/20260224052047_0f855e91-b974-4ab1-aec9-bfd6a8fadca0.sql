
-- Add xp_threshold column to scholarship_modules for gated XP access
ALTER TABLE public.scholarship_modules
ADD COLUMN xp_threshold integer NOT NULL DEFAULT 0;

-- Add comment for clarity
COMMENT ON COLUMN public.scholarship_modules.xp_threshold IS 'Minimum XP a student must have to unlock this module. 0 means no XP requirement.';
