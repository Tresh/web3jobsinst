import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Zap, CheckCircle } from "lucide-react";
import type { BootcampLeaderboardEntry } from "@/types/bootcamp";

interface BootcampLeaderboardProps {
  leaderboard: BootcampLeaderboardEntry[];
  currentUserId?: string;
}

const BootcampLeaderboard = ({ leaderboard, currentUserId }: BootcampLeaderboardProps) => {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-500/20";
      case 2:
        return "bg-gradient-to-r from-gray-500/10 to-gray-500/5 border-gray-500/20";
      case 3:
        return "bg-gradient-to-r from-amber-600/10 to-amber-600/5 border-amber-600/20";
      default:
        return "";
    }
  };

  if (leaderboard.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No leaderboard data yet.</p>
          <p className="text-sm text-muted-foreground">Complete tasks to climb the ranks!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((entry) => {
            const isCurrentUser = entry.user_id === currentUserId;
            
            return (
              <div
                key={entry.user_id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  isCurrentUser 
                    ? "bg-primary/5 border-primary/20" 
                    : getRankBg(entry.rank) || "hover:bg-muted/50"
                }`}
              >
                <div className="w-10 flex justify-center">
                  {getRankIcon(entry.rank)}
                </div>

                <Avatar className="w-10 h-10">
                  <AvatarImage src={entry.user_avatar || undefined} />
                  <AvatarFallback>
                    {entry.user_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{entry.user_name}</p>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs">You</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {entry.tasks_completed} tasks
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-lg font-bold text-primary">
                    <Zap className="w-4 h-4" />
                    {entry.total_xp}
                  </div>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default BootcampLeaderboard;
