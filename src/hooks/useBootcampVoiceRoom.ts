import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface VoiceRoom {
  id: string;
  bootcamp_id: string;
  host_user_id: string;
  title: string;
  status: "active" | "ended";
  is_recording: boolean;
  started_at: string;
}

interface VoiceRoomParticipant {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  role: "host" | "speaker" | "listener";
  is_muted: boolean;
}

interface SpeakRequest {
  id: string;
  room_id: string;
  user_id: string;
  user_name: string;
  status: "pending" | "approved" | "rejected";
}

export const useBootcampVoiceRoom = (bootcampId: string) => {
  const { user, profile } = useAuth();
  const [activeRoom, setActiveRoom] = useState<VoiceRoom | null>(null);
  const [participants, setParticipants] = useState<VoiceRoomParticipant[]>([]);
  const [speakRequests, setSpeakRequests] = useState<SpeakRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  // Fetch active room
  const fetchActiveRoom = useCallback(async () => {
    const { data, error } = await supabase
      .from("bootcamp_voice_rooms")
      .select("*")
      .eq("bootcamp_id", bootcampId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Error fetching voice room:", error);
    } else {
      setActiveRoom(data as VoiceRoom | null);
    }
    setLoading(false);
  }, [bootcampId]);

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    if (!activeRoom) return;

    const { data, error } = await supabase
      .from("bootcamp_voice_room_participants")
      .select("*")
      .eq("room_id", activeRoom.id)
      .is("left_at", null);

    if (!error && data) {
      setParticipants(data as VoiceRoomParticipant[]);
    }
  }, [activeRoom]);

  // Fetch speak requests (for host)
  const fetchSpeakRequests = useCallback(async () => {
    if (!activeRoom) return;

    const { data, error } = await supabase
      .from("bootcamp_voice_speak_requests")
      .select("*")
      .eq("room_id", activeRoom.id)
      .eq("status", "pending");

    if (!error && data) {
      setSpeakRequests(data as SpeakRequest[]);
    }
  }, [activeRoom]);

  // Start a voice room (host only)
  const startRoom = useCallback(async (title: string, isRecording: boolean) => {
    if (!user) return { success: false, error: "Not authenticated" };

    const { data, error } = await supabase
      .from("bootcamp_voice_rooms")
      .insert({
        bootcamp_id: bootcampId,
        host_user_id: user.id,
        title,
        is_recording: isRecording,
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to start voice room:", error);
      return { success: false, error: error.message };
    }

    // Add host as participant
    await supabase.from("bootcamp_voice_room_participants").insert({
      room_id: data.id,
      user_id: user.id,
      user_name: profile?.full_name || "Host",
      user_avatar: profile?.avatar_url,
      role: "host",
      is_muted: false,
    });

    setActiveRoom(data as VoiceRoom);
    return { success: true };
  }, [bootcampId, user, profile]);

  // End a voice room (host only)
  const endRoom = useCallback(async () => {
    if (!activeRoom) return;

    await supabase
      .from("bootcamp_voice_rooms")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", activeRoom.id);

    // Clean up local audio
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setActiveRoom(null);
    setParticipants([]);
    setIsConnected(false);
  }, [activeRoom]);

  // Join a voice room
  const joinRoom = useCallback(async () => {
    if (!activeRoom || !user) return;

    // Check if already a participant
    const existing = participants.find((p) => p.user_id === user.id);
    if (existing) {
      setIsConnected(true);
      return;
    }

    const { error } = await supabase.from("bootcamp_voice_room_participants").insert({
      room_id: activeRoom.id,
      user_id: user.id,
      user_name: profile?.full_name || "Anonymous",
      user_avatar: profile?.avatar_url,
      role: "listener",
      is_muted: true,
    });

    if (error) {
      console.error("Failed to join room:", error);
      toast.error("Failed to join voice room");
      return;
    }

    setIsConnected(true);
    fetchParticipants();
  }, [activeRoom, user, profile, participants, fetchParticipants]);

  // Leave a voice room
  const leaveRoom = useCallback(async () => {
    if (!activeRoom || !user) return;

    await supabase
      .from("bootcamp_voice_room_participants")
      .update({ left_at: new Date().toISOString() })
      .eq("room_id", activeRoom.id)
      .eq("user_id", user.id);

    // Clean up local audio
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setIsConnected(false);
    fetchParticipants();
  }, [activeRoom, user, fetchParticipants]);

  // Request to speak
  const requestToSpeak = useCallback(async () => {
    if (!activeRoom || !user) return;

    const { error } = await supabase.from("bootcamp_voice_speak_requests").insert({
      room_id: activeRoom.id,
      user_id: user.id,
      user_name: profile?.full_name || "Anonymous",
    });

    if (error) {
      if (error.code === "23505") {
        toast.info("You already have a pending request");
      } else {
        toast.error("Failed to request to speak");
      }
    } else {
      toast.success("Request sent to host");
    }
  }, [activeRoom, user, profile]);

  // Approve speak request (host only)
  const approveSpeakRequest = useCallback(async (requestId: string, userId: string) => {
    if (!activeRoom) return;

    // Update request status
    await supabase
      .from("bootcamp_voice_speak_requests")
      .update({ status: "approved" })
      .eq("id", requestId);

    // Promote to speaker
    await supabase
      .from("bootcamp_voice_room_participants")
      .update({ role: "speaker", is_muted: true })
      .eq("room_id", activeRoom.id)
      .eq("user_id", userId);

    fetchSpeakRequests();
    fetchParticipants();
  }, [activeRoom, fetchSpeakRequests, fetchParticipants]);

  // Reject speak request (host only)
  const rejectSpeakRequest = useCallback(async (requestId: string) => {
    await supabase
      .from("bootcamp_voice_speak_requests")
      .update({ status: "rejected" })
      .eq("id", requestId);

    fetchSpeakRequests();
  }, [fetchSpeakRequests]);

  // Toggle mute
  const toggleMute = useCallback(async () => {
    if (!activeRoom || !user) return;

    const newMuted = !isMuted;
    setIsMuted(newMuted);

    await supabase
      .from("bootcamp_voice_room_participants")
      .update({ is_muted: newMuted })
      .eq("room_id", activeRoom.id)
      .eq("user_id", user.id);

    // Toggle local audio track
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !newMuted;
      });
    }
  }, [activeRoom, user, isMuted]);

  // Mute participant (host only)
  const muteParticipant = useCallback(async (userId: string) => {
    if (!activeRoom) return;

    await supabase
      .from("bootcamp_voice_room_participants")
      .update({ is_muted: true })
      .eq("room_id", activeRoom.id)
      .eq("user_id", userId);

    fetchParticipants();
  }, [activeRoom, fetchParticipants]);

  // Remove participant (host only)
  const removeParticipant = useCallback(async (userId: string) => {
    if (!activeRoom) return;

    await supabase
      .from("bootcamp_voice_room_participants")
      .update({ left_at: new Date().toISOString(), role: "listener" })
      .eq("room_id", activeRoom.id)
      .eq("user_id", userId);

    fetchParticipants();
  }, [activeRoom, fetchParticipants]);

  // Initial fetch
  useEffect(() => {
    fetchActiveRoom();
  }, [fetchActiveRoom]);

  // Fetch participants and requests when room changes
  useEffect(() => {
    if (activeRoom) {
      fetchParticipants();
      if (user?.id === activeRoom.host_user_id) {
        fetchSpeakRequests();
      }
    }
  }, [activeRoom, user, fetchParticipants, fetchSpeakRequests]);

  // Real-time subscription for room updates
  useEffect(() => {
    const channel = supabase
      .channel(`voice-room-${bootcampId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bootcamp_voice_rooms",
          filter: `bootcamp_id=eq.${bootcampId}`,
        },
        () => {
          fetchActiveRoom();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bootcamp_voice_room_participants",
        },
        () => {
          fetchParticipants();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bootcamp_voice_speak_requests",
        },
        () => {
          if (user?.id === activeRoom?.host_user_id) {
            fetchSpeakRequests();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bootcampId, user, activeRoom, fetchActiveRoom, fetchParticipants, fetchSpeakRequests]);

  const isHost = user?.id === activeRoom?.host_user_id;
  const myParticipation = participants.find((p) => p.user_id === user?.id);
  const canSpeak = myParticipation?.role === "host" || myParticipation?.role === "speaker";

  return {
    activeRoom,
    participants,
    speakRequests,
    loading,
    isConnected,
    isMuted,
    isHost,
    canSpeak,
    myParticipation,
    startRoom,
    endRoom,
    joinRoom,
    leaveRoom,
    requestToSpeak,
    approveSpeakRequest,
    rejectSpeakRequest,
    toggleMute,
    muteParticipant,
    removeParticipant,
  };
};
