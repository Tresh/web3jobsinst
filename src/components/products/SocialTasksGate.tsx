import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, ExternalLink, Loader2, Lock } from "lucide-react";
import {
  useProductSocialTasks,
  useMyTaskCompletions,
  useCompleteTask,
  getPlatformLabel,
  getTaskTypeLabel,
} from "@/hooks/useProductSocialTasks";
import { toast } from "sonner";

const platformIcons: Record<string, string> = {
  x: "𝕏",
  youtube: "▶",
  tiktok: "♪",
  instagram: "📷",
  telegram: "✈",
};

interface SocialTasksGateProps {
  productId: string;
  children: React.ReactNode;
}

const SocialTasksGate = ({ productId, children }: SocialTasksGateProps) => {
  const { data: tasks = [], isLoading: loadingTasks } = useProductSocialTasks(productId);
  const { data: completions = [], isLoading: loadingCompletions } = useMyTaskCompletions(productId);
  const completeTask = useCompleteTask();
  const [proofUrls, setProofUrls] = useState<Record<string, string>>({});

  if (loadingTasks || loadingCompletions) {
    return <div className="text-center py-16 text-muted-foreground">Loading...</div>;
  }

  // No social tasks configured — grant access directly
  if (tasks.length === 0) {
    return <>{children}</>;
  }

  const completedTaskIds = new Set(completions.map((c) => c.task_id));
  const allCompleted = tasks.every((t) => completedTaskIds.has(t.id));

  if (allCompleted) {
    return <>{children}</>;
  }

  const isFollowTask = (task: { task_type: string }) => task.task_type === "follow";

  const getProofPlaceholder = (task: { task_type: string }) => {
    if (isFollowTask(task)) return "Enter your X username (e.g. @username)";
    return "Paste your proof link here...";
  };

  const getProofLabel = (task: { task_type: string }) => {
    if (isFollowTask(task)) return "Your X Username";
    return "Proof Link";
  };

  const handleSubmit = (taskId: string, task: { task_type: string }) => {
    const proofValue = proofUrls[taskId]?.trim();
    if (!proofValue) {
      toast.error(isFollowTask(task) ? "Please enter your X username" : "Please paste your proof link");
      return;
    }
    const proofUrl = isFollowTask(task) ? `x-username:${proofValue.replace(/^@/, "")}` : proofValue;
    completeTask.mutate(
      { taskId, proofUrl },
      {
        onSuccess: () => {
          toast.success("Task completed!");
          setProofUrls((prev) => ({ ...prev, [taskId]: "" }));
        },
        onError: () => toast.error("Failed to submit task"),
      }
    );
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Complete Tasks to Unlock</h2>
        <p className="text-muted-foreground">
          Complete the following social tasks to access this product. Paste your proof link for each task.
        </p>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => {
          const isCompleted = completedTaskIds.has(task.id);
          return (
            <Card key={task.id} className={isCompleted ? "border-primary/50 bg-primary/5" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{platformIcons[task.platform] || "🔗"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">
                        {getTaskTypeLabel(task.task_type)} on {getPlatformLabel(task.platform)}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getPlatformLabel(task.platform)}
                      </Badge>
                      {isCompleted && (
                        <CheckCircle2 className="w-5 h-5 text-primary ml-auto flex-shrink-0" />
                      )}
                    </div>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                    )}

                    {!isCompleted && (
                      <>
                        <a
                          href={task.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-3"
                        >
                          Open task <ExternalLink className="w-3 h-3" />
                        </a>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground">{getProofLabel(task)}</label>
                          <div className="flex gap-2">
                            <Input
                              placeholder={getProofPlaceholder(task)}
                              value={proofUrls[task.id] || ""}
                              onChange={(e) =>
                                setProofUrls((prev) => ({ ...prev, [task.id]: e.target.value }))
                              }
                              className="flex-1"
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSubmit(task.id, task)}
                              disabled={completeTask.isPending}
                            >
                              {completeTask.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Submit"
                              )}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        {completions.length} of {tasks.length} tasks completed
      </p>
    </div>
  );
};

export default SocialTasksGate;
