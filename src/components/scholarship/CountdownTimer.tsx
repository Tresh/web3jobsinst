import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock } from "lucide-react";

const PROGRAM_START_DATE = new Date("2026-02-01T00:00:00");

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

export function CountdownTimer() {
  const countdown = useCountdown(PROGRAM_START_DATE);
  const isProgramStarted = countdown.isComplete;

  if (isProgramStarted) {
    return null;
  }

  return (
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
            Day 1 begins February 1st, 2026
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
