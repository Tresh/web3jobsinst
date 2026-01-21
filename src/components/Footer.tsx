import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import ComingSoonDialog from "./ComingSoonDialog";
import ScholarshipFormDialog from "./ScholarshipFormDialog";

const Footer = () => {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [comingSoonTitle, setComingSoonTitle] = useState("");
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  const handleComingSoon = (title: string) => {
    setComingSoonTitle(title);
    setComingSoonOpen(true);
  };

  const mainLinks = [
    { label: "Home", href: "/", isRoute: true },
    { label: "Courses", href: "/courses", isRoute: true },
    { label: "About", href: "/about", isRoute: true },
    { label: "Scholarship", href: "/#scholarship", isRoute: false },
    { label: "Jobs", comingSoon: "Jobs Board Coming Soon" },
    { label: "Collab Market", comingSoon: "Collab Market Coming Soon" },
  ];

  const legalLinks = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ];

  const socialLinks = [
    { label: "X (Twitter)", href: "https://x.com/web3jobsinc" },
    { label: "Telegram", href: "https://t.me/+Gv2UKErPPsI2NGU0" },
  ];

  return (
    <>
      <footer className="border-t border-secondary bg-secondary/20">
        <div className="section-container py-12 md:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Logo & Description */}
            <div className="col-span-2 md:col-span-1">
              <Link to="/" className="inline-flex items-center gap-2 mb-4">
                <img src={logo} alt="Web3 Jobs Institute" className="w-8 h-8 object-contain" />
                <span className="font-bold text-lg text-foreground">Web3 Jobs Institute</span>
              </Link>
              <p className="text-muted-foreground text-sm max-w-sm">
                The home of Web3 jobs, skills, business models, and collaboration. 
                Learn, build, and earn in the decentralized economy.
              </p>
            </div>

            {/* Navigate */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Navigate</h4>
              <ul className="space-y-2">
                {mainLinks.map((link) => (
                  <li key={link.label}>
                    {link.comingSoon ? (
                      <button
                        onClick={() => handleComingSoon(link.comingSoon)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                      >
                        {link.label}
                      </button>
                    ) : link.isRoute ? (
                      <Link
                        to={link.href!}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-semibold text-foreground mb-4 text-sm">Connect</h4>
              <ul className="space-y-2">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-secondary mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Web3 Jobs Institute. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {legalLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

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

export default Footer;
