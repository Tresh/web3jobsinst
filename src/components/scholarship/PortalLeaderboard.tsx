import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Zap } from "lucide-react";
import type { LeaderboardEntry } from "@/types/scholarship";

interface PortalLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

export function PortalLeaderboard({ leaderboard, currentUserId }: PortalLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
    if (rank === 2) return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    if (rank === 3) return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    return "bg-secondary text-muted-foreground";
  };

  if (leaderboard.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
          <p className="text-muted-foreground">
            Complete tasks to earn XP and appear on the leaderboard
          </p>
        </CardContent>
      </Card>
    );
  }

  // Find current user's position
  const currentUserEntry = leaderboard.find((entry) => entry.user_id === currentUserId);

  return (
    <div className="space-y-6">
      {/* Current User's Rank */}
      {currentUserEntry && (
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-lg font-bold text-primary-foreground">
                    {currentUserEntry.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">Your Ranking</h3>
                  <p className="text-sm text-muted-foreground">Keep earning XP to climb!</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">#{currentUserEntry.rank}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 justify-end">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  {currentUserEntry.total_xp} XP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Scholarship Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.user_id === currentUserId;
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center justify-between p-4 ${
                    isCurrentUser ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Badge className={`w-8 h-8 flex items-center justify-center ${getRankBadge(entry.rank)}`}>
                      {getRankIcon(entry.rank) || entry.rank}
                    </Badge>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {entry.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className={`font-medium ${isCurrentUser ? "text-primary" : ""}`}>
                          {entry.full_name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span className="font-semibold">{entry.total_xp}</span>
                    <span className="text-muted-foreground text-sm">XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
