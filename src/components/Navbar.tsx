import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, ChevronDown } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import faviconLogo from "/favicon.png";
import ComingSoonDialog from "./ComingSoonDialog";
import UserMenu from "./auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

interface NavLink {
  label: string;
  href?: string;
  comingSoon?: string;
  badge?: string;
}

const mainLinks: NavLink[] = [
  { label: "Courses", href: "/courses" },
  { label: "Bootcamps", href: "/bootcamps" },
  { label: "Digital Products", href: "/products" },
];

const marketLinks: NavLink[] = [
  { label: "Talent Market", href: "/talent", badge: "Beta" },
  { label: "Internships", href: "/internships", badge: "Beta" },
];

const opportunityLinks: NavLink[] = [
  { label: "LearnFi", href: "/learnfi", badge: "Beta" },
  { label: "Become a Tutor", href: "/tutors" },
  { label: "Verified Institutions", href: "/institutions", badge: "Beta" },
  { label: "Affiliates", comingSoon: "Affiliates Coming Soon" },
  { label: "Jobs", comingSoon: "Jobs Board Coming Soon" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setComingSoonOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleScholarshipRoute = () => {
    setComingSoonOpen(false);
    setIsMobileMenuOpen(false);
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30 pwa-safe-header" style={{ height: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
        <nav className="section-container h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={faviconLogo} alt="Web3 Jobs Institute" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-foreground hidden sm:block">
                Web3 Jobs Institute
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {mainLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href!}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}

              {/* Market Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 outline-none">
                  Market
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="bg-background border border-border">
                  {marketLinks.map((link) => (
                    <DropdownMenuItem key={link.label} asChild>
                      <Link to={link.href!} className="cursor-pointer flex items-center justify-between">
                        {link.label}
                        {link.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded ml-2 font-semibold">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Opportunities Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 outline-none">
                  Opportunities
                  <ChevronDown className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="bg-background border border-border">
                  {opportunityLinks.map((link) => (
                    link.href ? (
                      <DropdownMenuItem key={link.label} asChild>
                        <Link to={link.href} className="cursor-pointer flex items-center justify-between">
                          {link.label}
                          {link.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded ml-2 font-semibold">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        key={link.label}
                        onClick={() => handleComingSoon(link.comingSoon!)}
                        className="cursor-pointer flex items-center justify-between"
                      >
                        {link.label}
                        <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded ml-2">
                          Soon
                        </span>
                      </DropdownMenuItem>
                    )
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Auth & Mobile Menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block">
                <UserMenu />
              </div>
              
              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className="lg:hidden p-2 text-foreground"
                    aria-label="Toggle menu"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background p-0">
                  <SheetHeader className="p-4 border-b border-border">
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="h-[calc(100vh-60px)] overflow-y-auto overscroll-contain">
                    <div className="flex flex-col gap-1 p-4">
                      {user && (
                        <Link
                          to="/dashboard"
                          className="py-3 px-3 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors duration-150 mb-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                      )}

                      {mainLinks.map((link) => (
                        <Link
                          key={link.label}
                          to={link.href!}
                          className="py-3 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors duration-150"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                      
                      <div className="py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                        Market
                      </div>
                      {marketLinks.map((link) => (
                        <Link
                          key={link.label}
                          to={link.href!}
                          className="py-3 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors duration-150 flex items-center justify-between"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                          {link.badge && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded font-semibold">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      ))}

                      <div className="py-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                        Opportunities
                      </div>
                      {opportunityLinks.map((link) => (
                        link.href ? (
                          <Link
                            key={link.label}
                            to={link.href}
                            className="py-3 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors duration-150"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {link.label}
                          </Link>
                        ) : (
                          <button
                            key={link.label}
                            onClick={() => handleComingSoon(link.comingSoon!)}
                            className="py-3 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors duration-150 text-left flex items-center justify-between"
                          >
                            {link.label}
                            <span className="text-[10px] px-1.5 py-0.5 bg-secondary text-muted-foreground rounded">
                              Soon
                            </span>
                          </button>
                        )
                      ))}

                      {/* Auth buttons for mobile - at bottom */}
                      {!user && (
                        <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                          <Button asChild variant="outline" size="sm">
                            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                              Sign In
                            </Link>
                          </Button>
                          <Button asChild variant="default" size="sm">
                            <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                              Sign Up
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </nav>
      </header>

      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={comingSoonTitle}
        onScholarshipClick={handleScholarshipRoute}
      />
    </>
  );
};

export default Navbar;
