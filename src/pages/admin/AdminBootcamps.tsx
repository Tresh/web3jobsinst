import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Search,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  Users,
  Clock,
  DollarSign,
  Plus,
} from "lucide-react";
import type { Bootcamp, BootcampStatus } from "@/types/bootcamp";

const statusColors: Record<BootcampStatus, string> = {
  draft: "bg-gray-500/10 text-gray-500",
  pending_approval: "bg-amber-500/10 text-amber-500",
  approved: "bg-blue-500/10 text-blue-500",
  active: "bg-green-500/10 text-green-500",
  completed: "bg-gray-500/10 text-gray-500",
  rejected: "bg-red-500/10 text-red-500",
  cancelled: "bg-red-500/10 text-red-500",
};

const AdminBootcamps = () => {
  const { user } = useAuth();
  const [bootcamps, setBootcamps] = useState<Bootcamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBootcamp, setSelectedBootcamp] = useState<Bootcamp | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchBootcamps();
  }, []);

  const fetchBootcamps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("bootcamps")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBootcamps((data as Bootcamp[]) || []);
    } catch (err: any) {
      toast.error("Failed to load bootcamps", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const updateBootcampStatus = async (bootcampId: string, status: BootcampStatus) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("bootcamps")
        .update({
          status,
          admin_notes: adminNotes || null,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", bootcampId);

      if (error) throw error;

      toast.success(`Bootcamp ${status === "approved" ? "approved" : "updated"} successfully`);
      setSelectedBootcamp(null);
      setAdminNotes("");
      fetchBootcamps();
    } catch (err: any) {
      toast.error("Failed to update bootcamp", { description: err.message });
    } finally {
      setProcessing(false);
    }
  };

  const toggleFeatured = async (bootcamp: Bootcamp) => {
    try {
      const { error } = await supabase
        .from("bootcamps")
        .update({ is_featured: !bootcamp.is_featured })
        .eq("id", bootcamp.id);

      if (error) throw error;

      toast.success(bootcamp.is_featured ? "Removed from featured" : "Added to featured");
      fetchBootcamps();
    } catch (err: any) {
      toast.error("Failed to update featured status");
    }
  };

  const filteredBootcamps = bootcamps.filter((b) => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.host_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: bootcamps.length,
    pending: bootcamps.filter((b) => b.status === "pending_approval").length,
    active: bootcamps.filter((b) => b.status === "active").length,
    totalParticipants: bootcamps.reduce((sum, b) => sum + b.current_participants, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bootcamp Management</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bootcamps</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Participants</p>
                <p className="text-2xl font-bold">{stats.totalParticipants}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search bootcamps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending_approval">Pending Approval</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bootcamps Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bootcamp</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredBootcamps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No bootcamps found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBootcamps.map((bootcamp) => (
                  <TableRow key={bootcamp.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {bootcamp.is_featured && (
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        )}
                        <div>
                          <p className="font-medium">{bootcamp.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {bootcamp.duration_days} days
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{bootcamp.host_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {bootcamp.bootcamp_type === "free" ? "Free" : `$${bootcamp.price_amount}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {bootcamp.current_participants} / {bootcamp.max_participants}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[bootcamp.status]}>
                        {bootcamp.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedBootcamp(bootcamp);
                            setAdminNotes(bootcamp.admin_notes || "");
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleFeatured(bootcamp)}
                        >
                          <Star className={`w-4 h-4 ${bootcamp.is_featured ? "text-amber-500 fill-amber-500" : ""}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bootcamp Detail Dialog */}
      <Dialog open={!!selectedBootcamp} onOpenChange={(open) => !open && setSelectedBootcamp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBootcamp?.title}</DialogTitle>
            <DialogDescription>
              Hosted by {selectedBootcamp?.host_name}
            </DialogDescription>
          </DialogHeader>

          {selectedBootcamp && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{selectedBootcamp.duration_days} Days</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className="font-medium">
                    {selectedBootcamp.bootcamp_type === "free" ? "Free" : `Paid ($${selectedBootcamp.price_amount})`}
                  </p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Max Participants</p>
                  <p className="font-medium">{selectedBootcamp.max_participants}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Platform Fee</p>
                  <p className="font-medium">${selectedBootcamp.platform_fee}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Description</p>
                <p className="text-sm text-muted-foreground">
                  {selectedBootcamp.description || "No description provided."}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for this bootcamp..."
                  rows={3}
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBootcamp.status === "pending_approval" && (
                    <>
                      <Button
                        onClick={() => updateBootcampStatus(selectedBootcamp.id, "approved")}
                        disabled={processing}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => updateBootcampStatus(selectedBootcamp.id, "rejected")}
                        disabled={processing}
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </>
                  )}
                  {selectedBootcamp.status === "approved" && (
                    <Button
                      onClick={() => updateBootcampStatus(selectedBootcamp.id, "active")}
                      disabled={processing}
                    >
                      Start Bootcamp
                    </Button>
                  )}
                  {selectedBootcamp.status === "active" && (
                    <Button
                      variant="secondary"
                      onClick={() => updateBootcampStatus(selectedBootcamp.id, "completed")}
                      disabled={processing}
                    >
                      Mark Completed
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBootcamp(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBootcamps;
