import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  Users,
  BookOpen,
  CalendarDays,
  Trophy,
  MessageSquare,
  Zap,
  Settings,
} from "lucide-react";
import type { Bootcamp, BootcampParticipant, BootcampTask, BootcampTaskSubmission, BootcampLeaderboardEntry } from "@/types/bootcamp";
import CommunityTab from "./CommunityTab";
import ClassroomTab from "./ClassroomTab";
import CalendarTab from "./CalendarTab";
import MembersTab from "./MembersTab";
import LeaderboardTab from "./LeaderboardTab";
import BootcampCreatorControls from "../BootcampCreatorControls";

type TabType = "community" | "classroom" | "calendar" | "members" | "leaderboard";

interface BootcampSchoolLayoutProps {
  bootcamp: Bootcamp;
  participation: BootcampParticipant;
  tasks: BootcampTask[];
  submissions: BootcampTaskSubmission[];
  leaderboard: BootcampLeaderboardEntry[];
  participants: BootcampParticipant[];
  onSubmitTask: (taskId: string, text?: string, url?: string) => Promise<{ success: boolean; error?: string }>;
  refetch: () => void;
}

const BootcampSchoolLayout = ({
  bootcamp,
  participation,
  tasks,
  submissions,
  leaderboard,
  participants,
  onSubmitTask,
  refetch,
}: BootcampSchoolLayoutProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("community");
  const [showHostControls, setShowHostControls] = useState(false);

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
  const userRank = leaderboard.findIndex((e) => e.user_id === participation.user_id) + 1;

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: "community", label: "Community", icon: <MessageSquare className="w-4 h-4" /> },
    { id: "classroom", label: "Classroom", icon: <BookOpen className="w-4 h-4" /> },
    { id: "calendar", label: "Calendar", icon: <CalendarDays className="w-4 h-4" /> },
    { id: "members", label: "Members", icon: <Users className="w-4 h-4" /> },
    { id: "leaderboard", label: "Progress", icon: <Trophy className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background overflow-y-auto">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pwa-safe-header">
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
                  Day {currentDay} / {bootcamp.duration_days} • {participants.length} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
                <Zap className="w-3 h-3 mr-1" />
                {participation.total_xp} XP
              </Badge>
              {userRank > 0 && (
                <Badge variant="outline" className="text-xs">
                  #{userRank}
                </Badge>
              )}
              {isHost && (
                <Button variant="ghost" size="icon" onClick={() => setShowHostControls(true)}>
                  <Settings className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-2 border-t border-border/50 overflow-x-auto scrollbar-hide">
          <div className="flex items-center min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1 overflow-y-auto">
        {activeTab === "community" && (
          <CommunityTab
            bootcamp={bootcamp}
            isHost={isHost}
            currentDay={currentDay}
            tasks={tasks}
            submissions={submissions}
            onSubmitTask={onSubmitTask}
            refetch={refetch}
          />
        )}
        {activeTab === "classroom" && (
          <ClassroomTab
            bootcamp={bootcamp}
            tasks={tasks}
            submissions={submissions}
            currentDay={currentDay}
            onSubmitTask={onSubmitTask}
            refetch={refetch}
          />
        )}
        {activeTab === "calendar" && (
          <CalendarTab
            bootcamp={bootcamp}
            tasks={tasks}
            currentDay={currentDay}
          />
        )}
        {activeTab === "members" && (
          <MembersTab
            bootcamp={bootcamp}
            participants={participants}
            leaderboard={leaderboard}
            isHost={isHost}
          />
        )}
        {activeTab === "leaderboard" && (
          <LeaderboardTab
            bootcamp={bootcamp}
            participation={participation}
            leaderboard={leaderboard}
            tasks={tasks}
            submissions={submissions}
            currentDay={currentDay}
          />
        )}
      </main>

      {/* Host Controls Dialog */}
      {isHost && (
        <Dialog open={showHostControls} onOpenChange={setShowHostControls}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Host Controls</DialogTitle>
            </DialogHeader>
            <BootcampCreatorControls bootcamp={bootcamp} isHost={isHost} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default BootcampSchoolLayout;
