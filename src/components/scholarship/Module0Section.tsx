import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Play, Loader2, Video, ExternalLink } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useModule0Progress } from "@/hooks/useModule0Progress";
import { toast } from "sonner";

interface Module0SectionProps {
  onRefetch?: () => void;
}

export function Module0Section({ onRefetch }: Module0SectionProps) {
  const { isVideoCompleted, isAwarding, markVideoCompleted } = useModule0Progress();
  const [videoStarted, setVideoStarted] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

  // Handle video end event via postMessage from Vimeo
  const handleVideoEnd = useCallback(async () => {
    if (isVideoCompleted) return;
    
    setShowCompletionPrompt(true);
  }, [isVideoCompleted]);

  const handleConfirmCompletion = async () => {
    const result = await markVideoCompleted();
    if (result.success) {
      if (!result.alreadyCompleted) {
        toast.success("Module 0 Complete! +100 XP awarded 🎉");
      }
      setShowCompletionPrompt(false);
      onRefetch?.();
    } else {
      toast.error("Failed to record completion. Please try again.");
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

  // Set up message listener
  useState(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  });

  return (
    <Card className={`transition-all ${isVideoCompleted ? "bg-green-500/5 border-green-500/20" : ""}`}>
      <CardContent className="p-4 space-y-4">
        {/* Module Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                isVideoCompleted
                  ? "bg-green-500/10 text-green-500"
                  : "bg-blue-500/10 text-blue-500"
              }`}
            >
              {isVideoCompleted ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-muted-foreground">Module 0</span>
                {isVideoCompleted ? (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                ) : (
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                    <Play className="w-3 h-3 mr-1" />
                    Available
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  100 XP
                </Badge>
              </div>
              <h3 className="font-medium">Introduction to the Web3 Jobs Institute Scholarship Program</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Watch this introduction video to learn about the scholarship program and what to expect.
              </p>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative overflow-hidden rounded-lg bg-muted">
          <AspectRatio ratio={16 / 9}>
            <iframe
              title="Introduction to Web3 Jobs Institute Scholarship"
              src="https://player.vimeo.com/video/1160816479?h=f4d7dc7bc8"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
            />
          </AspectRatio>
        </div>

        {/* Completion Prompt */}
        {showCompletionPrompt && !isVideoCompleted && (
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
                  Claim 100 XP
                </>
              )}
            </Button>
          </div>
        )}

        {/* Manual Completion Button (for users who watched but didn't trigger the event) */}
        {!isVideoCompleted && videoStarted && !showCompletionPrompt && (
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setShowCompletionPrompt(true)}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            I've finished watching - Claim XP
          </Button>
        )}

        {/* Attached Task */}
        <div className="border-t pt-4 mt-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center">
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm">Attached Task: Announce Your Web3 Jobs Institute Journey</h4>
                <Badge variant="outline" className="text-xs">50 XP</Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                After watching the video, make a post on X (Twitter) announcing that you are starting the Web3 Jobs Institute Scholarship. 
                Share that you will be building in public and carrying your audience along. Attach a screenshot showing you watched the video.
              </p>
              <p className="text-xs text-muted-foreground italic">
                📌 Submit this task from the Tasks tab once completed.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
