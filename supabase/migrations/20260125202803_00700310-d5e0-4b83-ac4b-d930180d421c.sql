-- Fix existing approved submissions that have xp_awarded = 0 or NULL
-- Set xp_awarded to the task's xp_value for approved submissions
UPDATE public.scholarship_task_submissions s
SET xp_awarded = t.xp_value
FROM public.scholarship_tasks t
WHERE s.task_id = t.id
  AND s.status = 'approved'
  AND (s.xp_awarded IS NULL OR s.xp_awarded = 0)
  AND t.xp_value > 0;

-- Recalculate total_xp for all approved scholarship applications
-- by summing all approved submission XP values
UPDATE public.scholarship_applications a
SET total_xp = COALESCE((
  SELECT SUM(s.xp_awarded)
  FROM public.scholarship_task_submissions s
  WHERE s.user_id = a.user_id
    AND s.status = 'approved'
    AND s.xp_awarded IS NOT NULL
    AND s.xp_awarded > 0
), 0) + COALESCE((
  -- Add daily check-in XP
  SELECT SUM(c.xp_awarded + COALESCE(c.bonus_xp, 0))
  FROM public.scholarship_daily_checkins c
  WHERE c.user_id = a.user_id
), 0),
updated_at = now()
WHERE a.status = 'approved';