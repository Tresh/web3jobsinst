import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Bootcamp, BootcampParticipant, BootcampTask, BootcampTaskSubmission, BootcampLeaderboardEntry, BootcampMessage } from "@/types/bootcamp";

export function useBootcamps() {
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBootcamps();
  }, []);

  const fetchBootcamps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bootcamps")
        .select("*")
        .in("status", ["approved", "active", "completed"])
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBootcamps((data as unknown as Bootcamp[]) || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { bootcamps, loading, error, refetch: fetchBootcamps };
}

export function useBootcamp(bootcampId: string | undefined) {
  const { user } = useAuth();
  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [participation, setParticipation] = useState<BootcampParticipant | null>(null);
  const [tasks, setTasks] = useState<BootcampTask[]>([]);
  const [submissions, setSubmissions] = useState<BootcampTaskSubmission[]>([]);
  const [leaderboard, setLeaderboard] = useState<BootcampLeaderboardEntry[]>([]);
  const [participants, setParticipants] = useState<BootcampParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bootcampId) {
      fetchBootcampData();
    }
  }, [bootcampId, user?.id]);

  const fetchBootcampData = async () => {
    if (!bootcampId) return;

    try {
      setLoading(true);
      
      // Fetch bootcamp details
      const { data: bootcampData, error: bootcampError } = await supabase
        .from("bootcamps")
        .select("*")
        .eq("id", bootcampId)
        .single();

      if (bootcampError) throw bootcampError;
      setBootcamp(bootcampData as unknown as Bootcamp);

      // Fetch user participation if logged in
      if (user?.id) {
        const { data: participationData } = await supabase
          .from("bootcamp_participants")
          .select("*")
          .eq("bootcamp_id", bootcampId)
          .eq("user_id", user.id)
          .maybeSingle();

        setParticipation(participationData as BootcampParticipant | null);

        // Only fetch tasks if user is participant
        if (participationData) {
          const { data: tasksData } = await supabase
            .from("bootcamp_tasks")
            .select("*")
            .eq("bootcamp_id", bootcampId)
            .eq("is_published", true)
            .order("day_number", { ascending: true });

          setTasks((tasksData as BootcampTask[]) || []);

          // Fetch user submissions
          const { data: submissionsData } = await supabase
            .from("bootcamp_task_submissions")
            .select("*")
            .eq("bootcamp_id", bootcampId)
            .eq("user_id", user.id);

          setSubmissions((submissionsData as BootcampTaskSubmission[]) || []);

          // Fetch participants list
          const { data: participantsData } = await supabase
            .from("bootcamp_participants")
            .select("*")
            .eq("bootcamp_id", bootcampId)
            .order("total_xp", { ascending: false });

          setParticipants((participantsData as BootcampParticipant[]) || []);
        }
      }

      // Fetch leaderboard using RPC function
      const { data: leaderboardData } = await supabase
        .rpc("get_bootcamp_leaderboard", { p_bootcamp_id: bootcampId });

      setLeaderboard((leaderboardData as BootcampLeaderboardEntry[]) || []);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const joinBootcamp = async () => {
    if (!bootcampId || !user?.id) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("bootcamp_participants")
        .insert({
          bootcamp_id: bootcampId,
          user_id: user.id,
        });

      if (error) throw error;
      
      await fetchBootcampData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const submitTask = async (taskId: string, submissionText?: string, submissionUrl?: string) => {
    if (!bootcampId || !user?.id) return { success: false, error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("bootcamp_task_submissions")
        .upsert({
          task_id: taskId,
          user_id: user.id,
          bootcamp_id: bootcampId,
          submission_text: submissionText,
          submission_url: submissionUrl,
          status: "pending",
        }, {
          onConflict: "task_id,user_id",
        });

      if (error) throw error;
      
      await fetchBootcampData();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    bootcamp,
    participation,
    tasks,
    submissions,
    leaderboard,
    participants,
    loading,
    error,
    joinBootcamp,
    submitTask,
    refetch: fetchBootcampData,
  };
}

export function useBootcampMessages(bootcampId: string | undefined) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<BootcampMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bootcampId) return;

    // Initial fetch
    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`bootcamp-messages-${bootcampId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "bootcamp_messages",
          filter: `bootcamp_id=eq.${bootcampId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as BootcampMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bootcampId]);

  const fetchMessages = async () => {
    if (!bootcampId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bootcamp_messages")
        .select("*")
        .eq("bootcamp_id", bootcampId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages((data as BootcampMessage[]) || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, messageType: string = "message") => {
    if (!bootcampId || !user?.id) return { success: false };

    try {
      const { error } = await supabase
        .from("bootcamp_messages")
        .insert({
          bootcamp_id: bootcampId,
          user_id: user.id,
          user_name: profile?.full_name || "Anonymous",
          user_avatar: profile?.avatar_url,
          message,
          message_type: messageType,
        });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}

export function useMyBootcamps() {
  const { user } = useAuth();
  const [hostedBootcamps, setHostedBootcamps] = useState<Bootcamp[]>([]);
  const [joinedBootcamps, setJoinedBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchMyBootcamps();
    }
  }, [user?.id]);

  const fetchMyBootcamps = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch bootcamps I host
      const { data: hosted } = await supabase
        .from("bootcamps")
        .select("*")
        .eq("host_user_id", user.id)
        .order("created_at", { ascending: false });

      setHostedBootcamps((hosted as unknown as Bootcamp[]) || []);

      // Fetch bootcamps I've joined
      const { data: participations } = await supabase
        .from("bootcamp_participants")
        .select("bootcamp_id")
        .eq("user_id", user.id);

      if (participations && participations.length > 0) {
        const bootcampIds = participations.map((p) => p.bootcamp_id);
        const { data: joined } = await supabase
          .from("bootcamps")
          .select("*")
          .in("id", bootcampIds)
          .order("created_at", { ascending: false });

        setJoinedBootcamps((joined as unknown as Bootcamp[]) || []);
      } else {
        setJoinedBootcamps([]);
      }
    } catch (err) {
      console.error("Failed to fetch my bootcamps:", err);
    } finally {
      setLoading(false);
    }
  };

  return { hostedBootcamps, joinedBootcamps, loading, refetch: fetchMyBootcamps };
}
