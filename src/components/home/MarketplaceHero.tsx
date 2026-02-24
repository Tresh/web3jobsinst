import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const MarketplaceHero = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats } = usePlatformStats();

  return (
    <section className="relative flex items-center pt-[72px] overflow-hidden">
      <div className="section-container py-16 md:py-24 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card mb-8">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-60"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Platform Live</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-foreground tracking-tight leading-[1.08] mb-5">
            Learn. Build. Earn.
            <br />
            <span className="text-primary italic font-extrabold">In Public.</span>
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
            The marketplace for Web3 skills, talent, and digital products. 
            Build proof of work, get hired, and monetize your expertise.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
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
        </div>

        {/* Stats Strip — flat, bold, separated by dividers */}
        <div className="mt-16 flex items-center justify-center divide-x divide-border max-w-3xl mx-auto px-4">
          <StatItem 
            value={`${((stats?.totalSignups || 2109) / 1000).toFixed(1)}K+`}
            label="Total Signups"
          />
          <StatItem 
            value={`${(stats?.activeScholars || 1193).toLocaleString()}+`}
            label="Active Scholars"
          />
          <StatItem 
            value={`${(stats?.tasksCompleted || 2720).toLocaleString()}+`}
            label="Tasks Completed"
          />
          <StatItem 
            value={`${stats?.countries || 37}+`}
            label="Countries"
          />
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
  <div className="flex-1 text-center px-6 py-2">
    <div className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight">{value}</div>
    <div className="text-xs text-muted-foreground mt-1 tracking-wide">{label}</div>
  </div>
);

export default MarketplaceHero;
