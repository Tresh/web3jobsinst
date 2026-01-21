import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Package, Users, ArrowRight, Wallet } from "lucide-react";
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
      {/* Complete Profile Notice - Shown at top for wallet users */}
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
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrolled Courses
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Start learning today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Listed Products
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              Sell your digital products
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Talent Profile
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Not Set</div>
            <p className="text-xs text-muted-foreground mt-1">
              Get discovered by clients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Browse Courses
            </CardTitle>
            <CardDescription>
              Learn Web3 development, trading, marketing, and more
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/courses">
                Explore Courses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              List a Product
            </CardTitle>
            <CardDescription>
              Sell templates, ebooks, or other digital products
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleComingSoon("List a Product - Coming Soon")}
            >
              List Product
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Talent Profile
            </CardTitle>
            <CardDescription>
              Create your profile and get hired for Web3 jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full"
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
