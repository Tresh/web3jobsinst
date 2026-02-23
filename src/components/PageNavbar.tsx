import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, SlidersHorizontal, ShoppingCart, Home } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import faviconLogo from "/favicon.png";
import ComingSoonDialog from "./ComingSoonDialog";
import { useAuth } from "@/contexts/AuthContext";

interface NavLinkItem {
  label: string;
  href?: string;
  comingSoon?: string;
}

const navLinks: NavLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Digital Products", href: "/products" },
  { label: "Talent Market", href: "/talent" },
  { label: "Internships", href: "/internships" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "About", href: "/about" },
  { label: "Bootcamps", href: "/bootcamps" },
  { label: "Affiliates", comingSoon: "Affiliates Coming Soon" },
  { label: "Jobs", comingSoon: "Jobs Board Coming Soon" },
];

interface PageNavbarProps {
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
  onFilterClick?: () => void;
  activeFiltersCount?: number;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showCart?: boolean;
  cartItemsCount?: number;
  onCartClick?: () => void;
}

const PageNavbar = ({
  searchQuery = "",
  onSearchChange,
  onFilterClick,
  activeFiltersCount = 0,
  searchPlaceholder = "Search...",
  showSearch = false,
  showCart = false,
  cartItemsCount = 0,
  onCartClick,
}: PageNavbarProps) => {
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

  // Primary nav links to show on desktop (first 4 non-coming-soon)
  const primaryLinks = navLinks.filter(l => !l.comingSoon).slice(0, 4);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border pwa-safe-header" style={{ height: 'calc(72px + env(safe-area-inset-top, 0px))' }}>
        <nav className="section-container h-full">
          <div className="flex items-center justify-between h-full gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src={faviconLogo} alt="Web3 Jobs Institute" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-foreground hidden md:block">
                Web3 Jobs Institute
              </span>
            </Link>

            {/* Search Bar (optional) */}
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
              {primaryLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href!}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side icons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Cart icon (optional) */}
              {showCart && onCartClick && (
                <button
                  onClick={onCartClick}
                  className="relative p-2 text-foreground hover:bg-secondary/50 rounded-lg transition-colors"
                  aria-label="Cart"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartItemsCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {cartItemsCount}
                    </span>
                  )}
                </button>
              )}

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
                <SheetContent side="right" className="w-[280px] bg-background">
                  <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-1 mt-6">
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

export default PageNavbar;
