import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Repeat,
  MessageSquare,
  Video,
  BookOpen,
  Link as LinkIcon,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Send,
  Zap,
  Calendar,
} from "lucide-react";
import type { ScholarshipTask, ScholarshipTaskSubmission } from "@/types/scholarship";
import { TASK_TYPE_LABELS } from "@/types/scholarship";
import { format } from "date-fns";

interface PortalTasksProps {
  tasks: ScholarshipTask[];
  getSubmissionForTask: (taskId: string) => ScholarshipTaskSubmission | undefined;
  submitTask: (taskId: string, submissionUrl: string, submissionText?: string) => Promise<{ error: Error | null }>;
  onRefetch: () => void;
}

const getTaskIcon = (type: string) => {
  switch (type) {
    case "retweet":
      return <Repeat className="w-5 h-5" />;
    case "x_post":
      return <MessageSquare className="w-5 h-5" />;
    case "video_upload":
      return <Video className="w-5 h-5" />;
    case "complete_lesson":
      return <BookOpen className="w-5 h-5" />;
    case "submit_link":
      return <LinkIcon className="w-5 h-5" />;
    default:
      return <FileText className="w-5 h-5" />;
  }
};

export function PortalTasks({ tasks, getSubmissionForTask, submitTask, onRefetch }: PortalTasksProps) {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<ScholarshipTask | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedTask) return;
    if (!submissionUrl.trim()) {
      toast({
        title: "Error",
        description: "Please provide a submission URL",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await submitTask(selectedTask.id, submissionUrl, submissionText);
    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Task Submitted",
        description: "Your submission is pending review",
      });
      setSelectedTask(null);
      setSubmissionUrl("");
      setSubmissionText("");
      onRefetch();
    }
  };

  const getStatusBadge = (submission: ScholarshipTaskSubmission | undefined) => {
    if (!submission) return null;

    switch (submission.status) {
      case "approved":
        return (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved (+{submission.xp_awarded} XP)
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Tasks Available</h3>
          <p className="text-muted-foreground">
            Check back soon for new tasks to complete
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your Tasks</h2>
        <p className="text-sm text-muted-foreground">{tasks.length} tasks available</p>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => {
          const submission = getSubmissionForTask(task.id);
          const isCompleted = submission?.status === "approved";
          const isPending = submission?.status === "pending";
          const isRejected = submission?.status === "rejected";

          return (
            <Card
              key={task.id}
              className={`transition-colors ${isCompleted ? "bg-green-500/5 border-green-500/20" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-500/10 text-green-500"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="w-5 h-5" /> : getTaskIcon(task.task_type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge variant="secondary" className="text-xs">
                          <Zap className="w-3 h-3 mr-1" />
                          {task.xp_value} XP
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {TASK_TYPE_LABELS[task.task_type]}
                        </span>
                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Due: {format(new Date(task.due_date), "MMM d, yyyy")}
                          </span>
                        )}
                      </div>
                      {isRejected && submission?.rejection_reason && (
                        <div className="mt-2 p-2 bg-red-500/10 rounded text-sm text-red-500">
                          Rejection reason: {submission.rejection_reason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(submission)}
                    {!submission && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" onClick={() => setSelectedTask(task)}>
                            <Send className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Submit Task</DialogTitle>
                            <DialogDescription>
                              Submit your proof of completion for "{task.title}"
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Submission URL *</label>
                              <Input
                                placeholder="https://..."
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Provide a link to your completed task (tweet URL, post link, etc.)
                              </p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Additional Notes (Optional)</label>
                              <Textarea
                                placeholder="Any additional context..."
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                              {isSubmitting ? "Submitting..." : "Submit Task"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                    {isRejected && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" onClick={() => setSelectedTask(task)}>
                            Resubmit
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Resubmit Task</DialogTitle>
                            <DialogDescription>
                              Submit a new proof of completion for "{task.title}"
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Submission URL *</label>
                              <Input
                                placeholder="https://..."
                                value={submissionUrl}
                                onChange={(e) => setSubmissionUrl(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Additional Notes</label>
                              <Textarea
                                placeholder="Any additional context..."
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                              {isSubmitting ? "Submitting..." : "Resubmit Task"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
