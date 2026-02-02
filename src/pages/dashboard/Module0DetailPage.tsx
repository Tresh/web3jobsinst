import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  CheckCircle, 
  ArrowLeft, 
  Loader2, 
  ExternalLink, 
  Clock, 
  Zap 
} from "lucide-react";
import { useModule0Progress } from "@/hooks/useModule0Progress";
import { toast } from "sonner";

interface Module0DetailPageProps {
  onRefetch?: () => void;
}

export default function Module0DetailPage({ onRefetch }: Module0DetailPageProps) {
  const navigate = useNavigate();
  const { isVideoCompleted, isAwarding, markVideoCompleted } = useModule0Progress();
  const [videoStarted, setVideoStarted] = useState(false);
  const [showCompletionPrompt, setShowCompletionPrompt] = useState(false);

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

  useEffect(() => {
    window.addEventListener("message", handleIframeMessage);
    return () => window.removeEventListener("message", handleIframeMessage);
  }, [handleIframeMessage]);

  const goBack = () => navigate("/dashboard/scholarship", { state: { tab: "modules" } });

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

          <div className="p-6 space-y-4">
            {/* Module Info */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Introduction to the Web3 Jobs Institute Scholarship Program</h2>
                <p className="text-muted-foreground mt-2">
                  Watch this introduction video to learn about the scholarship program and what to expect. 
                  This module will give you an overview of the 30-day journey ahead.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  5:00
                </Badge>
                <Badge className="bg-primary/10 text-primary border-primary/20 gap-1">
                  <Zap className="w-3 h-3" />
                  100 XP
                </Badge>
                {isVideoCompleted && (
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                )}
              </div>
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

            {/* Manual Completion Button */}
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
          </div>
        </CardContent>
      </Card>

      {/* Attached Task */}
      <Card>
        <CardContent className="p-6">
          <h3 className="font-semibold mb-4">Attached Task</h3>
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
        </CardContent>
      </Card>
    </div>
  );
}
