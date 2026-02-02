import { useEffect, useState } from "react";
import { 
  Zap, 
  CheckCircle, 
  UserPlus, 
  Trophy,
  BookOpen,
  ShoppingCart,
  ArrowRight
} from "lucide-react";

interface Activity {
  id: string;
  type: "xp" | "task" | "join" | "purchase" | "module";
  message: string;
  time: string;
  icon: React.ReactNode;
}

const generateActivities = (): Activity[] => [
  {
    id: "1",
    type: "xp",
    message: "S***a earned 150 XP from task completion",
    time: "Just now",
    icon: <Zap className="w-3.5 h-3.5 text-amber-500" />,
  },
  {
    id: "2",
    type: "task",
    message: "M***n completed 'Create Twitter Thread'",
    time: "2 min ago",
    icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  },
  {
    id: "3",
    type: "join",
    message: "New scholar joined from Nigeria 🇳🇬",
    time: "5 min ago",
    icon: <UserPlus className="w-3.5 h-3.5 text-blue-500" />,
  },
  {
    id: "4",
    type: "module",
    message: "A***r unlocked Module 3: DeFi Basics",
    time: "8 min ago",
    icon: <BookOpen className="w-3.5 h-3.5 text-purple-500" />,
  },
  {
    id: "5",
    type: "xp",
    message: "J***e reached 1,000 XP milestone! 🎉",
    time: "12 min ago",
    icon: <Trophy className="w-3.5 h-3.5 text-primary" />,
  },
  {
    id: "6",
    type: "purchase",
    message: "Trading Strategies Ebook purchased",
    time: "15 min ago",
    icon: <ShoppingCart className="w-3.5 h-3.5 text-green-500" />,
  },
  {
    id: "7",
    type: "join",
    message: "New scholar joined from Kenya 🇰🇪",
    time: "18 min ago",
    icon: <UserPlus className="w-3.5 h-3.5 text-blue-500" />,
  },
  {
    id: "8",
    type: "task",
    message: "D***l completed daily check-in (Day 15)",
    time: "22 min ago",
    icon: <CheckCircle className="w-3.5 h-3.5 text-green-500" />,
  },
];

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<Activity[]>(generateActivities());
  const [currentIndex, setCurrentIndex] = useState(0);

  // Simulate new activities coming in
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activities.length]);

  const visibleActivities = [
    activities[(currentIndex) % activities.length],
    activities[(currentIndex + 1) % activities.length],
    activities[(currentIndex + 2) % activities.length],
    activities[(currentIndex + 3) % activities.length],
    activities[(currentIndex + 4) % activities.length],
    activities[(currentIndex + 5) % activities.length],
  ];

  return (
    <section className="bg-foreground py-12">
      <div className="section-container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span>
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-background">Live Platform Activity</h3>
              <p className="text-xs text-background/60">Real-time updates from the ecosystem</p>
            </div>
          </div>
        </div>

        {/* Activity Ticker */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visibleActivities.map((activity, index) => (
            <div
              key={`${activity.id}-${index}`}
              className="flex items-center gap-3 bg-background/10 border border-background/20 rounded-lg p-3 transition-all duration-500"
              style={{
                opacity: 1 - (index * 0.1),
              }}
            >
              <div className="w-7 h-7 rounded-full bg-background/20 flex items-center justify-center flex-shrink-0">
                {activity.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-background truncate">{activity.message}</p>
                <span className="text-[10px] text-background/50">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LiveActivityFeed;
