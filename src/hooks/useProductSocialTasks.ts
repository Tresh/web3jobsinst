import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SocialTask {
  id: string;
  product_id: string;
  platform: string;
  task_type: string;
  target_url: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface SocialCompletion {
  id: string;
  user_id: string;
  task_id: string;
  proof_url: string | null;
  completed_at: string;
}

const platformLabels: Record<string, string> = {
  x: "X (Twitter)",
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  telegram: "Telegram",
};

const taskTypeLabels: Record<string, string> = {
  follow: "Follow",
  retweet: "Retweet",
  like: "Like",
  comment: "Comment",
  subscribe: "Subscribe",
  join: "Join",
};

export const getPlatformLabel = (p: string) => platformLabels[p] || p;
export const getTaskTypeLabel = (t: string) => taskTypeLabels[t] || t;

export function useProductSocialTasks(productId: string | undefined) {
  return useQuery({
    queryKey: ["product-social-tasks", productId],
    queryFn: async () => {
      if (!productId) return [];
      const { data, error } = await supabase
        .from("product_social_tasks")
        .select("*")
        .eq("product_id", productId)
        .order("order_index");
      if (error) throw error;
      return data as SocialTask[];
    },
    enabled: !!productId,
  });
}

export function useMyTaskCompletions(productId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["product-social-completions", productId, user?.id],
    queryFn: async () => {
      if (!productId || !user) return [];
      // Get all task IDs for this product first
      const { data: tasks } = await supabase
        .from("product_social_tasks")
        .select("id")
        .eq("product_id", productId);
      if (!tasks?.length) return [];
      const taskIds = tasks.map((t) => t.id);
      const { data, error } = await supabase
        .from("product_social_completions")
        .select("*")
        .eq("user_id", user.id)
        .in("task_id", taskIds);
      if (error) throw error;
      return data as SocialCompletion[];
    },
    enabled: !!productId && !!user,
  });
}

export function useCompleteTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ taskId, proofUrl }: { taskId: string; proofUrl: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("product_social_completions").upsert(
        { user_id: user.id, task_id: taskId, proof_url: proofUrl },
        { onConflict: "user_id,task_id" }
      );
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["product-social-completions"] });
    },
  });
}

// Admin hooks
export function useCreateSocialTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: Omit<SocialTask, "id" | "created_at">) => {
      const { error } = await supabase.from("product_social_tasks").insert(task as any);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product-social-tasks"] }),
  });
}

export function useDeleteSocialTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.from("product_social_tasks").delete().eq("id", taskId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["product-social-tasks"] }),
  });
}
