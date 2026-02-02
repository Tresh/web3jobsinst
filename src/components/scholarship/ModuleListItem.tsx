import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lock, Play, Zap } from "lucide-react";
import { toast } from "sonner";
import type { ScholarshipModule } from "@/types/scholarship";

interface ModuleListItemProps {
  module: ScholarshipModule;
  index: number;
  status: "locked" | "available" | "completed";
  unlockInfo: string | null;
  isSelected: boolean;
  onClick: () => void;
}

export function ModuleListItem({ 
  module, 
  index, 
  status, 
  unlockInfo, 
  isSelected,
  onClick 
}: ModuleListItemProps) {
  const isLocked = status === "locked";

  const handleClick = () => {
    if (isLocked) {
      toast.info(
        unlockInfo || "This module is currently locked",
        { 
          description: "Complete the required steps to unlock this module.",
          duration: 4000 
        }
      );
      return;
    }
    onClick();
  };

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-secondary text-green-600 dark:text-green-400 border-border text-xs">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "available":
        return (
          <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
            <Play className="w-3 h-3 mr-1" />
            Available
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        );
    }
  };

  const coverImage = module.cover_image_url || "/placeholder.svg";

  return (
    <Card 
      className={`transition-all cursor-pointer hover:shadow-md ${
        isSelected 
          ? "ring-2 ring-primary" 
          : status === "completed"
          ? "bg-green-500/5 border-green-500/20"
          : isLocked
          ? "opacity-60 hover:opacity-75"
          : ""
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="relative shrink-0 w-32 h-20 rounded-md overflow-hidden bg-muted">
            <img 
              src={coverImage} 
              alt={module.title}
              className={`w-full h-full object-cover ${isLocked ? "blur-sm grayscale" : ""}`}
            />
            {/* Duration overlay */}
            {module.video_duration && (
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                {module.video_duration}
              </div>
            )}
            {/* Status icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
            {status === "completed" ? (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              ) : status === "available" ? (
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Content - Only essential info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-muted-foreground">Module {index + 1}</span>
              {getStatusBadge()}
            </div>
            <h4 className="font-medium text-sm line-clamp-2">{module.title}</h4>
            
            {/* XP reward only */}
            {module.xp_value && module.xp_value > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="outline" className="text-xs gap-1">
                  <Zap className="w-3 h-3" />
                  {module.xp_value} XP
                </Badge>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}