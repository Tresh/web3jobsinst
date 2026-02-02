-- Add Module 0 tasks (global tasks for all scholars)
-- Task 1: Watch Introduction Video (100 XP, auto-completes when video finishes)
INSERT INTO public.scholarship_tasks (
  title,
  description,
  task_type,
  xp_value,
  status,
  is_global,
  is_published
) VALUES (
  'Watch Introduction Video',
  'Watch the introduction video in Module 0 to learn about the Web3 Jobs Institute Scholarship Program.',
  'custom',
  100,
  'active',
  true,
  true
);

-- Task 2: Announce Your Web3 Jobs Institute Journey (50 XP, manual submission)
INSERT INTO public.scholarship_tasks (
  title,
  description,
  task_type,
  xp_value,
  status,
  is_global,
  is_published,
  external_link
) VALUES (
  'Announce Your Web3 Jobs Institute Journey',
  'After watching the introduction video, make a post on X (Twitter) announcing that you are starting the Web3 Jobs Institute Scholarship. Share that you will be building in public and carrying your audience along. Attach a screenshot showing you watched the video.',
  'create_x_post',
  50,
  'active',
  true,
  true,
  'https://twitter.com/intent/tweet'
);