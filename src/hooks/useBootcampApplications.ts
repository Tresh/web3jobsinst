import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { BootcampApplication, Bootcamp } from "@/types/bootcamp";

export interface ApplicationWithBootcamp extends BootcampApplication {
  bootcamp?: Bootcamp;
}

export function useMyBootcampApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithBootcamp[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [user?.id]);

  const fetchApplications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Fetch applications
      const { data: appData, error: appError } = await supabase
        .from("bootcamp_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (appError) throw appError;

      if (!appData || appData.length === 0) {
        setApplications([]);
        return;
      }

      // Fetch related bootcamps
      const bootcampIds = [...new Set(appData.map((a) => a.bootcamp_id))];
      const { data: bootcamps } = await supabase
        .from("bootcamps")
        .select("*")
        .in("id", bootcampIds);

      const bootcampMap = new Map((bootcamps || []).map((b) => [b.id, b]));

      const applicationsWithBootcamps: ApplicationWithBootcamp[] = appData.map((app) => ({
        ...app,
        bootcamp: bootcampMap.get(app.bootcamp_id) as Bootcamp | undefined,
      }));

      setApplications(applicationsWithBootcamps);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  return { applications, loading, refetch: fetchApplications };
}

export function useBootcampApplicationsAdmin(bootcampId?: string) {
  const [applications, setApplications] = useState<BootcampApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [bootcampId]);

  const fetchApplications = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("bootcamp_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (bootcampId) {
        query = query.eq("bootcamp_id", bootcampId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setApplications((data as BootcampApplication[]) || []);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    status: "approved" | "rejected",
    adminNotes?: string
  ) => {
    try {
      const { error } = await supabase
        .from("bootcamp_applications")
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (error) throw error;
      await fetchApplications();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return { applications, loading, refetch: fetchApplications, updateApplicationStatus };
}
