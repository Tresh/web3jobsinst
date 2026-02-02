import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBootcampApplicationsAdmin } from "@/hooks/useBootcampApplications";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Loader2, Clock, Users } from "lucide-react";
import type { BootcampApplication } from "@/types/bootcamp";

interface BootcampApplicationsTabProps {
  bootcampId: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500",
  approved: "bg-green-500/10 text-green-500",
  rejected: "bg-red-500/10 text-red-500",
};

const BootcampApplicationsTab = ({ bootcampId }: BootcampApplicationsTabProps) => {
  const { applications, loading, updateApplicationStatus } = useBootcampApplicationsAdmin(bootcampId);
  const [selectedApp, setSelectedApp] = useState<BootcampApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleReview = (app: BootcampApplication) => {
    setSelectedApp(app);
    setAdminNotes(app.admin_notes || "");
    setDetailsOpen(true);
  };

  const handleStatusUpdate = async (status: "approved" | "rejected") => {
    if (!selectedApp) return;

    setProcessing(true);
    const result = await updateApplicationStatus(selectedApp.id, status, adminNotes);
    setProcessing(false);

    if (result.success) {
      toast.success(`Application ${status}`);
      setDetailsOpen(false);
    } else {
      toast.error("Failed to update application", { description: result.error });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No applications yet</p>
        <p className="text-sm">Applications will appear here when users apply to join</p>
      </div>
    );
  }

  const pendingCount = applications.filter((a) => a.status === "pending").length;

  return (
    <div className="space-y-4">
      {pendingCount > 0 && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 rounded-lg">
          <Clock className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-medium">
            {pendingCount} pending application{pendingCount !== 1 ? "s" : ""} to review
          </span>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Skill Level</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{app.full_name}</p>
                  <p className="text-sm text-muted-foreground">{app.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {app.skill_level}
                </Badge>
              </TableCell>
              <TableCell>
                {new Date(app.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Badge className={statusColors[app.status] || "bg-muted"}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="sm" onClick={() => handleReview(app)}>
                  <Eye className="w-4 h-4 mr-2" />
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Application Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Review the application from {selectedApp?.full_name}
            </DialogDescription>
          </DialogHeader>

          {selectedApp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedApp.full_name}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedApp.email}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Skill Level</p>
                  <p className="font-medium capitalize">{selectedApp.skill_level}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={statusColors[selectedApp.status] || "bg-muted"}>
                    {selectedApp.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Why do they want to join?</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedApp.why_join}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Goals</h4>
                  <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                    {selectedApp.goals}
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    {selectedApp.availability_commitment ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">Availability committed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedApp.agreed_to_rules ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <span className="text-sm">Agreed to rules</span>
                  </div>
                </div>
              </div>

              {selectedApp.status === "pending" && (
                <div className="space-y-3">
                  <Label htmlFor="adminNotes">Admin Notes (optional)</Label>
                  <Textarea
                    id="adminNotes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Internal notes about this application..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedApp?.status === "pending" ? (
              <div className="flex gap-2 w-full">
                <Button
                  variant="destructive"
                  onClick={() => handleStatusUpdate("rejected")}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleStatusUpdate("approved")}
                  disabled={processing}
                  className="flex-1"
                >
                  {processing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setDetailsOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BootcampApplicationsTab;
