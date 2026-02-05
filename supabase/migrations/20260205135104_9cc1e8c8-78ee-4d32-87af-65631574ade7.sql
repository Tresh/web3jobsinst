-- Fix infinite recursion in bootcamp_participants SELECT policies

-- Helper function to check membership without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.is_bootcamp_participant(p_bootcamp_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bootcamp_participants bp
    WHERE bp.bootcamp_id = p_bootcamp_id
      AND bp.user_id = p_user_id
  );
$$;

-- Drop the recursive policy (it references bootcamp_participants inside bootcamp_participants RLS)
DROP POLICY IF EXISTS "Participants can view other participants in same bootcamp" ON public.bootcamp_participants;

-- Allow a user to always see their own participant row
DROP POLICY IF EXISTS "Users can view their own participation" ON public.bootcamp_participants;
CREATE POLICY "Users can view their own participation"
ON public.bootcamp_participants
FOR SELECT
USING (auth.uid() = user_id);

-- Allow participants to view other participants in the same bootcamp (non-recursive via SECURITY DEFINER function)
CREATE POLICY "Participants can view participants in same bootcamp"
ON public.bootcamp_participants
FOR SELECT
USING (public.is_bootcamp_participant(bootcamp_id, auth.uid()));
