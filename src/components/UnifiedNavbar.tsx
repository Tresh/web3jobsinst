import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, SlidersHorizontal, ChevronDown } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import faviconLogo from "/favicon.png";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/contexts/AuthContext";

interface NavLink {
  label: string;
  href?: string;
  comingSoon?: string;
}

const mainLinks: NavLink[] = [
  { label: "Courses", href: "/courses" },
  { label: "Bootcamps", href: "/bootcamps" },
  { label: "Digital Products", href: "/products" },
];

const marketLinks: NavLink[] = [
  { label: "Talent Market", href: "/talent" },
  { label: "Internships", href: "/internships" },
];

const opportunityLinks: NavLink[] = [
  { label: "LearnFi", href: "/learnfi" },
  { label: "Become a Tutor", href: "/tutors" },
  { label: "Verified Institutions", href: "/institutions" },
  { label: "Affiliates", comingSoon: "Affiliates Coming Soon" },
  { label: "Jobs", comingSoon: "Jobs Board Coming Soon" },
];

interface UnifiedNavbarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  activeFiltersCount?: number;
  showSearch?: boolean;
  searchPlaceholder?: string;
}

const UnifiedNavbar = ({
  searchQuery = "",
  onSearchChange,
  onFilterClick,
  activeFiltersCount = 0,
  showSearch = false,
  searchPlaceholder = "Search...",
}: UnifiedNavbarProps) => {
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

  const handleScholarshipClick = () => {
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border pwa-safe-header" style={{ height: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
        <nav className="section-container h-full">
          <div className="flex items-center justify-between h-full gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <img src={faviconLogo} alt="Web3 Jobs Institute" className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0" />
              <span className="font-bold text-xs sm:text-sm md:text-base lg:text-lg text-foreground truncate">
                Web3 Jobs Institute
              </span>
            </Link>

            {/* Search Bar - Only shown when enabled */}
            {showSearch && onSearchChange && (
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-12 bg-secondary/50 border-secondary h-10"
                  />
                  {onFilterClick && (
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
                  )}
                </div>
              </div>
            )}

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6 shrink-0">
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
                      <Link to={link.href!} className="cursor-pointer">
                        {link.label}
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
                        <Link to={link.href} className="cursor-pointer">
                          {link.label}
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
            <div className="flex items-center gap-3 shrink-0">
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
                          className="py-3 px-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors duration-150"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.label}
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
                  </ScrollArea>
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
        onScholarshipClick={handleScholarshipClick}
      />
    </>
  );
};

export default UnifiedNavbar;
