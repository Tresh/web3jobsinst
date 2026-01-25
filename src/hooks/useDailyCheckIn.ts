import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { ScholarshipApplication } from "@/types/scholarship";

// XP milestone bonuses
const MILESTONE_BONUSES: Record<number, number> = {
  3: 10,
  7: 50,
  14: 100,
  30: 200,
  40: 400,
  60: 1000,
};

interface CheckInResult {
  success: boolean;
  xpAwarded: number;
  bonusXp: number;
  newStreak: number;
  error?: string;
}

export function useDailyCheckIn(
  application: ScholarshipApplication | null,
  onSuccess?: () => void
) {
  const { user } = useAuth();
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Check if user has already checked in today
  const hasCheckedInToday = useCallback(() => {
    if (!application?.last_check_in_date) return false;
    const today = new Date().toISOString().split("T")[0];
    return application.last_check_in_date === today;
  }, [application?.last_check_in_date]);

  // Check if streak should be reset (missed a day)
  const shouldResetStreak = useCallback(() => {
    if (!application?.last_check_in_date) return true;
    
    const lastCheckIn = new Date(application.last_check_in_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    lastCheckIn.setHours(0, 0, 0, 0);
    
    const diffTime = today.getTime() - lastCheckIn.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // If more than 1 day has passed, streak should reset
    return diffDays > 1;
  }, [application?.last_check_in_date]);

  const performCheckIn = async (): Promise<CheckInResult> => {
    if (!user || !application) {
      return { success: false, xpAwarded: 0, bonusXp: 0, newStreak: 0, error: "Not authenticated" };
    }

    if (hasCheckedInToday()) {
      return { success: false, xpAwarded: 0, bonusXp: 0, newStreak: application.current_streak || 0, error: "Already checked in today" };
    }

    setIsCheckingIn(true);

    try {
      const today = new Date().toISOString().split("T")[0];
      const resetStreak = shouldResetStreak();
      
      // Calculate new streak
      const newStreak = resetStreak ? 1 : (application.current_streak || 0) + 1;
      
      // Base XP: +1 for daily check-in
      const baseXp = 1;
      
      // Check for milestone bonus
      const bonusXp = MILESTONE_BONUSES[newStreak] || 0;
      const totalXp = baseXp + bonusXp;

      // Insert check-in record
      const { error: checkInError } = await supabase
        .from("scholarship_daily_checkins")
        .insert({
          user_id: user.id,
          application_id: application.id,
          check_in_date: today,
          streak_day: newStreak,
          xp_awarded: baseXp,
          bonus_xp: bonusXp,
        });

      if (checkInError) {
        // Handle unique constraint violation (already checked in)
        if (checkInError.code === "23505") {
          return { success: false, xpAwarded: 0, bonusXp: 0, newStreak: application.current_streak || 0, error: "Already checked in today" };
        }
        throw checkInError;
      }

      // Update application with new streak and XP
      const newHighestStreak = Math.max(newStreak, application.highest_streak || 0);
      const newTotalXp = (application.total_xp || 0) + totalXp;

      const { error: updateError } = await supabase
        .from("scholarship_applications")
        .update({
          current_streak: newStreak,
          highest_streak: newHighestStreak,
          last_check_in_date: today,
          total_xp: newTotalXp,
        })
        .eq("id", application.id);

      if (updateError) {
        throw updateError;
      }

      onSuccess?.();

      return {
        success: true,
        xpAwarded: baseXp,
        bonusXp,
        newStreak,
      };
    } catch (error) {
      console.error("Check-in error:", error);
      return {
        success: false,
        xpAwarded: 0,
        bonusXp: 0,
        newStreak: application.current_streak || 0,
        error: "Failed to check in. Please try again.",
      };
    } finally {
      setIsCheckingIn(false);
    }
  };

  return {
    performCheckIn,
    isCheckingIn,
    hasCheckedInToday: hasCheckedInToday(),
    currentStreak: application?.current_streak || 0,
    highestStreak: application?.highest_streak || 0,
    shouldResetStreak: shouldResetStreak(),
  };
}
