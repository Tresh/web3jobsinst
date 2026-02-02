import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Play, Video, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useModule0Progress } from "@/hooks/useModule0Progress";

interface Module0CardProps {
  onRefetch?: () => void;
}

export function Module0Card({ onRefetch }: Module0CardProps) {
  const navigate = useNavigate();
  const { isVideoCompleted } = useModule0Progress();

  const handleClick = () => {
    navigate("/dashboard/scholarship/modules/module-0");
  };

  return (
    <Card 
      className={`transition-all cursor-pointer hover:shadow-md group ${
        isVideoCompleted 
          ? "bg-green-500/5 border-green-500/20" 
          : "hover:border-primary/30"
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden rounded-t-lg bg-muted">
          <img 
            src="/placeholder.svg" 
            alt="Introduction"
            className="w-full h-full object-cover"
          />
          {/* Duration overlay */}
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
            5:00
          </div>
          {/* Status icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isVideoCompleted ? (
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-6 h-6 text-primary-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Module 0</span>
            {isVideoCompleted ? (
              <Badge className="bg-secondary text-green-600 dark:text-green-400 border-border text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                <Play className="w-3 h-3 mr-1" />
                Available
              </Badge>
            )}
          </div>
          <h4 className="font-medium text-sm line-clamp-2 mb-2">
            Introduction to the Web3 Jobs Institute Scholarship Program
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            Watch this introduction video to learn about the scholarship program and what to expect.
          </p>
          <Badge variant="outline" className="text-xs gap-1">
            <Zap className="w-3 h-3" />
            100 XP
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
