import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Lock, CheckCircle, Play, Calendar } from "lucide-react";
import type { ScholarshipModule } from "@/types/scholarship";

interface PortalModulesProps {
  modules: ScholarshipModule[];
  getModuleStatus: (moduleId: string) => "locked" | "available" | "completed";
  dayNumber: number;
}

export function PortalModules({ modules, getModuleStatus, dayNumber }: PortalModulesProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case "available":
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Play className="w-3 h-3 mr-1" />
            Available
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Lock className="w-3 h-3 mr-1" />
            Locked
          </Badge>
        );
    }
  };

  const getUnlockInfo = (module: ScholarshipModule) => {
    switch (module.unlock_type) {
      case "day":
        if (module.unlock_day && dayNumber < module.unlock_day) {
          return `Unlocks on Day ${module.unlock_day}`;
        }
        return null;
      case "task":
        return "Complete required task to unlock";
      case "manual":
        return "Will be unlocked by admin";
      default:
        return null;
    }
  };

  if (modules.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Course Modules Yet</h3>
          <p className="text-muted-foreground">
            Course modules will be added soon. Check back later!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Course Modules</h2>
        <p className="text-sm text-muted-foreground">
          {modules.filter((m) => getModuleStatus(m.id) === "completed").length} of {modules.length} completed
        </p>
      </div>

      <div className="space-y-3">
        {modules.map((module, index) => {
          const status = getModuleStatus(module.id);
          const isLocked = status === "locked";
          const unlockInfo = getUnlockInfo(module);

          return (
            <Card
              key={module.id}
              className={`transition-all ${
                status === "completed"
                  ? "bg-green-500/5 border-green-500/20"
                  : isLocked
                  ? "opacity-75"
                  : ""
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        status === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : status === "available"
                          ? "bg-blue-500/10 text-blue-500"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {status === "completed" ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : status === "available" ? (
                        <Play className="w-5 h-5" />
                      ) : (
                        <Lock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-muted-foreground">Module {index + 1}</span>
                        {getStatusBadge(status)}
                      </div>
                      <h3 className="font-medium">{module.title}</h3>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      )}
                      {isLocked && unlockInfo && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {unlockInfo}
                        </p>
                      )}
                    </div>
                  </div>
                  {status === "available" && (
                    <Button size="sm">
                      <Play className="w-4 h-4 mr-1" />
                      Start
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
