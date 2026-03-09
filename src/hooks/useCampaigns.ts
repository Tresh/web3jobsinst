import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface DBCampaign {
  id: string; title: string; description: string | null; type: string;
  reward: string | null; max_participants: number; deadline: string | null;
  status: string; project: string | null; requirements: string[];
  cover_image_url: string | null; is_published: boolean;
  created_at: string; participant_count?: number;
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<DBCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("platform_campaigns")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Get participant counts
      const ids = data.map((c: any) => c.id);
      const { data: parts } = await supabase
        .from("campaign_participants")
        .select("campaign_id")
        .in("campaign_id", ids);

      const countMap: Record<string, number> = {};
      (parts || []).forEach((p: any) => {
        countMap[p.campaign_id] = (countMap[p.campaign_id] || 0) + 1;
      });

      setCampaigns(data.map((c: any) => ({
        ...c,
        requirements: Array.isArray(c.requirements) ? c.requirements : [],
        participant_count: countMap[c.id] || 0,
      })));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  return { campaigns, loading, refetch: fetchCampaigns };
};

export const useCampaignParticipation = (campaignId: string | null) => {
  const { user } = useAuth();
  const [participation, setParticipation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchParticipation = useCallback(async () => {
    if (!user || !campaignId) return;
    setLoading(true);
    const { data } = await supabase
      .from("campaign_participants")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("user_id", user.id)
      .maybeSingle();
    setParticipation(data);
    setLoading(false);
  }, [user, campaignId]);

  useEffect(() => { fetchParticipation(); }, [fetchParticipation]);

  const joinCampaign = async () => {
    if (!user || !campaignId) return false;
    const { error } = await supabase.from("campaign_participants").insert({
      campaign_id: campaignId,
      user_id: user.id,
      status: "joined",
    });
    if (!error) { fetchParticipation(); return true; }
    return false;
  };

  const submitProof = async (submissionUrl: string, submissionText: string) => {
    if (!user || !participation) return false;
    const { error } = await supabase.from("campaign_participants")
      .update({ submission_url: submissionUrl, submission_text: submissionText, status: "submitted", updated_at: new Date().toISOString() })
      .eq("id", participation.id);
    if (!error) { fetchParticipation(); return true; }
    return false;
  };

  return { participation, loading, joinCampaign, submitProof, refetch: fetchParticipation };
};
