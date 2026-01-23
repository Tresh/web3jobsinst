import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, CheckCircle, XCircle, Loader2, ExternalLink, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { ScholarshipPortal } from "@/components/scholarship/ScholarshipPortal";
import { CountdownTimer } from "@/components/scholarship/CountdownTimer";
import type { ScholarshipApplication, ScholarshipProgram } from "@/types/scholarship";

const DashboardScholarship = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [activePrograms, setActivePrograms] = useState<ScholarshipProgram[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data: apps } = await supabase
        .from("scholarship_applications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const { data: programs } = await supabase
        .from("scholarship_programs")
        .select("*")
        .eq("is_active", true);

      setApplications((apps || []) as unknown as ScholarshipApplication[]);
      setActivePrograms((programs || []) as unknown as ScholarshipProgram[]);
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

  // Check if user has an approved application
  const approvedApplication = applications.find((app) => app.status === "approved");

  // If approved, show the full portal
  if (!isLoading && approvedApplication) {
    return <ScholarshipPortal />;
  }

  // Helper functions for non-approved users
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

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const appliedProgramIds = applications.map((a) => a.program_id);
  const availablePrograms = activePrograms.filter((p) => !appliedProgramIds.includes(p.id));

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Countdown Timer - visible to everyone */}
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

      {/* Applications Status */}
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

      {/* Available Programs */}
      {availablePrograms.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Available Programs</h2>
          <div className="grid gap-4">
            {availablePrograms.map((program) => (
              <Card key={program.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    {program.title}
                  </CardTitle>
                  {program.description && (
                    <CardDescription>{program.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {program.application_deadline && (
                        <span>Deadline: {new Date(program.application_deadline).toLocaleDateString()}</span>
                      )}
                    </div>
                    <Button asChild>
                      <Link to={`/scholarship/${program.id}`}>Apply Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No programs available */}
      {applications.length === 0 && availablePrograms.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Scholarship Programs Available</h3>
            <p className="text-muted-foreground mb-4">
              There are currently no active scholarship programs. Check back soon!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardScholarship;
