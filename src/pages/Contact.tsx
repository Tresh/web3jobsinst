import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Send } from "lucide-react";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-[72px]">
        {/* Hero */}
        <section className="section-container py-12 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <span className="badge-minimal mb-4 md:mb-6 inline-block">Contact</span>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-6 text-balance">
              Get in Touch
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Have questions about our programs, courses, or opportunities? 
              We'd love to hear from you. Reach out through any of the channels below.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="section-container pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* X/Twitter */}
            <a
              href="https://x.com/web3jobsinc"
              target="_blank"
              rel="noopener noreferrer"
              className="card-minimal card-minimal-accent p-6 flex items-start gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">X (Twitter)</h3>
                <p className="text-sm text-muted-foreground">
                  Follow us for updates and DM us anytime
                </p>
                <span className="text-sm text-primary mt-2 inline-block">@web3jobsinc</span>
              </div>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/+Gv2UKErPPsI2NGU0"
              target="_blank"
              rel="noopener noreferrer"
              className="card-minimal card-minimal-accent p-6 flex items-start gap-4 hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <Send className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">Telegram</h3>
                <p className="text-sm text-muted-foreground">
                  Join our community for direct support
                </p>
                <span className="text-sm text-primary mt-2 inline-block">Join Group</span>
              </div>
            </a>
          </div>
        </section>

        {/* Additional Info */}
        <section className="bg-secondary/30 section-padding">
          <div className="section-container text-center max-w-2xl mx-auto">
            <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Response Time
            </h2>
            <p className="text-muted-foreground">
              We typically respond within 24-48 hours. For faster support, 
              reach out to us on Telegram where our community managers are active daily.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
