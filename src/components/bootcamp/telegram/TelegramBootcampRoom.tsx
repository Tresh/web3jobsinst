import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useBootcampCommunityTopics } from "@/hooks/useBootcampCommunity";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  MoreVertical,
  Pin,
  Zap,
} from "lucide-react";
import type { Bootcamp, BootcampParticipant, BootcampTask, BootcampTaskSubmission, BootcampLeaderboardEntry, BootcampCommunityTopic } from "@/types/bootcamp";
import TelegramRoomChat from "./TelegramRoomChat";
import TelegramRoomList from "./TelegramRoomList";
import { LiveVoiceRoom } from "@/components/bootcamp/voice";

interface TelegramBootcampRoomProps {
  bootcamp: Bootcamp;
  participation: BootcampParticipant;
  tasks: BootcampTask[];
  submissions: BootcampTaskSubmission[];
  leaderboard: BootcampLeaderboardEntry[];
  participants: BootcampParticipant[];
  onSubmitTask: (taskId: string, text?: string, url?: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

const TelegramBootcampRoom = ({
  bootcamp,
  participation,
  tasks,
  submissions,
  leaderboard,
  participants,
  onSubmitTask,
  refetch,
}: TelegramBootcampRoomProps) => {
  const { user } = useAuth();
  const { topics, loading: loadingTopics } = useBootcampCommunityTopics(bootcamp.id);
  const [selectedRoom, setSelectedRoom] = useState<BootcampCommunityTopic | null>(null);
  const [showRoomList, setShowRoomList] = useState(true);

  const isHost = user?.id === bootcamp.host_user_id;
  const isCompleted = bootcamp.status === "completed";

  // Calculate current day
  const getCurrentDay = () => {
    if (!bootcamp.start_date) return 1;
    const startDate = new Date(bootcamp.start_date);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(daysPassed, 1), bootcamp.duration_days);
  };

  const currentDay = getCurrentDay();

  // Get today's tasks
  const todayTasks = tasks.filter((task) => task.day_number === currentDay);
  const pendingTasks = todayTasks.filter((task) => {
    const sub = submissions.find((s) => s.task_id === task.id);
    return !sub || sub.status !== "approved";
  });

  const handleSelectRoom = (topic: BootcampCommunityTopic) => {
    setSelectedRoom(topic);
    setShowRoomList(false);
  };

  const handleBackToRooms = () => {
    setShowRoomList(true);
    setSelectedRoom(null);
  };

  // Room list view
  if (showRoomList) {
    return (
      <div className="flex flex-col h-full min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <Link to="/dashboard/bootcamps">
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                </Link>
                <Avatar className="w-10 h-10 shrink-0 border border-primary/20">
                  {bootcamp.cover_image_url ? (
                    <AvatarImage src={bootcamp.cover_image_url} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">
                    {bootcamp.title.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h1 className="font-semibold truncate text-foreground">{bootcamp.title}</h1>
                  <p className="text-xs text-muted-foreground">
                    Day {currentDay} / {bootcamp.duration_days}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
                  <Zap className="w-3 h-3 mr-1" />
                  {participation.total_xp} XP
                </Badge>
                {/* Live Voice Room Button */}
                <LiveVoiceRoom bootcampId={bootcamp.id} isHost={isHost} />
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Pinned Daily Tasks Alert */}
          {pendingTasks.length > 0 && (
            <div className="px-4 py-2 bg-primary/10 border-t border-primary/20">
              <div className="flex items-center gap-2">
                <Pin className="w-4 h-4 text-primary shrink-0" />
                <p className="text-sm text-primary font-medium flex-1 truncate">
                  {pendingTasks.length} daily task{pendingTasks.length > 1 ? "s" : ""} pending
                </p>
                <Badge className="bg-primary text-primary-foreground text-xs">
                  +{pendingTasks.reduce((sum, t) => sum + t.xp_value, 0)} XP
                </Badge>
              </div>
            </div>
          )}
        </header>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          <TelegramRoomList
            topics={topics}
            loading={loadingTopics}
            onSelectRoom={handleSelectRoom}
            isHost={isHost}
            bootcamp={bootcamp}
            tasks={tasks}
            submissions={submissions}
            participation={participation}
            leaderboard={leaderboard}
            participants={participants}
            currentDay={currentDay}
            onSubmitTask={onSubmitTask}
            refetch={refetch}
          />
        </div>
      </div>
    );
  }

  // Chat view
  return (
    <TelegramRoomChat
      bootcamp={bootcamp}
      topic={selectedRoom!}
      isCompleted={isCompleted}
      onBack={handleBackToRooms}
    />
  );
};

export default TelegramBootcampRoom;
