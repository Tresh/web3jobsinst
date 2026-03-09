import { useEffect, useState } from "react";
import {
  Zap,
  CheckCircle,
  UserPlus,
  Trophy,
  BookOpen,
  ShoppingCart,
  ArrowRight } from
"lucide-react";

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
  icon: <Zap className="w-3.5 h-3.5 text-primary" />
},
{
  id: "2",
  type: "task",
  message: "M***n completed 'Create Twitter Thread'",
  time: "2 min ago",
  icon: <CheckCircle className="w-3.5 h-3.5 text-primary" />
},
{
  id: "3",
  type: "join",
  message: "New scholar joined from Nigeria 🇳🇬",
  time: "5 min ago",
  icon: <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
},
{
  id: "4",
  type: "module",
  message: "A***r unlocked Module 3: DeFi Basics",
  time: "8 min ago",
  icon: <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
},
{
  id: "5",
  type: "xp",
  message: "J***e reached 1,000 XP milestone! 🎉",
  time: "12 min ago",
  icon: <Trophy className="w-3.5 h-3.5 text-primary" />
},
{
  id: "6",
  type: "purchase",
  message: "Trading Strategies Ebook purchased",
  time: "15 min ago",
  icon: <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />
},
{
  id: "7",
  type: "join",
  message: "New scholar joined from Kenya 🇰🇪",
  time: "18 min ago",
  icon: <UserPlus className="w-3.5 h-3.5 text-muted-foreground" />
},
{
  id: "8",
  type: "task",
  message: "D***l completed daily check-in (Day 15)",
  time: "22 min ago",
  icon: <CheckCircle className="w-3.5 h-3.5 text-primary" />
}];


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
  activities[currentIndex % activities.length],
  activities[(currentIndex + 1) % activities.length],
  activities[(currentIndex + 2) % activities.length],
  activities[(currentIndex + 3) % activities.length],
  activities[(currentIndex + 4) % activities.length],
  activities[(currentIndex + 5) % activities.length]];


  return;











































};

export default LiveActivityFeed;