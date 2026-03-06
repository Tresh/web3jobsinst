import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Globe, FolderOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ComingSoonDialog from "./ComingSoonDialog";

const HeroSection = () => {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleScholarshipClick = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  return (
    <>
      <section className="min-h-screen flex items-center bg-background pt-[72px] relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--foreground)) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
        
        <div
          className="section-container py-20 md:py-28 lg:py-32 relative z-10"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease-out, transform 0.7s ease-out",
          }}
        >
          <div className="max-w-3xl mx-auto text-center">
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-6 tracking-tight text-balance leading-[1.15]">
              Learn Web3 Skills. Get Real Jobs.{" "}
              <span className="text-primary">Build Digital Income.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The home of Web3 jobs, skills, business models, and collaboration. 
              Your launchpad into the decentralized economy.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="default" 
                size="lg" 
                className="w-full sm:w-auto text-base px-8 h-12"
                onClick={handleScholarshipClick}
              >
                Join the Scholarship Waitlist
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto text-base px-8 h-12"
                onClick={() => setComingSoonOpen(true)}
              >
                Explore Programs
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground mb-6 tracking-wide uppercase">Trusted by learners worldwide</p>
              <div className="flex items-center justify-center gap-10 sm:gap-16">
                <div className="text-center flex flex-col items-center gap-1.5">
                  <Users className="h-5 w-5 text-primary" />
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">500+</div>
                  <div className="text-xs text-muted-foreground font-medium">Students</div>
                </div>
                <div className="text-center flex flex-col items-center gap-1.5">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">50+</div>
                  <div className="text-xs text-muted-foreground font-medium">Projects</div>
                </div>
                <div className="text-center flex flex-col items-center gap-1.5">
                  <Globe className="h-5 w-5 text-primary" />
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">20+</div>
                  <div className="text-xs text-muted-foreground font-medium">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ComingSoonDialog 
        open={comingSoonOpen} 
        onOpenChange={setComingSoonOpen}
        title="Programs Coming Soon"
        onScholarshipClick={handleScholarshipClick}
      />
    </>
  );
};

export default HeroSection;
