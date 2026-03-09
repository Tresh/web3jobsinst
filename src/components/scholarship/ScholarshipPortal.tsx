import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, ListTodo, Trophy, BookOpen, Bell, Gift, FolderCheck } from "lucide-react";
import { useScholarshipPortal } from "@/hooks/useScholarshipData";
import { PortalOverview } from "./PortalOverview";
import { PortalTasks } from "./PortalTasks";
import { PortalLeaderboard } from "./PortalLeaderboard";
import { PortalModules } from "./PortalModules";
import { PortalNotifications } from "./PortalNotifications";
import { PortalOffers } from "./PortalOffers";
import { PortalProofOfWork } from "./PortalProofOfWork";
import { Loader2 } from "lucide-react";

// Module-level — persists the active tab across navigation without URL coupling
let persistedTab = "overview";

export function ScholarshipPortal() {
  const location = useLocation();
  const {
    isLoading,
    application,
    tasks,
    submissions,
    modules,
    moduleProgress,
    leaderboard,
    notifications,
    totalScholars,
    userRank,
    dayNumber,
    submitTask,
    markNotificationRead,
    markAllNotificationsRead,
    getSubmissionForTask,
    getModuleStatus,
    refetch,
  } = useScholarshipPortal();

  // Prefer location.state?.tab (e.g. coming back from module detail),
  // then the last tab the user was on, then default to "overview"
  const initialTab = (location.state as any)?.tab || persistedTab;
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    persistedTab = tab;
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const completedModulesCount = moduleProgress?.filter((p) => p.status === "completed").length || 0;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          Scholarship Portal
        </h1>
        <p className="text-muted-foreground mt-1">
          Complete tasks, earn XP, and unlock courses
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto scrollbar-hide justify-start lg:w-auto lg:inline-flex lg:justify-center">
          <TabsTrigger value="overview" className="gap-2">
            <GraduationCap className="w-4 h-4 hidden sm:inline" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="w-4 h-4 hidden sm:inline" />
            <span>Tasks</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="w-4 h-4 hidden sm:inline" />
            <span>Ranking</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <BookOpen className="w-4 h-4 hidden sm:inline" />
            <span>Modules</span>
          </TabsTrigger>
          <TabsTrigger value="offers" className="gap-2">
            <Gift className="w-4 h-4 hidden sm:inline" />
            <span>Offers</span>
          </TabsTrigger>
          <TabsTrigger value="proof-of-work" className="gap-2">
            <FolderCheck className="w-4 h-4 hidden sm:inline" />
            <span>Proof of Work</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 relative">
            <Bell className="w-4 h-4 hidden sm:inline" />
            <span>Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PortalOverview
            application={application}
            completedModulesCount={completedModulesCount}
            totalModulesCount={modules.length}
            totalScholars={totalScholars}
            userRank={userRank}
            tasksCount={tasks.length}
            completedTasksCount={submissions.filter((s) => s.status === "approved").length}
            onCheckInSuccess={refetch}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <PortalTasks
            tasks={tasks}
            getSubmissionForTask={getSubmissionForTask}
            submitTask={submitTask}
            onRefetch={refetch}
          />
        </TabsContent>

        <TabsContent value="leaderboard">
          <PortalLeaderboard leaderboard={leaderboard} currentUserId={application.user_id} />
        </TabsContent>

        <TabsContent value="modules">
          <PortalModules
            modules={modules}
            getModuleStatus={getModuleStatus}
            dayNumber={dayNumber}
            onRefetch={refetch}
            programId={application.program_id}
            userTotalXp={application.total_xp || 0}
          />
        </TabsContent>

        <TabsContent value="offers">
          <PortalOffers />
        </TabsContent>

        <TabsContent value="proof-of-work">
          <PortalProofOfWork />
        </TabsContent>

        <TabsContent value="internship">
          <PortalInternshipProfile application={application} />
        </TabsContent>

        <TabsContent value="notifications">
          <PortalNotifications
            notifications={notifications}
            markNotificationRead={markNotificationRead}
            markAllNotificationsRead={markAllNotificationsRead}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
