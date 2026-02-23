import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { FolderCheck, Send, CheckCircle, Clock, AlertCircle, Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface POWAssignment {
  id: string;
  title: string;
  instructions: string | null;
  xp_reward: number | null;
  is_published: boolean;
  created_at: string;
}

interface POWSubmission {
  id: string;
  assignment_id: string;
  submission_url: string | null;
  submission_text: string | null;
  status: string;
  feedback: string | null;
  xp_awarded: number | null;
  created_at: string;
}

export function PortalProofOfWork() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<POWAssignment[]>([]);
  const [submissions, setSubmissions] = useState<POWSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<POWAssignment | null>(null);
  const [submitUrl, setSubmitUrl] = useState("");
  const [submitText, setSubmitText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchData = async () => {
    if (!user) return;

    const [assignRes, subRes] = await Promise.all([
      supabase
        .from("scholarship_pow_assignments")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false }),
      supabase
        .from("scholarship_pow_submissions")
        .select("*")
        .eq("user_id", user.id),
    ]);

    setAssignments((assignRes.data || []) as unknown as POWAssignment[]);
    setSubmissions((subRes.data || []) as unknown as POWSubmission[]);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const getSubmissionForAssignment = (assignmentId: string) =>
    submissions.find((s) => s.assignment_id === assignmentId);

  const handleSubmit = async () => {
    if (!user || !selectedAssignment || !submitUrl.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("scholarship_pow_submissions").insert({
      assignment_id: selectedAssignment.id,
      user_id: user.id,
      submission_url: submitUrl.trim(),
      submission_text: submitText.trim() || null,
      status: "pending",
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Submitted!", description: "Your proof of work has been submitted for review." });
      setSubmitUrl("");
      setSubmitText("");
      setDialogOpen(false);
      await fetchData();
    }
    setSubmitting(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "revision":
        return <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20"><AlertCircle className="w-3 h-3 mr-1" />Needs Revision</Badge>;
      case "rejected":
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <FolderCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Assignments Yet</h3>
          <p className="text-muted-foreground">
            Portfolio assignments and proof-of-work tasks will appear here when published.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FolderCheck className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Proof of Work</h2>
      </div>

      <div className="space-y-4">
        {assignments.map((assignment) => {
          const submission = getSubmissionForAssignment(assignment.id);

          return (
            <Card key={assignment.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{assignment.title}</CardTitle>
                    {assignment.xp_reward ? (
                      <Badge variant="outline" className="mt-1 text-xs gap-1">
                        +{assignment.xp_reward} XP
                      </Badge>
                    ) : null}
                  </div>
                  {submission && getStatusBadge(submission.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {assignment.instructions && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assignment.instructions}</p>
                )}

                {submission?.feedback && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Feedback:</p>
                    <p className="text-sm">{submission.feedback}</p>
                  </div>
                )}

                {submission?.submission_url && (
                  <a
                    href={submission.submission_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Your Submission
                  </a>
                )}

                {!submission && (
                  <Dialog open={dialogOpen && selectedAssignment?.id === assignment.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) setSelectedAssignment(assignment);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <Send className="w-4 h-4 mr-1" />
                        Submit Work
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Submit: {assignment.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label>Link *</Label>
                          <Input
                            value={submitUrl}
                            onChange={(e) => setSubmitUrl(e.target.value)}
                            placeholder="https://... (X thread, GitHub, Notion, Google Doc, etc.)"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (optional)</Label>
                          <Textarea
                            value={submitText}
                            onChange={(e) => setSubmitText(e.target.value)}
                            placeholder="Brief description of your work..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSubmit} disabled={submitting || !submitUrl.trim()}>
                          {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                          Submit
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

                {submission && submission.status === "revision" && (
                  <Dialog open={dialogOpen && selectedAssignment?.id === assignment.id} onOpenChange={(open) => {
                    setDialogOpen(open);
                    if (open) setSelectedAssignment(assignment);
                  }}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Send className="w-4 h-4 mr-1" />
                        Resubmit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Resubmit: {assignment.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-2">
                        <div className="space-y-2">
                          <Label>Link *</Label>
                          <Input
                            value={submitUrl}
                            onChange={(e) => setSubmitUrl(e.target.value)}
                            placeholder="https://..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Description (optional)</Label>
                          <Textarea
                            value={submitText}
                            onChange={(e) => setSubmitText(e.target.value)}
                            placeholder="Updated description..."
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSubmit} disabled={submitting || !submitUrl.trim()}>
                          {submitting && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                          Resubmit
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
