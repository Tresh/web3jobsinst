import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const ECARD_TASK_TITLE = "Post Your Scholarship Admission";
const ECARD_TASK_XP = 50;

/**
 * Hook to track e-card generation as a task completion
 * When a user generates/downloads their e-card, this automatically:
 * 1. Creates a submission for the e-card task (if exists)
 * 2. Awards 50 XP when approved
 */
export function useECardTaskTracking() {
  const { user } = useAuth();

  const trackECardGeneration = useCallback(async (downloadUrl?: string) => {
    if (!user) return { success: false, error: "Not authenticated" };

    try {
      // Find the e-card task for the user's program
      const { data: application } = await supabase
        .from("scholarship_applications")
        .select("id, program_id")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .maybeSingle();

      if (!application) {
        return { success: false, error: "No approved application found" };
      }

      // Find the e-card celebration task
      const { data: eCardTask } = await supabase
        .from("scholarship_tasks")
        .select("id, xp_value")
        .eq("is_published", true)
        .eq("status", "active")
        .or(`is_global.eq.true,program_id.eq.${application.program_id}`)
        .ilike("title", `%${ECARD_TASK_TITLE}%`)
        .maybeSingle();

      if (!eCardTask) {
        // No e-card task exists, silently succeed
        return { success: true, taskFound: false };
      }

      // Check if user already has a submission for this task
      const { data: existingSubmission } = await supabase
        .from("scholarship_task_submissions")
        .select("id, status")
        .eq("task_id", eCardTask.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingSubmission) {
        return { 
          success: true, 
          alreadySubmitted: true,
          status: existingSubmission.status 
        };
      }

      // Create a new submission for the e-card task
      const { error: submitError } = await supabase
        .from("scholarship_task_submissions")
        .insert({
          task_id: eCardTask.id,
          user_id: user.id,
          submission_url: downloadUrl || "E-card generated",
          submission_text: "E-card downloaded and ready to share",
          status: "pending",
        });

      if (submitError) {
        console.error("Failed to submit e-card task:", submitError);
        return { success: false, error: submitError.message };
      }

      return { success: true, submitted: true, xpPending: eCardTask.xp_value || ECARD_TASK_XP };
    } catch (error) {
      console.error("Error tracking e-card generation:", error);
      return { success: false, error: "Failed to track e-card task" };
    }
  }, [user]);

  return { trackECardGeneration };
}
