import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  CheckCircle,
  Calendar,
  Trophy,
  Target,
  Flame,
  TrendingUp,
} from "lucide-react";
import type { Bootcamp, BootcampParticipant, BootcampTaskSubmission, BootcampLeaderboardEntry } from "@/types/bootcamp";
import { useBootcampProgressLog } from "@/hooks/useBootcampProgressLog";
import { format, parseISO, differenceInDays } from "date-fns";

interface BootcampUserProfileProps {
  bootcamp: Bootcamp;
  participation: BootcampParticipant;
  submissions: BootcampTaskSubmission[];
  leaderboard: BootcampLeaderboardEntry[];
  userName: string;
  userAvatar?: string | null;
  currentDay: number;
}

const BootcampUserProfile = ({
  bootcamp,
  participation,
  submissions,
  leaderboard,
  userName,
  userAvatar,
  currentDay,
}: BootcampUserProfileProps) => {
  const { recentLogs, loading: loadingLogs } = useBootcampProgressLog(bootcamp.id);

  // Calculate stats
  const approvedSubmissions = submissions.filter((s) => s.status === "approved");
  const pendingSubmissions = submissions.filter((s) => s.status === "pending");
  const rejectedSubmissions = submissions.filter((s) => s.status === "rejected");
  
  const userRank = leaderboard.find((l) => l.user_id === participation.user_id)?.rank || 0;
  const progressPercent = (currentDay / bootcamp.duration_days) * 100;
  
  // Days active (days with at least one log)
  const daysWithLogs = recentLogs.length;

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src={userAvatar || undefined} />
              <AvatarFallback className="text-2xl">
                {userName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-2xl font-bold">{userName}</h2>
              <p className="text-muted-foreground">Bootcamp Participant</p>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-3">
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  <Zap className="w-3 h-3 mr-1" />
                  {participation.total_xp} XP
                </Badge>
                {userRank > 0 && userRank <= 3 && (
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">
                    <Trophy className="w-3 h-3 mr-1" />
                    Rank #{userRank}
                  </Badge>
                )}
                <Badge variant="outline">
                  <Calendar className="w-3 h-3 mr-1" />
                  Joined {format(parseISO(participation.joined_at), "MMM d")}
                </Badge>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl font-bold text-primary">#{userRank || "-"}</div>
              <p className="text-sm text-muted-foreground">Leaderboard</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Progress Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Bootcamp Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Day Progress</span>
                <span className="font-medium">Day {currentDay} / {bootcamp.duration_days}</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-green-500">{approvedSubmissions.length}</div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Tasks Completed
                </p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{participation.total_xp}</div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Zap className="w-3 h-3" />
                  Total XP
                </p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-yellow-500">{pendingSubmissions.length}</div>
                <p className="text-xs text-muted-foreground">Pending Review</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-muted-foreground">{daysWithLogs}</div>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Flame className="w-3 h-3" />
                  Days Logged
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Recent Progress Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingLogs ? (
              <p className="text-muted-foreground text-center py-4">Loading...</p>
            ) : recentLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Flame className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No progress logs yet</p>
                <p className="text-sm">Start logging your daily progress!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-muted/30 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {format(parseISO(log.log_date), "MMM d, yyyy")}
                      </Badge>
                    </div>
                    {log.worked_on && (
                      <p className="text-sm line-clamp-2">{log.worked_on}</p>
                    )}
                    {log.wins && (
                      <p className="text-xs text-green-500 mt-1">🎉 {log.wins}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Submission History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Task Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No task submissions yet</p>
          ) : (
            <div className="space-y-2">
              {submissions.slice(0, 10).map((submission) => (
                <div
                  key={submission.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    submission.status === "approved"
                      ? "bg-green-500/5 border-green-500/20"
                      : submission.status === "rejected"
                      ? "bg-red-500/5 border-red-500/20"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {submission.status === "approved" ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : submission.status === "rejected" ? (
                      <div className="w-4 h-4 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center text-xs">✕</div>
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-yellow-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        Task Submission
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(submission.created_at), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {submission.status === "approved" && submission.xp_awarded && (
                      <Badge className="bg-green-500/10 text-green-500">
                        +{submission.xp_awarded} XP
                      </Badge>
                    )}
                    <Badge
                      variant={
                        submission.status === "approved"
                          ? "default"
                          : submission.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {submission.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BootcampUserProfile;
