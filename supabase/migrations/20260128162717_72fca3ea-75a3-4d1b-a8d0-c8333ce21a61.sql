-- Create a function to auto-generate referral code on new user creation
CREATE OR REPLACE FUNCTION public.auto_generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Generate a unique referral code
  LOOP
    new_code := public.generate_referral_code();
    SELECT EXISTS(SELECT 1 FROM public.scholar_referral_codes WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  -- Insert the new referral code
  INSERT INTO public.scholar_referral_codes (user_id, referral_code, is_enabled)
  VALUES (NEW.user_id, new_code, true);
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate referral code after profile creation
DROP TRIGGER IF EXISTS auto_generate_referral_code_trigger ON public.profiles;
CREATE TRIGGER auto_generate_referral_code_trigger
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_referral_code();