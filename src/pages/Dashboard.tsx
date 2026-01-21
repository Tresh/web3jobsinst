import { useState, useEffect } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Wallet,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import logo from "@/assets/logo.png";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

const navItems = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Scholarship", href: "/dashboard/scholarship", icon: GraduationCap },
  { label: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { label: "My Products", href: "/dashboard/products", icon: Package },
  { label: "Talent Profile", href: "/dashboard/talent", icon: Users },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

const Dashboard = () => {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding if profile exists but onboarding not completed
    if (profile && !profile.onboarding_completed) {
      setShowOnboarding(true);
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  // Show onboarding flow if not completed
  if (showOnboarding) {
    return <OnboardingFlow onComplete={() => setShowOnboarding(false)} />;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  // Get user initial for avatar
  const getInitial = () => {
    if (profile?.full_name) return profile.full_name.charAt(0).toUpperCase();
    if (user.email && !user.email.includes("@wallet.local")) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const isWalletUser = user.email?.includes("@wallet.local");

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-16 px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Web3 Jobs Institute" className="w-8 h-8" />
          <span className="font-bold text-foreground">W3JI</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg hover:bg-secondary"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-background border-r border-border transform transition-transform duration-200 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-border px-4 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Web3 Jobs Institute" className="w-8 h-8" />
            <span className="font-bold text-foreground">Web3 Jobs Institute</span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                {getInitial()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {profile?.full_name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isWalletUser ? (
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    Wallet Connected
                  </span>
                ) : (
                  user.email
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {isActive(item.href) && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;