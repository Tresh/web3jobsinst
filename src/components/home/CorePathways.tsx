import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  Briefcase,
  Trophy, 
  GraduationCap, 
  Zap,
  ArrowRight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const pathways = [
  {
    id: "learn",
    title: "Learn & Buy",
    description: "Master Web3, AI, trading, and high-income skills with practical courses and digital products.",
    icon: BookOpen,
    features: ["200+ Courses", "Digital Products", "Bootcamps"],
    cta: "Browse Courses",
    href: "/courses",
  },
  {
    id: "learnfi",
    title: "LearnFi",
    description: "Join structured learn-to-earn programs. Complete missions, earn tokens, XP, and real opportunities.",
    icon: Zap,
    features: ["Learn-to-Earn", "Token Rewards", "Ecosystem Missions"],
    cta: "Explore Programs",
    href: "/learnfi",
    badge: "New",
  },
  {
    id: "hire",
    title: "Hire & Get Hired",
    description: "Connect with verified talent or showcase your proof of work to land your next opportunity.",
    icon: Briefcase,
    features: ["Talent Profiles", "Job Campaigns", "Verified Skills"],
    cta: "Explore Talent",
    href: "/talent",
  },
  {
    id: "reputation",
    title: "Build Reputation",
    description: "Complete tasks, earn XP, and build public proof of work that demonstrates your capabilities.",
    icon: Trophy,
    features: ["XP System", "Task Completion", "Public Rankings"],
    cta: "See Leaderboard",
    href: "/dashboard/scholarship",
    requiresAuth: true,
  },
  {
    id: "scholarship",
    title: "Free Scholarship",
    description: "Zero-cost entry to learn, build, and earn. Complete tasks to unlock paid opportunities.",
    icon: GraduationCap,
    features: ["Free Entry", "Structured Learning", "Earn While Learning"],
    cta: "Join Scholarship",
    href: "/dashboard/scholarship",
    requiresAuth: true,
    badge: "Popular",
  },
];

const CorePathways = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleClick = (pathway: typeof pathways[0]) => {
    if (pathway.requiresAuth && !user) {
      navigate("/login", { state: { from: { pathname: pathway.href } } });
      return;
    }
    navigate(pathway.href);
  };

  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Your Path Into the Ecosystem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Four clear pathways to learn, earn, and grow in the decentralized economy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pathways.map((pathway) => (
            <Card
              key={pathway.id}
              onClick={() => handleClick(pathway)}
              className="cursor-pointer group bg-card border-border hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 relative overflow-hidden"
            >
              <CardContent className="p-6 relative">
                {/* Badge */}
                {pathway.badge && (
                  <span className="absolute top-4 right-4 text-[10px] font-semibold px-2 py-0.5 bg-primary text-primary-foreground rounded">
                    {pathway.badge}
                  </span>
                )}

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <pathway.icon className="w-6 h-6 text-primary" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {pathway.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">
                  {pathway.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {pathway.features.map((feature) => (
                    <span 
                      key={feature}
                      className="text-[10px] px-2 py-1 bg-secondary text-muted-foreground rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div className="flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                  {pathway.cta}
                  <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CorePathways;
