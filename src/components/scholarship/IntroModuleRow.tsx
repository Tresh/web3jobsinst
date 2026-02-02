import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, Zap, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModule0Progress } from "@/hooks/useModule0Progress";
import type { ScholarshipModule } from "@/types/scholarship";

interface IntroModuleRowProps {
  introModule?: ScholarshipModule | null;
  isLoading?: boolean;
}

export function IntroModuleRow({ introModule, isLoading }: IntroModuleRowProps) {
  const navigate = useNavigate();
  const { isVideoCompleted } = useModule0Progress();

  const handleClick = () => {
    if (introModule) {
      navigate(`/dashboard/scholarship/modules/${introModule.id}`);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <Card className="border-0 border-b border-border rounded-none animate-pulse">
        <div className="flex gap-4 p-3">
          <div className="w-40 sm:w-48 shrink-0">
            <div className="aspect-video bg-muted rounded-lg" />
          </div>
          <div className="flex-1 py-0.5 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="h-5 bg-muted rounded w-24" />
          </div>
        </div>
      </Card>
    );
  }

  // No intro module found
  if (!introModule) {
    return null;
  }

  const coverImage = introModule.cover_image_url || "/placeholder.svg";
  const xpValue = introModule.xp_value || 100;
  const status = isVideoCompleted ? "completed" : "available";

  return (
    <Card 
      className={`transition-all cursor-pointer hover:bg-secondary/50 group border-0 border-b border-border rounded-none ${
        isVideoCompleted ? "bg-green-500/5" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-4 p-3">
        {/* Thumbnail - 16:9 ratio, small */}
        <div className="relative w-40 sm:w-48 shrink-0">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            <img 
              src={coverImage} 
              alt={introModule.title}
              className="w-full h-full object-cover"
            />
            {/* Duration badge */}
            {introModule.video_duration && (
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                {introModule.video_duration}
              </div>
            )}
            {/* Status overlay icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {isVideoCompleted ? (
                <div className="w-8 h-8 rounded-full bg-secondary/90 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Title */}
          <h4 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {introModule.title}
          </h4>
          
          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
            <span>Introduction</span>
            {introModule.video_duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {introModule.video_duration}
                </span>
              </>
            )}
          </div>

          {/* Status and XP badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {status === "completed" ? (
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] h-5">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">
                <Play className="w-3 h-3 mr-1" />
                Available
              </Badge>
            )}
            
            <Badge variant="outline" className="text-[10px] h-5 gap-1">
              <Zap className="w-3 h-3" />
              {xpValue} XP
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
}
