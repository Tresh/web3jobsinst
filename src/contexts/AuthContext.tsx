import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "admin" | "moderator" | "user";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  provider: string | null;
  onboarding_completed: boolean | null;
  onboarding_step: number | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  isLoading: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string, referralCode?: string, redirectPath?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshRole: () => Promise<void>;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Guards to prevent redundant fetches
  const lastFetchedUserId = useRef<string | null>(null);
  const isFetching = useRef(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }
      return data as Profile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
  }, []);

  const fetchRole = useCallback(async (userId: string): Promise<AppRole | null> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .order("role");

      if (error) {
        console.error("Error fetching role:", error);
        return null;
      }

      if (data && data.length > 0) {
        const roles = data.map((r) => r.role as AppRole);
        if (roles.includes("admin")) return "admin";
        if (roles.includes("moderator")) return "moderator";
        return "user";
      }
      return "user";
    } catch (error) {
      console.error("Error fetching role:", error);
      return null;
    }
  }, []);

  const refreshRole = async () => {
    if (user) {
      const userRole = await fetchRole(user.id);
      setRole(userRole);
    }
  };

  const refetchProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);
    }
  };

  const loadUserData = useCallback(async (userId: string, event?: string) => {
    // Skip if already fetching or if same user data was just fetched
    if (isFetching.current) return;
    if (lastFetchedUserId.current === userId && event === "TOKEN_REFRESHED") return;
    
    isFetching.current = true;
    try {
      const [userProfile, userRole] = await Promise.all([
        fetchProfile(userId),
        fetchRole(userId),
      ]);
      setProfile(userProfile);
      setRole(userRole);
      lastFetchedUserId.current = userId;
    } finally {
      isFetching.current = false;
      setIsLoading(false);
    }
  }, [fetchProfile, fetchRole]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to prevent potential deadlock with Supabase client
          setTimeout(async () => {
            await loadUserData(currentSession.user.id, event);

            // Track referral on first login (new user signup)
            if (event === "SIGNED_IN") {
              const storedRefCode = sessionStorage.getItem("referral_code");
              const metadataRefCode = currentSession.user.user_metadata?.referral_code;
              const referralCode = storedRefCode || metadataRefCode;
              
              if (referralCode) {
                try {
                  const { data: referrerCode } = await supabase
                    .from("scholar_referral_codes")
                    .select("user_id")
                    .eq("referral_code", referralCode)
                    .maybeSingle();

                  if (referrerCode && referrerCode.user_id !== currentSession.user.id) {
                    const { data: existing } = await supabase
                      .from("scholar_referrals")
                      .select("id")
                      .eq("referred_user_id", currentSession.user.id)
                      .maybeSingle();

                    if (!existing) {
                      await supabase.from("scholar_referrals").insert({
                        referrer_user_id: referrerCode.user_id,
                        referred_user_id: currentSession.user.id,
                        referral_code: referralCode,
                      });
                      console.log("Referral tracked successfully:", referralCode);
                    }
                  }
                } catch (err) {
                  console.error("Error tracking referral:", err);
                }
                sessionStorage.removeItem("referral_code");
              }
            }
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          lastFetchedUserId.current = null;
          setIsLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!initialSession) {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signInWithTwitter = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signUpWithEmail = async (email: string, password: string, fullName?: string, referralCode?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          referral_code: referralCode || undefined,
        },
      },
    });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    lastFetchedUserId.current = null;
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    role,
    isLoading,
    isAdmin: role === "admin",
    isModerator: role === "moderator" || role === "admin",
    signInWithGoogle,
    signInWithTwitter,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    refreshRole,
    refetchProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
