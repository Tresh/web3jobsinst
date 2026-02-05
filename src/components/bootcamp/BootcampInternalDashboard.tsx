import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Home,
  MessageSquare,
  ListTodo,
  Trophy,
  Users,
  User,
  ArrowLeft,
  Loader2,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import type { 
  Bootcamp, 
  BootcampParticipant, 
  BootcampTask, 
  BootcampTaskSubmission,
  BootcampLeaderboardEntry
} from "@/types/bootcamp";
import BootcampDailyFocus from "./BootcampDailyFocus";
import BootcampRooms from "./BootcampRooms";
import BootcampTasks from "./BootcampTasks";
import BootcampLeaderboard from "./BootcampLeaderboard";
import BootcampParticipants from "./BootcampParticipants";
import BootcampUserProfile from "./BootcampUserProfile";
import BootcampCreatorControls from "./BootcampCreatorControls";

interface BootcampInternalDashboardProps {
  bootcamp: Bootcamp;
  participation: BootcampParticipant;
  tasks: BootcampTask[];
  submissions: BootcampTaskSubmission[];
  leaderboard: BootcampLeaderboardEntry[];
  participants: BootcampParticipant[];
  onSubmitTask: (taskId: string, text?: string, url?: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

const BootcampInternalDashboard = ({
  bootcamp,
  participation,
  tasks,
  submissions,
  leaderboard,
  participants,
  onSubmitTask,
  refetch,
}: BootcampInternalDashboardProps) => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [selectedTask, setSelectedTask] = useState<BootcampTask | null>(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isCompleted = bootcamp.status === "completed";
  const isHost = user?.id === bootcamp.host_user_id;

  // Calculate current day
  const getCurrentDay = () => {
    if (!bootcamp.start_date) return 1;
    const startDate = new Date(bootcamp.start_date);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(daysPassed, 1), bootcamp.duration_days);
  };

  const currentDay = getCurrentDay();

  const handleOpenTask = (task: BootcampTask) => {
    setSelectedTask(task);
    setSubmissionText("");
    setSubmissionUrl("");
  };

  const handleSubmitTask = async () => {
    if (!selectedTask) return;

    setSubmitting(true);
    const result = await onSubmitTask(selectedTask.id, submissionText, submissionUrl);
    setSubmitting(false);

    if (result.success) {
      toast.success("Task submitted successfully!");
      setSelectedTask(null);
      refetch();
    } else {
      toast.error(result.error || "Failed to submit task");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Compact Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Link to="/dashboard/bootcamps">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="min-w-0">
                <h1 className="font-semibold truncate">{bootcamp.title}</h1>
                <p className="text-xs text-muted-foreground">
                  Day {currentDay} of {bootcamp.duration_days} • {bootcamp.host_name}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="bg-primary/10 text-primary border-primary/30">
                {participation.total_xp} XP
              </Badge>
              {isCompleted && (
                <Badge variant="secondary">Completed</Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={`grid w-full mb-6 ${isHost ? 'grid-cols-4 md:grid-cols-7' : 'grid-cols-3 md:grid-cols-6'}`}>
            <TabsTrigger value="home" className="flex items-center gap-1.5">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="rooms" className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Rooms</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-1.5">
              <ListTodo className="w-4 h-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Rank</span>
            </TabsTrigger>
            <TabsTrigger value="participants" className="flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">People</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            {isHost && (
              <TabsTrigger value="manage" className="flex items-center gap-1.5">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Manage</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="home">
            <BootcampDailyFocus
              bootcamp={bootcamp}
              tasks={tasks}
              submissions={submissions}
              participation={participation}
              currentDay={currentDay}
              onOpenTask={handleOpenTask}
            />
          </TabsContent>

          <TabsContent value="rooms">
            <BootcampRooms
              bootcampId={bootcamp.id}
              isCompleted={isCompleted}
            />
          </TabsContent>

          <TabsContent value="tasks">
            <BootcampTasks
              tasks={tasks}
              submissions={submissions}
              bootcamp={bootcamp}
              onSubmit={onSubmitTask}
              refetch={refetch}
            />
          </TabsContent>

          <TabsContent value="leaderboard">
            <BootcampLeaderboard
              leaderboard={leaderboard}
              currentUserId={user?.id}
            />
          </TabsContent>

          <TabsContent value="participants">
            <BootcampParticipants
              participants={participants}
              currentUserId={user?.id}
            />
          </TabsContent>

          <TabsContent value="profile">
            <BootcampUserProfile
              bootcamp={bootcamp}
              participation={participation}
              submissions={submissions}
              leaderboard={leaderboard}
              userName={profile?.full_name || "Participant"}
              userAvatar={profile?.avatar_url}
              currentDay={currentDay}
            />
          </TabsContent>

          {isHost && (
            <TabsContent value="manage">
              <BootcampCreatorControls
                bootcamp={bootcamp}
                isHost={isHost}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>

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
            <Button onClick={handleSubmitTask} disabled={submitting}>
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

export default BootcampInternalDashboard;
