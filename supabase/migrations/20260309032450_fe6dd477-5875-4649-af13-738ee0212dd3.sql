
-- Add slug column to platform_courses for URL-friendly routing (if not exists)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='platform_courses' AND column_name='slug') THEN
    ALTER TABLE public.platform_courses ADD COLUMN slug TEXT UNIQUE;
  END IF;
END $$;

-- Generate slugs for existing courses
UPDATE public.platform_courses SET slug = lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g')) WHERE slug IS NULL;
