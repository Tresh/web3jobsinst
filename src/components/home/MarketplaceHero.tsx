import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, TrendingUp, Users, Zap, Globe } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const MarketplaceHero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats } = usePlatformStats();

  const handleScholarshipClick = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  return (
    <section className="relative min-h-[70vh] flex items-center pt-[72px] overflow-hidden">
      <div className="section-container py-10 md:py-14 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/5 backdrop-blur-sm mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-primary/90">Platform Live</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-4">
            Learn. Build. Earn.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-orange-400 bg-clip-text text-transparent">In Public.</span>
          </h1>

          {/* Supporting Description */}
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-6">
            The marketplace for Web3 skills, talent, and digital products. 
            Build proof of work, get hired, and monetize your expertise.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
            <Button 
              size="default" 
              onClick={() => navigate("/courses")}
              className="w-full sm:w-auto gap-2 h-11 px-6 text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Browse Courses
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
            <Button 
              size="default" 
              variant="outline"
              onClick={() => navigate("/products")}
              className="w-full sm:w-auto h-11 px-6 text-sm font-medium border-border text-foreground hover:bg-secondary transition-all"
            >
              Explore Products
            </Button>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
          </div>
        </div>

        {/* Live Platform Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
          <StatCard 
            icon={<Users className="w-5 h-5 text-primary" />}
            value={`${((stats?.totalSignups || 2109) / 1000).toFixed(1)}K+`}
            label="Total Signups"
          />
          <StatCard 
            icon={<Zap className="w-5 h-5 text-primary" />}
            value={`${((stats?.activeScholars || 1193)).toLocaleString()}+`}
            label="Active Scholars"
          />
          <StatCard 
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            value={`${((stats?.tasksCompleted || 2720)).toLocaleString()}+`}
            label="Tasks Completed"
          />
          <StatCard 
            icon={<Globe className="w-5 h-5 text-primary" />}
            value={`${stats?.countries || 37}+`}
            label="Countries"
          />
        </div>
      </div>
    </section>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

const StatCard = ({ icon, value, label }: StatCardProps) => (
  <div className="bg-card border border-border rounded-xl p-4 text-center transition-all hover:shadow-card-hover">
    <div className="flex items-center justify-center mb-1.5">
      {icon}
    </div>
    <div className="text-lg md:text-xl font-bold text-foreground tracking-tight">{value}</div>
    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
  </div>
);

export default MarketplaceHero;
