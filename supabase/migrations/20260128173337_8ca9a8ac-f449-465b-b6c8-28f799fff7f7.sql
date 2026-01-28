-- Drop and recreate the leaderboard function to include WJI balance
DROP FUNCTION IF EXISTS public.get_scholarship_leaderboard(uuid);

CREATE FUNCTION public.get_scholarship_leaderboard(p_program_id uuid)
RETURNS TABLE(user_id uuid, full_name text, total_xp integer, rank bigint, wji_earned integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    sa.user_id,
    sa.full_name,
    sa.total_xp,
    ROW_NUMBER() OVER (ORDER BY sa.total_xp DESC, sa.created_at ASC) as rank,
    COALESCE(wb.balance, 0)::integer as wji_earned
  FROM public.scholarship_applications sa
  LEFT JOIN public.wji_balances wb ON wb.user_id = sa.user_id
  WHERE sa.program_id = p_program_id AND sa.status = 'approved'
  ORDER BY sa.total_xp DESC, sa.created_at ASC
$$;