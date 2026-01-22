import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Clock, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface ScholarshipProgram {
  id: string;
  title: string;
  description: string | null;
  is_active: boolean;
  application_deadline: string | null;
  telegram_link: string | null;
}

interface ScholarshipApplication {
  id: string;
  program_id: string;
  status: string;
  created_at: string;
  program?: ScholarshipProgram;
}

const DashboardScholarship = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<ScholarshipApplication[]>([]);
  const [activePrograms, setActivePrograms] = useState<ScholarshipProgram[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Fetch user's applications
      const { data: apps } = await supabase
        .from("scholarship_applications")
        .select("*")
        .eq("user_id", user.id);

      // Fetch active programs
      const { data: programs } = await supabase
        .from("scholarship_programs")
        .select("*")
        .eq("is_active", true);

      setApplications(apps || []);
      setActivePrograms(programs || []);
      setIsLoading(false);
    };

    fetchData();
  }, [user]);

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
      <div className="mb-8">
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
                      <p className="text-sm text-muted-foreground mt-4 bg-secondary/50 p-3 rounded-lg">
                        Your application is being reviewed. You'll receive an email notification once a decision is made.
                      </p>
                    )}
                    {app.status === "approved" && (
                      <div className="mt-4 bg-green-500/10 p-3 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400">
                          🎉 Congratulations! Your application has been approved. Join the scholarship community to get started.
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