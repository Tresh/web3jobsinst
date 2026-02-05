import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Trophy,
  Zap,
  Target,
  Flame,
  TrendingUp,
  CheckCircle,
} from "lucide-react";
import type { Bootcamp, BootcampParticipant, BootcampTask, BootcampTaskSubmission, BootcampLeaderboardEntry } from "@/types/bootcamp";

interface LeaderboardTabProps {
  bootcamp: Bootcamp;
  participation: BootcampParticipant;
  leaderboard: BootcampLeaderboardEntry[];
  tasks: BootcampTask[];
  submissions: BootcampTaskSubmission[];
  currentDay: number;
}

const LeaderboardTab = ({
  bootcamp,
  participation,
  leaderboard,
  tasks,
  submissions,
  currentDay,
}: LeaderboardTabProps) => {
  // Calculate user stats
  const userRank = leaderboard.findIndex((e) => e.user_id === participation.user_id) + 1;
  const completedTasks = submissions.filter((s) => s.status === "approved").length;
  const totalTasks = tasks.filter((t) => t.day_number && t.day_number <= currentDay).length;
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Top 3 for podium
  const topThree = leaderboard.slice(0, 3);

  return (
    <div className="pb-8">
      {/* User Progress Card */}
      <div className="px-4 py-6 bg-gradient-to-b from-primary/10 to-transparent">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarImage src={participation.user_id ? undefined : undefined} />
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {userRank > 0 ? `#${userRank}` : "?"}
                </AvatarFallback>
              </Avatar>
              {userRank <= 3 && userRank > 0 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Trophy className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Your Progress</h3>
              <p className="text-sm text-muted-foreground">
                Day {currentDay} of {bootcamp.duration_days}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">{participation.total_xp}</p>
              <p className="text-xs text-muted-foreground">Total XP</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Tasks Completed</span>
              <span className="font-medium">{completedTasks}/{totalTasks}</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Trophy className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold">{userRank > 0 ? `#${userRank}` : "-"}</p>
              <p className="text-xs text-muted-foreground">Rank</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                <CheckCircle className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold">{completedTasks}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500 mb-1">
                <Flame className="w-4 h-4" />
              </div>
              <p className="text-lg font-bold">{Math.round(progressPercent)}%</p>
              <p className="text-xs text-muted-foreground">Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Podium for Top 3 */}
      {topThree.length > 0 && (
        <div className="px-4 py-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Top Performers
          </h3>
          <div className="flex items-end justify-center gap-2">
            {/* 2nd Place */}
            {topThree[1] && (
              <div className="flex flex-col items-center">
                <Avatar className="w-12 h-12 border-2 border-gray-400 mb-2">
                  <AvatarImage src={topThree[1].user_avatar || undefined} />
                  <AvatarFallback className="bg-gray-400/20 text-gray-400">
                    {topThree[1].user_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-20 h-16 bg-gray-400/20 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-gray-400">2</span>
                </div>
                <p className="text-xs font-medium mt-1 truncate max-w-[80px]">
                  {topThree[1].user_name.split(" ")[0]}
                </p>
                <p className="text-xs text-muted-foreground">{topThree[1].total_xp} XP</p>
              </div>
            )}

            {/* 1st Place */}
            {topThree[0] && (
              <div className="flex flex-col items-center -mt-4">
                <div className="text-2xl mb-1">👑</div>
                <Avatar className="w-16 h-16 border-2 border-yellow-500 mb-2">
                  <AvatarImage src={topThree[0].user_avatar || undefined} />
                  <AvatarFallback className="bg-yellow-500/20 text-yellow-500">
                    {topThree[0].user_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-24 h-20 bg-yellow-500/20 rounded-t-lg flex items-center justify-center">
                  <span className="text-3xl font-bold text-yellow-500">1</span>
                </div>
                <p className="text-sm font-medium mt-1 truncate max-w-[96px]">
                  {topThree[0].user_name.split(" ")[0]}
                </p>
                <p className="text-xs text-muted-foreground">{topThree[0].total_xp} XP</p>
              </div>
            )}

            {/* 3rd Place */}
            {topThree[2] && (
              <div className="flex flex-col items-center">
                <Avatar className="w-12 h-12 border-2 border-amber-700 mb-2">
                  <AvatarImage src={topThree[2].user_avatar || undefined} />
                  <AvatarFallback className="bg-amber-700/20 text-amber-700">
                    {topThree[2].user_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-20 h-12 bg-amber-700/20 rounded-t-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-amber-700">3</span>
                </div>
                <p className="text-xs font-medium mt-1 truncate max-w-[80px]">
                  {topThree[2].user_name.split(" ")[0]}
                </p>
                <p className="text-xs text-muted-foreground">{topThree[2].total_xp} XP</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Leaderboard */}
      <div className="px-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Full Rankings
        </h3>
        <div className="space-y-2">
          {leaderboard.map((entry, index) => {
            const isCurrentUser = entry.user_id === participation.user_id;
            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  isCurrentUser
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-card border border-border"
                }`}
              >
                {/* Rank */}
                <span
                  className={`w-8 text-center font-bold ${
                    index === 0
                      ? "text-yellow-500"
                      : index === 1
                      ? "text-gray-400"
                      : index === 2
                      ? "text-amber-700"
                      : "text-muted-foreground"
                  }`}
                >
                  {index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}
                </span>

                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.user_avatar || undefined} />
                  <AvatarFallback className={isCurrentUser ? "bg-primary/20 text-primary" : "bg-muted"}>
                    {entry.user_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className={`font-medium truncate ${isCurrentUser ? "text-primary" : ""}`}>
                    {entry.user_name}
                    {isCurrentUser && " (You)"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {entry.tasks_completed} tasks completed
                  </p>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className="font-bold flex items-center gap-1 justify-end">
                    <Zap className="w-4 h-4 text-primary" />
                    {entry.total_xp}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardTab;
