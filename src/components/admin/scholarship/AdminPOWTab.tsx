import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Loader2, FolderCheck, Eye, CheckCircle, XCircle, MessageSquare, ExternalLink, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Assignment {
  id: string;
  title: string;
  instructions: string | null;
  xp_reward: number | null;
  is_published: boolean;
  created_at: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_url: string | null;
  submission_text: string | null;
  status: string;
  feedback: string | null;
  xp_awarded: number | null;
  created_at: string;
}

const defaultAssignmentForm = {
  title: "",
  instructions: "",
  xp_reward: "0",
  is_published: false,
};

export function AdminPOWTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assignDialog, setAssignDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(defaultAssignmentForm);

  // Review dialog
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [submissionFilter, setSubmissionFilter] = useState("pending");

  const fetchData = async () => {
    const [aRes, sRes] = await Promise.all([
      supabase.from("scholarship_pow_assignments").select("*").order("created_at", { ascending: false }),
      supabase.from("scholarship_pow_submissions").select("*").order("created_at", { ascending: false }),
    ]);
    setAssignments((aRes.data || []) as unknown as Assignment[]);
    setSubmissions((sRes.data || []) as unknown as Submission[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultAssignmentForm);
    setAssignDialog(true);
  };

  const openEdit = (a: Assignment) => {
    setEditingId(a.id);
    setForm({
      title: a.title,
      instructions: a.instructions || "",
      xp_reward: String(a.xp_reward || 0),
      is_published: a.is_published,
    });
    setAssignDialog(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setSaving(true);

    const payload = {
      title: form.title,
      instructions: form.instructions || null,
      xp_reward: parseInt(form.xp_reward) || 0,
      is_published: form.is_published,
      created_by: user?.id,
    };

    const { error } = editingId
      ? await supabase.from("scholarship_pow_assignments").update(payload).eq("id", editingId)
      : await supabase.from("scholarship_pow_assignments").insert(payload);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Assignment updated" : "Assignment created" });
      setAssignDialog(false);
      fetchData();
    }
    setSaving(false);
  };

  const handleDeleteAssignment = async (id: string) => {
    const { error } = await supabase.from("scholarship_pow_assignments").delete().eq("id", id);
    if (!error) {
      toast({ title: "Assignment deleted" });
      fetchData();
    }
  };

  const reviewSubmission = async (status: "approved" | "revision" | "rejected") => {
    if (!selectedSub) return;
    setSaving(true);

    const assignment = assignments.find((a) => a.id === selectedSub.assignment_id);
    const xp = status === "approved" ? (assignment?.xp_reward || 0) : null;

    const { error } = await supabase
      .from("scholarship_pow_submissions")
      .update({
        status,
        feedback: feedback || null,
        xp_awarded: xp,
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedSub.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Award XP if approved
      if (status === "approved" && xp && xp > 0) {
        await supabase.rpc("get_scholarship_leaderboard", { p_program_id: "00000000-0000-0000-0000-000000000000" }).then(() => {
          // XP award: update user's total_xp
          supabase
            .from("scholarship_applications")
            .select("total_xp")
            .eq("user_id", selectedSub.user_id)
            .eq("status", "approved")
            .single()
            .then(({ data }) => {
              if (data) {
                supabase
                  .from("scholarship_applications")
                  .update({ total_xp: (data.total_xp || 0) + xp })
                  .eq("user_id", selectedSub.user_id)
                  .eq("status", "approved")
                  .then(() => {});
              }
            });
        });
      }

      toast({ title: `Submission ${status}` });
      setReviewDialog(false);
      setFeedback("");
      fetchData();
    }
    setSaving(false);
  };

  const filteredSubs = submissionFilter === "all"
    ? submissions
    : submissions.filter((s) => s.status === submissionFilter);

  const getAssignmentTitle = (assignmentId: string) =>
    assignments.find((a) => a.id === assignmentId)?.title || "Unknown";

  return (
    <div className="space-y-6">
      {/* Assignments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderCheck className="w-5 h-5" />
                POW Assignments
              </CardTitle>
              <CardDescription>Create assignments for students to submit proof of work</CardDescription>
            </div>
            <Button onClick={openCreate} size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Create Assignment
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>XP Reward</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell>{a.xp_reward || 0} XP</TableCell>
                    <TableCell>
                      <Badge variant={a.is_published ? "default" : "secondary"}>
                        {a.is_published ? "Published" : "Draft"}
                      </Badge>
                    </TableCell>
                    <TableCell>{submissions.filter((s) => s.assignment_id === a.id).length}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button size="sm" variant="outline" onClick={() => openEdit(a)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteAssignment(a.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {assignments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No assignments yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Submissions Review */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>POW Submissions</CardTitle>
              <CardDescription>Review student proof-of-work submissions</CardDescription>
            </div>
            <Select value={submissionFilter} onValueChange={setSubmissionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="revision">Needs Revision</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Assignment</TableHead>
                <TableHead>Submission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{getAssignmentTitle(sub.assignment_id)}</TableCell>
                  <TableCell>
                    {sub.submission_url && (
                      <a href={sub.submission_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1 text-sm">
                        <ExternalLink className="w-3 h-3" />View
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={sub.status === "approved" ? "default" : sub.status === "rejected" ? "destructive" : "secondary"}>
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(sub.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedSub(sub);
                        setFeedback(sub.feedback || "");
                        setReviewDialog(true);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredSubs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No submissions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assignment Create/Edit Dialog */}
      <Dialog open={assignDialog} onOpenChange={setAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Instructions</Label>
              <Textarea value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>XP Reward</Label>
                <Input type="number" value={form.xp_reward} onChange={(e) => setForm({ ...form, xp_reward: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
                <Label>Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {editingId ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-muted-foreground">Assignment</Label>
                <p className="font-medium">{getAssignmentTitle(selectedSub.assignment_id)}</p>
              </div>
              {selectedSub.submission_url && (
                <div>
                  <Label className="text-muted-foreground">Submission Link</Label>
                  <a href={selectedSub.submission_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    {selectedSub.submission_url}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
              {selectedSub.submission_text && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm bg-muted p-2 rounded">{selectedSub.submission_text}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label>Feedback</Label>
                <Textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="Add feedback for the student..." rows={3} />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => reviewSubmission("approved")} disabled={saving}>
                  <CheckCircle className="w-4 h-4 mr-1" />Approve
                </Button>
                <Button variant="outline" onClick={() => reviewSubmission("revision")} disabled={saving}>
                  <MessageSquare className="w-4 h-4 mr-1" />Request Revision
                </Button>
                <Button variant="destructive" onClick={() => reviewSubmission("rejected")} disabled={saving}>
                  <XCircle className="w-4 h-4 mr-1" />Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
