import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Play,
  Square,
  Trophy,
  ClipboardList,
  MessageCircle,
} from "lucide-react";
import type { Bootcamp, BootcampStatus, BootcampLeaderboardEntry, ApplicationQuestion, RequiredPostLink } from "@/types/bootcamp";
import BootcampApplicationsTab from "./BootcampApplicationsTab";
import BootcampCommunityManagement from "./BootcampCommunityManagement";
import BootcampApplicationSettings from "./BootcampApplicationSettings";

interface BootcampManageDialogProps {
  bootcamp: Bootcamp | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const statusColors: Record<BootcampStatus, string> = {
  draft: "bg-gray-500/10 text-gray-500",
  pending_approval: "bg-amber-500/10 text-amber-500",
  approved: "bg-blue-500/10 text-blue-500",
  active: "bg-green-500/10 text-green-500",
  completed: "bg-gray-500/10 text-gray-500",
  rejected: "bg-red-500/10 text-red-500",
  cancelled: "bg-red-500/10 text-red-500",
};

const BootcampManageDialog = ({ bootcamp, open, onOpenChange, onSuccess }: BootcampManageDialogProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [participants, setParticipants] = useState<BootcampLeaderboardEntry[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    if (bootcamp) {
      setAdminNotes(bootcamp.admin_notes || "");
      fetchParticipants();
    }
  }, [bootcamp?.id]);

  const fetchParticipants = async () => {
    if (!bootcamp?.id) return;
    
    setLoadingParticipants(true);
    try {
      const { data, error } = await supabase
        .rpc("get_bootcamp_leaderboard", { p_bootcamp_id: bootcamp.id });

      if (error) throw error;
      setParticipants((data as BootcampLeaderboardEntry[]) || []);
    } catch (err) {
      console.error("Failed to fetch participants:", err);
    } finally {
      setLoadingParticipants(false);
    }
  };

  const updateStatus = async (status: BootcampStatus) => {
    if (!bootcamp) return;
    
    setLoading(true);
    try {
      const updateData: any = {
        status,
        admin_notes: adminNotes || null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };

      // Set start/end dates based on status change
      if (status === "active" && !bootcamp.start_date) {
        updateData.start_date = new Date().toISOString();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + bootcamp.duration_days);
        updateData.end_date = endDate.toISOString();
      }

      const { error } = await supabase
        .from("bootcamps")
        .update(updateData)
        .eq("id", bootcamp.id);

      if (error) throw error;

      toast.success(`Bootcamp ${status === "approved" ? "approved" : status === "active" ? "started" : "updated"}`);
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      toast.error("Failed to update bootcamp", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!bootcamp) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("bootcamps")
        .update({ admin_notes: adminNotes || null })
        .eq("id", bootcamp.id);

      if (error) throw error;
      toast.success("Notes saved");
      onSuccess();
    } catch (err: any) {
      toast.error("Failed to save notes", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!bootcamp) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle>{bootcamp.title}</DialogTitle>
            <Badge className={statusColors[bootcamp.status]}>
              {bootcamp.status.replace("_", " ")}
            </Badge>
          </div>
          <DialogDescription>
            Hosted by {bootcamp.host_name} • {bootcamp.duration_days} Days
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="application-settings">
              App Form
            </TabsTrigger>
            <TabsTrigger value="applications">
              <ClipboardList className="w-4 h-4 mr-1" />
              Applications
            </TabsTrigger>
            <TabsTrigger value="participants">
              Participants ({bootcamp.current_participants})
            </TabsTrigger>
            <TabsTrigger value="community">
              <MessageCircle className="w-4 h-4 mr-1" />
              Community
            </TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Basic Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-medium">{bootcamp.duration_days} Days</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">
                  {bootcamp.bootcamp_type === "free" ? "Free" : `Paid ($${bootcamp.price_amount})`}
                </p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Max Participants</p>
                <p className="font-medium">{bootcamp.max_participants}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Platform Fee</p>
                <p className="font-medium">${bootcamp.platform_fee || 0}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Description</p>
              <p className="text-sm text-muted-foreground">
                {bootcamp.description || "No description provided."}
              </p>
            </div>

            {/* Admin Notes */}
            <div className="space-y-2">
              <Label htmlFor="admin_notes">Admin Notes</Label>
              <Textarea
                id="admin_notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes about this bootcamp..."
                rows={3}
              />
              <Button size="sm" variant="outline" onClick={saveNotes} disabled={loading}>
                Save Notes
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="application-settings" className="mt-4">
            <BootcampApplicationSettings
              bootcampId={bootcamp.id}
              initialQuestions={bootcamp.application_questions}
              initialPostLinks={bootcamp.required_post_links}
              onSave={onSuccess}
            />
          </TabsContent>

          <TabsContent value="applications" className="mt-4">
            <BootcampApplicationsTab bootcampId={bootcamp.id} />
          </TabsContent>

          <TabsContent value="participants" className="mt-4">
            {loadingParticipants ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No participants yet</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Participant</TableHead>
                    <TableHead>XP</TableHead>
                    <TableHead>Tasks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {participants.map((p) => (
                    <TableRow key={p.user_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {p.rank <= 3 && (
                            <Trophy className={`w-4 h-4 ${
                              p.rank === 1 ? "text-primary" :
                              p.rank === 2 ? "text-muted-foreground" :
                              "text-secondary-foreground"
                            }`} />
                          )}
                          #{p.rank}
                        </div>
                      </TableCell>
                      <TableCell>{p.user_name}</TableCell>
                      <TableCell>{p.total_xp} XP</TableCell>
                      <TableCell>{p.tasks_completed}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="community" className="mt-4">
            <BootcampCommunityManagement bootcampId={bootcamp.id} />
          </TabsContent>

          <TabsContent value="controls" className="mt-4 space-y-6">
            {/* Status Actions */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Status Controls</p>
              <div className="flex flex-wrap gap-2">
                {bootcamp.status === "pending_approval" && (
                  <>
                    <Button onClick={() => updateStatus("approved")} disabled={loading}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button variant="destructive" onClick={() => updateStatus("rejected")} disabled={loading}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </>
                )}
                {bootcamp.status === "approved" && (
                  <Button onClick={() => updateStatus("active")} disabled={loading}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Bootcamp
                  </Button>
                )}
                {bootcamp.status === "active" && (
                  <>
                    <Button variant="secondary" onClick={() => updateStatus("completed")} disabled={loading}>
                      <Square className="w-4 h-4 mr-2" />
                      End Bootcamp
                    </Button>
                    <Button variant="destructive" onClick={() => updateStatus("cancelled")} disabled={loading}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {bootcamp.status === "draft" && (
                  <Button onClick={() => updateStatus("pending_approval")} disabled={loading}>
                    Submit for Approval
                  </Button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/bootcamps/${bootcamp.id}`} target="_blank" rel="noopener noreferrer">
                    View Public Page
                  </a>
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BootcampManageDialog;
