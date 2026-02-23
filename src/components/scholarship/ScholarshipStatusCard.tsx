import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GraduationCap, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { ScholarshipApplication } from "@/types/scholarship";

interface ScholarshipStatusCardProps {
  application: ScholarshipApplication | null;
  hasActivePrograms: boolean;
}

export function ScholarshipStatusCard({ application, hasActivePrograms }: ScholarshipStatusCardProps) {
  if (!application) {
    return null;
  }

  const getStatusInfo = () => {
    switch (application.status) {
      case "approved":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-500" />,
          badge: <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>,
          title: "Scholarship Approved! 🎉",
          description: "Congratulations! You've been accepted into the scholarship program.",
          showPortalLink: true,
        };
      case "rejected":
        return {
          icon: <XCircle className="w-6 h-6 text-red-500" />,
          badge: <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>,
          title: "Application Not Accepted",
          description: application.rejection_reason || "Unfortunately, your application was not accepted at this time.",
          showPortalLink: false,
        };
      case "waitlist":
        return {
          icon: <AlertCircle className="w-6 h-6 text-yellow-500" />,
          badge: <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Waitlisted</Badge>,
          title: "You're on the Waitlist",
          description: "Your application is on the waitlist. We'll notify you if a spot opens up.",
          showPortalLink: false,
        };
      default:
        return {
          icon: <Clock className="w-6 h-6 text-blue-500" />,
          badge: <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Under Review</Badge>,
          title: "Application Under Review",
          description: "Your application is being reviewed. You'll be notified once a decision is made.",
          showPortalLink: false,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {statusInfo.icon}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold">{statusInfo.title}</h3>
              {statusInfo.badge}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {statusInfo.description}
            </p>
            {statusInfo.showPortalLink && (
              <Button asChild>
                <Link to="/dashboard/scholarship">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Enter Scholarship Portal
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
