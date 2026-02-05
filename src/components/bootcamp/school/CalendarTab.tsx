import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  Video,
  Zap,
} from "lucide-react";
import type { Bootcamp, BootcampTask } from "@/types/bootcamp";

interface CalendarTabProps {
  bootcamp: Bootcamp;
  tasks: BootcampTask[];
  currentDay: number;
}

type ViewMode = "month" | "agenda";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: "task" | "call" | "deadline" | "challenge";
  xp?: number;
  dayNumber?: number;
}

const CalendarTab = ({ bootcamp, tasks, currentDay }: CalendarTabProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("agenda");
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Generate calendar events from tasks and bootcamp dates
  const events = useMemo(() => {
    const eventList: CalendarEvent[] = [];

    if (!bootcamp.start_date) return eventList;

    const startDate = new Date(bootcamp.start_date);

    // Add tasks as events
    tasks.forEach((task) => {
      if (task.day_number) {
        const taskDate = new Date(startDate);
        taskDate.setDate(startDate.getDate() + task.day_number - 1);

        eventList.push({
          id: task.id,
          title: task.title,
          date: taskDate,
          type: task.task_type === "challenge" ? "challenge" : "task",
          xp: task.xp_value,
          dayNumber: task.day_number,
        });
      }
    });

    // Add bootcamp milestones
    const midpoint = new Date(startDate);
    midpoint.setDate(startDate.getDate() + Math.floor(bootcamp.duration_days / 2));
    eventList.push({
      id: "midpoint",
      title: "Bootcamp Midpoint 🎯",
      date: midpoint,
      type: "deadline",
    });

    if (bootcamp.end_date) {
      eventList.push({
        id: "end",
        title: "Bootcamp Finale 🎉",
        date: new Date(bootcamp.end_date),
        type: "deadline",
      });
    }

    return eventList.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [bootcamp, tasks]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(
      (e) =>
        e.date.getFullYear() === date.getFullYear() &&
        e.date.getMonth() === date.getMonth() &&
        e.date.getDate() === date.getDate()
    );
  };

  // Get today's date (based on bootcamp day)
  const getTodayDate = () => {
    if (!bootcamp.start_date) return new Date();
    const startDate = new Date(bootcamp.start_date);
    const today = new Date(startDate);
    today.setDate(startDate.getDate() + currentDay - 1);
    return today;
  };

  const todayDate = getTodayDate();

  // Upcoming events for agenda view
  const upcomingEvents = events.filter((e) => e.date >= new Date());

  // Month calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty slots for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const monthDays = getDaysInMonth(selectedMonth);
  const monthName = selectedMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setSelectedMonth(newMonth);
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "task":
        return <Target className="w-4 h-4" />;
      case "call":
        return <Video className="w-4 h-4" />;
      case "deadline":
        return <Clock className="w-4 h-4" />;
      case "challenge":
        return <Zap className="w-4 h-4" />;
      default:
        return <CalendarDays className="w-4 h-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "task":
        return "bg-blue-500/10 text-blue-500 border-blue-500/30";
      case "call":
        return "bg-purple-500/10 text-purple-500 border-purple-500/30";
      case "deadline":
        return "bg-red-500/10 text-red-500 border-red-500/30";
      case "challenge":
        return "bg-primary/10 text-primary border-primary/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="pb-8">
      {/* View Toggle */}
      <div className="px-4 py-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Schedule</h2>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode("agenda")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "agenda"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Agenda
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === "month"
                ? "bg-background shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {viewMode === "agenda" ? (
        /* Agenda View */
        <div className="px-4 py-4 space-y-4">
          {/* Today */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Today — Day {currentDay}
            </h3>
            {getEventsForDate(todayDate).length === 0 ? (
              <p className="text-sm text-muted-foreground/70 py-4">
                No events scheduled for today
              </p>
            ) : (
              getEventsForDate(todayDate).map((event) => (
                <div
                  key={event.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${getEventColor(
                    event.type
                  )}`}
                >
                  {getEventIcon(event.type)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    {event.xp && (
                      <p className="text-xs opacity-70">+{event.xp} XP</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Upcoming */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Upcoming
            </h3>
            {upcomingEvents.slice(0, 10).map((event) => {
              const isToday =
                event.date.toDateString() === todayDate.toDateString();
              if (isToday) return null;

              return (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${getEventColor(
                      event.type
                    )}`}
                  >
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {event.dayNumber
                        ? `Day ${event.dayNumber}`
                        : event.date.toLocaleDateString()}
                    </p>
                  </div>
                  {event.xp && (
                    <Badge variant="secondary" className="text-xs">
                      +{event.xp} XP
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Month View */
        <div className="px-4 py-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(-1)}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="font-semibold">{monthName}</h3>
            <Button variant="ghost" size="icon" onClick={() => navigateMonth(1)}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dayEvents = getEventsForDate(date);
              const isToday = date.toDateString() === todayDate.toDateString();
              const isPast = date < new Date();

              return (
                <div
                  key={date.toISOString()}
                  className={`aspect-square p-1 rounded-lg border transition-colors ${
                    isToday
                      ? "bg-primary/10 border-primary"
                      : isPast
                      ? "bg-muted/30 border-transparent"
                      : "bg-card border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="h-full flex flex-col">
                    <span
                      className={`text-xs font-medium ${
                        isToday ? "text-primary" : isPast ? "text-muted-foreground" : ""
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    <div className="flex-1 flex flex-wrap gap-0.5 overflow-hidden">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`w-1.5 h-1.5 rounded-full ${
                            event.type === "task"
                              ? "bg-blue-500"
                              : event.type === "challenge"
                              ? "bg-primary"
                              : event.type === "deadline"
                              ? "bg-red-500"
                              : "bg-purple-500"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span>Task</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span>Challenge</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span>Deadline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarTab;
