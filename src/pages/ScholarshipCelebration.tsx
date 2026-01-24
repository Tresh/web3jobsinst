import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ECardGenerator } from "@/components/scholarship/ECardGenerator";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Loader2, PartyPopper, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScholarshipApplication, ScholarshipProgram } from "@/types/scholarship";

export default function ScholarshipCelebration() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [application, setApplication] = useState<ScholarshipApplication | null>(null);
  const [program, setProgram] = useState<ScholarshipProgram | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!user) {
        if (!authLoading) {
          navigate("/login", { state: { from: "/scholarship/celebration" } });
        }
        return;
      }

      try {
        // Fetch approved application
        const { data: appData, error: appError } = await supabase
          .from("scholarship_applications")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "approved")
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (appError || !appData) {
          // No approved application, redirect to dashboard
          navigate("/dashboard/scholarship", {
            state: { message: "You need an approved scholarship application to access this page." },
          });
          return;
        }

        setApplication(appData as unknown as ScholarshipApplication);

        // Fetch program details
        if (appData.program_id) {
          const { data: programData } = await supabase
            .from("scholarship_programs")
            .select("*")
            .eq("id", appData.program_id)
            .single();

          if (programData) {
            setProgram(programData as unknown as ScholarshipProgram);
          }
        }
      } catch (error) {
        console.error("Error fetching celebration data:", error);
        navigate("/dashboard/scholarship");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user, authLoading, navigate]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />

      <main className="container mx-auto px-4 py-12">
        {/* Back button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/dashboard/scholarship")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <PartyPopper className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Congratulations, {application.full_name}! 🎉
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            You've been accepted into the scholarship program! Create your personalized
            e-card and share the exciting news with your community.
          </p>
        </div>

        {/* E-Card Generator */}
        <div className="max-w-2xl mx-auto">
          <ECardGenerator
            scholarName={application.full_name}
            programTitle={program?.title || "Web3 Scholarship Program"}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
