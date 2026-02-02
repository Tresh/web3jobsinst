import { useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CheckCircle, ArrowLeft, Loader2, ExternalLink, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import type { ScholarshipModule, ScholarshipTask } from "@/types/scholarship";

interface ModuleVideoPlayerProps {
  module: ScholarshipModule;
  isCompleted: boolean;
  attachedTasks: ScholarshipTask[];
  onBack: () => void;
  onComplete: () => Promise<{ success: boolean }>;
}

export function ModuleVideoPlayer({ 
  module, 
  isCompleted, 
  attachedTasks,
  onBack, 
  onComplete 
}: ModuleVideoPlayerProps) {
  const [videoStarted, setVideoStarted] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);
  const [isAwarding, setIsAwarding] = useState(false);

  // Parse Vimeo URL to get embed URL
  const getEmbedUrl = (url: string | null): string => {
    if (!url) return "";
    
    // If it's already an embed URL, return as is
    if (url.includes("player.vimeo.com")) {
      return url;
    }
    
    // Extract video ID from various Vimeo URL formats
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
    setIsAwarding(true);
    const result = await onComplete();
    if (result.success) {
      toast.success(`Module Complete! +${module.xp_value} XP awarded 🎉`);
      setShowCompletionPrompt(false);
    } else {
      toast.error("Failed to record completion. Please try again.");
    }
    setIsAwarding(false);
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

  const embedUrl = getEmbedUrl(module.video_url);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="gap-2">
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
              <div className="flex items-center gap-2 shrink-0">
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

      {/* Attached Tasks */}
      {attachedTasks.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Attached Tasks</h3>
            <div className="space-y-4">
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
