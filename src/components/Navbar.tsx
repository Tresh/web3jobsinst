import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import ComingSoonDialog from "./ComingSoonDialog";
import ScholarshipFormDialog from "./ScholarshipFormDialog";

interface NavLink {
  label: string;
  href?: string;
  comingSoon?: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "Digital Products", href: "/products" },
  { label: "Talent Market", href: "/talent" },
  { label: "Campaigns", href: "/campaigns" },
  { label: "About", href: "/about" },
  { label: "Bootcamp", comingSoon: "Bootcamp Coming Soon" },
  { label: "Affiliates", comingSoon: "Affiliates Coming Soon" },
  { label: "Jobs", comingSoon: "Jobs Board Coming Soon" },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("");
  const [scholarshipOpen, setScholarshipOpen] = useState(false);

  const handleComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setComingSoonOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleScholarshipClick = () => {
    setScholarshipOpen(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-secondary h-[72px]">
        <nav className="section-container h-full">
          <div className="flex items-center justify-between h-full">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Web3 Jobs Institute" className="w-8 h-8 object-contain" />
              <span className="font-bold text-lg text-foreground hidden sm:block">
                Web3 Jobs Institute
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                link.comingSoon ? (
                  <button
                    key={link.label}
                    onClick={() => handleComingSoon(link.comingSoon!)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 flex items-center gap-1.5"
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
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                )
              ))}
            </div>

            {/* CTA Button & Mobile Menu */}
            <div className="flex items-center gap-4">
              <Button 
                variant="default" 
                size="sm" 
                className="hidden sm:inline-flex"
                onClick={handleScholarshipClick}
              >
                Apply for Scholarship
              </Button>
              
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
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleScholarshipClick();
                      }}
                    >
                      Apply for Scholarship
                    </Button>
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
        onScholarshipClick={() => setScholarshipOpen(true)}
      />
      <ScholarshipFormDialog open={scholarshipOpen} onOpenChange={setScholarshipOpen} />
    </>
  );
};

export default Navbar;
