import { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  CheckCircle, 
  ArrowLeft, 
  Loader2, 
  ExternalLink, 
  Clock, 
  Zap,
  Lock,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";
import { useModuleProgress } from "@/hooks/useModuleProgress";
import { useModule0Progress } from "@/hooks/useModule0Progress";
import type { ScholarshipModule, ScholarshipTask } from "@/types/scholarship";

export default function ScholarshipModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videoStarted, setVideoStarted] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  // Fetch module data
  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: ["scholarship-module", moduleId],
    queryFn: async () => {
      if (!moduleId) return null;
      
      const { data, error } = await supabase
        .from("scholarship_modules")
        .select("*")
        .eq("id", moduleId)
        .eq("is_published", true)
        .single();
      
      if (error) throw error;
      return data as ScholarshipModule;
    },
    enabled: !!moduleId,
  });

  // Fetch user's scholarship application for day calculation
  const { data: application } = useQuery({
    queryKey: ["scholarship-application", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("scholarship_applications")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "approved")
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch module progress
  const { data: moduleProgress } = useQuery({
    queryKey: ["module-progress", user?.id, moduleId],
    queryFn: async () => {
      if (!user?.id || !moduleId) return null;
      
      const { data, error } = await supabase
        .from("scholarship_module_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("module_id", moduleId)
        .maybeSingle();
      
      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user?.id && !!moduleId,
  });

  // Fetch related tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["scholarship-tasks", application?.program_id],
    queryFn: async () => {
      if (!application?.program_id) return [];
      
      const { data, error } = await supabase
        .from("scholarship_tasks")
        .select("*")
        .eq("is_published", true)
        .eq("status", "active")
        .or(`is_global.eq.true,program_id.eq.${application.program_id}`);
      
      if (error) throw error;
      return data as ScholarshipTask[];
    },
    enabled: !!application?.program_id,
  });

  // Determine if this is the intro module (order_index = -1)
  const isIntroModule = module?.order_index === -1;
  
  // Use appropriate progress hook based on module type
  const { isVideoCompleted: introCompleted, isAwarding: introAwarding, markVideoCompleted } = useModule0Progress();
  const { markModuleCompleted, isAwarding: regularAwarding } = useModuleProgress({ 
    moduleId: moduleId || "", 
    xpValue: module?.xp_value || 0 
  });

  const isCompleted = isIntroModule ? introCompleted : (moduleProgress?.status === "completed");
  const isAwarding = isIntroModule ? introAwarding : regularAwarding;

  // Calculate day number
  const dayNumber = application?.scholarship_start_date
    ? Math.floor((Date.now() - new Date(application.scholarship_start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 1;

  // Check if module is locked
  const isLocked = useCallback(() => {
    if (!module) return true;
    if (module.order_index === -1) return false;
    
    // Check XP threshold
    const threshold = module.xp_threshold || 0;
    if (threshold > 0 && (application?.total_xp || 0) < threshold) {
      return true;
    }
    
    const unlockType = module.unlock_type;
    
    if (unlockType === "immediate") return false;
    if (unlockType === "day") {
      return module.unlock_day ? dayNumber < module.unlock_day : false;
    }
    if (unlockType === "task") return false;
    if (unlockType === "manual") return true;
    return false;
  }, [module, dayNumber, application?.total_xp]);

  const getUnlockMessage = () => {
    if (!module) return "This module is locked";
    
    // Check XP threshold first
    const threshold = module.xp_threshold || 0;
    if (threshold > 0 && (application?.total_xp || 0) < threshold) {
      return `This module requires ${threshold} XP to unlock. You currently have ${application?.total_xp || 0} XP.`;
    }
    
    switch (module.unlock_type) {
      case "day":
        return `This module unlocks on Day ${module.unlock_day}. You are currently on Day ${dayNumber}.`;
      case "task":
        return "Complete the required task to unlock this module.";
      case "manual":
        return "This module will be unlocked by an admin.";
      default:
        return "This module is currently locked.";
    }
  };

  // Get attached tasks for this module
  const attachedTasks = tasks.filter(task => {
    if (!module) return false;
    if (task.description?.toLowerCase().includes(module.title.toLowerCase())) {
      return true;
    }
    if (module.unlock_task_id === task.id) {
      return true;
    }
    return false;
  });

  // Parse Vimeo URL to get embed URL
  const getEmbedUrl = (url: string | null): string => {
    if (!url) return "";
    
    if (url.includes("player.vimeo.com")) {
      return url;
    }
    
    const vimeoRegex = /(?:vimeo\.com\/)(\d+)(?:\/([a-zA-Z0-9]+))?/;
    const match = url.match(vimeoRegex);
    
    if (match) {
      const videoId = match[1];
      const hash = match[2];
      return hash 
        ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
        : `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  const handleVideoEnd = useCallback(async () => {
    if (isCompleted) return;
    setShowCompletionPrompt(true);
  }, [isCompleted]);

  const handleConfirmCompletion = async () => {
    if (isIntroModule) {
      const result = await markVideoCompleted();
      if (result.success) {
        if (!result.alreadyCompleted) {
          toast.success(`Module Complete! +${module?.xp_value || 100} XP awarded 🎉`);
        }
        setShowCompletionPrompt(false);
      } else {
        toast.error("Failed to record completion. Please try again.");
      }
    } else {
      const result = await markModuleCompleted();
      if (result.success) {
        toast.success(`Module Complete! +${module?.xp_value} XP awarded 🎉`);
        setShowCompletionPrompt(false);
      } else {
        toast.error("Failed to record completion. Please try again.");
      }
    }
  };

  // Listen for Vimeo player events
  const handleIframeMessage = useCallback((event: MessageEvent) => {
    if (!event.origin.includes("vimeo.com")) return;
    
    try {
      const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
      if (data.event === "play") {
        setVideoStarted(true);
      } else if (data.event === "ended") {
        handleVideoEnd();
      }
    } catch {
      // Ignore non-JSON messages
    }
  }, [handleVideoEnd]);

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [handleIframeMessage]);

  const goBack = () => navigate("/dashboard/scholarship", { state: { tab: "modules" } });

  if (moduleLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full rounded-lg" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={goBack} className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Modules
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Module Not Found</h3>
            <p className="text-muted-foreground">
              This module doesn't exist or is no longer available.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show locked state
  if (isLocked()) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={goBack} className="gap-2 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Modules
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
            <p className="text-muted-foreground mb-4">
              {getUnlockMessage()}
            </p>
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              {module.xp_value} XP on completion
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  const embedUrl = getEmbedUrl(module.video_url);

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={goBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Modules
      </Button>

      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="relative overflow-hidden rounded-t-lg bg-muted">
            <AspectRatio ratio={16 / 9}>
              {embedUrl ? (
                <iframe
                  title={module.title}
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">No video available</p>
                </div>
              )}
            </AspectRatio>
          </div>

          <div className="p-6 space-y-4">
            {/* Module Info */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">{module.title}</h2>
                {module.description && (
                  <p className="text-muted-foreground mt-2">{module.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                {module.video_duration && (
                  <Badge variant="outline" className="gap-1">
                    <Clock className="w-3 h-3" />
                    {module.video_duration}
                  </Badge>
                )}
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                  <Zap className="w-3 h-3" />
                  {module.xp_value} XP
                </Badge>
                {isCompleted && (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
            </div>

            {/* Completion Prompt */}
            {showCompletionPrompt && !isCompleted && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">Video Complete!</p>
                  <p className="text-sm text-muted-foreground">Click to confirm and receive your XP reward.</p>
                </div>
                <Button onClick={handleConfirmCompletion} disabled={isAwarding}>
                  {isAwarding ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Awarding XP...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Claim {module.xp_value} XP
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Manual Completion Button */}
            {!isCompleted && videoStarted && !showCompletionPrompt && (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowCompletionPrompt(true)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                I've finished watching - Claim XP
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Attached Tasks - Show for intro module OR any module with tasks */}
      {(isIntroModule || attachedTasks.length > 0) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Attached Tasks</h3>
            <div className="space-y-4">
              {isIntroModule && (
                <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">Announce Your Web3 Jobs Institute Journey</h4>
                      <Badge variant="outline" className="text-xs">
                        50 XP
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      After watching the video, make a post on X (Twitter) announcing that you are starting 
                      the Web3 Jobs Institute Scholarship. Share that you will be building in public and 
                      carrying your audience along. Attach a screenshot showing you watched the video.
                    </p>
                    <p className="text-xs text-muted-foreground italic">
                      📌 Submit this task from the Tasks tab once completed.
                    </p>
                  </div>
                </div>
              )}
              {attachedTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-4 bg-secondary/50 rounded-lg">
                  <div className="h-8 w-8 rounded-lg bg-background flex items-center justify-center shrink-0">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {task.xp_value} XP
                      </Badge>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground italic">
                      📌 Submit this task from the Tasks tab once completed.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
