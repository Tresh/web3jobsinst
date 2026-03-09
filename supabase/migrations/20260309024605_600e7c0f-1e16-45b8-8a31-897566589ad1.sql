-- Add auto_reply_sent tracking to prevent piling up auto-replies
ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS auto_reply_sent_by jsonb DEFAULT '[]'::jsonb;