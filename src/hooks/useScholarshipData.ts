import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type {
  ScholarshipApplication,
  ScholarshipTask,
  ScholarshipTaskSubmission,
  ScholarshipModule,
  ScholarshipModuleProgress,
  ScholarshipNotification,
  LeaderboardEntry,
} from "@/types/scholarship";

export function useScholarshipPortal() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<ScholarshipApplication | null>(null);
  const [tasks, setTasks] = useState<ScholarshipTask[]>([]);
  const [submissions, setSubmissions] = useState<ScholarshipTaskSubmission[]>([]);
  const [modules, setModules] = useState<ScholarshipModule[]>([]);
  const [moduleProgress, setModuleProgress] = useState<ScholarshipModuleProgress[]>([]);
  const [notifications, setNotifications] = useState<ScholarshipNotification[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const isApproved = application?.status === "approved";
  
  // Calculate days since start
  const getDayNumber = () => {
    if (!application?.scholarship_start_date) return 0;
    const startDate = new Date(application.scholarship_start_date);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(diffDays, 30));
  };

  const initialLoadDone = useRef(false);

  const fetchData = async () => {
    if (!user) return;
    if (!initialLoadDone.current) {
      setIsLoading(true);
    }

    try {
      // Fetch user's approved application
      const { data: appData } = await supabase
        .from("scholarship_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (appData) {
        setApplication(appData as unknown as ScholarshipApplication);

        // Only fetch portal data if approved
        if (appData.status === "approved" && appData.program_id) {
          // Fetch tasks - include global tasks and program-specific tasks
          // The RLS policy already handles visibility, but we filter for active/published
          const { data: tasksData } = await supabase
            .from("scholarship_tasks")
            .select("*")
            .eq("is_published", true)
            .eq("status", "active")
            .or(`is_global.eq.true,program_id.eq.${appData.program_id}`)
            .order("created_at", { ascending: false });

          setTasks((tasksData || []) as unknown as ScholarshipTask[]);

          // Fetch user's submissions
          const { data: subsData } = await supabase
            .from("scholarship_task_submissions")
            .select("*")
            .eq("user_id", user.id);

          setSubmissions((subsData || []) as unknown as ScholarshipTaskSubmission[]);

          // Fetch modules with new video/cover fields (includes intro module with order_index = -1)
          const { data: modulesData } = await supabase
            .from("scholarship_modules")
            .select("id, program_id, title, description, order_index, unlock_type, unlock_day, unlock_task_id, is_published, cover_image_url, video_url, video_duration, xp_value, created_at, updated_at")
            .eq("program_id", appData.program_id)
            .eq("is_published", true)
            .gte("order_index", 0)  // Exclude intro module (order_index = -1) from regular modules list
            .order("order_index", { ascending: true });

          setModules((modulesData || []) as unknown as ScholarshipModule[]);

          // Fetch module progress
          const { data: progressData } = await supabase
            .from("scholarship_module_progress")
            .select("*")
            .eq("user_id", user.id);

          setModuleProgress((progressData || []) as unknown as ScholarshipModuleProgress[]);

          // Fetch leaderboard
          const { data: leaderboardData } = await supabase
            .rpc("get_scholarship_leaderboard", { p_program_id: appData.program_id });

          setLeaderboard((leaderboardData || []) as unknown as LeaderboardEntry[]);
        }

        // Fetch notifications
        const { data: notifData } = await supabase
          .from("scholarship_notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        setNotifications((notifData || []) as unknown as ScholarshipNotification[]);
      }
    } catch (error) {
      console.error("Error fetching scholarship data:", error);
    } finally {
      setIsLoading(false);
      initialLoadDone.current = true;
    }
  };

  // Realtime auto-sync: whenever tasks/submissions/notifications change, refetch.
  // This keeps approved scholars dashboards up-to-date without manual refresh.
  const refetchTimerRef = useRef<number | null>(null);
  const scheduleRefetch = () => {
    if (refetchTimerRef.current) window.clearTimeout(refetchTimerRef.current);
    refetchTimerRef.current = window.setTimeout(() => {
      fetchData();
    }, 250);
  };

  useEffect(() => {
    if (!user) return;
    if (application?.status !== "approved" || !application.program_id) return;

    const channel = supabase
      .channel(`scholarship-portal-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scholarship_tasks" },
        () => scheduleRefetch()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scholarship_task_submissions",
          filter: `user_id=eq.${user.id}`,
        },
        () => scheduleRefetch()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scholarship_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => scheduleRefetch()
      )
      .subscribe();

    return () => {
      if (refetchTimerRef.current) window.clearTimeout(refetchTimerRef.current);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, application?.status, application?.program_id]);

  const submitTask = async (taskId: string, submissionUrl: string, submissionText?: string) => {
    if (!user) return { error: new Error("Not authenticated") };

    const { error } = await supabase
      .from("scholarship_task_submissions")
      .insert({
        task_id: taskId,
        user_id: user.id,
        submission_url: submissionUrl,
        submission_text: submissionText || null,
        status: "pending",
      });

    if (!error) {
      await fetchData();
    }

    return { error };
  };

  const markNotificationRead = async (notificationId: string) => {
    await supabase
      .from("scholarship_notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;

    await supabase
      .from("scholarship_notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getSubmissionForTask = (taskId: string) => {
    return submissions.find((s) => s.task_id === taskId);
  };

  const getModuleStatus = (moduleId: string) => {
    const progress = moduleProgress.find((p) => p.module_id === moduleId);
    return progress?.status || "locked";
  };

  const getUserRank = () => {
    if (!user) return null;
    return leaderboard.find((entry) => entry.user_id === user.id);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  return {
    isLoading,
    application,
    isApproved,
    tasks,
    submissions,
    modules,
    moduleProgress,
    notifications,
    leaderboard,
    dayNumber: getDayNumber(),
    totalScholars: leaderboard.length,
    userRank: getUserRank(),
    submitTask,
    markNotificationRead,
    markAllNotificationsRead,
    getSubmissionForTask,
    getModuleStatus,
    refetch: fetchData,
  };
}
