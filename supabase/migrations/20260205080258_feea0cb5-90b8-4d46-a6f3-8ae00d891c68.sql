
-- Fix XP discrepancy: Recalculate total_xp for all approved scholarship applications
-- This updates total_xp to be the correct sum of:
-- 1. XP from approved task submissions
-- 2. XP from daily check-ins (base + bonus)

UPDATE scholarship_applications sa
SET 
  total_xp = (
    -- Sum of XP from approved submissions
    COALESCE((
      SELECT SUM(xp_awarded) 
      FROM scholarship_task_submissions sts 
      WHERE sts.user_id = sa.user_id 
        AND sts.status = 'approved'
        AND sts.xp_awarded IS NOT NULL
    ), 0)
    +
    -- Sum of XP from daily check-ins (base xp + bonus xp)
    COALESCE((
      SELECT SUM(xp_awarded + COALESCE(bonus_xp, 0)) 
      FROM scholarship_daily_checkins sdc 
      WHERE sdc.user_id = sa.user_id
    ), 0)
  ),
  updated_at = now()
WHERE sa.status = 'approved';
