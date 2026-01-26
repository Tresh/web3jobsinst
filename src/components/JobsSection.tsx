import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Zap, ArrowRight } from "lucide-react";
import ComingSoonDialog from "./ComingSoonDialog";
import { useAuth } from "@/contexts/AuthContext";

const JobsSection = () => {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleScholarshipClick = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  return (
    <>
      <section id="jobs" className="section-container section-padding">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <span className="badge-minimal mb-6 inline-block">Opportunities</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-balance">
              Web3 Jobs & Opportunities
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Access exclusive job listings, freelance gigs, internships, and collaboration 
              opportunities with leading Web3 startups and protocols. Our job board connects 
              skilled talent directly with projects that are building the future.
            </p>
            <Button 
              variant="default" 
              size="lg"
              onClick={() => setComingSoonOpen(true)}
            >
              Access Jobs Board
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-minimal card-minimal-accent p-6">
              <Briefcase className="w-6 h-6 text-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Full-Time Roles</h3>
              <p className="text-sm text-muted-foreground">
                Remote positions at top Web3 companies
              </p>
            </div>
            <div className="card-minimal card-minimal-accent p-6">
              <Zap className="w-6 h-6 text-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Freelance Gigs</h3>
              <p className="text-sm text-muted-foreground">
                Project-based work and bounties
              </p>
            </div>
            <div className="card-minimal card-minimal-accent p-6">
              <Users className="w-6 h-6 text-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">Internships</h3>
              <p className="text-sm text-muted-foreground">
                Learn and earn with emerging projects
              </p>
            </div>
            <div className="card-minimal p-6 border-l-2 border-l-primary">
              <div className="text-2xl font-bold text-primary mb-2">100+</div>
              <p className="text-sm text-muted-foreground">
                Active opportunities updated weekly
              </p>
            </div>
          </div>
        </div>
      </section>

      <ComingSoonDialog 
        open={comingSoonOpen} 
        onOpenChange={setComingSoonOpen}
        title="Jobs Board Coming Soon"
        onScholarshipClick={handleScholarshipClick}
      />
    </>
  );
};

export default JobsSection;
