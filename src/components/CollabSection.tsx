import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Handshake, Code, Palette, Megaphone, ArrowRight } from "lucide-react";
import ComingSoonDialog from "./ComingSoonDialog";
import { useAuth } from "@/contexts/AuthContext";

const CollabSection = () => {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleScholarshipClick = () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: "/dashboard/scholarship" } } });
      return;
    }
    navigate("/dashboard/scholarship");
  };

  return (
    <>
      <section id="collab" className="bg-background-secondary section-padding">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="card-minimal card-minimal-accent bg-card p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                    <Code className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Developers</span>
                </div>
                <div className="card-minimal card-minimal-accent bg-card p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                    <Palette className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Designers</span>
                </div>
                <div className="card-minimal card-minimal-accent bg-card p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                    <Megaphone className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Marketers</span>
                </div>
                <div className="card-minimal card-minimal-accent bg-card p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-3">
                    <Handshake className="w-5 h-5 text-foreground" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Founders</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="badge-minimal mb-6 inline-block">Collab Market</span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-balance">
                Collab Market
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                A marketplace where creators, developers, marketers, and founders collaborate 
                on real projects. Trade skills for opportunities, not just certificates. 
                Build your portfolio while earning and expanding your network.
              </p>
              <Button 
                variant="default" 
                size="lg"
                onClick={() => setComingSoonOpen(true)}
              >
                Explore Collab Market
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <ComingSoonDialog 
        open={comingSoonOpen} 
        onOpenChange={setComingSoonOpen}
        title="Collab Market Coming Soon"
        onScholarshipClick={handleScholarshipClick}
      />
    </>
  );
};

export default CollabSection;
