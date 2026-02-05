import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { toast } from "sonner";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Lock,
  Play,
  ChevronDown,
  Zap,
  ExternalLink,
  Loader2,
} from "lucide-react";
import type { Bootcamp, BootcampTask, BootcampTaskSubmission } from "@/types/bootcamp";

interface ClassroomTabProps {
  bootcamp: Bootcamp;
  tasks: BootcampTask[];
  submissions: BootcampTaskSubmission[];
  currentDay: number;
  onSubmitTask: (taskId: string, text?: string, url?: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

interface DayGroup {
  day: number;
  tasks: BootcampTask[];
  completedCount: number;
  totalXP: number;
  earnedXP: number;
}

const ClassroomTab = ({
  bootcamp,
  tasks,
  submissions,
  currentDay,
  onSubmitTask,
  refetch,
}: ClassroomTabProps) => {
  const [selectedTask, setSelectedTask] = useState<BootcampTask | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([currentDay]));

  // Group tasks by day
  const dayGroups: DayGroup[] = [];
  for (let day = 1; day <= bootcamp.duration_days; day++) {
    const dayTasks = tasks.filter((t) => t.day_number === day);
    const completedCount = dayTasks.filter((t) => {
      const sub = submissions.find((s) => s.task_id === t.id);
      return sub?.status === "approved";
    }).length;
    const totalXP = dayTasks.reduce((sum, t) => sum + t.xp_value, 0);
    const earnedXP = dayTasks.reduce((sum, t) => {
      const sub = submissions.find((s) => s.task_id === t.id);
      return sum + (sub?.status === "approved" ? t.xp_value : 0);
    }, 0);

    dayGroups.push({
      day,
      tasks: dayTasks,
      completedCount,
      totalXP,
      earnedXP,
    });
  }

  const getTaskStatus = (task: BootcampTask) => {
    const sub = submissions.find((s) => s.task_id === task.id);
    return sub?.status || "not_started";
  };

  const handleSubmitTask = async () => {
    if (!selectedTask) return;
    setSubmitting(true);
    const result = await onSubmitTask(selectedTask.id, submissionText, submissionUrl);
    setSubmitting(false);
    if (result.success) {
      toast.success("Task submitted!");
      setSelectedTask(null);
      setSubmissionUrl("");
      setSubmissionText("");
      refetch();
    } else {
      toast.error(result.error || "Failed to submit");
    }
  };

  const toggleDay = (day: number) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  // Overall progress
  const totalTasks = tasks.length;
  const completedTasks = submissions.filter((s) => s.status === "approved").length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="pb-8">
      {/* Progress Overview */}
      <div className="px-4 py-6 border-b bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Your Progress</h2>
            <p className="text-sm text-muted-foreground">
              {completedTasks} of {totalTasks} lessons completed
            </p>
          </div>
          <Badge className="bg-primary/10 text-primary">
            {Math.round(progressPercent)}%
          </Badge>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Curriculum */}
      <div className="px-4 py-4 space-y-2">
        {dayGroups.map((group) => {
          const isLocked = group.day > currentDay;
          const isCompleted = group.completedCount === group.tasks.length && group.tasks.length > 0;
          const isExpanded = expandedDays.has(group.day);
          const isActive = group.day === currentDay;

          return (
            <Collapsible
              key={group.day}
              open={isExpanded && !isLocked}
              onOpenChange={() => !isLocked && toggleDay(group.day)}
            >
              <CollapsibleTrigger asChild>
                <button
                  disabled={isLocked}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${
                    isLocked
                      ? "bg-muted/30 opacity-50 cursor-not-allowed"
                      : isActive
                      ? "bg-primary/10 border border-primary/30"
                      : isCompleted
                      ? "bg-green-500/10 border border-green-500/30"
                      : "bg-card border border-border hover:bg-muted/50"
                  }`}
                >
                  {/* Day Icon */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-primary text-primary-foreground"
                        : isLocked
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <span className="font-bold">{group.day}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Day {group.day}</h3>
                      {isActive && (
                        <Badge className="bg-primary text-primary-foreground text-xs">
                          Today
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {group.tasks.length} lessons • {group.totalXP} XP
                    </p>
                    {group.tasks.length > 0 && !isLocked && (
                      <div className="mt-2">
                        <Progress
                          value={(group.completedCount / group.tasks.length) * 100}
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>

                  {/* Expand Icon */}
                  {!isLocked && group.tasks.length > 0 && (
                    <ChevronDown
                      className={`w-5 h-5 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="pl-4 mt-2 space-y-2">
                  {group.tasks.map((task, idx) => {
                    const status = getTaskStatus(task);
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          status === "approved"
                            ? "bg-green-500/5 border-green-500/20"
                            : "bg-card border-border hover:bg-muted/30"
                        }`}
                      >
                        {/* Status Icon */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            status === "approved"
                              ? "bg-green-500 text-white"
                              : status === "pending"
                              ? "bg-yellow-500 text-white"
                              : "bg-muted"
                          }`}
                        >
                          {status === "approved" ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : status === "pending" ? (
                            <Clock className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </div>

                        {/* Task Info */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm ${
                              status === "approved" ? "line-through text-muted-foreground" : ""
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              {task.xp_value} XP
                            </span>
                            {task.external_link && (
                              <a
                                href={task.external_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Resource
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Action */}
                        {status !== "approved" && (
                          <Button
                            size="sm"
                            variant={status === "pending" ? "outline" : "default"}
                            onClick={() => setSelectedTask(task)}
                          >
                            {status === "pending" ? "Pending" : "Start"}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Task Submit Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              {selectedTask?.title}
            </DialogTitle>
            {selectedTask?.description && (
              <DialogDescription>{selectedTask.description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedTask?.external_link && (
              <a
                href={selectedTask.external_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Open Lesson Resource
              </a>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">Submission URL (optional)</label>
              <Input
                placeholder="https://..."
                value={submissionUrl}
                onChange={(e) => setSubmissionUrl(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                placeholder="What did you learn? Any key takeaways?"
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitTask} disabled={submitting}>
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Mark Complete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClassroomTab;
