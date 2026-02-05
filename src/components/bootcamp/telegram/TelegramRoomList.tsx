import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Pin,
  Lock,
  ChevronRight,
  ListTodo,
  Trophy,
  Users,
  Settings,
  Flame,
  CheckCircle,
  Clock,
  Zap,
  Loader2,
  Save,
  Target,
} from "lucide-react";
import type { Bootcamp, BootcampParticipant, BootcampTask, BootcampTaskSubmission, BootcampLeaderboardEntry, BootcampCommunityTopic } from "@/types/bootcamp";
import { useBootcampProgressLog } from "@/hooks/useBootcampProgressLog";
import BootcampCreatorControls from "../BootcampCreatorControls";

interface TelegramRoomListProps {
  topics: BootcampCommunityTopic[];
  loading: boolean;
  onSelectRoom: (topic: BootcampCommunityTopic) => void;
  isHost: boolean;
  bootcamp: Bootcamp;
  tasks: BootcampTask[];
  submissions: BootcampTaskSubmission[];
  participation: BootcampParticipant;
  leaderboard: BootcampLeaderboardEntry[];
  participants: BootcampParticipant[];
  currentDay: number;
  onSubmitTask: (taskId: string, text?: string, url?: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

const TelegramRoomList = ({
  topics,
  loading,
  onSelectRoom,
  isHost,
  bootcamp,
  tasks,
  submissions,
  participation,
  leaderboard,
  participants,
  currentDay,
  onSubmitTask,
  refetch,
}: TelegramRoomListProps) => {
  const [showTasksDialog, setShowTasksDialog] = useState(false);
  const [showLeaderboardDialog, setShowLeaderboardDialog] = useState(false);
  const [showPeopleDialog, setShowPeopleDialog] = useState(false);
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [showHostControls, setShowHostControls] = useState(false);
  const [selectedTask, setSelectedTask] = useState<BootcampTask | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { todayLog, saveProgressLog, loading: loadingLog } = useBootcampProgressLog(bootcamp.id);
  const [progressData, setProgressData] = useState({
    worked_on: "",
    progress_notes: "",
    wins: "",
    blockers: "",
  });
  const [savingProgress, setSavingProgress] = useState(false);

  // Initialize progress data when dialog opens
  const handleOpenProgress = () => {
    if (todayLog) {
      setProgressData({
        worked_on: todayLog.worked_on || "",
        progress_notes: todayLog.progress_notes || "",
        wins: todayLog.wins || "",
        blockers: todayLog.blockers || "",
      });
    }
    setShowProgressDialog(true);
  };

  const handleSaveProgress = async () => {
    setSavingProgress(true);
    const result = await saveProgressLog(progressData);
    setSavingProgress(false);
    if (result.success) {
      toast.success("Progress saved!");
      setShowProgressDialog(false);
    } else {
      toast.error(result.error || "Failed to save");
    }
  };

  // Today's tasks
  const todayTasks = tasks.filter((t) => t.day_number === currentDay);
  const getSubmission = (taskId: string) => submissions.find((s) => s.task_id === taskId);
  const getTaskStatus = (task: BootcampTask) => {
    const sub = getSubmission(task.id);
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

  const pendingTodayCount = todayTasks.filter((t) => getTaskStatus(t) !== "approved").length;
  const userRank = leaderboard.findIndex((e) => e.user_id === participation.user_id) + 1;

  // Default rooms structure (pinned actions)
  const pinnedActions = [
    {
      id: "daily-tasks",
      icon: <ListTodo className="w-5 h-5" />,
      emoji: "✅",
      title: "Daily Tasks",
      subtitle: pendingTodayCount > 0 ? `${pendingTodayCount} pending today` : "All done for today!",
      badge: pendingTodayCount > 0 ? pendingTodayCount : null,
      badgeType: "primary" as const,
      onClick: () => setShowTasksDialog(true),
    },
    {
      id: "progress-log",
      icon: <Target className="w-5 h-5" />,
      emoji: "📝",
      title: "Progress Log",
      subtitle: todayLog ? "Logged today" : "Log your progress",
      badge: todayLog ? "✓" : null,
      badgeType: "success" as const,
      onClick: handleOpenProgress,
    },
    {
      id: "leaderboard",
      icon: <Trophy className="w-5 h-5" />,
      emoji: "🏆",
      title: "Leaderboard",
      subtitle: userRank > 0 ? `You're #${userRank}` : "View rankings",
      onClick: () => setShowLeaderboardDialog(true),
    },
    {
      id: "people",
      icon: <Users className="w-5 h-5" />,
      emoji: "👥",
      title: "People",
      subtitle: `${participants.length} participants`,
      onClick: () => setShowPeopleDialog(true),
    },
  ];

  if (isHost) {
    pinnedActions.push({
      id: "host-controls",
      icon: <Settings className="w-5 h-5" />,
      emoji: "⚙️",
      title: "Host Controls",
      subtitle: "Manage rooms & tasks",
      onClick: () => setShowHostControls(true),
    });
  }

  return (
    <div className="pb-4">
      {/* Pinned Actions */}
      <div className="px-4 py-3">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
          <Pin className="w-3 h-3" /> Pinned
        </p>
      </div>
      <div className="divide-y divide-border/50">
        {pinnedActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
              {action.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground">{action.title}</h4>
              <p className="text-sm text-muted-foreground truncate">{action.subtitle}</p>
            </div>
            {action.badge && (
              <Badge
                className={
                  action.badgeType === "primary"
                    ? "bg-primary text-primary-foreground"
                    : "bg-green-500/10 text-green-500 border-green-500/30"
                }
              >
                {action.badge}
              </Badge>
            )}
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      {/* Chat Rooms */}
      <div className="px-4 py-3 mt-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Chat Rooms</p>
      </div>
      {loading ? (
        <div className="px-4 py-8 text-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
          Loading rooms...
        </div>
      ) : topics.length === 0 ? (
        <div className="px-4 py-8 text-center text-muted-foreground">
          <p>No rooms available yet</p>
          <p className="text-sm">Rooms will appear when the bootcamp starts</p>
        </div>
      ) : (
        <div className="divide-y divide-border/50">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => !topic.is_locked && onSelectRoom(topic)}
              disabled={topic.is_locked}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left ${
                topic.is_locked ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg shrink-0">
                {topic.icon || "💬"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-foreground">{topic.title}</h4>
                  {topic.is_locked && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                {topic.description && (
                  <p className="text-sm text-muted-foreground truncate">{topic.description}</p>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Daily Tasks Dialog */}
      <Dialog open={showTasksDialog} onOpenChange={setShowTasksDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-primary" />
              Day {currentDay} Tasks
            </DialogTitle>
            <DialogDescription>
              Complete these tasks to earn XP
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {todayTasks.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No tasks scheduled for today</p>
            ) : (
              todayTasks.map((task) => {
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
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          +{task.xp_value} XP
                        </p>
                      </div>
                    </div>
                    {status !== "approved" && (
                      <Button
                        variant={status === "pending" ? "outline" : "default"}
                        size="sm"
                        onClick={() => setSelectedTask(task)}
                      >
                        {status === "pending" ? "Pending" : "Submit"}
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Task Submit Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Task</DialogTitle>
            <DialogDescription>{selectedTask?.title}</DialogDescription>
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
                placeholder="Add any notes..."
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTask(null)}>Cancel</Button>
            <Button onClick={handleSubmitTask} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Progress Log Dialog */}
      <Dialog open={showProgressDialog} onOpenChange={setShowProgressDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Daily Progress Log
            </DialogTitle>
            <DialogDescription>Track what you accomplished today</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">What did you work on?</label>
              <Textarea
                placeholder="I focused on..."
                value={progressData.worked_on}
                onChange={(e) => setProgressData({ ...progressData, worked_on: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Progress Notes</label>
              <Textarea
                placeholder="Key learnings..."
                value={progressData.progress_notes}
                onChange={(e) => setProgressData({ ...progressData, progress_notes: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">🎉 Wins</label>
                <Textarea
                  placeholder="Celebrate..."
                  value={progressData.wins}
                  onChange={(e) => setProgressData({ ...progressData, wins: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">⚠️ Blockers</label>
                <Textarea
                  placeholder="Challenges..."
                  value={progressData.blockers}
                  onChange={(e) => setProgressData({ ...progressData, blockers: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProgressDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveProgress} disabled={savingProgress || loadingLog}>
              {savingProgress ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leaderboard Dialog */}
      <Dialog open={showLeaderboardDialog} onOpenChange={setShowLeaderboardDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Leaderboard
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {leaderboard.slice(0, 20).map((entry, index) => (
              <div
                key={entry.user_id}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  entry.user_id === participation.user_id
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-muted/30"
                }`}
              >
                <span className={`font-bold text-lg w-8 ${index < 3 ? "text-primary" : "text-muted-foreground"}`}>
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                </span>
                <Avatar className="w-8 h-8">
                  {entry.user_avatar && <img src={entry.user_avatar} alt="" />}
                  <AvatarFallback>{entry.user_name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <span className="flex-1 font-medium truncate">{entry.user_name}</span>
                <Badge variant="outline">
                  <Zap className="w-3 h-3 mr-1" />
                  {entry.total_xp} XP
                </Badge>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* People Dialog */}
      <Dialog open={showPeopleDialog} onOpenChange={setShowPeopleDialog}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Participants ({participants.length})
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {leaderboard.map((entry) => (
              <div key={entry.user_id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Avatar className="w-10 h-10">
                  {entry.user_avatar && <img src={entry.user_avatar} alt="" />}
                  <AvatarFallback>{entry.user_name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{entry.user_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {entry.tasks_completed} tasks • {entry.total_xp} XP
                  </p>
                </div>
                {entry.rank <= 3 && (
                  <span className="text-lg">
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                  </span>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Host Controls Dialog */}
      <Dialog open={showHostControls} onOpenChange={setShowHostControls}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Host Controls
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <BootcampCreatorControls bootcamp={bootcamp} isHost={isHost} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TelegramRoomList;
