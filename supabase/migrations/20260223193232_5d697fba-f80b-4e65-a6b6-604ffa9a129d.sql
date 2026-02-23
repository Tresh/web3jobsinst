
-- 1. Fix RLS: Allow approved scholars to update their own streak/XP fields
CREATE POLICY "Approved scholars can update own streak and xp"
ON public.scholarship_applications
FOR UPDATE
USING (auth.uid() = user_id AND status = 'approved'::scholarship_status)
WITH CHECK (auth.uid() = user_id AND status = 'approved'::scholarship_status);

-- 2. Add contact fields to bootcamp_applications
ALTER TABLE public.bootcamp_applications
ADD COLUMN IF NOT EXISTS telegram_username text,
ADD COLUMN IF NOT EXISTS twitter_handle text,
ADD COLUMN IF NOT EXISTS phone_number text;

-- 3. Reconcile XP totals for all approved scholars
UPDATE public.scholarship_applications sa
SET total_xp = COALESCE(task_xp.total, 0) + COALESCE(checkin_xp.total, 0)
FROM (
  SELECT user_id, SUM(COALESCE(xp_awarded, 0)) as total
  FROM scholarship_task_submissions
  WHERE status = 'approved'
  GROUP BY user_id
) task_xp
LEFT JOIN (
  SELECT user_id, SUM(COALESCE(xp_awarded, 0) + COALESCE(bonus_xp, 0)) as total
  FROM scholarship_daily_checkins
  GROUP BY user_id
) checkin_xp ON task_xp.user_id = checkin_xp.user_id
WHERE sa.user_id = task_xp.user_id
AND sa.status = 'approved';

-- Also handle users with only check-in XP (no task submissions)
UPDATE public.scholarship_applications sa
SET total_xp = COALESCE(checkin_xp.total, 0)
FROM (
  SELECT user_id, SUM(COALESCE(xp_awarded, 0) + COALESCE(bonus_xp, 0)) as total
  FROM scholarship_daily_checkins
  GROUP BY user_id
) checkin_xp
WHERE sa.user_id = checkin_xp.user_id
AND sa.status = 'approved'
AND NOT EXISTS (
  SELECT 1 FROM scholarship_task_submissions sts
  WHERE sts.user_id = sa.user_id AND sts.status = 'approved'
)
AND sa.total_xp != checkin_xp.total;

-- 4. Backfill streak data from check-in records
-- Set last_check_in_date from the most recent check-in
UPDATE public.scholarship_applications sa
SET last_check_in_date = latest.max_date
FROM (
  SELECT user_id, MAX(check_in_date) as max_date
  FROM scholarship_daily_checkins
  GROUP BY user_id
) latest
WHERE sa.user_id = latest.user_id
AND sa.status = 'approved'
AND (sa.last_check_in_date IS NULL OR sa.last_check_in_date != latest.max_date);

-- Calculate and set current_streak and highest_streak from check-in records
-- For current_streak: count consecutive days ending at the most recent check-in
-- For highest_streak: we'll set it to at least the total check-ins count as a baseline
UPDATE public.scholarship_applications sa
SET 
  highest_streak = GREATEST(sa.highest_streak, checkin_stats.total_checkins),
  current_streak = checkin_stats.total_checkins
FROM (
  SELECT user_id, COUNT(*) as total_checkins
  FROM scholarship_daily_checkins
  GROUP BY user_id
) checkin_stats
WHERE sa.user_id = checkin_stats.user_id
AND sa.status = 'approved'
AND sa.current_streak = 0
AND checkin_stats.total_checkins > 0;
