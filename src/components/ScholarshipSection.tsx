import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ScholarshipSection = () => {
  const navigate = useNavigate();

  return (
    <section id="scholarship" className="section-container section-padding overflow-hidden">
      <div className="rounded-xl border border-secondary bg-background p-6 sm:p-8 md:p-12 lg:p-16">
        <div className="max-w-2xl mx-auto text-center">
          <span className="badge-minimal border-muted-foreground text-muted-foreground mb-4 sm:mb-6 inline-block">Intake Closed</span>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-4 sm:mb-6 text-balance">
            Web3 Scholarship Program
          </h2>
          
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8">
            Thank you for your interest! The current scholarship batch is now closed.
            Stay tuned for the next cohort — we'll announce it soon. In the meantime,
            explore our courses to start learning.
          </p>
          
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => navigate("/courses")}
            className="w-full sm:w-auto"
          >
            Explore Courses
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ScholarshipSection;
