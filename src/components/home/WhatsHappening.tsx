import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GraduationCap, 
  Rocket, 
  Trophy, 
  BookOpen, 
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const WhatsHappening = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats } = usePlatformStats();

  const happeningItems = [
    {
      id: "scholarship",
      type: "Scholarship",
      title: "Web3 Jobs Institute Scholarship",
      status: "Now Live",
      statusColor: "bg-green-500",
      description: `Join ${(stats?.activeScholars || 1193).toLocaleString()}+ scholars building proof of work`,
      icon: GraduationCap,
      href: "/dashboard/scholarship",
      requiresAuth: true,
      stats: [
        { label: "Active Scholars", value: (stats?.activeScholars || 1193).toLocaleString() },
        { label: "Tasks Completed", value: (stats?.tasksCompleted || 2720).toLocaleString() },
      ],
    },
    {
      id: "bootcamps",
      type: "Bootcamps",
      title: "Cohort-Based Learning",
      status: `${stats?.activeBootcamps || 3} Active`,
      statusColor: "bg-blue-500",
      description: "Intensive programs with live mentorship",
      icon: Rocket,
      href: "/bootcamps",
      stats: [
        { label: "Running Now", value: String(stats?.activeBootcamps || 3) },
        { label: "Participants", value: String(stats?.bootcampParticipants || 156) },
      ],
    },
    {
      id: "leaderboard",
      type: "Leaderboard",
      title: "Top Performers This Week",
      status: "Live",
      statusColor: "bg-amber-500",
      description: "Ranked by XP earned and tasks completed",
      icon: Trophy,
      href: "/dashboard/scholarship",
      requiresAuth: true,
      topPerformers: [
        { rank: 1, name: "S***a", xp: "2,450 XP" },
        { rank: 2, name: "M***n", xp: "2,120 XP" },
        { rank: 3, name: "A***r", xp: "1,890 XP" },
      ],
    },
    {
      id: "modules",
      type: "New Content",
      title: "Latest Modules Added",
      status: "Updated",
      statusColor: "bg-purple-500",
      description: "Fresh learning content available now",
      icon: BookOpen,
      href: "/courses",
      modules: [
        { title: "Web3 Fundamentals", xp: "100 XP" },
        { title: "Smart Contract Basics", xp: "150 XP" },
      ],
    },
  ];

  const handleClick = (item: typeof happeningItems[0]) => {
    if (item.requiresAuth && !user) {
      navigate("/login", { state: { from: { pathname: item.href } } });
      return;
    }
    navigate(item.href);
  };

  return (
    <section className="py-16 md:py-20">
      <div className="section-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-medium text-primary">Live Activity</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              What's Happening Now
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {happeningItems.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleClick(item)}
              className="cursor-pointer group bg-white/5 border-white/10 hover:border-primary/30 transition-all duration-200"
            >
              <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="text-[10px] gap-1.5 bg-white/10 text-foreground border-0">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.statusColor}`} />
                    {item.status}
                  </Badge>
                </div>

                {/* Type */}
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                  {item.type}
                </span>

                {/* Title */}
                <h3 className="text-sm font-semibold text-foreground mt-1 mb-2">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-muted-foreground mb-4">
                  {item.description}
                </p>

                {/* Stats or Content */}
                {item.stats && (
                  <div className="flex gap-4 mb-4">
                    {item.stats.map((stat) => (
                      <div key={stat.label}>
                      <div className="text-sm font-bold text-foreground">{stat.value}</div>
                      <div className="text-[10px] text-muted-foreground">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                )}

                {item.topPerformers && (
                  <div className="space-y-2 mb-4">
                    {item.topPerformers.map((performer) => (
                      <div key={performer.rank} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                            {performer.rank}
                          </span>
                          <span className="text-foreground/70">{performer.name}</span>
                        </div>
                        <span className="font-medium text-primary">{performer.xp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {item.modules && (
                  <div className="space-y-2 mb-4">
                    {item.modules.map((module) => (
                      <div key={module.title} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-2">
                        <span className="text-foreground">{module.title}</span>
                        <span className="text-primary font-medium">{module.xp}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                  View Details
                  <ArrowRight className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatsHappening;
