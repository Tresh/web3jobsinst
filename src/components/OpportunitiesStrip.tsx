import { useState } from "react";
import { Rocket, Users, Briefcase, Handshake, Trophy, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ComingSoonDialog from "@/components/ComingSoonDialog";

const opportunities = [
  {
    title: "Bootcamps",
    description: "Intensive cohort-based learning programs",
    icon: Rocket,
    comingSoon: true,
  },
  {
    title: "Affiliates",
    description: "Earn by referring learners and institutions",
    icon: Users,
    comingSoon: true,
  },
  {
    title: "Jobs Marketplace",
    description: "Connect with Web3 employers globally",
    icon: Briefcase,
    comingSoon: true,
  },
  {
    title: "Collab Marketplace",
    description: "Find partners and collaborators",
    icon: Handshake,
    comingSoon: true,
  },
  {
    title: "Bounties",
    description: "Complete tasks and earn rewards",
    icon: Trophy,
    comingSoon: true,
  },
  {
    title: "Campaigns",
    description: "Participate in ecosystem campaigns",
    icon: Megaphone,
    comingSoon: true,
  },
];

const OpportunitiesStrip = () => {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState("");

  const handleCardClick = (title: string) => {
    setSelectedTitle(title);
    setComingSoonOpen(true);
  };

  return (
    <section className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Opportunities on Web3 Jobs Institute
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore more ways to learn, earn, and grow in the Web3 ecosystem
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {opportunities.map((opportunity) => (
            <Card
              key={opportunity.title}
              className="cursor-pointer hover:shadow-md transition-shadow border-border bg-background"
              onClick={() => handleCardClick(opportunity.title)}
            >
              <CardContent className="p-4 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                  <opportunity.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">
                  {opportunity.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {opportunity.description}
                </p>
                {opportunity.comingSoon && (
                  <span className="inline-block mt-2 text-xs text-primary font-medium">
                    Coming Soon
                  </span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={selectedTitle}
      />
    </section>
  );
};

export default OpportunitiesStrip;
