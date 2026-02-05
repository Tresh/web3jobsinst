-- Create storage bucket for bootcamp voice notes
INSERT INTO storage.buckets (id, name, public)
VALUES ('bootcamp-voice-notes', 'bootcamp-voice-notes', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for voice notes bucket
CREATE POLICY "Participants can upload voice notes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'bootcamp-voice-notes' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Anyone can view voice notes"
ON storage.objects FOR SELECT
USING (bucket_id = 'bootcamp-voice-notes');

CREATE POLICY "Users can delete their own voice notes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'bootcamp-voice-notes' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table for voice room sessions
CREATE TABLE public.bootcamp_voice_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bootcamp_id UUID NOT NULL REFERENCES public.bootcamps(id) ON DELETE CASCADE,
  host_user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'Live Voice Room',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'ended')),
  is_recording BOOLEAN NOT NULL DEFAULT false,
  recording_url TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Voice room participants
CREATE TABLE public.bootcamp_voice_room_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.bootcamp_voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  role TEXT NOT NULL DEFAULT 'listener' CHECK (role IN ('host', 'speaker', 'listener')),
  is_muted BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(room_id, user_id)
);

-- Speak requests for voice rooms
CREATE TABLE public.bootcamp_voice_speak_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.bootcamp_voice_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Add voice_note_url to bootcamp messages
ALTER TABLE public.bootcamp_messages 
ADD COLUMN IF NOT EXISTS voice_note_url TEXT,
ADD COLUMN IF NOT EXISTS voice_note_duration INTEGER;

-- Enable RLS
ALTER TABLE public.bootcamp_voice_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_voice_room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bootcamp_voice_speak_requests ENABLE ROW LEVEL SECURITY;

-- RLS for voice rooms - participants can view
CREATE POLICY "Bootcamp participants can view voice rooms"
ON public.bootcamp_voice_rooms FOR SELECT
USING (public.is_bootcamp_participant(bootcamp_id, auth.uid()));

-- Only host can create voice rooms
CREATE POLICY "Host can create voice rooms"
ON public.bootcamp_voice_rooms FOR INSERT
WITH CHECK (
  auth.uid() = host_user_id 
  AND EXISTS (
    SELECT 1 FROM public.bootcamps b 
    WHERE b.id = bootcamp_id AND b.host_user_id = auth.uid()
  )
);

-- Host can update voice rooms
CREATE POLICY "Host can update voice rooms"
ON public.bootcamp_voice_rooms FOR UPDATE
USING (auth.uid() = host_user_id);

-- Voice room participants policies
CREATE POLICY "Participants can view room participants"
ON public.bootcamp_voice_room_participants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamp_voice_rooms vr
    WHERE vr.id = room_id 
    AND public.is_bootcamp_participant(vr.bootcamp_id, auth.uid())
  )
);

CREATE POLICY "Users can join voice rooms"
ON public.bootcamp_voice_room_participants FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
ON public.bootcamp_voice_room_participants FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Host can manage participants"
ON public.bootcamp_voice_room_participants FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamp_voice_rooms vr
    WHERE vr.id = room_id AND vr.host_user_id = auth.uid()
  )
);

-- Speak requests policies
CREATE POLICY "Room participants can view speak requests"
ON public.bootcamp_voice_speak_requests FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamp_voice_rooms vr
    WHERE vr.id = room_id 
    AND public.is_bootcamp_participant(vr.bootcamp_id, auth.uid())
  )
);

CREATE POLICY "Users can create speak requests"
ON public.bootcamp_voice_speak_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Host can update speak requests"
ON public.bootcamp_voice_speak_requests FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.bootcamp_voice_rooms vr
    WHERE vr.id = room_id AND vr.host_user_id = auth.uid()
  )
);