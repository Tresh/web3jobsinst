import { Button } from "@/components/ui/button";
import { ArrowRight, Rocket } from "lucide-react";

const CTASection = () => {
  return (
    <section className="section-container section-padding">
      <div className="relative overflow-hidden rounded-3xl bg-foreground p-8 md:p-12 lg:p-20">
        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary/10 rounded-full blur-2xl" />
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-primary bg-primary/20 rounded-full mb-6">
            <Rocket className="w-4 h-4" />
            Start Your Journey
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-background mb-6 text-balance max-w-3xl mx-auto">
            Start Your Web3 Career the Right Way
          </h2>
          
          <p className="text-lg text-background/70 max-w-2xl mx-auto mb-10">
            Join thousands of learners building real skills and earning in the decentralized economy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl" className="group w-full sm:w-auto">
              Join Scholarship Waitlist
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="xl" 
              className="w-full sm:w-auto bg-transparent border-background/20 text-background hover:bg-background/10 hover:border-background/40"
            >
              Explore Programs
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
