import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  GraduationCap, 
  Users, 
  Building2, 
  UserCheck, 
  Package, 
  BookOpen, 
  Share2, 
  Briefcase, 
  Handshake 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface Slide {
  id: string;
  headline: string;
  description: string;
  primaryCta: string;
  primaryCtaAction: () => void;
  secondaryCta?: string;
  secondaryCtaAction?: () => void;
  icon: React.ReactNode;
  badge?: string;
}

const HeroSlider = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 30 },
    [Autoplay({ delay: 8000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  const handleScholarshipClick = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  const slides: Slide[] = [
    {
      id: "scholarship",
      headline: "Scholarship Program Now Live",
      description: "Join our structured scholarship program designed to help you build real proof of work and unlock paid opportunities.",
      primaryCta: "Apply for Scholarship",
      primaryCtaAction: handleScholarshipClick,
      secondaryCta: "Learn More",
      secondaryCtaAction: () => {
        document.getElementById("scholarship-section")?.scrollIntoView({ behavior: "smooth" });
      },
      icon: <GraduationCap className="w-16 h-16 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "tutor",
      headline: "Teach Once. Earn Continuously.",
      description: "Share your skills, publish courses, and earn royalties by teaching Web3, AI, trading, and digital skills.",
      primaryCta: "Become a Tutor",
      primaryCtaAction: () => navigate("/tutors"),
      icon: <Users className="w-16 h-16 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "institutions",
      headline: "Learn From Leading Ecosystems",
      description: "Protocols, DAOs, and companies launch verified education hubs to train and hire talent directly.",
      primaryCta: "Explore Verified Institutions",
      primaryCtaAction: () => navigate("/institutions"),
      icon: <Building2 className="w-16 h-16 text-primary" strokeWidth={1.5} />,
      badge: "Early Partners",
    },
    {
      id: "talent",
      headline: "Verified Talent. Trusted Payments.",
      description: "Showcase proof of work, discover talent, and transact securely with escrow-backed payments.",
      primaryCta: "Explore Talent Marketplace",
      primaryCtaAction: () => navigate("/talent"),
      icon: <UserCheck className="w-16 h-16 text-primary" strokeWidth={1.5} />,
      badge: "Coming Soon",
    },
    {
      id: "products",
      headline: "Digital Products Marketplace",
      description: "Buy and sell ebooks, tools, bots, templates, playbooks, and AI resources—all in one place.",
      primaryCta: "Explore Digital Products",
      primaryCtaAction: () => navigate("/products"),
      icon: <Package className="w-16 h-16 text-primary" strokeWidth={1.5} />,
      badge: "Coming Soon",
    },
    {
      id: "courses",
      headline: "Learn High-Income Digital Skills",
      description: "Practical courses across Web3, AI, Forex, trading, content creation, development, and Web3 jobs.",
      primaryCta: "Browse Courses",
      primaryCtaAction: () => navigate("/courses"),
      icon: <BookOpen className="w-16 h-16 text-primary" strokeWidth={1.5} />,
      badge: "Launching Soon",
    },
    {
      id: "affiliates",
      headline: "Earn With Our Affiliate Program",
      description: "Promote courses and products and earn commissions for every successful referral.",
      primaryCta: "Join Affiliates",
      primaryCtaAction: () => navigate("/affiliates"),
      icon: <Share2 className="w-16 h-16 text-primary" strokeWidth={1.5} />,
      badge: "Coming Soon",
    },
    {
      id: "jobs",
      headline: "Jobs Marketplace",
      description: "Access curated Web3, tech, and digital job opportunities from verified companies and institutions.",
      primaryCta: "View Jobs Marketplace",
      primaryCtaAction: () => {
        document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" });
      },
      icon: <Briefcase className="w-16 h-16 text-primary" strokeWidth={1.5} />,
      badge: "Coming Soon",
    },
    {
      id: "collab",
      headline: "Find Partners. Build Together.",
      description: "Collaborate with creators, builders, and operators to launch projects, startups, and campaigns.",
      primaryCta: "Explore Collab Market",
      primaryCtaAction: () => {
        document.getElementById("collab-section")?.scrollIntoView({ behavior: "smooth" });
      },
      icon: <Handshake className="w-16 h-16 text-primary" strokeWidth={1.5} />,
      badge: "Coming Soon",
    },
  ];

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="min-h-screen flex items-center bg-background pt-[72px] relative overflow-hidden">
      {/* Abstract background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/50 rounded-full blur-3xl" />
      </div>

      <div className="section-container py-12 md:py-20 lg:py-24 relative z-10">
        {/* Carousel */}
        <div className="relative max-w-4xl mx-auto">
          {/* Navigation Arrows */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-10 h-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-10 h-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>

          {/* Slides */}
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {slides.map((slide) => (
                <div
                  key={slide.id}
                  className="flex-[0_0_100%] min-w-0 px-4"
                >
                  <div className="text-center py-8 md:py-12">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 rounded-2xl bg-primary/10 flex items-center justify-center">
                        {slide.icon}
                      </div>
                    </div>

                    {/* Badge */}
                    {slide.badge && (
                      <Badge 
                        variant="secondary" 
                        className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                      >
                        {slide.badge}
                      </Badge>
                    )}

                    {/* Headline */}
                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4 tracking-tight">
                      {slide.headline}
                    </h1>

                    {/* Description */}
                    <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
                      {slide.description}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                      <Button 
                        size="lg" 
                        onClick={slide.primaryCtaAction}
                        className="w-full sm:w-auto"
                      >
                        {slide.primaryCta}
                      </Button>
                      {slide.secondaryCta && (
                        <Button 
                          variant="outline" 
                          size="lg"
                          onClick={slide.secondaryCtaAction}
                          className="w-full sm:w-auto"
                        >
                          {slide.secondaryCta}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === selectedIndex 
                    ? "bg-primary w-6" 
                    : "bg-border hover:bg-muted-foreground/50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 pt-8 border-t border-secondary max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground mb-6 text-center">Trusted by learners worldwide</p>
          <div className="flex items-center justify-center gap-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">500+</div>
              <div className="text-xs text-muted-foreground">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">50+</div>
              <div className="text-xs text-muted-foreground">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">20+</div>
              <div className="text-xs text-muted-foreground">Countries</div>
            </div>
          </div>
        </div>

        {/* Global CTA */}
        {!user && (
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button 
              size="lg" 
              variant="default"
              onClick={() => navigate("/signup")}
            >
              Create a Free Account
            </Button>
            <Button 
              size="lg" 
              variant="ghost"
              onClick={() => navigate("/login")}
            >
              Log In
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSlider;
