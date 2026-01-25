import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, Check, Sparkles } from "lucide-react";
import { useDailyCheckIn } from "@/hooks/useDailyCheckIn";
import type { ScholarshipApplication } from "@/types/scholarship";
import { toast } from "sonner";

interface DailyCheckInCardProps {
  application: ScholarshipApplication;
  onCheckInSuccess: () => void;
}

// Milestone days for display
const MILESTONES = [3, 7, 14, 30, 40, 60];

export function DailyCheckInCard({ application, onCheckInSuccess }: DailyCheckInCardProps) {
  const {
    performCheckIn,
    isCheckingIn,
    hasCheckedInToday,
    currentStreak,
  } = useDailyCheckIn(application, onCheckInSuccess);

  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheckIn = async () => {
    const result = await performCheckIn();
    
    if (result.success) {
      setShowSuccess(true);
      
      let message = `+${result.xpAwarded} XP earned!`;
      if (result.bonusXp > 0) {
        message += ` 🎉 Bonus: +${result.bonusXp} XP for Day ${result.newStreak} milestone!`;
      }
      
      toast.success("Daily Check-In Complete!", {
        description: message,
      });
      
      setTimeout(() => setShowSuccess(false), 2000);
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  // Progress percentage (Day X of 60)
  const progressPercentage = Math.min((currentStreak / 60) * 100, 100);
  
  // Find next milestone
  const nextMilestone = MILESTONES.find(m => m > currentStreak) || 60;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Daily Check-In
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Streak Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold">{currentStreak}</span>
              </div>
              <span className="text-sm text-muted-foreground">day streak</span>
            </div>
            
            {/* Check-In Button */}
            <Button
              onClick={handleCheckIn}
              disabled={hasCheckedInToday || isCheckingIn}
              size="sm"
              className={hasCheckedInToday 
                ? "bg-accent text-accent-foreground border-border hover:bg-accent" 
                : ""}
              variant={hasCheckedInToday ? "outline" : "default"}
            >
              {isCheckingIn ? (
                "Checking in..."
              ) : hasCheckedInToday ? (
                <>
                  <Check className="w-4 h-4 mr-1 text-primary" />
                  Checked in today
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1" />
                  Daily Check-In
                </>
              )}
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Day {currentStreak} of 60</span>
              <span>Next milestone: Day {nextMilestone}</span>
            </div>
          </div>

          {/* Success Animation Overlay */}
          {showSuccess && (
            <div className="text-center text-primary font-medium animate-pulse">
              ✨ Streak increased!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
