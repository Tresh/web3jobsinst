import { useNavigate } from "react-router-dom";
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
  onClick: () => void;
}

export function ModuleListItem({ 
  module, 
  index, 
  status, 
  unlockInfo, 
  onClick 
}: ModuleListItemProps) {
  const navigate = useNavigate();
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
      className={`transition-all cursor-pointer hover:shadow-md group ${
        status === "completed"
          ? "bg-green-500/5 border-green-500/20"
          : isLocked
          ? "opacity-60 hover:opacity-75"
          : "hover:border-primary/30"
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg bg-muted">
          <img 
            src={coverImage} 
            alt={module.title}
            className={`w-full h-full object-cover ${isLocked ? "blur-sm grayscale" : ""}`}
          />
          {/* Duration overlay */}
          {module.video_duration && (
            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
              {module.video_duration}
            </div>
          )}
          {/* Status icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            {status === "completed" ? (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            ) : status === "available" ? (
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-primary-foreground" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Lock className="w-5 h-5 text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Module {index}</span>
            {getStatusBadge()}
          </div>
          <h4 className="font-medium text-sm line-clamp-2 mb-2">{module.title}</h4>
          
          {/* Short description - 1-2 lines only */}
          {module.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
              {module.description}
            </p>
          )}
          
          {/* XP reward */}
          {module.xp_value && module.xp_value > 0 && (
            <Badge variant="outline" className="text-xs gap-1">
              <Zap className="w-3 h-3" />
              {module.xp_value} XP
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
