import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ScholarshipSection = () => {
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
    <section id="scholarship" className="section-container section-padding overflow-hidden">
      <div className="rounded-xl border border-secondary bg-background p-6 sm:p-8 md:p-12 lg:p-16">
        <div className="max-w-2xl mx-auto text-center">
          <span className="badge-minimal border-primary text-primary mb-4 sm:mb-6 inline-block">Limited Spots</span>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
            Web3 Scholarship Program
          </h2>
          
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8">
            Join our free 30-day onboarding program designed to kickstart your Web3 career. 
            Get access to structured learning, mentorship, and your first real opportunities 
            in the decentralized ecosystem.
          </p>
          
          <Button 
            variant="default" 
            size="lg"
            onClick={handleScholarshipClick}
            className="w-full sm:w-auto"
          >
            Register for Scholarship
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipSection;
