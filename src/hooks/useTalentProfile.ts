import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface TalentProfile {
  id: string;
  user_id: string;
  headline: string;
  bio: string | null;
  category: string;
  skills: string[];
  portfolio_links: string[];
  hourly_rate: number | null;
  availability: "available" | "busy";
  rating: number;
  completed_projects: number;
  social_twitter: string | null;
  social_linkedin: string | null;
  social_github: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface TalentProfileWithUser extends TalentProfile {
  full_name: string;
  avatar_url: string | null;
  // Payment preferences (optional — only present if user set them)
  accepts_crypto?: boolean | null;
  accepts_paypal?: boolean | null;
  accepts_bank_transfer?: boolean | null;
  payment_region?: string | null;
}

export const TALENT_CATEGORIES = [
  { value: "ai_developer", label: "AI Developer" },
  { value: "developer", label: "Developer" },
  { value: "designer", label: "Designer" },
  { value: "marketer", label: "Marketer" },
  { value: "writer", label: "Writer" },
  { value: "trader", label: "Trader" },
  { value: "community_manager", label: "Community Manager" },
  { value: "researcher", label: "Researcher" },
  { value: "consultant", label: "Consultant" },
] as const;

export const useTalentProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<TalentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("talent_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data as TalentProfile | null);
    } catch (error: any) {
      console.error("Error fetching talent profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async (data: Partial<TalentProfile>) => {
    if (!user) return { success: false, error: "Not authenticated" };

    setSaving(true);
    try {
      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from("talent_profiles")
          .update(data)
          .eq("user_id", user.id);

        if (error) throw error;

        setProfile({ ...profile, ...data } as TalentProfile);
        toast({
          title: "Profile Updated",
          description: "Your talent profile has been saved.",
        });
      } else {
        // Create new profile
        const { data: newProfile, error } = await supabase
          .from("talent_profiles")
          .insert({
            user_id: user.id,
            headline: data.headline || "",
            category: data.category || "developer",
            ...data,
          })
          .select()
          .single();

        if (error) throw error;

        setProfile(newProfile as TalentProfile);
        toast({
          title: "Profile Created",
          description: "Your talent profile is now live on the marketplace!",
        });
      }

      return { success: true };
    } catch (error: any) {
      console.error("Error saving talent profile:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  const deleteProfile = async () => {
    if (!user) return { success: false, error: "Not authenticated" };

    setSaving(true);
    try {
      const { error } = await supabase
        .from("talent_profiles")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      setProfile(null);
      toast({
        title: "Profile Deleted",
        description: "Your talent profile has been removed.",
      });
      return { success: true };
    } catch (error: any) {
      console.error("Error deleting talent profile:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return { success: false, error: error.message };
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    saving,
    saveProfile,
    deleteProfile,
    refetch: fetchProfile,
  };
};

export const useTalentMarketplace = () => {
  const [talents, setTalents] = useState<TalentProfileWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTalents = async () => {
    setLoading(true);
    try {
      // Fetch talent profiles with user info
      const { data: talentData, error: talentError } = await supabase
        .from("talent_profiles")
        .select("*")
        .eq("is_published", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (talentError) throw talentError;

      if (!talentData || talentData.length === 0) {
        setTalents([]);
        return;
      }

      // Get user IDs to fetch profiles
      const userIds = talentData.map((t) => t.user_id);

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      if (profilesError) throw profilesError;

      // Merge talent profiles with user data
      const merged = talentData.map((talent) => {
        const userProfile = profilesData?.find((p) => p.user_id === talent.user_id);
        return {
          ...talent,
          full_name: userProfile?.full_name || "Anonymous",
          avatar_url: userProfile?.avatar_url || null,
        } as TalentProfileWithUser;
      });

      setTalents(merged);
    } catch (error: any) {
      console.error("Error fetching talents:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalents();
  }, []);

  return { talents, loading, refetch: fetchTalents };
};
