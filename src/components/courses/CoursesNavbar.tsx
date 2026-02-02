import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import logo from "@/assets/logo.png";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import { useAuth } from "@/contexts/AuthContext";
import UserMenu from "@/components/auth/UserMenu";

interface NavLink {
  label: string;
  href?: string;
  comingSoon?: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Digital Products", href: "/products" },
  { label: "Talent", href: "/talent" },
  { label: "Bootcamps", href: "/bootcamps" },
  { label: "About", href: "/about" },
  { label: "Affiliates", comingSoon: "Affiliates Coming Soon" },
  { label: "Jobs", comingSoon: "Jobs Board Coming Soon" },
];

interface CoursesNavbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  activeFiltersCount: number;
}

const CoursesNavbar = ({
  searchQuery,
  onSearchChange,
  onFilterClick,
  activeFiltersCount,
}: CoursesNavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setComingSoonOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleScholarshipClick = () => {
    setIsMobileMenuOpen(false);
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-secondary h-[72px]">
        <nav className="section-container h-full">
          <div className="flex items-center justify-between h-full gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={logo} alt="Web3 Jobs Institute" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-foreground hidden md:block">
                Web3 Jobs Institute
              </span>
            </Link>

            {/* Search Bar - Desktop & Mobile */}
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="pl-10 pr-12 bg-secondary/50 border-secondary h-10"
                />
                <button
                  onClick={onFilterClick}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-secondary transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                  {activeFiltersCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 shrink-0">
              {navLinks.slice(0, 3).map((link) => (
                link.comingSoon ? (
                  <button
                    key={link.label}
                    onClick={() => handleComingSoon(link.comingSoon!)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href!}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                )
              ))}
              <Button 
                variant="default" 
                size="sm"
                onClick={handleScholarshipClick}
              >
                Apply for Scholarship
              </Button>
              <UserMenu />
            </div>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <button
                  className="lg:hidden p-2 text-foreground shrink-0"
                  aria-label="Toggle menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background p-0">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-60px)]">
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

                    {navLinks.map((link) => (
                      link.comingSoon ? (
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
                      ) : (
                        <Link
                          key={link.label}
                          to={link.href!}
                          className="py-3 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors duration-150"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      )
                    ))}

                    <Button 
                      variant="default" 
                      size="sm" 
                      className="mt-4"
                      onClick={handleScholarshipClick}
                    >
                      Apply for Scholarship
                    </Button>

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
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </header>

      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={comingSoonTitle}
        onScholarshipClick={handleScholarshipClick}
      />
    </>
  );
};

export default CoursesNavbar;
