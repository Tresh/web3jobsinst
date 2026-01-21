import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ArrowRight } from "lucide-react";
import ComingSoonDialog from "@/components/ComingSoonDialog";

const DashboardTalent = () => {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);

  const handleComingSoon = () => {
    setComingSoonOpen(true);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">Talent Profile</h1>
        <p className="text-muted-foreground mt-1">
          Create your talent profile and get discovered by clients
        </p>
      </div>

      {/* Empty State */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Users className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg mb-2">Create Your Talent Profile</CardTitle>
          <CardDescription className="text-center max-w-md mb-6">
            Showcase your skills, experience, and portfolio to get hired for Web3 jobs. 
            Your profile will be visible in the Talent Marketplace.
          </CardDescription>
          <Button onClick={handleComingSoon}>
            Create Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Skills & Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Add your Web3 skills like Solidity, Rust, DeFi, NFTs, and more
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Showcase your best projects and contributions to Web3
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Set your hourly rate and availability for new projects
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title="Create Talent Profile - Coming Soon"
      />
    </div>
  );
};

export default DashboardTalent;
