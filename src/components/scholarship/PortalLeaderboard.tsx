import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Zap, Coins } from "lucide-react";
import type { LeaderboardEntry } from "@/types/scholarship";

const PAGE_SIZE = 30;

interface PortalLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentUserId: string;
}

export function PortalLeaderboard({ leaderboard, currentUserId }: PortalLeaderboardProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-4 h-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-4 h-4 text-gray-400" />;
    if (rank === 3) return <Medal className="w-4 h-4 text-amber-600" />;
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

  const currentUserEntry = leaderboard.find((entry) => entry.user_id === currentUserId);
  const visibleEntries = leaderboard.slice(0, visibleCount);
  const hasMore = visibleCount < leaderboard.length;

  return (
    <div className="space-y-6">
      {/* Current User's Rank — stacks on mobile, row on sm+ */}
      {currentUserEntry && (
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Avatar + label */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-primary-foreground">
                    {currentUserEntry.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold">Your Ranking</h3>
                  <p className="text-sm text-muted-foreground">Keep earning XP to climb!</p>
                </div>
              </div>

              {/* Metrics below on mobile, inline right on sm+ */}
              <div className="flex items-center gap-5 sm:ml-auto">
                <div className="text-center">
                  <p className="text-2xl font-bold">#{currentUserEntry.rank}</p>
                  <p className="text-xs text-muted-foreground">Rank</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold flex items-center gap-1 justify-center">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    {currentUserEntry.total_xp}
                  </p>
                  <p className="text-xs text-muted-foreground">XP</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold flex items-center gap-1 justify-center">
                    <Coins className="w-4 h-4 text-amber-500" />
                    {currentUserEntry.wji_earned}
                  </p>
                  <p className="text-xs text-muted-foreground">WJI</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Table */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Scholarship Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {visibleEntries.map((entry) => {
              const isCurrentUser = entry.user_id === currentUserId;
              return (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-2 sm:gap-3 p-3 sm:p-4 ${
                    isCurrentUser ? "bg-primary/5" : ""
                  }`}
                >
                  {/* Rank badge */}
                  <Badge
                    className={`w-8 h-8 flex-shrink-0 flex items-center justify-center p-0 ${getRankBadge(entry.rank)}`}
                  >
                    {getRankIcon(entry.rank) || <span className="text-xs font-bold">{entry.rank}</span>}
                  </Badge>

                  {/* Avatar */}
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {entry.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Name — truncates to prevent overflow */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${isCurrentUser ? "text-primary" : ""}`}>
                      {entry.full_name}
                      {isCurrentUser && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(You)</span>
                      )}
                    </p>
                  </div>

                  {/* Stats — icon+number always visible, label only on sm+ */}
                  <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="font-semibold text-sm">{entry.total_xp}</span>
                      <span className="text-muted-foreground text-xs hidden sm:inline">XP</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-semibold text-sm">{entry.wji_earned}</span>
                      <span className="text-muted-foreground text-xs hidden sm:inline">WJI</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="p-4 text-center border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
              >
                Load More ({leaderboard.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
