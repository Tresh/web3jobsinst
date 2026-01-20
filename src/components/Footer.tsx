import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    main: [
      { label: "Home", href: "/", isRoute: true },
      { label: "Courses", href: "/courses", isRoute: true },
      { label: "Scholarship", href: "/#scholarship", isRoute: false },
      { label: "Jobs", href: "/#jobs", isRoute: false },
      { label: "Collab Market", href: "/#collab", isRoute: false },
    ],
    resources: [
      { label: "Learning Paths", href: "/courses", isRoute: true },
      { label: "Web3 Fundamentals", href: "/courses", isRoute: true },
      { label: "Career Guide", href: "/#programs", isRoute: false },
    ],
    social: [
      { label: "Twitter", href: "https://twitter.com" },
      { label: "Discord", href: "https://discord.com" },
      { label: "Telegram", href: "https://telegram.org" },
    ],
  };

  return (
    <footer className="border-t border-secondary bg-secondary/20">
      <div className="section-container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-12">
          {/* Logo & Description */}
          <div className="col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">W3</span>
              </div>
              <span className="font-bold text-lg text-foreground">Web3 Jobs Institute</span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              The home of Web3 jobs, skills, business models, and collaboration. 
              Learn, build, and earn in the decentralized economy.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Navigate</h4>
            <ul className="space-y-2">
              {links.main.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
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

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Resources</h4>
            <ul className="space-y-2">
              {links.resources.map((link) => (
                <li key={link.label}>
                  {link.isRoute ? (
                    <Link
                      to={link.href}
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

          {/* Social */}
          <div>
            <h4 className="font-semibold text-foreground mb-4 text-sm">Connect</h4>
            <ul className="space-y-2">
              {links.social.map((link) => (
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
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
