import { Button } from "@/components/ui/button";
import { Briefcase, Users, Zap, ArrowRight } from "lucide-react";

const JobsSection = () => {
  return (
    <section id="jobs" className="section-container section-padding">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <span className="inline-block px-4 py-1.5 text-sm font-medium text-primary bg-orange-100 rounded-full mb-6">
            Opportunities
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Web3 Jobs & Opportunities
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Access exclusive job listings, freelance gigs, internships, and collaboration 
            opportunities with leading Web3 startups and protocols. Our job board connects 
            skilled talent directly with projects that are building the future.
          </p>
          <Button variant="hero" size="lg" className="group">
            Access Jobs Board
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="card-elevated p-6">
            <Briefcase className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Full-Time Roles</h3>
            <p className="text-sm text-muted-foreground">
              Remote positions at top Web3 companies
            </p>
          </div>
          <div className="card-elevated p-6">
            <Zap className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Freelance Gigs</h3>
            <p className="text-sm text-muted-foreground">
              Project-based work and bounties
            </p>
          </div>
          <div className="card-elevated p-6">
            <Users className="w-8 h-8 text-primary mb-4" />
            <h3 className="font-semibold text-foreground mb-2">Internships</h3>
            <p className="text-sm text-muted-foreground">
              Learn and earn with emerging projects
            </p>
          </div>
          <div className="card-elevated p-6 border-2 border-primary/20 bg-orange-50/50">
            <div className="text-2xl font-bold text-primary mb-2">100+</div>
            <p className="text-sm text-muted-foreground">
              Active opportunities updated weekly
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobsSection;
