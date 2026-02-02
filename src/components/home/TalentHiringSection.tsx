import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  UserCheck, 
  Briefcase, 
  Trophy, 
  ArrowRight,
  Shield,
  Zap,
  CheckCircle
} from "lucide-react";

const talentProfiles = [
  {
    id: "1",
    name: "S***a K.",
    role: "Smart Contract Developer",
    xp: "2,450 XP",
    tasks: 28,
    verified: true,
    skills: ["Solidity", "Web3.js", "DeFi"],
  },
  {
    id: "2",
    name: "M***n T.",
    role: "Content Creator",
    xp: "2,120 XP",
    tasks: 34,
    verified: true,
    skills: ["YouTube", "Twitter", "Community"],
  },
  {
    id: "3",
    name: "A***r P.",
    role: "Marketing Specialist",
    xp: "1,890 XP",
    tasks: 22,
    verified: true,
    skills: ["Growth", "Analytics", "Campaigns"],
  },
];

const hiringFeatures = [
  {
    icon: Trophy,
    title: "Proof of Work",
    description: "Hire based on completed tasks, XP earned, and verified skills",
  },
  {
    icon: Shield,
    title: "Verified Talent",
    description: "All talent has demonstrated skills through our platform",
  },
  {
    icon: Zap,
    title: "Fast Matching",
    description: "Find the right talent for your project in hours, not weeks",
  },
];

const TalentHiringSection = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-foreground text-background py-16 md:py-24">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <Badge variant="secondary" className="bg-background/10 text-background border-background/20 mb-4">
              Talent Marketplace
            </Badge>
            
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
              Hire Talent Based on{" "}
              <span className="text-primary">Proof of Work</span>
            </h2>
            
            <p className="text-background/70 mb-8 max-w-md">
              Skip resumes. Hire verified talent who have demonstrated their skills 
              through completed tasks and earned XP on our platform.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {hiringFeatures.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-background text-sm">{feature.title}</h4>
                    <p className="text-xs text-background/60">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg"
                onClick={() => navigate("/talent")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Browse Talent
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate("/talent")}
                className="border-background/30 text-background hover:bg-background/10"
              >
                List as Talent
              </Button>
            </div>
          </div>

          {/* Right Side - Talent Cards */}
          <div className="space-y-3">
            {talentProfiles.map((talent) => (
              <Card key={talent.id} className="bg-background/5 border-background/10 hover:bg-background/10 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-background text-sm">{talent.name}</span>
                          {talent.verified && (
                            <CheckCircle className="w-3.5 h-3.5 text-primary" />
                          )}
                        </div>
                        <span className="text-xs text-background/60">{talent.role}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-primary">{talent.xp}</div>
                      <div className="text-[10px] text-background/60">{talent.tasks} tasks</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1.5 mt-3">
                    {talent.skills.map((skill) => (
                      <span 
                        key={skill}
                        className="text-[10px] px-2 py-0.5 bg-background/10 text-background/80 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button 
              variant="ghost" 
              className="w-full text-background/70 hover:text-background hover:bg-background/10"
              onClick={() => navigate("/talent")}
            >
              View All Talent
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TalentHiringSection;
