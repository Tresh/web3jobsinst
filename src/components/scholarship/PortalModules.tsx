import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle } from "lucide-react";
import type { ScholarshipModule, ScholarshipTask } from "@/types/scholarship";
import { Module0Section } from "./Module0Section";
import { ModuleListItem } from "./ModuleListItem";
import { ModuleVideoPlayer } from "./ModuleVideoPlayer";
import { useModuleProgress } from "@/hooks/useModuleProgress";

interface PortalModulesProps {
  modules: ScholarshipModule[];
  getModuleStatus: (moduleId: string) => "locked" | "available" | "completed";
  dayNumber: number;
  tasks?: ScholarshipTask[];
  onRefetch?: () => void;
}

export function PortalModules({ modules, getModuleStatus, dayNumber, tasks = [], onRefetch }: PortalModulesProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  const selectedModule = modules.find(m => m.id === selectedModuleId);

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

  // Get tasks that might be attached to a module (by matching module title or explicit linking)
  const getAttachedTasks = (module: ScholarshipModule): ScholarshipTask[] => {
    return tasks.filter(task => {
      // Match tasks that reference the module title
      if (task.description?.toLowerCase().includes(module.title.toLowerCase())) {
        return true;
      }
      // Or tasks that are explicitly related (by unlock_task_id relationship)
      if (module.unlock_task_id === task.id) {
        return true;
      }
      return false;
    });
  };

  const completedCount = modules.filter((m) => getModuleStatus(m.id) === "completed").length;

  // If a module is selected, show the video player
  if (selectedModule) {
    return (
      <SelectedModuleView
        module={selectedModule}
        isCompleted={getModuleStatus(selectedModule.id) === "completed"}
        attachedTasks={getAttachedTasks(selectedModule)}
        onBack={() => setSelectedModuleId(null)}
        onRefetch={onRefetch}
      />
    );
  }

  if (modules.length === 0) {
    return (
      <div className="space-y-4">
        {/* Module 0 - Introduction Video (always first, always unlocked) */}
        <Module0Section onRefetch={onRefetch} />
        
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">More Modules Coming Soon</h3>
            <p className="text-muted-foreground">
              Additional course modules will be added soon. Check back later!
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
            Watch videos, complete tasks, and earn XP
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="w-3 h-3" />
          {completedCount} of {modules.length + 1} completed
        </Badge>
      </div>

      {/* Module List - YouTube playlist style */}
      <div className="space-y-3">
        {/* Module 0 - Introduction Video (always first, always unlocked) */}
        <Module0Section onRefetch={onRefetch} />

        {/* Dynamic Modules */}
        {modules.map((module, index) => {
          const status = getModuleStatus(module.id);
          const unlockInfo = getUnlockInfo(module);

          return (
            <ModuleListItem
              key={module.id}
              module={module}
              index={index + 1} // Start from 1 since Module 0 is intro
              status={status}
              unlockInfo={unlockInfo}
              isSelected={false}
              onClick={() => setSelectedModuleId(module.id)}
            />
          );
        })}
      </div>
    </div>
  );
}

// Separate component to use the hook
function SelectedModuleView({ 
  module, 
  isCompleted, 
  attachedTasks, 
  onBack, 
  onRefetch 
}: { 
  module: ScholarshipModule;
  isCompleted: boolean;
  attachedTasks: ScholarshipTask[];
  onBack: () => void;
  onRefetch?: () => void;
}) {
  const { markModuleCompleted } = useModuleProgress({ 
    moduleId: module.id, 
    xpValue: module.xp_value || 0 
  });

  const handleComplete = useCallback(async () => {
    const result = await markModuleCompleted();
    if (result.success) {
      onRefetch?.();
    }
    return result;
  }, [markModuleCompleted, onRefetch]);

  return (
    <ModuleVideoPlayer
      module={module}
      isCompleted={isCompleted}
      attachedTasks={attachedTasks}
      onBack={onBack}
      onComplete={handleComplete}
    />
  );
}
