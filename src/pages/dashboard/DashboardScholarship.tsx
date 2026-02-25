import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, CheckCircle, XCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ScholarshipPortal } from "@/components/scholarship/ScholarshipPortal";
import { CountdownTimer } from "@/components/scholarship/CountdownTimer";
import type { ScholarshipApplication, ScholarshipProgram } from "@/types/scholarship";

const DashboardScholarship = () => {
  const { user } = useAuth();

  const { data: applications = [], isLoading: appsLoading } = useQuery({
    queryKey: ["scholarship-applications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data: apps } = await supabase
        .from("scholarship_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      return (apps || []) as unknown as ScholarshipApplication[];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,   // keep cache fresh for 5 min
    gcTime: 10 * 60 * 1000,     // discard cache after 10 min idle
  });

  const { data: activePrograms = [] } = useQuery({
    queryKey: ["scholarship-programs"],
    queryFn: async () => {
      const { data: programs } = await supabase
        .from("scholarship_programs")
        .select("*")
        .eq("is_active", true);
      return (programs || []) as unknown as ScholarshipProgram[];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });

  const approvedApplication = applications.find((app) => app.status === "approved");

  // Show portal immediately if approved (data comes from cache on revisit — no flash)
  if (!appsLoading && approvedApplication) {
    return <ScholarshipPortal />;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20 whitespace-nowrap">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 whitespace-nowrap">Rejected</Badge>;
      case "waitlist":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 whitespace-nowrap">Waitlist</Badge>;
      default:
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-sm whitespace-nowrap">Under Review</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "waitlist":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  if (appsLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <CountdownTimer />

      <div className="mb-8 mt-6">
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-primary" />
          Scholarship Programs
        </h1>
        <p className="text-muted-foreground mt-1">
          Apply for scholarships and track your application status
        </p>
      </div>

      {applications.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Your Applications</h2>
          <div className="space-y-4">
            {applications.map((app) => {
              const program = activePrograms.find((p) => p.id === app.program_id);
              return (
                <Card key={app.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {getStatusIcon(app.status)}
                        <div>
                          <h3 className="font-semibold">{program?.title || "Scholarship Program"}</h3>
                          <p className="text-sm text-muted-foreground">
                            Applied on {new Date(app.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(app.status)}
                        {app.status === "approved" && program?.telegram_link && (
                          <a
                            href={program.telegram_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            Join Community <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>

                    {app.status === "pending" && (
                      <div className="mt-4 bg-secondary/50 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Your application is being reviewed. You'll receive a notification once a decision is made.
                        </p>
                      </div>
                    )}

                    {app.status === "rejected" && (
                      <div className="mt-4 bg-red-500/10 p-4 rounded-lg">
                        <p className="text-sm font-medium text-red-500 mb-1">Application Not Accepted</p>
                        <p className="text-sm text-muted-foreground">
                          {app.rejection_reason || "Unfortunately, your application was not accepted at this time. You may apply for future programs."}
                        </p>
                      </div>
                    )}

                    {app.status === "waitlist" && (
                      <div className="mt-4 bg-yellow-500/10 p-4 rounded-lg">
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400 mb-1">You're on the Waitlist</p>
                        <p className="text-sm text-muted-foreground">
                          Your application is on the waitlist. We'll notify you if a spot becomes available.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {applications.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Scholarship Intake Has Ended</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for your interest! The current scholarship batch is now closed.
              Stay tuned for the next cohort — we'll announce it soon.
            </p>
            <Button asChild variant="outline">
              <Link to="/courses">Explore Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardScholarship;
