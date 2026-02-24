import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { BookOpen, Package, Users, ArrowRight, Wallet, GraduationCap, Rocket, Briefcase, Target, Zap, DollarSign } from "lucide-react";
import ComingSoonDialog from "@/components/ComingSoonDialog";

const DashboardOverview = () => {
  const { profile, user } = useAuth();
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("");

  const isWalletUser = user?.email?.includes("@wallet.local");

  const handleComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setComingSoonOpen(true);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Complete Profile Notice */}
      {isWalletUser && (
        <Card className="mb-6 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="w-5 h-5 text-primary" />
              Complete Your Profile
            </CardTitle>
            <CardDescription>
              You signed in with a wallet. Add your email to receive notifications and enable password login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link to="/dashboard/settings">
                Go to Settings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's what's happening with your account
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">Listed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Talent
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">Profile</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Earnings
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.00</div>
            <p className="text-xs text-muted-foreground mt-1">Total earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Earnings</h2>
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground mt-1">Available Balance</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground mt-1">Pending</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/50">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <p className="text-2xl font-bold">$0.00</p>
                <p className="text-xs text-muted-foreground mt-1">Total Withdrawn</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => handleComingSoon("Withdraw Earnings — Coming Soon")}>
                Withdraw Earnings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5 text-primary" />
              Browse Courses
            </CardTitle>
            <CardDescription className="text-sm">
              Learn Web3, trading, marketing & more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/courses">
                Explore Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <GraduationCap className="w-5 h-5 text-primary" />
              Scholarship Portal
            </CardTitle>
            <CardDescription className="text-sm">
              Tasks, modules, XP & leaderboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/dashboard/scholarship">
                Open Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="w-5 h-5 text-primary" />
              Join Bootcamps
            </CardTitle>
            <CardDescription className="text-sm">
              Intensive, community-driven programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/bootcamps">
                Browse Bootcamps
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-5 h-5 text-primary" />
              LearnFi Programs
            </CardTitle>
            <CardDescription className="text-sm">
              Learn, complete missions & earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/learnfi">
                Explore Programs
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="w-5 h-5 text-primary" />
              Internship Market
            </CardTitle>
            <CardDescription className="text-sm">
              Discover internship opportunities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full" size="sm">
              <Link to="/internships">
                View Internships
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-5 h-5 text-primary" />
              List a Product
            </CardTitle>
            <CardDescription className="text-sm">
              Sell templates, ebooks & digital goods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              size="sm"
              onClick={() => handleComingSoon("List a Product - Coming Soon")}
            >
              List Product
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-5 h-5 text-primary" />
              Talent Profile
            </CardTitle>
            <CardDescription className="text-sm">
              Create your profile & get hired
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              size="sm"
              onClick={() => handleComingSoon("Create Talent Profile - Coming Soon")}
            >
              Create Profile
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={comingSoonTitle}
      />
    </div>
  );
};

export default DashboardOverview;
