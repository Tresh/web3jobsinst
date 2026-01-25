-- Create trigger function to auto-update total_xp when submission is approved
CREATE OR REPLACE FUNCTION public.update_user_xp_on_submission_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger when status changes to 'approved' and xp_awarded is set
  IF NEW.status = 'approved' AND NEW.xp_awarded IS NOT NULL AND NEW.xp_awarded > 0 THEN
    -- Check if this is a new approval (old status was not approved OR xp was just set)
    IF (OLD.status IS DISTINCT FROM 'approved') OR (OLD.xp_awarded IS NULL AND NEW.xp_awarded IS NOT NULL) THEN
      -- Update the user's total_xp in scholarship_applications
      UPDATE public.scholarship_applications
      SET total_xp = total_xp + NEW.xp_awarded,
          updated_at = now()
      WHERE user_id = NEW.user_id
        AND status = 'approved';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on scholarship_task_submissions
DROP TRIGGER IF EXISTS trigger_update_xp_on_approval ON public.scholarship_task_submissions;
CREATE TRIGGER trigger_update_xp_on_approval
AFTER UPDATE ON public.scholarship_task_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_user_xp_on_submission_approval();

-- Also handle INSERT case for initial approved submissions
DROP TRIGGER IF EXISTS trigger_update_xp_on_insert ON public.scholarship_task_submissions;
CREATE TRIGGER trigger_update_xp_on_insert
AFTER INSERT ON public.scholarship_task_submissions
FOR EACH ROW
WHEN (NEW.status = 'approved' AND NEW.xp_awarded IS NOT NULL AND NEW.xp_awarded > 0)
EXECUTE FUNCTION public.update_user_xp_on_submission_approval();