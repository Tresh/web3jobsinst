import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface BootcampProgressLog {
  id: string;
  bootcamp_id: string;
  user_id: string;
  log_date: string;
  worked_on: string | null;
  progress_notes: string | null;
  wins: string | null;
  blockers: string | null;
  created_at: string;
  updated_at: string;
}

export function useBootcampProgressLog(bootcampId: string | undefined) {
  const { user } = useAuth();
  const [todayLog, setTodayLog] = useState<BootcampProgressLog | null>(null);
  const [recentLogs, setRecentLogs] = useState<BootcampProgressLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bootcampId && user?.id) {
      fetchLogs();
    }
  }, [bootcampId, user?.id]);

  const fetchLogs = async () => {
    if (!bootcampId || !user?.id) return;

    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      // Fetch today's log
      const { data: todayData } = await supabase
        .from("bootcamp_progress_logs")
        .select("*")
        .eq("bootcamp_id", bootcampId)
        .eq("user_id", user.id)
        .eq("log_date", today)
        .maybeSingle();

      setTodayLog(todayData as BootcampProgressLog | null);

      // Fetch recent logs (last 7 days)
      const { data: recentData } = await supabase
        .from("bootcamp_progress_logs")
        .select("*")
        .eq("bootcamp_id", bootcampId)
        .eq("user_id", user.id)
        .order("log_date", { ascending: false })
        .limit(7);

      setRecentLogs((recentData as BootcampProgressLog[]) || []);
    } catch (err) {
      console.error("Failed to fetch progress logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveProgressLog = async (data: {
    worked_on?: string;
    progress_notes?: string;
    wins?: string;
    blockers?: string;
  }) => {
    if (!bootcampId || !user?.id) return { success: false, error: "Not authenticated" };

    try {
      const today = new Date().toISOString().split("T")[0];

      const { error } = await supabase
        .from("bootcamp_progress_logs")
        .upsert(
          {
            bootcamp_id: bootcampId,
            user_id: user.id,
            log_date: today,
            worked_on: data.worked_on || null,
            progress_notes: data.progress_notes || null,
            wins: data.wins || null,
            blockers: data.blockers || null,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "bootcamp_id,user_id,log_date",
          }
        );

      if (error) throw error;

      await fetchLogs();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    todayLog,
    recentLogs,
    loading,
    saveProgressLog,
    refetch: fetchLogs,
  };
}
