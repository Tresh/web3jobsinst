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
  sectionLabel: string;
  headline: string;
  description: string;
  whyItMatters: string;
  primaryCta: string;
  primaryCtaAction: () => void;
  secondaryCta?: string;
  secondaryCtaAction?: () => void;
  icon: React.ReactNode;
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
      sectionLabel: "NOW LIVE",
      headline: "Scholarship Program Now Live",
      description: "Join our structured scholarship program designed to help you build real proof of work and unlock paid opportunities.",
      whyItMatters: "Get mentorship, complete tasks, and earn your way into the Web3 workforce.",
      primaryCta: "Apply for Scholarship",
      primaryCtaAction: handleScholarshipClick,
      secondaryCta: "Learn More",
      secondaryCtaAction: () => {
        document.getElementById("scholarship-section")?.scrollIntoView({ behavior: "smooth" });
      },
      icon: <GraduationCap className="w-10 h-10 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "tutor",
      sectionLabel: "OPEN",
      headline: "Teach Once. Earn Continuously.",
      description: "Share your skills, publish courses, and earn royalties by teaching Web3, AI, trading, and digital skills.",
      whyItMatters: "Turn your expertise into passive income while helping others grow.",
      primaryCta: "Become a Tutor",
      primaryCtaAction: () => navigate("/tutors"),
      icon: <Users className="w-10 h-10 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "institutions",
      sectionLabel: "EARLY PARTNERS",
      headline: "Learn From Leading Ecosystems",
      description: "Protocols, DAOs, and companies launch verified education hubs to train and hire talent directly.",
      whyItMatters: "Access exclusive training programs from top Web3 organizations.",
      primaryCta: "Explore Verified Institutions",
      primaryCtaAction: () => navigate("/institutions"),
      icon: <Building2 className="w-10 h-10 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "talent",
      sectionLabel: "COMING SOON",
      headline: "Verified Talent. Trusted Payments.",
      description: "Showcase proof of work, discover talent, and transact securely with escrow-backed payments.",
      whyItMatters: "Get hired or hire others with confidence and built-in payment protection.",
      primaryCta: "Explore Talent Marketplace",
      primaryCtaAction: () => navigate("/talent"),
      icon: <UserCheck className="w-10 h-10 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "products",
      sectionLabel: "COMING SOON",
      headline: "Digital Products Marketplace",
      description: "Buy and sell ebooks, tools, bots, templates, playbooks, and AI resources—all in one place.",
      whyItMatters: "Monetize your digital assets or find tools to accelerate your growth.",
      primaryCta: "Explore Digital Products",
      primaryCtaAction: () => navigate("/products"),
      icon: <Package className="w-10 h-10 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "courses",
      sectionLabel: "LAUNCHING SOON",
      headline: "Learn High-Income Digital Skills",
      description: "Practical courses across Web3, AI, Forex, trading, content creation, development, and Web3 jobs.",
      whyItMatters: "Build job-ready skills with real-world projects, not theory.",
      primaryCta: "Browse Courses",
      primaryCtaAction: () => navigate("/courses"),
      icon: <BookOpen className="w-10 h-10 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "affiliates",
      sectionLabel: "COMING SOON",
      headline: "Earn With Our Affiliate Program",
      description: "Promote courses and products and earn commissions for every successful referral.",
      whyItMatters: "Create an additional income stream by sharing what you love.",
      primaryCta: "Join Affiliates",
      primaryCtaAction: () => navigate("/affiliates"),
      icon: <Share2 className="w-10 h-10 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "jobs",
      sectionLabel: "COMING SOON",
      headline: "Jobs Marketplace",
      description: "Access curated Web3, tech, and digital job opportunities from verified companies and institutions.",
      whyItMatters: "Find your next role in the most exciting industry in tech.",
      primaryCta: "View Jobs Marketplace",
      primaryCtaAction: () => {
        document.getElementById("jobs-section")?.scrollIntoView({ behavior: "smooth" });
      },
      icon: <Briefcase className="w-10 h-10 text-primary" strokeWidth={1.5} />,
    },
    {
      id: "collab",
      sectionLabel: "COMING SOON",
      headline: "Find Partners. Build Together.",
      description: "Collaborate with creators, builders, and operators to launch projects, startups, and campaigns.",
      whyItMatters: "Connect with like-minded builders and bring your ideas to life.",
      primaryCta: "Explore Collab Market",
      primaryCtaAction: () => {
        document.getElementById("collab-section")?.scrollIntoView({ behavior: "smooth" });
      },
      icon: <Handshake className="w-10 h-10 text-primary" strokeWidth={1.5} />,
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
    <section className="min-h-[calc(100vh-72px)] flex items-center bg-background pt-[72px] relative overflow-hidden">
      {/* Abstract background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/50 rounded-full blur-3xl" />
      </div>

      <div className="section-container py-8 md:py-12 lg:py-16 relative z-10">
        {/* Desktop: Grid layout with text left, carousel right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center">
          {/* Hero Text - Left on desktop, top on mobile */}
          <div className="text-center lg:text-left order-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl xl:text-5xl font-bold text-foreground tracking-tight leading-tight mb-2">
              Learn Web3, AI & High-Income Digital Skills.
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-semibold text-primary tracking-tight mb-4 lg:mb-6">
              Get Hired. Build Digital Income.
            </p>
            
            {/* Global CTA for unauthenticated users - desktop */}
            {!user && (
              <div className="hidden lg:block">
                <Button 
                  size="default" 
                  variant="default"
                  onClick={() => navigate("/signup")}
                  className="bg-primary hover:bg-primary/90"
                >
                  Get Started Free
                </Button>
              </div>
            )}
          </div>

          {/* Carousel - Right on desktop, bottom on mobile */}
          <div className="relative order-2 mt-4 lg:mt-0">
            {/* Navigation Arrows */}
            <button
              onClick={scrollPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 lg:-translate-x-4 z-20 w-10 h-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 lg:translate-x-4 z-20 w-10 h-10 rounded-full bg-background border border-border shadow-sm flex items-center justify-center hover:bg-secondary transition-colors"
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
                    <div className="text-center py-4 md:py-6">
                      {/* Section Label */}
                      <span className="inline-block text-[10px] font-semibold tracking-widest text-primary uppercase mb-3">
                        {slide.sectionLabel}
                      </span>

                      {/* Icon Container */}
                      <div className="flex justify-center mb-3">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-primary/10 border border-primary/10 shadow-sm flex items-center justify-center">
                          {slide.icon}
                        </div>
                      </div>

                      {/* Slide Headline */}
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 tracking-tight">
                        {slide.headline}
                      </h2>

                      {/* Description */}
                      <p className="text-xs md:text-sm text-muted-foreground max-w-md mx-auto mb-1">
                        {slide.description}
                      </p>

                      {/* Why It Matters */}
                      <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto mb-4">
                        {slide.whyItMatters}
                      </p>

                      {/* CTAs */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
                        <Button 
                          size="default" 
                          onClick={slide.primaryCtaAction}
                          className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground text-sm"
                        >
                          {slide.primaryCta}
                        </Button>
                        {slide.secondaryCta && (
                          <button 
                            onClick={slide.secondaryCtaAction}
                            className="inline-flex items-center gap-1 text-xs font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {slide.secondaryCta}
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Trust Line */}
                      <p className="text-xs text-muted-foreground">
                        500+ learners across 20+ countries
                      </p>
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
        </div>

        {/* Global CTA for unauthenticated users - mobile only */}
        {!user && (
          <div className="mt-6 flex lg:hidden justify-center">
            <Button 
              size="default" 
              variant="default"
              onClick={() => navigate("/signup")}
              className="bg-primary hover:bg-primary/90"
            >
              Get Started Free
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSlider;
