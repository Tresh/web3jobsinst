import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, Zap, Loader2 } from "lucide-react";
import type { ScholarshipModule } from "@/types/scholarship";
import { Module0Card } from "./Module0Card";
import { ModuleListItem } from "./ModuleListItem";
import { useIntroModule } from "@/hooks/useIntroModule";
import { useScholarshipPortal } from "@/hooks/useScholarshipData";
import { useModule0Progress } from "@/hooks/useModule0Progress";

interface PortalModulesProps {
  modules: ScholarshipModule[];
  getModuleStatus: (moduleId: string) => "locked" | "available" | "completed";
  dayNumber: number;
  onRefetch?: () => void;
  programId?: string;
}

export function PortalModules({ modules, getModuleStatus, dayNumber, onRefetch, programId }: PortalModulesProps) {
  const navigate = useNavigate();
  const { introModule, isLoading: introLoading } = useIntroModule(programId);
  const { isVideoCompleted } = useModule0Progress();

  const getUnlockInfo = (module: ScholarshipModule) => {
    const unlockType = module.unlock_type;
    
    if (unlockType === "day") {
      if (module.unlock_day && dayNumber < module.unlock_day) {
        return `Unlocks on Day ${module.unlock_day}`;
      }
      return null;
    }
    if (unlockType === "task") {
      return "Complete required task to unlock";
    }
    if (unlockType === "manual") {
      return "Will be unlocked by admin";
    }
    return null;
  };

  // Count completed modules (including intro if completed)
  const regularCompletedCount = modules.filter((m) => getModuleStatus(m.id) === "completed").length;
  const introCompleted = isVideoCompleted ? 1 : 0;
  const completedCount = regularCompletedCount + introCompleted;
  const totalModules = modules.length + (introModule ? 1 : 0);

  const handleModuleClick = (moduleId: string) => {
    navigate(`/dashboard/scholarship/modules/${moduleId}`);
  };

  // Empty state (no modules at all)
  if (modules.length === 0 && !introModule && !introLoading) {
    return (
      <div className="space-y-4">
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Modules Available</h3>
            <p className="text-muted-foreground">
              Course modules will be added soon. Check back later!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with progress */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Course Modules</h2>
          <p className="text-sm text-muted-foreground">
            Click a module to watch and earn XP
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="w-3 h-3" />
          {completedCount} of {totalModules} completed
        </Badge>
      </div>

      {/* Clean Module Grid - Overview Only */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Introduction Module Card - Fetched from database */}
        <Module0Card 
          onRefetch={onRefetch} 
          introModule={introModule} 
          isLoading={introLoading} 
        />

        {/* Dynamic Modules */}
        {modules.map((module, index) => {
          const status = getModuleStatus(module.id);
          const unlockInfo = getUnlockInfo(module);

          return (
            <ModuleListItem
              key={module.id}
              module={module}
              index={index}
              status={status}
              unlockInfo={unlockInfo}
              onClick={() => handleModuleClick(module.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
