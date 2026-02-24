import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen, Loader2, CheckCircle, XCircle, Clock, Eye, Search, Users, Trash2, ExternalLink,
} from "lucide-react";
import { format } from "date-fns";

interface TutorApplication {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  expertise: string;
  experience: string;
  portfolio_url: string | null;
  pitch: string;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

const expertiseLabels: Record<string, string> = {
  development: "Web3 Development",
  trading: "Trading & DeFi",
  marketing: "Marketing & Growth",
  content: "Content Creation",
  design: "Design & UI/UX",
  ai: "AI & Automation",
  other: "Other",
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pending", variant: "secondary" },
  approved: { label: "Approved", variant: "default" },
  rejected: { label: "Rejected", variant: "destructive" },
};

const AdminTutors = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<TutorApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<TutorApplication | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplications = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tutor_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setApplications((data as unknown as TutorApplication[]) || []);
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchApplications(); }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    const updateData: Record<string, unknown> = {
      status: newStatus,
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    };
    if (adminNotes.trim()) updateData.admin_notes = adminNotes.trim();

    const { error } = await supabase.from("tutor_applications").update(updateData).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Application ${newStatus}` });
      setSelected(null);
      setAdminNotes("");
      fetchApplications();
    }
    setIsUpdating(false);
  };

  const deleteApplication = async (id: string) => {
    const { error } = await supabase.from("tutor_applications").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Application deleted" });
      setSelected(null);
      fetchApplications();
    }
  };

  const filtered = applications.filter((app) => {
    if (statusFilter !== "all" && app.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return app.full_name.toLowerCase().includes(q) || app.email.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    approved: applications.filter((a) => a.status === "approved").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tutor Applications</h1>
          <p className="text-muted-foreground">Manage tutor applications and approvals</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4 text-center"><Users className="w-5 h-5 mx-auto mb-1 text-muted-foreground" /><p className="text-2xl font-bold">{counts.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><Clock className="w-5 h-5 mx-auto mb-1 text-warning" /><p className="text-2xl font-bold">{counts.pending}</p><p className="text-xs text-muted-foreground">Pending</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><CheckCircle className="w-5 h-5 mx-auto mb-1 text-primary" /><p className="text-2xl font-bold">{counts.approved}</p><p className="text-xs text-muted-foreground">Approved</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><XCircle className="w-5 h-5 mx-auto mb-1 text-destructive" /><p className="text-2xl font-bold">{counts.rejected}</p><p className="text-xs text-muted-foreground">Rejected</p></CardContent></Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No applications found.</CardContent></Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Expertise</TableHead>
                <TableHead className="hidden md:table-cell">Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{app.full_name}</p>
                      <p className="text-xs text-muted-foreground">{app.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{expertiseLabels[app.expertise] || app.expertise}</TableCell>
                  <TableCell className="hidden md:table-cell">{app.experience}</TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[app.status]?.variant || "secondary"}>
                      {statusConfig[app.status]?.label || app.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">{format(new Date(app.created_at), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => { setSelected(app); setAdminNotes(app.admin_notes || ""); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" /> {selected.full_name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{selected.email}</p></div>
                  <div><span className="text-muted-foreground">Expertise:</span><p className="font-medium">{expertiseLabels[selected.expertise] || selected.expertise}</p></div>
                  <div><span className="text-muted-foreground">Experience:</span><p className="font-medium">{selected.experience} years</p></div>
                  <div><span className="text-muted-foreground">Status:</span><Badge variant={statusConfig[selected.status]?.variant || "secondary"}>{statusConfig[selected.status]?.label || selected.status}</Badge></div>
                </div>
                {selected.portfolio_url && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Portfolio:</span>
                    <a href={selected.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      {selected.portfolio_url} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="text-sm">
                  <span className="text-muted-foreground">Pitch:</span>
                  <p className="mt-1 p-3 bg-secondary rounded-md">{selected.pitch}</p>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Applied:</span>
                  <p>{format(new Date(selected.created_at), "PPP 'at' p")}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Admin Notes</span>
                  <Textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} placeholder="Add notes about this applicant..." rows={3} className="mt-1" />
                </div>
              </div>
              <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                {selected.status !== "approved" && (
                  <Button onClick={() => updateStatus(selected.id, "approved")} disabled={isUpdating} className="flex-1">
                    <CheckCircle className="w-4 h-4 mr-1" /> Approve
                  </Button>
                )}
                {selected.status !== "rejected" && (
                  <Button variant="destructive" onClick={() => updateStatus(selected.id, "rejected")} disabled={isUpdating} className="flex-1">
                    <XCircle className="w-4 h-4 mr-1" /> Reject
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={() => deleteApplication(selected.id)} disabled={isUpdating}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTutors;
