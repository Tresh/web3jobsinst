-- Add message_settings table for user messaging preferences
CREATE TABLE public.message_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  allow_messages_from text NOT NULL DEFAULT 'everyone' CHECK (allow_messages_from IN ('everyone', 'verified_only', 'none')),
  auto_reply_message text,
  show_read_receipts boolean NOT NULL DEFAULT true,
  disclaimer_text text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add profile visibility settings
CREATE TABLE public.profile_visibility (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  show_scholarship_status boolean NOT NULL DEFAULT true,
  show_internship_info boolean NOT NULL DEFAULT true,
  show_talent_profile boolean NOT NULL DEFAULT true,
  show_bootcamp_activity boolean NOT NULL DEFAULT true,
  show_learnfi_progress boolean NOT NULL DEFAULT true,
  show_xp_stats boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.message_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_visibility ENABLE ROW LEVEL SECURITY;

-- RLS policies for message_settings
CREATE POLICY "Users can view own message settings"
  ON public.message_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own message settings"
  ON public.message_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own message settings"
  ON public.message_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for profile_visibility
CREATE POLICY "Users can view own visibility settings"
  ON public.profile_visibility FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own visibility settings"
  ON public.profile_visibility FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own visibility settings"
  ON public.profile_visibility FOR UPDATE
  USING (auth.uid() = user_id);

-- Others can view visibility settings to know what to show
CREATE POLICY "Anyone can view profile visibility settings"
  ON public.profile_visibility FOR SELECT
  USING (true);