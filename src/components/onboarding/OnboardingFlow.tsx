import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight, User, Check, GraduationCap } from "lucide-react";

interface OnboardingFlowProps {
  onComplete: () => void;
}

const SCHOLARSHIP_POPUP_KEY = "scholarship_popup_dismissed_at";

const shouldShowScholarshipPopup = (userId: string): boolean => {
  const key = `${SCHOLARSHIP_POPUP_KEY}_${userId}`;
  const dismissedAt = localStorage.getItem(key);
  
  if (!dismissedAt) {
    return true; // Never dismissed, show it
  }
  
  const dismissedDate = new Date(dismissedAt);
  const now = new Date();
  const oneDayInMs = 24 * 60 * 60 * 1000;
  
  // Show again if more than 24 hours have passed
  return now.getTime() - dismissedDate.getTime() > oneDayInMs;
};

const dismissScholarshipPopup = (userId: string): void => {
  const key = `${SCHOLARSHIP_POPUP_KEY}_${userId}`;
  localStorage.setItem(key, new Date().toISOString());
};

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [showScholarshipPrompt, setShowScholarshipPrompt] = useState(false);
  const [hasExistingApplication, setHasExistingApplication] = useState<boolean | null>(null);

  // Check if user has already applied to any scholarship
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user?.id) {
        setHasExistingApplication(false);
        return;
      }
      
      const { data } = await supabase
        .from("scholarship_applications")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);
      
      setHasExistingApplication(data && data.length > 0);
    };
    
    checkExistingApplication();
  }, [user?.id]);

  useEffect(() => {
    // Wait for application check to complete
    if (hasExistingApplication === null) return;
    
    // Determine starting step based on profile completeness
    if (!profile?.full_name) {
      setStep(1);
    } else if (user?.id && !hasExistingApplication && shouldShowScholarshipPopup(user.id)) {
      // Profile is complete, no existing application, check if we should show scholarship prompt
      setShowScholarshipPrompt(true);
    } else {
      // Either already applied or popup was dismissed recently, complete onboarding silently
      onComplete();
    }
  }, [profile, user?.id, onComplete, hasExistingApplication]);

  const handleSaveName = async () => {
    if (!fullName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName.trim() })
      .eq("user_id", user?.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setStep(2);
    }

    setIsLoading(false);
  };

  const handleCompleteOnboarding = async () => {
    setIsLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_completed: true, onboarding_step: 2 })
      .eq("user_id", user?.id);

    if (error) {
      console.error("Error completing onboarding:", error);
    }

    setIsLoading(false);
    
    // Only show scholarship prompt if no existing application and not dismissed recently
    if (user?.id && !hasExistingApplication && shouldShowScholarshipPopup(user.id)) {
      setShowScholarshipPrompt(true);
    } else {
      onComplete();
    }
  };

  const handleScholarshipChoice = (apply: boolean) => {
    if (user?.id) {
      dismissScholarshipPopup(user.id);
    }
    setShowScholarshipPrompt(false);
    onComplete();
    if (apply) {
      window.location.href = "/dashboard/scholarship";
    }
  };

  // Scholarship prompt after completion
  if (showScholarshipPrompt) {
    return (
      <Dialog open onOpenChange={() => handleScholarshipChoice(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center">Apply for a Scholarship?</DialogTitle>
            <DialogDescription className="text-center">
              Get free access to our 30-day Web3 skills program. Top performers earn $200–$1,000 tuition credits!
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3 pt-4">
            <Button onClick={() => handleScholarshipChoice(true)}>
              <GraduationCap className="w-4 h-4 mr-2" />
              Yes, I want to apply!
            </Button>
            <Button variant="outline" onClick={() => handleScholarshipChoice(false)}>
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 1: Name
  if (step === 1) {
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-center">Welcome! What's your name?</DialogTitle>
            <DialogDescription className="text-center">
              This helps us personalize your experience
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
              />
            </div>
            <Button className="w-full" onClick={handleSaveName} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Complete
  if (step === 2) {
    return (
      <Dialog open onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <DialogTitle className="text-center">You're all set, {fullName || "there"}!</DialogTitle>
            <DialogDescription className="text-center">
              Your account is ready. Let's get started!
            </DialogDescription>
          </DialogHeader>
          <div className="pt-4">
            <Button className="w-full" onClick={handleCompleteOnboarding} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              Go to Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
};

export default OnboardingFlow;
