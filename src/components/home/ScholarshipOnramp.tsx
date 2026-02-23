import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  ArrowRight,
  CheckCircle,
  Zap,
  Trophy,
  BookOpen,
  Users
} from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";

const steps = [
  {
    step: 1,
    title: "Apply for Free",
    description: "Submit your application with goals and commitment level",
    icon: GraduationCap,
  },
  {
    step: 2,
    title: "Complete Tasks",
    description: "Learn by doing — complete daily tasks and challenges",
    icon: CheckCircle,
  },
  {
    step: 3,
    title: "Earn XP",
    description: "Every task completion earns you XP and builds reputation",
    icon: Zap,
  },
  {
    step: 4,
    title: "Unlock Opportunities",
    description: "Top performers get access to paid tracks and job opportunities",
    icon: Trophy,
  },
];

const ScholarshipOnramp = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats } = usePlatformStats();

  const handleScholarshipClick = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4 bg-white/10 text-foreground border-0">
              Free Entry Point
            </Badge>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Start Free. Build Skills.{" "}
              <span className="text-primary">Get Paid.</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The Web3 Jobs Institute Scholarship is your zero-cost entry into the ecosystem. 
              Learn, complete tasks, and prove your skills to unlock real opportunities.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {steps.map((step, index) => (
              <Card key={step.step} className="relative bg-white/5 border-white/10">
                <CardContent className="p-5">
                  {/* Step Number */}
                  <div className="absolute -top-3 -left-3 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-3">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-semibold text-foreground text-sm mb-1">
                    {step.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-2 w-4 border-t-2 border-dashed border-white/20" />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats & CTA */}
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Stats */}
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold text-foreground">{(stats?.activeScholars || 1193).toLocaleString()}+</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Active Scholars</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold text-foreground">30</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Day Program</span>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span className="text-2xl font-bold text-foreground">$0</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Entry Cost</span>
                  </div>
                </div>

                {/* CTA */}
                <Button size="lg" onClick={handleScholarshipClick}>
                  Apply for Scholarship
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipOnramp;
