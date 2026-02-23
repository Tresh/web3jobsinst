import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ComingSoonDialog from "./ComingSoonDialog";
import { useAuth } from "@/contexts/AuthContext";

const CTASection = () => {
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
      <section className="py-16 md:py-24">
        <div className="section-container">
          <div className="rounded-xl bg-primary/10 border border-primary/20 p-8 md:p-12 lg:p-16">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-balance">
                Start Your Web3 Career the Right Way
              </h2>
              
              <p className="text-lg text-muted-foreground mb-10">
                Join thousands of learners building real skills and earning in the decentralized economy.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  variant="default" 
                  size="lg" 
                  className="w-full sm:w-auto"
                  onClick={handleScholarshipClick}
                >
                  Join Scholarship Waitlist
                  <ArrowRight className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="w-full sm:w-auto text-foreground hover:bg-white/5 hover:text-foreground"
                  onClick={() => setComingSoonOpen(true)}
                >
                  Explore Programs
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ComingSoonDialog 
        open={comingSoonOpen} 
        onOpenChange={setComingSoonOpen}
        title="Programs Coming Soon"
        onScholarshipClick={handleScholarshipClick}
      />
    </>
  );
};

export default CTASection;
