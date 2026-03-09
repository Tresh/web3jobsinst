import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Play } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const MarketplaceHero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats } = usePlatformStats();

  return (
    <section className="relative pt-[72px]">
      {/* Hero Content */}
      <div className="section-container py-20 md:py-28 lg:py-32">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-sm font-medium text-primary">Now live — Join {((stats?.totalSignups || 2109) / 1000).toFixed(1)}K+ learners</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
            Learn Web3 skills.
            <br />
            <span className="text-primary">Get hired.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            The marketplace for Web3 education, talent, and digital products. 
            Build proof of work, earn credentials, and land your next role.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/courses")}
              className="w-full sm:w-auto gap-2 h-12 px-8 text-base"
            >
              Start Learning
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/talent")}
              className="w-full sm:w-auto h-12 px-8 text-base"
            >
              Hire Talent
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-t border-border bg-background-secondary">
        <div className="section-container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatItem 
              value={`${((stats?.totalSignups || 2109) / 1000).toFixed(1)}K+`}
              label="Total learners"
            />
            <StatItem 
              value={`${(stats?.activeScholars || 1193).toLocaleString()}+`}
              label="Active scholars"
            />
            <StatItem 
              value={`${(stats?.tasksCompleted || 2720).toLocaleString()}+`}
              label="Tasks completed"
            />
            <StatItem 
              value={`${stats?.countries || 37}+`}
              label="Countries"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

interface StatItemProps {
  value: string;
  label: string;
}

const StatItem = ({ value, label }: StatItemProps) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{value}</div>
    <div className="text-sm text-muted-foreground mt-1">{label}</div>
  </div>
);

export default MarketplaceHero;
