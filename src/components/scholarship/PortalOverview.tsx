import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar, Star, Users, Target, Zap, Clock } from "lucide-react";
import type { ScholarshipApplication, LeaderboardEntry } from "@/types/scholarship";

const PROGRAM_START_DATE = new Date("2025-02-01T00:00:00");

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft(targetDate));

  function calculateTimeLeft(target: Date) {
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isComplete: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isComplete: false,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

interface PortalOverviewProps {
  application: ScholarshipApplication;
  dayNumber: number;
  totalScholars: number;
  userRank: LeaderboardEntry | undefined | null;
  tasksCount: number;
  completedTasksCount: number;
}

export function PortalOverview({
  application,
  dayNumber,
  totalScholars,
  userRank,
  tasksCount,
  completedTasksCount,
}: PortalOverviewProps) {
  const countdown = useCountdown(PROGRAM_START_DATE);
  const progressPercentage = (dayNumber / 30) * 100;
  const taskCompletionRate = tasksCount > 0 ? (completedTasksCount / tasksCount) * 100 : 0;
  const isProgramStarted = countdown.isComplete;

  return (
    <div className="space-y-6">
      {/* Countdown Section - Only show if program hasn't started */}
      {!isProgramStarted && (
        <Card className="bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-primary/30">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Program Starts In</h2>
              </div>
              <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-md mx-auto">
                <div className="bg-background/80 rounded-lg p-3 sm:p-4 border border-primary/20">
                  <p className="text-2xl sm:text-4xl font-bold text-primary">{countdown.days}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Days</p>
                </div>
                <div className="bg-background/80 rounded-lg p-3 sm:p-4 border border-primary/20">
                  <p className="text-2xl sm:text-4xl font-bold text-primary">{countdown.hours}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Hours</p>
                </div>
                <div className="bg-background/80 rounded-lg p-3 sm:p-4 border border-primary/20">
                  <p className="text-2xl sm:text-4xl font-bold text-primary">{countdown.minutes}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Min</p>
                </div>
                <div className="bg-background/80 rounded-lg p-3 sm:p-4 border border-primary/20">
                  <p className="text-2xl sm:text-4xl font-bold text-primary">{countdown.seconds}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Sec</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Day 1 begins February 1st, 2025
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold mb-1">Welcome back, {application.full_name}!</h2>
              <p className="text-muted-foreground">
                Keep up the momentum. Complete your daily tasks to climb the ranks.
              </p>
            </div>
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-sm px-3 py-1">
              <Star className="w-3 h-3 mr-1" />
              Active Scholar
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* XP Points */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{application.total_xp}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Rank */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  #{userRank?.rank || "-"}
                </p>
                <p className="text-xs text-muted-foreground">of {totalScholars}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Day Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">Day {dayNumber}</p>
                <p className="text-xs text-muted-foreground">of 30</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Completed */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedTasksCount}</p>
                <p className="text-xs text-muted-foreground">Tasks Done</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 30-Day Progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              30-Day Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{dayNumber} days completed</span>
                <span>{30 - dayNumber} days remaining</span>
              </div>
              {!application.scholarship_start_date && (
                <p className="text-xs text-muted-foreground bg-secondary/50 p-2 rounded">
                  Your 30-day journey will start once the admin sets your start date.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Task Completion */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4" />
              Task Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Progress value={taskCompletionRate} className="h-3" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{completedTasksCount} completed</span>
                <span>{tasksCount - completedTasksCount} pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Track Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">{application.preferred_track}</h3>
              <p className="text-sm text-muted-foreground">Your selected learning track</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
