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
    <section className="relative min-h-[90vh] flex items-center pt-[72px] overflow-hidden">
      <div className="section-container py-12 md:py-16 lg:py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-primary/40 bg-primary/5 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary/90">Platform Live</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.1] mb-6">
            Learn. Build. Earn.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary to-orange-400 bg-clip-text text-transparent">In Public.</span>
          </h1>

          {/* Supporting Description */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            The marketplace for Web3 skills, talent, and digital products. 
            Build proof of work, get hired, and monetize your expertise.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button 
              size="lg" 
              onClick={() => navigate("/courses")}
              className="w-full sm:w-auto gap-2 h-14 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
            >
              Browse Courses
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/products")}
              className="w-full sm:w-auto h-14 px-8 text-base font-medium border-border/60 text-foreground hover:bg-card hover:border-primary/40 transition-all"
            >
              Explore Products
            </Button>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <button 
              onClick={() => navigate("/talent")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Hire Talent →
            </button>
            <span className="text-muted-foreground/30">|</span>
            <button 
              onClick={() => navigate("/talent")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Join as Talent →
            </button>
            <span className="text-muted-foreground/30">|</span>
            <button
              onClick={handleScholarshipClick}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Free Scholarship →
            </button>
          </div>
        </div>

        {/* Live Platform Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
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
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20">
    <div className="flex items-center justify-center mb-2">
      {icon}
    </div>
    <div className="text-xl md:text-2xl font-bold text-white tracking-tight">{value}</div>
    <div className="text-[11px] uppercase tracking-wider text-white/60 mt-1">{label}</div>
  </div>
);

export default MarketplaceHero;
