import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lock, Play, Clock, Zap, Calendar } from "lucide-react";
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

  const getStatusBadge = () => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
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

  // Default placeholder if no cover image
  const coverImage = module.cover_image_url || "/placeholder.svg";

  return (
    <Card 
      className={`transition-all cursor-pointer hover:shadow-md ${
        isSelected 
          ? "ring-2 ring-primary" 
          : status === "completed"
          ? "bg-green-500/5 border-green-500/20"
          : isLocked
          ? "opacity-60"
          : ""
      }`}
      onClick={isLocked ? undefined : onClick}
    >
      <CardContent className="p-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="relative shrink-0 w-32 h-20 rounded-md overflow-hidden bg-muted">
            <img 
              src={coverImage} 
              alt={module.title}
              className={`w-full h-full object-cover ${isLocked ? "blur-sm" : ""}`}
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
                <div className="w-8 h-8 rounded-full bg-green-600/90 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              ) : status === "available" ? (
                <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Play className="w-5 h-5 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted-foreground/60 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs text-muted-foreground">Module {index + 1}</span>
              {getStatusBadge()}
            </div>
            <h4 className="font-medium text-sm line-clamp-2">{module.title}</h4>
            
            <div className="flex items-center gap-3 mt-2">
              {module.xp_value > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {module.xp_value} XP
                </span>
              )}
              {isLocked && unlockInfo && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {unlockInfo}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
