import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const FEATURE_FLAGS = {
  institutions: "feature_institutions",
  tutors: "feature_tutors",
  talent_market: "feature_talent_market",
  internships: "feature_internships",
  learnfi: "feature_learnfi",
  bootcamps: "feature_bootcamps",
  products: "feature_products",
  campaigns: "feature_campaigns",
} as const;

export type FeatureFlagKey = keyof typeof FEATURE_FLAGS;

export const useFeatureFlags = () => {
  const queryClient = useQueryClient();

  const { data: flags = {}, isLoading } = useQuery({
    queryKey: ["feature-flags"],
    queryFn: async () => {
      const keys = Object.values(FEATURE_FLAGS);
      const { data, error } = await supabase
        .from("platform_settings")
        .select("key, value")
        .in("key", keys);

      if (error) throw error;

      const result: Record<string, boolean> = {};
      // Default all features to true
      for (const [name, key] of Object.entries(FEATURE_FLAGS)) {
        const setting = (data || []).find((d) => d.key === key);
        result[name] = setting ? setting.value === "true" : true;
      }
      return result;
    },
    staleTime: 5 * 60 * 1000,
  });

  const toggleFeature = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("platform_settings")
        .upsert({ key, value: String(enabled), updated_at: new Date().toISOString() }, { onConflict: "key" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
    },
  });

  const isFeatureEnabled = (feature: FeatureFlagKey): boolean => {
    return flags[feature] !== false;
  };

  return { flags, isLoading, toggleFeature, isFeatureEnabled };
};
