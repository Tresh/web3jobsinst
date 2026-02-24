import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Briefcase, Clock, CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface WaitlistEntry {
  id: string;
  full_name: string;
  email: string;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  admin_notes: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: "Pending Approval",
    icon: <Clock className="w-5 h-5" />,
    className: "bg-primary/10 text-primary border-primary/20",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle className="w-5 h-5" />,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  rejected: {
    label: "Not Accepted",
    icon: <XCircle className="w-5 h-5" />,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const DashboardInternship = () => {
  const { user } = useAuth();
  const [entry, setEntry] = useState<WaitlistEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchEntry();
  }, [user?.id]);

  const fetchEntry = async () => {
    const { data } = await supabase
      .from("internship_waitlist")
      .select("*")
      .eq("user_id", user!.id)
      .maybeSingle();
    setEntry(data as WaitlistEntry | null);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-2">Internship</h1>
        <p className="text-muted-foreground mb-6">
          You haven't applied to the internship program yet.
        </p>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="w-5 h-5 text-primary" />
              Join the Internship Waitlist
            </CardTitle>
            <CardDescription>
              Apply to join our internship program and get matched with opportunities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/internships">
                Go to Internship Market
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending;

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-2">Internship</h1>
      <p className="text-muted-foreground mb-6">Track your internship application status</p>

      <Card className="max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="w-5 h-5 text-primary" />
              Application Status
            </CardTitle>
            <Badge className={statusConfig.className}>
              {statusConfig.icon}
              <span className="ml-1.5">{statusConfig.label}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name</span>
              <p className="font-medium">{entry.full_name}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Email</span>
              <p className="font-medium">{entry.email}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Applied</span>
              <p className="font-medium">{format(new Date(entry.created_at), "MMM d, yyyy")}</p>
            </div>
            {entry.reviewed_at && (
              <div>
                <span className="text-muted-foreground">Reviewed</span>
                <p className="font-medium">{format(new Date(entry.reviewed_at), "MMM d, yyyy")}</p>
              </div>
            )}
          </div>

          {entry.status === "pending" && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm text-foreground">
                Your application is being reviewed. We'll notify you once a decision is made.
              </p>
            </div>
          )}

          {entry.status === "approved" && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
              <p className="text-sm text-foreground mb-3">
                Congratulations! You've been approved. You can now create your internship profile.
              </p>
              <Button asChild size="sm">
                <Link to="/internships">
                  View Internship Market
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardInternship;
