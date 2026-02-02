import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ScholarshipModule } from "@/types/scholarship";

/**
 * Hook to fetch the Introduction Module (Module 0) from the database.
 * This is the first module with order_index = -1.
 */
export function useIntroModule(programId?: string) {
  const [introModule, setIntroModule] = useState<ScholarshipModule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIntroModule = async () => {
      if (!programId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("scholarship_modules")
          .select("id, program_id, title, description, order_index, unlock_type, unlock_day, unlock_task_id, is_published, cover_image_url, video_url, video_duration, xp_value, created_at, updated_at")
          .eq("program_id", programId)
          .eq("order_index", -1)
          .eq("is_published", true)
          .maybeSingle();

        if (error) {
          console.error("Error fetching intro module:", error);
        } else if (data) {
          setIntroModule(data as unknown as ScholarshipModule);
        }
      } catch (err) {
        console.error("Error in useIntroModule:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIntroModule();
  }, [programId]);

  return { introModule, isLoading };
}
