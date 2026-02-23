-- Add reward-specific fields to learnfi_programs
ALTER TABLE public.learnfi_programs
  ADD COLUMN IF NOT EXISTS reward_amount_type text DEFAULT 'total', -- 'total' or 'per_participant'
  ADD COLUMN IF NOT EXISTS token_is_stable boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS token_name text,
  ADD COLUMN IF NOT EXISTS leaderboard_tiers jsonb DEFAULT '[]'::jsonb, -- [{rank: 1, amount: 100}, ...]
  ADD COLUMN IF NOT EXISTS internship_details text,
  ADD COLUMN IF NOT EXISTS linked_course_id text; -- optional link to a course on the platform
