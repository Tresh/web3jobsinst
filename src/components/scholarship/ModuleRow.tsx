import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Lock, Play, Zap, Clock } from "lucide-react";
import { toast } from "sonner";
import type { ScholarshipModule } from "@/types/scholarship";

interface ModuleRowProps {
  module: ScholarshipModule;
  index: number | string;
  status: "locked" | "available" | "completed";
  unlockInfo: string | null;
  onClick: () => void;
}

export function ModuleRow({ 
  module, 
  index, 
  status, 
  unlockInfo, 
  onClick 
}: ModuleRowProps) {
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

  const coverImage = module.cover_image_url || "/placeholder.svg";

  return (
    <Card 
      className={`transition-all cursor-pointer hover:bg-secondary/50 group border-0 border-b border-border rounded-none last:border-b-0 ${
        status === "completed"
          ? "bg-green-500/5"
          : isLocked
          ? "opacity-60 hover:opacity-80"
          : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex gap-4 p-3">
        {/* Thumbnail - 16:9 ratio, small */}
        <div className="relative w-40 sm:w-48 shrink-0">
          <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
            <img 
              src={coverImage} 
              alt={module.title}
              className={`w-full h-full object-cover ${isLocked ? "blur-sm grayscale" : ""}`}
            />
            {/* Duration badge */}
            {module.video_duration && (
              <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                {module.video_duration}
              </div>
            )}
            {/* Status overlay icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              {status === "completed" ? (
                <div className="w-8 h-8 rounded-full bg-secondary/90 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              ) : status === "available" ? (
                <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-4 h-4 text-primary-foreground" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted/90 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 py-0.5">
          {/* Title */}
          <h4 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {module.title}
          </h4>
          
          {/* Meta row */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2 flex-wrap">
            <span>Module {index}</span>
            {module.video_duration && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {module.video_duration}
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
            ) : status === "available" ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-5">
                <Play className="w-3 h-3 mr-1" />
                Available
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px] h-5">
                <Lock className="w-3 h-3 mr-1" />
                Locked
              </Badge>
            )}
            
            {module.xp_value && module.xp_value > 0 && (
              <Badge variant="outline" className="text-[10px] h-5 gap-1">
                <Zap className="w-3 h-3" />
                {module.xp_value} XP
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
