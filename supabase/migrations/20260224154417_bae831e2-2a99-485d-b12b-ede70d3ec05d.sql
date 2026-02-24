
-- Internship waitlist table
CREATE TABLE public.internship_waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  telegram_username TEXT,
  twitter_handle TEXT,
  retweet_link TEXT,
  tag_proof_link TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.internship_waitlist ENABLE ROW LEVEL SECURITY;

-- Users can view their own waitlist entry
CREATE POLICY "Users can view own waitlist entry"
  ON public.internship_waitlist FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own waitlist entry
CREATE POLICY "Users can insert own waitlist entry"
  ON public.internship_waitlist FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all waitlist entries
CREATE POLICY "Admins can view all waitlist entries"
  ON public.internship_waitlist FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update waitlist entries
CREATE POLICY "Admins can update waitlist entries"
  ON public.internship_waitlist FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Platform settings table for admin-configurable values (like tweet link)
CREATE TABLE public.platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID
);

ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read platform settings"
  ON public.platform_settings FOR SELECT
  USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can insert platform settings"
  ON public.platform_settings FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update platform settings"
  ON public.platform_settings FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed the default internship tweet link setting
INSERT INTO public.platform_settings (key, value) VALUES ('internship_waitlist_tweet_url', '');

-- Trigger for updated_at on internship_waitlist
CREATE TRIGGER update_internship_waitlist_updated_at
  BEFORE UPDATE ON public.internship_waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
