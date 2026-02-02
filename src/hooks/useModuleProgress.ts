import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UseModuleProgressProps {
  moduleId: string;
  xpValue: number;
}

export function useModuleProgress({ moduleId, xpValue }: UseModuleProgressProps) {
  const { user } = useAuth();
  const [isAwarding, setIsAwarding] = useState(false);

  const markModuleCompleted = useCallback(async () => {
    if (!user || isAwarding) return { success: false };
    
    setIsAwarding(true);

    try {
      // Check if already completed
      const { data: existingProgress } = await supabase
        .from("scholarship_module_progress")
        .select("id, status")
        .eq("module_id", moduleId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProgress?.status === "completed") {
        setIsAwarding(false);
        return { success: true, alreadyCompleted: true };
      }

      // Get the module details to find any associated task
      const { data: moduleData } = await supabase
        .from("scholarship_modules")
        .select("title, xp_value")
        .eq("id", moduleId)
        .single();

      if (!moduleData) {
        setIsAwarding(false);
        return { success: false };
      }

      // Create or update module progress
      if (existingProgress) {
        const { error } = await supabase
          .from("scholarship_module_progress")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
          })
          .eq("id", existingProgress.id);

        if (error) {
          console.error("Error updating module progress:", error);
          setIsAwarding(false);
          return { success: false, error };
        }
      } else {
        const { error } = await supabase
          .from("scholarship_module_progress")
          .insert({
            module_id: moduleId,
            user_id: user.id,
            status: "completed",
            unlocked_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
          });

        if (error) {
          console.error("Error inserting module progress:", error);
          setIsAwarding(false);
          return { success: false, error };
        }
      }

      // Find or create a task submission for this module video
      // Look for a task associated with this module (by title convention)
      const { data: moduleTask } = await supabase
        .from("scholarship_tasks")
        .select("id, xp_value")
        .ilike("title", `%${moduleData.title.substring(0, 30)}%`)
        .eq("task_type", "complete_lesson")
        .maybeSingle();

      if (moduleTask) {
        // Check if submission already exists
        const { data: existingSub } = await supabase
          .from("scholarship_task_submissions")
          .select("id")
          .eq("task_id", moduleTask.id)
          .eq("user_id", user.id)
          .maybeSingle();

        if (!existingSub) {
          // Create auto-approved submission for the module video
          await supabase
            .from("scholarship_task_submissions")
            .insert({
              task_id: moduleTask.id,
              user_id: user.id,
              submission_text: `MODULE_VIDEO_WATCH_${moduleId}`,
              submission_url: null,
              status: "approved",
              xp_awarded: moduleTask.xp_value || xpValue,
            });
        }
      } else if (xpValue > 0) {
        // No specific task found, just update user's total XP directly
        const { data: appData } = await supabase
          .from("scholarship_applications")
          .select("total_xp")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .maybeSingle();

        if (appData) {
          await supabase
            .from("scholarship_applications")
            .update({ total_xp: (appData.total_xp || 0) + xpValue })
            .eq("user_id", user.id)
            .eq("status", "approved");
        }
      }

      setIsAwarding(false);
      return { success: true, xpAwarded: xpValue };
    } catch (err) {
      console.error("Error in markModuleCompleted:", err);
      setIsAwarding(false);
      return { success: false, error: err };
    }
  }, [user, moduleId, xpValue, isAwarding]);

  return {
    isAwarding,
    markModuleCompleted,
  };
}
