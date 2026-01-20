import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const ScholarshipSection = () => {
  return (
    <section id="scholarship" className="section-container section-padding">
      <div className="rounded-xl border border-secondary bg-background p-8 md:p-12 lg:p-16 border-l-2 border-l-primary">
        <div className="max-w-2xl mx-auto text-center">
          <span className="badge-accent mb-6 inline-block">Limited Spots</span>
          
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-balance">
            Web3 Scholarship Program
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Join our free 30-day onboarding program designed to kickstart your Web3 career. 
            Get access to structured learning, mentorship, and your first real opportunities 
            in the decentralized ecosystem.
          </p>
          
          <Button variant="default" size="lg">
            Register for Scholarship
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipSection;
