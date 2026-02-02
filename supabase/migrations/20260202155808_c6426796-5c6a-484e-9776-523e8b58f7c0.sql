-- Insert the Introduction Module (Module 0) as a proper database entry
-- This module was previously hardcoded and needs to be managed from Admin
-- Using gen_random_uuid() for proper UUID generation

INSERT INTO scholarship_modules (
  program_id,
  title,
  description,
  video_url,
  cover_image_url,
  video_duration,
  xp_value,
  order_index,
  unlock_type,
  unlock_day,
  is_published,
  created_at,
  updated_at
) VALUES (
  'c9d1a42a-d5b8-4c6f-87b2-efec503498fc',
  'Introduction to the Web3 Jobs Institute Scholarship Program',
  'Watch this introduction video to learn about the scholarship program and what to expect. This module will give you an overview of the 30-day journey ahead.',
  'https://player.vimeo.com/video/1160816479?h=f4d7dc7bc8',
  NULL,
  '5:00',
  100,
  -1,
  'day',
  1,
  true,
  NOW(),
  NOW()
);