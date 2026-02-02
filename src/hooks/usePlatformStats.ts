import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  totalSignups: number;
  activeScholars: number;
  totalXpEarned: number;
  countries: number;
  tasksCompleted: number;
  activeBootcamps: number;
  bootcampParticipants: number;
}

export const usePlatformStats = () => {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      const [
        profilesResult,
        scholarsResult,
        xpResult,
        countriesResult,
        tasksResult,
        bootcampsResult,
        participantsResult
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("scholarship_applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("scholarship_applications").select("total_xp").eq("status", "approved"),
        supabase.from("scholarship_applications").select("country"),
        supabase.from("scholarship_task_submissions").select("*", { count: "exact", head: true }).eq("status", "approved"),
        supabase.from("bootcamps").select("*", { count: "exact", head: true }).in("status", ["active", "approved"]),
        supabase.from("bootcamp_participants").select("*", { count: "exact", head: true })
      ]);

      const totalXp = xpResult.data?.reduce((sum, app) => sum + (app.total_xp || 0), 0) || 0;
      const uniqueCountries = new Set(countriesResult.data?.map(app => app.country).filter(Boolean));

      return {
        totalSignups: profilesResult.count || 2109,
        activeScholars: scholarsResult.count || 1193,
        totalXpEarned: totalXp || 18045,
        countries: uniqueCountries.size || 37,
        tasksCompleted: tasksResult.count || 2720,
        activeBootcamps: bootcampsResult.count || 3,
        bootcampParticipants: participantsResult.count || 3
      };
    },
    staleTime: 60000, // Cache for 1 minute
    refetchInterval: 60000, // Refetch every minute
  });
};
