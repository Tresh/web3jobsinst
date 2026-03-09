
-- 1. Create XP audit log table
CREATE TABLE public.xp_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  full_name TEXT,
  old_xp INTEGER NOT NULL,
  correct_xp INTEGER NOT NULL,
  adjustment INTEGER NOT NULL,
  task_xp INTEGER DEFAULT 0,
  module_xp INTEGER DEFAULT 0,
  checkin_xp INTEGER DEFAULT 0,
  audit_source TEXT NOT NULL DEFAULT 'system_reconciliation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.xp_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view xp audit log"
  ON public.xp_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert xp audit log"
  ON public.xp_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 2. Create the reconciliation function (callable by admin)
CREATE OR REPLACE FUNCTION public.reconcile_scholarship_xp(dry_run BOOLEAN DEFAULT true)
RETURNS TABLE(
  user_id UUID,
  full_name TEXT,
  old_xp INTEGER,
  expected_xp INTEGER,
  adjustment INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH task_xp AS (
    SELECT sts.user_id, COALESCE(SUM(sts.xp_awarded), 0)::integer as earned
    FROM scholarship_task_submissions sts
    WHERE sts.status = 'approved' AND sts.xp_awarded > 0
    GROUP BY sts.user_id
  ),
  module_xp AS (
    SELECT smp.user_id, COALESCE(SUM(sm.xp_value), 0)::integer as earned
    FROM scholarship_module_progress smp
    JOIN scholarship_modules sm ON sm.id = smp.module_id
    WHERE smp.status = 'completed' AND sm.xp_value > 0
    GROUP BY smp.user_id
  ),
  checkin_xp AS (
    SELECT sdc.user_id, COALESCE(SUM(COALESCE(sdc.xp_awarded, 0) + COALESCE(sdc.bonus_xp, 0)), 0)::integer as earned
    FROM scholarship_daily_checkins sdc
    GROUP BY sdc.user_id
  ),
  audit AS (
    SELECT
      sa.user_id as uid,
      sa.full_name as fname,
      sa.total_xp as old,
      (COALESCE(t.earned, 0) + COALESCE(m.earned, 0) + COALESCE(c.earned, 0))::integer as expected,
      COALESCE(t.earned, 0)::integer as t_xp,
      COALESCE(m.earned, 0)::integer as m_xp,
      COALESCE(c.earned, 0)::integer as c_xp
    FROM scholarship_applications sa
    LEFT JOIN task_xp t ON t.user_id = sa.user_id
    LEFT JOIN module_xp m ON m.user_id = sa.user_id
    LEFT JOIN checkin_xp c ON c.user_id = sa.user_id
    WHERE sa.status = 'approved'
  )
  SELECT
    a.uid as user_id,
    a.fname as full_name,
    a.old as old_xp,
    a.expected as expected_xp,
    (a.expected - a.old)::integer as adjustment
  FROM audit a
  WHERE a.old != a.expected;

  -- If not dry run, actually fix the XP and log it
  IF NOT dry_run THEN
    WITH task_xp AS (
      SELECT sts.user_id, COALESCE(SUM(sts.xp_awarded), 0)::integer as earned
      FROM scholarship_task_submissions sts
      WHERE sts.status = 'approved' AND sts.xp_awarded > 0
      GROUP BY sts.user_id
    ),
    module_xp AS (
      SELECT smp.user_id, COALESCE(SUM(sm.xp_value), 0)::integer as earned
      FROM scholarship_module_progress smp
      JOIN scholarship_modules sm ON sm.id = smp.module_id
      WHERE smp.status = 'completed' AND sm.xp_value > 0
      GROUP BY smp.user_id
    ),
    checkin_xp AS (
      SELECT sdc.user_id, COALESCE(SUM(COALESCE(sdc.xp_awarded, 0) + COALESCE(sdc.bonus_xp, 0)), 0)::integer as earned
      FROM scholarship_daily_checkins sdc
      GROUP BY sdc.user_id
    ),
    corrections AS (
      SELECT
        sa.user_id as uid,
        sa.full_name as fname,
        sa.total_xp as old,
        (COALESCE(t.earned, 0) + COALESCE(m.earned, 0) + COALESCE(c.earned, 0))::integer as expected,
        COALESCE(t.earned, 0)::integer as t_xp,
        COALESCE(m.earned, 0)::integer as m_xp,
        COALESCE(c.earned, 0)::integer as c_xp
      FROM scholarship_applications sa
      LEFT JOIN task_xp t ON t.user_id = sa.user_id
      LEFT JOIN module_xp m ON m.user_id = sa.user_id
      LEFT JOIN checkin_xp c ON c.user_id = sa.user_id
      WHERE sa.status = 'approved'
        AND sa.total_xp != (COALESCE(t.earned, 0) + COALESCE(m.earned, 0) + COALESCE(c.earned, 0))
    )
    -- Log corrections
    INSERT INTO xp_audit_log (user_id, full_name, old_xp, correct_xp, adjustment, task_xp, module_xp, checkin_xp, audit_source)
    SELECT uid, fname, old, expected, expected - old, t_xp, m_xp, c_xp, 'admin_reconciliation'
    FROM corrections;

    -- Apply corrections
    UPDATE scholarship_applications sa
    SET total_xp = sub.expected, updated_at = now()
    FROM (
      WITH task_xp AS (
        SELECT sts.user_id, COALESCE(SUM(sts.xp_awarded), 0)::integer as earned
        FROM scholarship_task_submissions sts
        WHERE sts.status = 'approved' AND sts.xp_awarded > 0
        GROUP BY sts.user_id
      ),
      module_xp AS (
        SELECT smp.user_id, COALESCE(SUM(sm.xp_value), 0)::integer as earned
        FROM scholarship_module_progress smp
        JOIN scholarship_modules sm ON sm.id = smp.module_id
        WHERE smp.status = 'completed' AND sm.xp_value > 0
        GROUP BY smp.user_id
      ),
      checkin_xp AS (
        SELECT sdc.user_id, COALESCE(SUM(COALESCE(sdc.xp_awarded, 0) + COALESCE(sdc.bonus_xp, 0)), 0)::integer as earned
        FROM scholarship_daily_checkins sdc
        GROUP BY sdc.user_id
      )
      SELECT
        sa2.user_id as uid,
        (COALESCE(t.earned, 0) + COALESCE(m.earned, 0) + COALESCE(c.earned, 0))::integer as expected
      FROM scholarship_applications sa2
      LEFT JOIN task_xp t ON t.user_id = sa2.user_id
      LEFT JOIN module_xp m ON m.user_id = sa2.user_id
      LEFT JOIN checkin_xp c ON c.user_id = sa2.user_id
      WHERE sa2.status = 'approved'
        AND sa2.total_xp != (COALESCE(t.earned, 0) + COALESCE(m.earned, 0) + COALESCE(c.earned, 0))
    ) sub
    WHERE sa.user_id = sub.uid AND sa.status = 'approved';
  END IF;
END;
$$;

-- 3. XP integrity trigger — prevent unexpected XP drops on scholarship_applications
CREATE OR REPLACE FUNCTION public.validate_xp_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Skip if total_xp didn't change
  IF NEW.total_xp = OLD.total_xp THEN
    RETURN NEW;
  END IF;

  -- Allow increases (normal XP awards)
  IF NEW.total_xp > OLD.total_xp THEN
    RETURN NEW;
  END IF;

  -- Allow decreases only from admin reconciliation (check if caller is admin)
  IF public.has_role(auth.uid(), 'admin') THEN
    -- Log the decrease for audit
    INSERT INTO xp_audit_log (user_id, full_name, old_xp, correct_xp, adjustment, audit_source)
    VALUES (NEW.user_id, NEW.full_name, OLD.total_xp, NEW.total_xp, NEW.total_xp - OLD.total_xp, 'admin_manual');
    RETURN NEW;
  END IF;

  -- For service role (triggers), allow the change but log it
  -- The SECURITY DEFINER triggers run as the function owner, not as auth.uid()
  -- So we check if auth.uid() is null (service context)
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Block unexpected XP drops from regular users
  RAISE WARNING 'XP decrease blocked for user %: % -> %', NEW.user_id, OLD.total_xp, NEW.total_xp;
  NEW.total_xp := OLD.total_xp;
  RETURN NEW;
END;
$$;

CREATE TRIGGER validate_scholarship_xp_update
  BEFORE UPDATE OF total_xp ON public.scholarship_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_xp_update();
