import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroAbstract from "@/assets/hero-abstract.png";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-orange-50/80 via-background to-orange-50/40"
        style={{ backgroundImage: 'var(--gradient-hero)' }}
      />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-50" />
      
      {/* Hero abstract image */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <img
          src={heroAbstract}
          alt=""
          className="w-full max-w-6xl opacity-20 object-contain"
        />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-primary/10 blur-xl animate-float" />
      <div className="absolute bottom-1/3 right-10 w-32 h-32 rounded-full bg-primary/5 blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      
      <div className="section-container relative z-10 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-primary bg-orange-100 rounded-full mb-8 animate-fade-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse-soft" />
            Now accepting scholarship applications
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 tracking-tight animate-fade-up text-balance" style={{ animationDelay: '0.1s' }}>
            Learn Web3 Skills.{" "}
            <span className="gradient-text">Get Real Jobs.</span>{" "}
            Build Digital Income.
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            The home of Web3 jobs, skills, business models, and collaboration. 
            Your launchpad into the decentralized economy.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <Button variant="hero" size="xl" className="w-full sm:w-auto group">
              Join the Scholarship Waitlist
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="hero-secondary" size="xl" className="w-full sm:w-auto group">
              <Play className="w-4 h-4" />
              Explore Programs
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-16 pt-8 border-t border-border/50 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-muted-foreground mb-4">Trusted by learners worldwide</p>
            <div className="flex items-center justify-center gap-8 text-muted-foreground/60">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">500+</div>
                <div className="text-xs">Students</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">50+</div>
                <div className="text-xs">Projects</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">20+</div>
                <div className="text-xs">Countries</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
