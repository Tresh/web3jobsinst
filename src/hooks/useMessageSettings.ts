import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface MessageSettings {
  id: string;
  user_id: string;
  allow_messages_from: "everyone" | "verified_only" | "none";
  auto_reply_message: string | null;
  show_read_receipts: boolean;
  disclaimer_text: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileVisibility {
  id: string;
  user_id: string;
  show_scholarship_status: boolean;
  show_internship_info: boolean;
  show_talent_profile: boolean;
  show_bootcamp_activity: boolean;
  show_learnfi_progress: boolean;
  show_xp_stats: boolean;
  created_at: string;
  updated_at: string;
}

const DEFAULT_MESSAGE_SETTINGS: Partial<MessageSettings> = {
  allow_messages_from: "everyone",
  show_read_receipts: true,
  auto_reply_message: null,
  disclaimer_text: null,
};

const DEFAULT_VISIBILITY: Partial<ProfileVisibility> = {
  show_scholarship_status: true,
  show_internship_info: true,
  show_talent_profile: true,
  show_bootcamp_activity: true,
  show_learnfi_progress: true,
  show_xp_stats: true,
};

export const useMessageSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<MessageSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("message_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching message settings:", error);
    }

    if (!data) {
      // Create default settings
      const { data: newSettings, error: insertError } = await supabase
        .from("message_settings")
        .insert({ user_id: user.id, ...DEFAULT_MESSAGE_SETTINGS })
        .select()
        .single();

      if (!insertError && newSettings) {
        setSettings(newSettings as MessageSettings);
      }
    } else {
      setSettings(data as MessageSettings);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (updates: Partial<MessageSettings>) => {
    if (!user || !settings) return;

    const { data, error } = await supabase
      .from("message_settings")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .select()
      .single();

    if (!error && data) {
      setSettings(data as MessageSettings);
    }
    return { error };
  };

  return { settings, loading, updateSettings, refetch: fetchSettings };
};

export const useProfileVisibility = () => {
  const { user } = useAuth();
  const [visibility, setVisibility] = useState<ProfileVisibility | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchVisibility = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("profile_visibility")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile visibility:", error);
    }

    if (!data) {
      // Create default visibility
      const { data: newVisibility, error: insertError } = await supabase
        .from("profile_visibility")
        .insert({ user_id: user.id, ...DEFAULT_VISIBILITY })
        .select()
        .single();

      if (!insertError && newVisibility) {
        setVisibility(newVisibility as ProfileVisibility);
      }
    } else {
      setVisibility(data as ProfileVisibility);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchVisibility();
  }, [fetchVisibility]);

  const updateVisibility = async (updates: Partial<ProfileVisibility>) => {
    if (!user || !visibility) return;

    const { data, error } = await supabase
      .from("profile_visibility")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .select()
      .single();

    if (!error && data) {
      setVisibility(data as ProfileVisibility);
    }
    return { error };
  };

  return { visibility, loading, updateVisibility, refetch: fetchVisibility };
};

// Fetch another user's visibility settings
export const useOtherUserVisibility = (userId: string | null) => {
  const [visibility, setVisibility] = useState<ProfileVisibility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetch = async () => {
      const { data } = await supabase
        .from("profile_visibility")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      setVisibility((data as ProfileVisibility) || null);
      setLoading(false);
    };

    fetch();
  }, [userId]);

  return { visibility, loading };
};
