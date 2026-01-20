import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const ScholarshipSection = () => {
  return (
    <section id="scholarship" className="section-container section-padding">
      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-orange-50 to-background p-8 md:p-12 lg:p-16">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-primary bg-orange-100 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            Limited Spots Available
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 text-balance">
            Web3 Scholarship Program
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Join our free 30-day onboarding program designed to kickstart your Web3 career. 
            Get access to structured learning, mentorship, and your first real opportunities 
            in the decentralized ecosystem.
          </p>
          
          <Button variant="hero" size="xl" className="group">
            Register for Scholarship
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipSection;
