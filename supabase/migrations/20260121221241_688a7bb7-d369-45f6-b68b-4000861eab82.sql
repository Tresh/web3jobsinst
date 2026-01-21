-- Seed an initial scholarship program so users see at least one active program
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.scholarship_programs) THEN
    INSERT INTO public.scholarship_programs (
      title,
      description,
      requirements,
      telegram_link,
      is_active
    ) VALUES (
      'Web3 Scholarship Program',
      'A free 30-day onboarding program designed to kickstart your Web3 career with structured learning, mentorship, and real opportunities.',
      'Complete the required Twitter tasks, provide proof links, and submit a short intro video (optional but recommended).',
      'https://t.me/web3jobsinstitute',
      true
    );
  END IF;
END $$;