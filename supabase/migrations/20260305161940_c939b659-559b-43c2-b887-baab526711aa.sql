-- 1) Ensure approved submissions always carry xp_awarded (defaults from linked task xp_value)
CREATE OR REPLACE FUNCTION public.ensure_submission_xp_awarded()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  task_xp integer;
BEGIN
  IF NEW.status = 'approved' AND (NEW.xp_awarded IS NULL OR NEW.xp_awarded <= 0) THEN
    SELECT xp_value INTO task_xp
    FROM public.scholarship_tasks
    WHERE id = NEW.task_id;

    IF task_xp IS NOT NULL AND task_xp > 0 THEN
      NEW.xp_awarded := task_xp;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_ensure_submission_xp_awarded ON public.scholarship_task_submissions;

CREATE TRIGGER trigger_ensure_submission_xp_awarded
BEFORE INSERT OR UPDATE OF status, xp_awarded, task_id
ON public.scholarship_task_submissions
FOR EACH ROW
EXECUTE FUNCTION public.ensure_submission_xp_awarded();

-- 2) Backfill approved submissions missing xp_awarded from linked task xp
UPDATE public.scholarship_task_submissions sts
SET xp_awarded = st.xp_value,
    updated_at = now()
FROM public.scholarship_tasks st
WHERE sts.task_id = st.id
  AND sts.status = 'approved'
  AND (sts.xp_awarded IS NULL OR sts.xp_awarded <= 0)
  AND st.xp_value > 0;

-- 3) Reconcile total_xp for approved applications from approved task submissions
--    Only tops up deficits (never decreases XP), idempotent.
WITH expected AS (
  SELECT
    sts.user_id,
    SUM(COALESCE(sts.xp_awarded, st.xp_value, 0))::integer AS expected_task_xp
  FROM public.scholarship_task_submissions sts
  LEFT JOIN public.scholarship_tasks st ON st.id = sts.task_id
  WHERE sts.status = 'approved'
  GROUP BY sts.user_id
), deficits AS (
  SELECT
    sa.id,
    GREATEST(expected.expected_task_xp - COALESCE(sa.total_xp, 0), 0) AS deficit
  FROM public.scholarship_applications sa
  JOIN expected ON expected.user_id = sa.user_id
  WHERE sa.status = 'approved'
)
UPDATE public.scholarship_applications sa
SET total_xp = sa.total_xp + d.deficit,
    updated_at = now()
FROM deficits d
WHERE sa.id = d.id
  AND d.deficit > 0;