import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Target,
  CheckCircle,
  Clock,
  Zap,
  Trophy,
  Save,
  Loader2,
  Flame,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import type { Bootcamp, BootcampTask, BootcampTaskSubmission } from "@/types/bootcamp";
import { useBootcampProgressLog } from "@/hooks/useBootcampProgressLog";

interface BootcampDailyFocusProps {
  bootcamp: Bootcamp;
  tasks: BootcampTask[];
  submissions: BootcampTaskSubmission[];
  participation: {
    total_xp: number;
    tasks_completed: number;
  };
  currentDay: number;
  onOpenTask: (task: BootcampTask) => void;
}

const BootcampDailyFocus = ({
  bootcamp,
  tasks,
  submissions,
  participation,
  currentDay,
  onOpenTask,
}: BootcampDailyFocusProps) => {
  const { todayLog, saveProgressLog, loading: loadingLog } = useBootcampProgressLog(bootcamp.id);
  
  const [workedOn, setWorkedOn] = useState("");
  const [progressNotes, setProgressNotes] = useState("");
  const [wins, setWins] = useState("");
  const [blockers, setBlockers] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Update state when todayLog loads
  if (todayLog && !initialized) {
    setWorkedOn(todayLog.worked_on || "");
    setProgressNotes(todayLog.progress_notes || "");
    setWins(todayLog.wins || "");
    setBlockers(todayLog.blockers || "");
    setInitialized(true);
  }

  // Get today's tasks (tasks for current day)
  const todayTasks = tasks.filter((task) => task.day_number === currentDay);
  
  // Get the daily challenge (first task of the day or highest XP task)
  const dailyChallenge = todayTasks.length > 0 
    ? todayTasks.reduce((max, task) => (task.xp_value > max.xp_value ? task : max), todayTasks[0])
    : null;

  const getSubmission = (taskId: string) => {
    return submissions.find((s) => s.task_id === taskId);
  };

  const getTaskStatus = (task: BootcampTask) => {
    const submission = getSubmission(task.id);
    if (!submission) return "pending";
    return submission.status;
  };

  const completedTodayTasks = todayTasks.filter((t) => getTaskStatus(t) === "approved").length;
  const totalTodayTasks = todayTasks.length;

  const handleSaveProgress = async () => {
    setSaving(true);
    const result = await saveProgressLog({
      worked_on: workedOn,
      progress_notes: progressNotes,
      wins,
      blockers,
    });
    setSaving(false);

    if (result.success) {
      toast.success("Progress saved!");
    } else {
      toast.error(result.error || "Failed to save progress");
    }
  };

  return (
    <div className="space-y-6">
      {/* Daily Stats Banner */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary">
                <span className="text-2xl font-bold">{currentDay}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">Day {currentDay} of {bootcamp.duration_days}</h2>
                <p className="text-muted-foreground">Stay focused, you're doing great!</p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                  <Zap className="w-5 h-5" />
                  {participation.total_xp}
                </div>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 text-2xl font-bold text-green-500">
                  <CheckCircle className="w-5 h-5" />
                  {participation.tasks_completed}
                </div>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column: Daily Challenge + Today's Tasks */}
        <div className="space-y-6">
          {/* Daily Challenge Highlight */}
          {dailyChallenge && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Today's Challenge</CardTitle>
                </div>
                <CardDescription>Complete this for bonus XP!</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-background/50 rounded-lg border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{dailyChallenge.title}</h4>
                        <Badge className="bg-primary/10 text-primary border-primary/30">
                          <Zap className="w-3 h-3 mr-1" />
                          {dailyChallenge.xp_value} XP
                        </Badge>
                      </div>
                      {dailyChallenge.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {dailyChallenge.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => onOpenTask(dailyChallenge)}
                      disabled={getTaskStatus(dailyChallenge) === "approved"}
                    >
                      {getTaskStatus(dailyChallenge) === "approved" ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Done
                        </>
                      ) : getTaskStatus(dailyChallenge) === "pending" ? (
                        <>
                          <Clock className="w-4 h-4 mr-1" />
                          Review
                        </>
                      ) : (
                        "Complete"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Today's Tasks */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">Today's Tasks</CardTitle>
                </div>
                {totalTodayTasks > 0 && (
                  <Badge variant="outline">
                    {completedTodayTasks} / {totalTodayTasks} done
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No tasks scheduled for today.</p>
                  <p className="text-sm">Check back later or explore past tasks!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => {
                    const status = getTaskStatus(task);
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                          status === "approved"
                            ? "bg-green-500/5 border-green-500/20"
                            : "bg-muted/30 hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {status === "approved" ? (
                            <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                          ) : status === "pending" ? (
                            <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className={`font-medium truncate ${status === "approved" ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </p>
                            <p className="text-xs text-muted-foreground">+{task.xp_value} XP</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {task.external_link && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => window.open(task.external_link!, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          {status !== "approved" && (
                            <Button
                              variant={status === "pending" ? "outline" : "default"}
                              size="sm"
                              onClick={() => onOpenTask(task)}
                            >
                              {status === "pending" ? "Pending" : "Submit"}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Progress Log */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Daily Progress Log</CardTitle>
            </div>
            <CardDescription>Track what you accomplished today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What did you work on today?</label>
              <Textarea
                placeholder="I focused on..."
                value={workedOn}
                onChange={(e) => setWorkedOn(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Progress Notes</label>
              <Textarea
                placeholder="Key learnings, insights, or progress made..."
                value={progressNotes}
                onChange={(e) => setProgressNotes(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <span className="text-green-500">🎉</span> Wins
                </label>
                <Textarea
                  placeholder="Celebrate your wins..."
                  value={wins}
                  onChange={(e) => setWins(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1">
                  <span className="text-yellow-500">⚠️</span> Blockers
                </label>
                <Textarea
                  placeholder="Any challenges..."
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  rows={2}
                  className="resize-none"
                />
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleSaveProgress}
              disabled={saving || loadingLog}
              className="w-full"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Today's Progress
                </>
              )}
            </Button>

            {todayLog && (
              <p className="text-xs text-center text-muted-foreground">
                Last saved: {new Date(todayLog.updated_at).toLocaleTimeString()}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BootcampDailyFocus;
