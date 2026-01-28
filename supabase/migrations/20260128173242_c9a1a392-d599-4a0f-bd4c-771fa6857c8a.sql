-- Create a trigger function to auto-award WJI when a referred user completes their first task
CREATE OR REPLACE FUNCTION public.award_wji_on_first_task_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer_id UUID;
  referral_record_id UUID;
  existing_approved_count INTEGER;
  wji_amount INTEGER := 1;
BEGIN
  -- Only process when status changes to 'approved'
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    
    -- Check if this user has any OTHER approved submissions (before this one)
    SELECT COUNT(*) INTO existing_approved_count
    FROM public.scholarship_task_submissions
    WHERE user_id = NEW.user_id
      AND status = 'approved'
      AND id != NEW.id;
    
    -- Only proceed if this is their FIRST approved task
    IF existing_approved_count = 0 THEN
      
      -- Check if this user was referred and WJI hasn't been awarded yet
      SELECT sr.referrer_user_id, sr.id INTO referrer_id, referral_record_id
      FROM public.scholar_referrals sr
      WHERE sr.referred_user_id = NEW.user_id
        AND sr.wji_awarded = false
      LIMIT 1;
      
      -- If we found a pending referral, award WJI
      IF referrer_id IS NOT NULL THEN
        
        -- Mark the referral as awarded
        UPDATE public.scholar_referrals
        SET wji_awarded = true,
            wji_awarded_at = now()
        WHERE id = referral_record_id;
        
        -- Credit WJI to the referrer's balance (upsert)
        INSERT INTO public.wji_balances (user_id, balance, created_at, updated_at)
        VALUES (referrer_id, wji_amount, now(), now())
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          balance = wji_balances.balance + wji_amount,
          updated_at = now();
        
        -- Record the transaction
        INSERT INTO public.wji_transactions (user_id, amount, transaction_type, description, reference_id)
        VALUES (
          referrer_id, 
          wji_amount, 
          'referral_bonus', 
          'Referral bonus: referred user completed first task',
          referral_record_id::text
        );
        
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger (drop first if exists to avoid duplicates)
DROP TRIGGER IF EXISTS trigger_award_wji_on_first_task ON public.scholarship_task_submissions;

CREATE TRIGGER trigger_award_wji_on_first_task
AFTER UPDATE ON public.scholarship_task_submissions
FOR EACH ROW
EXECUTE FUNCTION public.award_wji_on_first_task_completion();