import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  Play,
  Square,
  ClipboardList,
  MessageCircle,
  Settings,
  ListTodo,
  Eye,
  Calendar,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Bootcamp, BootcampStatus } from "@/types/bootcamp";
import BootcampApplicationsTab from "@/components/admin/bootcamp/BootcampApplicationsTab";
import BootcampCommunityManagement from "@/components/admin/bootcamp/BootcampCommunityManagement";
import AdminBootcampParticipants from "@/components/admin/bootcamp/AdminBootcampParticipants";
import AdminBootcampTasks from "@/components/admin/bootcamp/AdminBootcampTasks";
import AdminBootcampSettings from "@/components/admin/bootcamp/AdminBootcampSettings";

const statusColors: Record<BootcampStatus, string> = {
  draft: "bg-secondary text-secondary-foreground",
  pending_approval: "bg-amber-500/10 text-amber-500",
  approved: "bg-blue-500/10 text-blue-500",
  active: "bg-green-500/10 text-green-500",
  completed: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
  cancelled: "bg-destructive/10 text-destructive",
};

const AdminBootcampManage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bootcamp, setBootcamp] = useState<Bootcamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    if (id) {
      fetchBootcamp();
    }
  }, [id]);

  const fetchBootcamp = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bootcamps")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setBootcamp(data as Bootcamp);
      setAdminNotes(data.admin_notes || "");
    } catch (err: any) {
      toast.error("Failed to load bootcamp", { description: err.message });
      navigate("/admin/bootcamps");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (status: BootcampStatus) => {
    if (!bootcamp) return;

    setUpdating(true);
    try {
      const updateData: any = {
        status,
        admin_notes: adminNotes || null,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      };

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
      fetchBootcamp();
    } catch (err: any) {
      toast.error("Failed to update bootcamp", { description: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const saveNotes = async () => {
    if (!bootcamp) return;

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("bootcamps")
        .update({ admin_notes: adminNotes || null })
        .eq("id", bootcamp.id);

      if (error) throw error;
      toast.success("Notes saved");
    } catch (err: any) {
      toast.error("Failed to save notes", { description: err.message });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!bootcamp) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-4">Bootcamp not found</h2>
        <Link to="/admin/bootcamps">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bootcamps
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <Link
            to="/admin/bootcamps"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Bootcamps
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{bootcamp.title}</h1>
            <Badge className={statusColors[bootcamp.status]}>
              {bootcamp.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Hosted by {bootcamp.host_name} • {bootcamp.duration_days} Days
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={`/bootcamps/${bootcamp.id}`} target="_blank" rel="noopener noreferrer">
            <Eye className="w-4 h-4 mr-2" />
            View Public Page
          </a>
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Participants</p>
                <p className="text-xl font-bold">{bootcamp.current_participants} / {bootcamp.max_participants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-xl font-bold">{bootcamp.duration_days} Days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Start Date</p>
                <p className="text-xl font-bold">
                  {bootcamp.start_date
                    ? new Date(bootcamp.start_date).toLocaleDateString()
                    : "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="h-fit">
                {bootcamp.bootcamp_type === "free" ? "Free" : `$${bootcamp.price_amount}`}
              </Badge>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="text-xl font-bold capitalize">{bootcamp.bootcamp_type}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Controls (Quick Actions) */}
      {(bootcamp.status === "pending_approval" || bootcamp.status === "approved" || bootcamp.status === "active") && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Status Controls</CardTitle>
            <CardDescription>Manage the bootcamp lifecycle</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {bootcamp.status === "pending_approval" && (
              <>
                <Button onClick={() => updateStatus("approved")} disabled={updating}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve Bootcamp
                </Button>
                <Button variant="destructive" onClick={() => updateStatus("rejected")} disabled={updating}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
            {bootcamp.status === "approved" && (
              <Button onClick={() => updateStatus("active")} disabled={updating}>
                <Play className="w-4 h-4 mr-2" />
                Start Bootcamp
              </Button>
            )}
            {bootcamp.status === "active" && (
              <>
                <Button variant="secondary" onClick={() => updateStatus("completed")} disabled={updating}>
                  <Square className="w-4 h-4 mr-2" />
                  End Bootcamp
                </Button>
                <Button variant="destructive" onClick={() => updateStatus("cancelled")} disabled={updating}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="applications">
            <ClipboardList className="w-4 h-4 mr-1 hidden sm:inline" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="participants">
            <Users className="w-4 h-4 mr-1 hidden sm:inline" />
            Participants
          </TabsTrigger>
          <TabsTrigger value="community">
            <MessageCircle className="w-4 h-4 mr-1 hidden sm:inline" />
            Rooms
          </TabsTrigger>
          <TabsTrigger value="tasks">
            <ListTodo className="w-4 h-4 mr-1 hidden sm:inline" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="w-4 h-4 mr-1 hidden sm:inline" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Bootcamp Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                {bootcamp.start_date && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{new Date(bootcamp.start_date).toLocaleDateString()}</p>
                  </div>
                )}
                {bootcamp.end_date && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{new Date(bootcamp.end_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
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
                <Button size="sm" variant="outline" onClick={saveNotes} disabled={updating}>
                  {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>Participant Applications</CardTitle>
              <CardDescription>
                Review and manage applications from users who want to join this bootcamp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BootcampApplicationsTab bootcampId={bootcamp.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participants">
          <Card>
            <CardHeader>
              <CardTitle>Approved Participants</CardTitle>
              <CardDescription>
                View and manage participants who have been approved for this bootcamp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminBootcampParticipants bootcampId={bootcamp.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle>Rooms & Community</CardTitle>
              <CardDescription>
                Manage community rooms and moderate discussions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BootcampCommunityManagement bootcampId={bootcamp.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Daily Challenges</CardTitle>
              <CardDescription>
                View and manage bootcamp tasks created by the host
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminBootcampTasks bootcampId={bootcamp.id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <AdminBootcampSettings bootcamp={bootcamp} onUpdate={fetchBootcamp} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminBootcampManage;
