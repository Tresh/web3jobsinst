import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  ExternalLink,
  Zap,
  AlertCircle,
  Loader2,
} from "lucide-react";
import type { Bootcamp, BootcampTask, BootcampTaskSubmission } from "@/types/bootcamp";

interface BootcampTasksProps {
  tasks: BootcampTask[];
  submissions: BootcampTaskSubmission[];
  bootcamp: Bootcamp;
  onSubmit: (taskId: string, text?: string, url?: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

const BootcampTasks = ({ tasks, submissions, bootcamp, onSubmit, refetch }: BootcampTasksProps) => {
  const [selectedTask, setSelectedTask] = useState<BootcampTask | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const getSubmission = (taskId: string) => {
    return submissions.find((s) => s.task_id === taskId);
  };

  const isTaskExpired = (task: BootcampTask) => {
    if (!task.end_time) return false;
    return new Date(task.end_time) < new Date();
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;

    setSubmitting(true);
    const result = await onSubmit(selectedTask.id, submissionText, submissionUrl);
    setSubmitting(false);

    if (result.success) {
      toast.success("Task submitted successfully!");
      setSelectedTask(null);
      setSubmissionText("");
      setSubmissionUrl("");
      refetch();
    } else {
      toast.error(result.error || "Failed to submit task");
    }
  };

  const getStatusBadge = (task: BootcampTask) => {
    const submission = getSubmission(task.id);
    
    if (submission) {
      switch (submission.status) {
        case "approved":
          return (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Completed (+{submission.xp_awarded} XP)
            </Badge>
          );
        case "pending":
          return (
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              Pending Review
            </Badge>
          );
        case "rejected":
          return (
            <Badge variant="destructive">
              <AlertCircle className="w-3 h-3 mr-1" />
              Rejected
            </Badge>
          );
      }
    }

    if (isTaskExpired(task)) {
      return (
        <Badge variant="secondary" className="text-muted-foreground">
          Expired
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        <Zap className="w-3 h-3 mr-1" />
        {task.xp_value} XP
      </Badge>
    );
  };

  const canSubmit = (task: BootcampTask) => {
    const submission = getSubmission(task.id);
    if (submission && submission.status !== "rejected") return false;
    if (isTaskExpired(task)) return false;
    if (bootcamp.status === "completed") return false;
    return true;
  };

  // Group tasks by day
  const tasksByDay = tasks.reduce((acc, task) => {
    const day = task.day_number || 0;
    if (!acc[day]) acc[day] = [];
    acc[day].push(task);
    return acc;
  }, {} as Record<number, BootcampTask[]>);

  return (
    <div className="space-y-6">
      {tasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No tasks available yet. Check back soon!</p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(tasksByDay)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([day, dayTasks]) => (
            <div key={day}>
              {Number(day) > 0 && (
                <h3 className="text-lg font-semibold mb-4">Day {day}</h3>
              )}
              <div className="space-y-4">
                {dayTasks.map((task) => {
                  const submission = getSubmission(task.id);
                  
                  return (
                    <Card 
                      key={task.id} 
                      className={submission?.status === "approved" ? "border-green-500/20 bg-green-500/5" : ""}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-medium">{task.title}</h4>
                              {getStatusBadge(task)}
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            )}
                            {task.end_time && !isTaskExpired(task) && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Due: {new Date(task.end_time).toLocaleString()}
                              </p>
                            )}
                            {submission?.status === "rejected" && submission.rejection_reason && (
                              <p className="text-sm text-destructive mt-2">
                                Rejection reason: {submission.rejection_reason}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {task.external_link && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(task.external_link!, "_blank")}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            )}
                            {canSubmit(task) && (
                              <Button 
                                size="sm"
                                onClick={() => setSelectedTask(task)}
                              >
                                {submission?.status === "rejected" ? "Resubmit" : "Submit"}
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
      )}

      {/* Submission Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task</DialogTitle>
            <DialogDescription>
              {selectedTask?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {selectedTask?.description && (
              <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
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
                placeholder="Add any notes about your submission..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Task"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BootcampTasks;
