
-- Create changelog_entries table
CREATE TABLE public.changelog_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'feature' CHECK (type IN ('feature', 'improvement', 'fix', 'security')),
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.changelog_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can view published entries
CREATE POLICY "Anyone can view published changelog entries"
ON public.changelog_entries FOR SELECT
USING (is_published = true);

-- Admins can do everything
CREATE POLICY "Admins can manage changelog entries"
ON public.changelog_entries FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
