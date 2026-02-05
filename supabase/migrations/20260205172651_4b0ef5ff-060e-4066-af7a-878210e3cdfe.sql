-- Add customizable application questions and required post links to bootcamps
ALTER TABLE public.bootcamps 
ADD COLUMN IF NOT EXISTS application_questions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS required_post_links JSONB DEFAULT '[]'::jsonb;

-- application_questions format: [{"id": "uuid", "question": "Why do you want to join?", "required": true}]
-- required_post_links format: [{"id": "uuid", "label": "Tweet Link", "placeholder": "https://twitter.com/...", "required": true}]

COMMENT ON COLUMN public.bootcamps.application_questions IS 'Custom application questions defined by host';
COMMENT ON COLUMN public.bootcamps.required_post_links IS 'Required social media post links for application';