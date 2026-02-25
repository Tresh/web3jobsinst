import { useState, useEffect, useRef, useCallback } from "react";
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

// Module-level session cache — survives component unmount/remount within the same tab session.
// Keyed by user ID so switching accounts is safe.
type PortalCache = {
  application: ScholarshipApplication | null;
  tasks: ScholarshipTask[];
  submissions: ScholarshipTaskSubmission[];
  modules: ScholarshipModule[];
  moduleProgress: ScholarshipModuleProgress[];
  notifications: ScholarshipNotification[];
  leaderboard: LeaderboardEntry[];
  loaded: boolean;
};

const portalCache = new Map<string, PortalCache>();

const emptyCache = (): PortalCache => ({
  application: null,
  tasks: [],
  submissions: [],
  modules: [],
  moduleProgress: [],
  notifications: [],
  leaderboard: [],
  loaded: false,
});

export function useScholarshipPortal() {
  const { user } = useAuth();
  const cached = user?.id ? (portalCache.get(user.id) ?? emptyCache()) : emptyCache();

  // Initialise state from cache — on remount, cached data is available immediately
  const [application, setApplication] = useState<ScholarshipApplication | null>(cached.application);
  const [tasks, setTasks] = useState<ScholarshipTask[]>(cached.tasks);
  const [submissions, setSubmissions] = useState<ScholarshipTaskSubmission[]>(cached.submissions);
  const [modules, setModules] = useState<ScholarshipModule[]>(cached.modules);
  const [moduleProgress, setModuleProgress] = useState<ScholarshipModuleProgress[]>(cached.moduleProgress);
  const [notifications, setNotifications] = useState<ScholarshipNotification[]>(cached.notifications);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(cached.leaderboard);
  // Only show the full-screen loader on the very first load (cache empty)
  const [isLoading, setIsLoading] = useState(!cached.loaded);

  const isApproved = application?.status === "approved";

  const getDayNumber = () => {
    if (!application?.scholarship_start_date) return 0;
    const startDate = new Date(application.scholarship_start_date);
    const today = new Date();
    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, Math.min(diffDays, 30));
  };

  // Helper — write through to the module-level cache
  const updateCache = useCallback(
    (patch: Partial<PortalCache>) => {
      if (!user?.id) return;
      const prev = portalCache.get(user.id) ?? emptyCache();
      portalCache.set(user.id, { ...prev, ...patch });
    },
    [user?.id]
  );

  const fetchData = useCallback(async () => {
    if (!user) return;

    // Only show full-screen loader when we have no cached data
    const existing = portalCache.get(user.id);
    if (!existing?.loaded) setIsLoading(true);

    try {
      const { data: appData } = await supabase
        .from("scholarship_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (appData) {
        const app = appData as unknown as ScholarshipApplication;
        setApplication(app);
        updateCache({ application: app });

        if (appData.status === "approved" && appData.program_id) {
          const { data: tasksData } = await supabase
            .from("scholarship_tasks")
            .select("*")
            .eq("is_published", true)
            .eq("status", "active")
            .or(`is_global.eq.true,program_id.eq.${appData.program_id}`)
            .order("created_at", { ascending: false });

          const tArr = (tasksData || []) as unknown as ScholarshipTask[];
          setTasks(tArr);

          const { data: subsData } = await supabase
            .from("scholarship_task_submissions")
            .select("*")
            .eq("user_id", user.id);

          const sArr = (subsData || []) as unknown as ScholarshipTaskSubmission[];
          setSubmissions(sArr);

          const { data: modulesData } = await supabase
            .from("scholarship_modules")
            .select("id, program_id, title, description, order_index, unlock_type, unlock_day, unlock_task_id, is_published, cover_image_url, video_url, video_duration, xp_value, xp_threshold, created_at, updated_at")
            .eq("program_id", appData.program_id)
            .eq("is_published", true)
            .gte("order_index", 0)
            .order("order_index", { ascending: true });

          const mArr = (modulesData || []) as unknown as ScholarshipModule[];
          setModules(mArr);

          const { data: progressData } = await supabase
            .from("scholarship_module_progress")
            .select("*")
            .eq("user_id", user.id);

          const pArr = (progressData || []) as unknown as ScholarshipModuleProgress[];
          setModuleProgress(pArr);

          const { data: leaderboardData } = await supabase
            .rpc("get_scholarship_leaderboard", { p_program_id: appData.program_id });

          const lArr = (leaderboardData || []) as unknown as LeaderboardEntry[];
          setLeaderboard(lArr);

          updateCache({ tasks: tArr, submissions: sArr, modules: mArr, moduleProgress: pArr, leaderboard: lArr });
        }

        const { data: notifData } = await supabase
          .from("scholarship_notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20);

        const nArr = (notifData || []) as unknown as ScholarshipNotification[];
        setNotifications(nArr);
        updateCache({ notifications: nArr, loaded: true });
      }
    } catch (error) {
      console.error("Error fetching scholarship data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, updateCache]);

  // Targeted fetch — only submissions
  const fetchSubmissionsOnly = useCallback(async () => {
    if (!user) return;
    const { data: subsData } = await supabase
      .from("scholarship_task_submissions")
      .select("*")
      .eq("user_id", user.id);
    const sArr = (subsData || []) as unknown as ScholarshipTaskSubmission[];
    setSubmissions(sArr);
    updateCache({ submissions: sArr });
  }, [user?.id, updateCache]);

  // Targeted fetch — only notifications
  const fetchNotificationsOnly = useCallback(async () => {
    if (!user) return;
    const { data: notifData } = await supabase
      .from("scholarship_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    const nArr = (notifData || []) as unknown as ScholarshipNotification[];
    setNotifications(nArr);
    updateCache({ notifications: nArr });
  }, [user?.id, updateCache]);

  // Debounced full refetch — only for admin-driven task changes
  const refetchTimerRef = useRef<number | null>(null);
  const scheduleTasksRefetch = useCallback(() => {
    if (refetchTimerRef.current) window.clearTimeout(refetchTimerRef.current);
    refetchTimerRef.current = window.setTimeout(() => {
      fetchData();
    }, 400);
  }, [fetchData]);

  // Realtime: surgical updates
  useEffect(() => {
    if (!user) return;
    if (application?.status !== "approved" || !application.program_id) return;

    const channel = supabase
      .channel(`scholarship-portal-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scholarship_tasks" },
        () => scheduleTasksRefetch()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "scholarship_modules" },
        () => scheduleTasksRefetch()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scholarship_task_submissions",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchSubmissionsOnly()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scholarship_notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchNotificationsOnly()
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
      await fetchSubmissionsOnly();
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
    updateCache({
      notifications: (portalCache.get(user?.id || "")?.notifications || []).map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ),
    });
  };

  const markAllNotificationsRead = async () => {
    if (!user) return;

    await supabase
      .from("scholarship_notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    updateCache({
      notifications: (portalCache.get(user.id)?.notifications || []).map((n) => ({
        ...n,
        is_read: true,
      })),
    });
  };

  const getSubmissionForTask = (taskId: string) => {
    return submissions.find((s) => s.task_id === taskId);
  };

  const getModuleStatus = (moduleId: string): "locked" | "available" | "completed" => {
    const progress = moduleProgress.find((p) => p.module_id === moduleId);
    if (progress?.status === "completed") return "completed";

    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return "locked";

    const dayNumber = getDayNumber();

    if (mod.unlock_type === "immediate") return "available";
    if (mod.unlock_type === "day" && mod.unlock_day && dayNumber >= mod.unlock_day) return "available";

    // For manual/task types: if admin has created a progress record (any status), treat as available
    if ((mod.unlock_type === "manual" || mod.unlock_type === "task") && progress) return "available";

    return "locked";
  };

  const getUserRank = () => {
    if (!user) return null;
    return leaderboard.find((entry) => entry.user_id === user.id);
  };

  // Fetch on mount / user change — background refresh if cache already has data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
