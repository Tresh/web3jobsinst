import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowRight, 
  Globe, 
  TrendingUp, 
  Award, 
  Users, 
  Briefcase, 
  Star, 
  Mic, 
  BookOpen,
  DollarSign,
  BarChart,
  Zap,
  Search,
  CreditCard,
  CheckCircle
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import OpportunitiesStrip from "@/components/OpportunitiesStrip";
import TutorApplicationForm from "@/components/tutors/TutorApplicationForm";

const royaltyFeatures = [
  { icon: Zap, title: "Publish once, earn repeatedly", description: "Your courses generate income every time they're accessed" },
  { icon: DollarSign, title: "Set your pricing", description: "Full control over how your courses are priced" },
  { icon: BarChart, title: "Track enrollments", description: "Real-time dashboard for student analytics" },
  { icon: TrendingUp, title: "Track revenue", description: "Monitor your earnings and growth over time" },
  { icon: Globe, title: "Global distribution", description: "Reach learners from every corner of the world" },
  { icon: Search, title: "Built-in discovery", description: "Get found by students searching for your expertise" },
  { icon: CreditCard, title: "Automated payouts", description: "Regular, hassle-free payment processing" },
];

const targetAudience = [
  "Web3 professionals",
  "Developers",
  "Designers",
  "Marketers",
  "Traders",
  "Analysts",
  "DAO operators",
  "Community managers",
  "Growth strategists",
  "Researchers",
  "Founders",
  "Freelancers",
];

const howItWorks = [
  { step: 1, title: "Apply", description: "Submit your application with your expertise and course proposal" },
  { step: 2, title: "Review", description: "Our team reviews your application within 7 business days" },
  { step: 3, title: "Upload", description: "Create and upload your course content to our platform" },
  { step: 4, title: "Earn", description: "Start earning royalties as students enroll in your courses" },
];

const benefits = [
  { icon: Globe, title: "Global reach", description: "Access learners worldwide through our platform" },
  { icon: TrendingUp, title: "Automated sales", description: "We handle marketing and distribution" },
  { icon: Award, title: "Certification system", description: "Issue verifiable certificates to students" },
  { icon: Users, title: "Community access", description: "Join our network of expert educators" },
  { icon: Briefcase, title: "Job referrals", description: "Get referred for consulting opportunities" },
  { icon: Star, title: "Featured placement", description: "Top tutors get premium visibility" },
  { icon: Mic, title: "Speaking opportunities", description: "Speak at our events and webinars" },
  { icon: BookOpen, title: "Authority building", description: "Establish yourself as an industry expert" },
];

const Tutors = () => {
  const formRef = useRef<HTMLDivElement>(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToHowItWorks = () => {
    document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Teach Once. Earn Continuously.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Web3 Jobs Institute as a tutor and turn your expertise into a long-term digital asset. 
            Publish courses, reach a global audience, and earn recurring royalties.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={scrollToForm}>
              Apply as a Tutor
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={scrollToHowItWorks}>
              See How It Works
            </Button>
          </div>
        </div>
      </section>

      {/* How Royalties Work */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Royalty-Based Income, Not One-Time Payments
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Earn recurring income whenever your courses are accessed, enrolled in, or bundled. 
              Build passive income while helping others learn.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {royaltyFeatures.map((feature) => (
              <Card key={feature.title} className="border-border bg-background">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who This Is For */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Who This Is For
            </h2>
            <p className="text-muted-foreground">
              We're looking for experienced professionals ready to share their knowledge
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {targetAudience.map((audience) => (
              <span
                key={audience}
                className="px-4 py-2 bg-secondary text-foreground rounded-full text-sm font-medium"
              >
                {audience}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-[2px] bg-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tutor Benefits */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Tutor Benefits
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              More than just royalties — join a platform designed to elevate your career
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="border-border">
                <CardContent className="p-5">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section ref={formRef} className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Apply as a Tutor
            </h2>
            <p className="text-muted-foreground">
              Complete the form below to start your journey as a Web3 Jobs Institute tutor
            </p>
          </div>
          <TutorApplicationForm />
        </div>
      </section>

      <OpportunitiesStrip />
      <Footer />
    </div>
  );
};

export default Tutors;
