import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const MODULE_0_VIDEO_COMPLETED_KEY = "module0_video_completed";
const MODULE_0_XP_VALUE = 100;

export function useModule0Progress() {
  const { user } = useAuth();
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [isAwarding, setIsAwarding] = useState(false);

  // Check if video was already completed (from localStorage for this session)
  useEffect(() => {
    if (!user) return;
    const key = `${MODULE_0_VIDEO_COMPLETED_KEY}_${user.id}`;
    const completed = localStorage.getItem(key);
    if (completed === "true") {
      setIsVideoCompleted(true);
    }
  }, [user]);

  // Also check if XP was already awarded in database (for persistence across devices)
  useEffect(() => {
    if (!user) return;
    
    const checkDatabaseCompletion = async () => {
      // Check if user has a submission for the Module 0 video task
      const { data } = await supabase
        .from("scholarship_task_submissions")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("submission_text", "MODULE_0_VIDEO_WATCH")
        .maybeSingle();
      
      if (data) {
        setIsVideoCompleted(true);
        // Sync to localStorage
        const key = `${MODULE_0_VIDEO_COMPLETED_KEY}_${user.id}`;
        localStorage.setItem(key, "true");
      }
    };
    
    checkDatabaseCompletion();
  }, [user]);

  const markVideoCompleted = useCallback(async () => {
    if (!user || isVideoCompleted || isAwarding) return { success: false };
    
    setIsAwarding(true);

    try {
      // First, find the Module 0 video task
      const { data: task } = await supabase
        .from("scholarship_tasks")
        .select("id, xp_value")
        .eq("title", "Watch Introduction Video")
        .eq("is_global", true)
        .maybeSingle();

      if (!task) {
        console.error("Module 0 video task not found");
        setIsAwarding(false);
        return { success: false };
      }

      // Check if already submitted
      const { data: existingSubmission } = await supabase
        .from("scholarship_task_submissions")
        .select("id")
        .eq("task_id", task.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingSubmission) {
        // Already submitted, just mark as completed locally
        setIsVideoCompleted(true);
        const key = `${MODULE_0_VIDEO_COMPLETED_KEY}_${user.id}`;
        localStorage.setItem(key, "true");
        setIsAwarding(false);
        return { success: true, alreadyCompleted: true };
      }

      // Submit with approved status (this is a special auto-complete task)
      // The XP trigger will automatically award the XP
      const { error } = await supabase
        .from("scholarship_task_submissions")
        .insert({
          task_id: task.id,
          user_id: user.id,
          submission_text: "MODULE_0_VIDEO_WATCH",
          submission_url: "https://vimeo.com/1160816479",
          status: "approved",
          xp_awarded: MODULE_0_XP_VALUE,
        });

      if (error) {
        console.error("Error submitting video completion:", error);
        setIsAwarding(false);
        return { success: false, error };
      }

      // Mark as completed
      setIsVideoCompleted(true);
      const key = `${MODULE_0_VIDEO_COMPLETED_KEY}_${user.id}`;
      localStorage.setItem(key, "true");
      setIsAwarding(false);

      return { success: true, xpAwarded: MODULE_0_XP_VALUE };
    } catch (err) {
      console.error("Error in markVideoCompleted:", err);
      setIsAwarding(false);
      return { success: false, error: err };
    }
  }, [user, isVideoCompleted, isAwarding]);

  return {
    isVideoCompleted,
    isAwarding,
    markVideoCompleted,
  };
}
