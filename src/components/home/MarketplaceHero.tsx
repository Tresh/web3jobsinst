import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, TrendingUp, Users, Zap, Globe } from "lucide-react";
import { useEffect, useState } from "react";

const MarketplaceHero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Animated stats with incrementing effect
  const [stats, setStats] = useState({
    scholars: 0,
    tasksCompleted: 0,
    xpEarned: 0,
    countries: 0,
  });

  useEffect(() => {
    const targetStats = {
      scholars: 523,
      tasksCompleted: 2847,
      xpEarned: 156420,
      countries: 24,
    };

    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setStats({
        scholars: Math.floor(targetStats.scholars * easeOut),
        tasksCompleted: Math.floor(targetStats.tasksCompleted * easeOut),
        xpEarned: Math.floor(targetStats.xpEarned * easeOut),
        countries: Math.floor(targetStats.countries * easeOut),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setStats(targetStats);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  const handleScholarshipClick = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  return (
    <section className="relative min-h-[90vh] flex items-center bg-foreground pt-[72px] overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="section-container py-12 md:py-16 lg:py-20 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Live Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-medium text-primary">Platform Live • Real Activity Happening Now</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-background tracking-tight leading-tight mb-4">
            Learn. Build. Earn.{" "}
            <span className="text-primary">In Public.</span>
          </h1>

          {/* Supporting Description */}
          <p className="text-lg md:text-xl text-background/70 max-w-2xl mx-auto mb-8">
            The marketplace for Web3 skills, talent, and digital products. 
            Build proof of work, get hired, and monetize your expertise.
          </p>

          {/* Primary CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Button 
              size="lg" 
              onClick={() => navigate("/courses")}
              className="w-full sm:w-auto gap-2"
            >
              Browse Courses
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate("/products")}
              className="w-full sm:w-auto"
            >
              Explore Products
            </Button>
          </div>

          {/* Secondary CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <button 
              onClick={() => navigate("/talent")}
              className="text-background/70 hover:text-primary transition-colors"
            >
              Hire Talent →
            </button>
            <span className="text-background/30">|</span>
            <button 
              onClick={() => navigate("/talent")}
              className="text-background/70 hover:text-primary transition-colors"
            >
              Join as Talent →
            </button>
            <span className="text-background/30">|</span>
            <button
              onClick={handleScholarshipClick}
              className="text-background/70 hover:text-primary transition-colors"
            >
              Free Scholarship →
            </button>
          </div>
        </div>

        {/* Live Platform Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <StatCard 
            icon={<Users className="w-5 h-5 text-primary" />}
            value={stats.scholars.toLocaleString()}
            label="Active Scholars"
          />
          <StatCard 
            icon={<Zap className="w-5 h-5 text-primary" />}
            value={stats.tasksCompleted.toLocaleString()}
            label="Tasks Completed"
          />
          <StatCard 
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            value={stats.xpEarned.toLocaleString()}
            label="XP Earned"
          />
          <StatCard 
            icon={<Globe className="w-5 h-5 text-primary" />}
            value={`${stats.countries}+`}
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
  <div className="bg-background/10 border border-background/20 rounded-xl p-4 text-center">
    <div className="flex items-center justify-center mb-2">
      {icon}
    </div>
    <div className="text-xl md:text-2xl font-bold text-background">{value}</div>
    <div className="text-xs text-background/60">{label}</div>
  </div>
);

export default MarketplaceHero;
