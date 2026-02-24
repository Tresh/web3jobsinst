import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Rocket, Trophy, Target, ArrowRight, ArrowLeft, Loader2, Settings, Users, FileEdit, Clock, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import LearnFiProgramPortal from "@/components/learnfi/LearnFiProgramPortal";

interface Participation {
  program_id: string;
  total_xp: number;
  missions_completed: number;
  status: string;
  joined_at: string;
}

interface ProgramInfo {
  id: string;
  title: string;
  project_name: string;
  project_logo_url: string | null;
  status: string;
  reward_type: string;
  created_by: string | null;
  participants_count: number;
  edit_allowed: boolean | null;
}

interface EditRequest {
  id: string;
  program_id: string;
  reason: string;
  status: string;
  created_at: string;
}

const REWARD_LABELS: Record<string, string> = { token: "Token", paid: "Paid", xp: "XP", internship: "Internship" };

const DashboardLearnFi = () => {
  const { user } = useAuth();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const [createdPrograms, setCreatedPrograms] = useState<ProgramInfo[]>([]);
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"manage" | "participate">("participate");

  // Edit request dialog
  const [editRequestOpen, setEditRequestOpen] = useState(false);
  const [editRequestReason, setEditRequestReason] = useState("");
  const [editRequestProgramId, setEditRequestProgramId] = useState<string | null>(null);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      const [partsRes, createdRes, editRes] = await Promise.all([
        supabase.from("learnfi_participants").select("program_id, total_xp, missions_completed, status, joined_at").eq("user_id", user.id),
        supabase.from("learnfi_programs").select("id, title, project_name, project_logo_url, status, reward_type, created_by, participants_count, edit_allowed").eq("created_by", user.id),
        supabase.from("learnfi_edit_requests").select("id, program_id, reason, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false }),
      ]);

      const participationData = (partsRes.data || []) as unknown as Participation[];
      setParticipations(participationData);
      setCreatedPrograms((createdRes.data || []) as unknown as ProgramInfo[]);
      setEditRequests((editRes.data || []) as unknown as EditRequest[]);

      if (participationData.length > 0) {
        const ids = participationData.map((p) => p.program_id);
        const { data: progs } = await supabase.from("learnfi_programs")
          .select("id, title, project_name, project_logo_url, status, reward_type, created_by, participants_count, edit_allowed")
          .in("id", ids);
        setPrograms((progs || []) as unknown as ProgramInfo[]);
      }
      setIsLoading(false);
    };
    fetchData();
  }, [user]);

  const submitEditRequest = async () => {
    if (!user || !editRequestProgramId || !editRequestReason.trim()) return;
    setIsSubmittingRequest(true);
    const { error } = await supabase.from("learnfi_edit_requests").insert({
      program_id: editRequestProgramId,
      user_id: user.id,
      reason: editRequestReason.trim(),
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Edit request submitted", description: "Admin will review your request." });
      setEditRequestOpen(false);
      setEditRequestReason("");
      // Refresh edit requests
      const { data } = await supabase.from("learnfi_edit_requests").select("id, program_id, reason, status, created_at").eq("user_id", user.id).order("created_at", { ascending: false });
      setEditRequests((data || []) as unknown as EditRequest[]);
    }
    setIsSubmittingRequest(false);
  };

  if (isLoading) {
    return <div className="p-6 flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (selectedProgramId) {
    const prog = createdPrograms.find(p => p.id === selectedProgramId);
    const isCreator = viewMode === "manage";
    const canEdit = isCreator && prog?.edit_allowed;

    return (
      <div>
        <div className="p-6 pb-0">
          <Button variant="ghost" size="sm" onClick={() => setSelectedProgramId(null)} className="-ml-2 gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Programs
          </Button>
          {isCreator && prog?.status === "live" && !prog.edit_allowed && (
            <div className="mt-3 p-3 bg-secondary rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <FileEdit className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Want to edit this program? Request admin approval first.</span>
              </div>
              <Button size="sm" variant="outline" onClick={() => { setEditRequestProgramId(selectedProgramId); setEditRequestOpen(true); }}>
                Request Edit
              </Button>
            </div>
          )}
          {isCreator && canEdit && (
            <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Edit mode enabled. You can now modify your program.</span>
            </div>
          )}
        </div>
        <LearnFiProgramPortal programId={selectedProgramId} isCreator={isCreator && (canEdit || prog?.status === "pending_approval")} />
      </div>
    );
  }

  const hasCreated = createdPrograms.length > 0;
  const hasParticipated = participations.length > 0;

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My LearnFi Programs</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your learn-to-earn progress and manage your programs</p>
      </div>

      {hasCreated ? (
        <Tabs defaultValue="manage" className="space-y-6" onValueChange={(v) => setViewMode(v as "manage" | "participate")}>
          <TabsList>
            <TabsTrigger value="manage" className="gap-2"><Settings className="w-4 h-4" /> My Programs</TabsTrigger>
            <TabsTrigger value="joined" className="gap-2"><Rocket className="w-4 h-4" /> Joined</TabsTrigger>
          </TabsList>

          <TabsContent value="manage">
            <div className="grid gap-4 md:grid-cols-2">
              {createdPrograms.map((prog) => {
                const progEditReqs = editRequests.filter(r => r.program_id === prog.id);
                const pendingReq = progEditReqs.find(r => r.status === "pending");
                return (
                  <Card key={prog.id} className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer" onClick={() => { setViewMode("manage"); setSelectedProgramId(prog.id); }}>
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {prog.project_logo_url ? <img src={prog.project_logo_url} alt="" className="w-full h-full object-cover" /> : <Rocket className="w-4 h-4 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{prog.title}</h3>
                          <p className="text-xs text-muted-foreground">{prog.project_name}</p>
                        </div>
                        <Badge variant={prog.status === "live" ? "default" : prog.status === "pending_approval" ? "secondary" : "outline"}>
                          {prog.status === "live" ? "Live" : prog.status === "pending_approval" ? "Pending" : prog.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm mb-3">
                        <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" /> {prog.participants_count}</span>
                        <Badge variant="secondary" className="text-xs capitalize">{REWARD_LABELS[prog.reward_type] || prog.reward_type}</Badge>
                        {prog.edit_allowed && <Badge variant="outline" className="text-xs"><FileEdit className="w-3 h-3 mr-1" /> Editable</Badge>}
                      </div>
                      {pendingReq && (
                        <div className="mb-3 p-2 bg-secondary rounded text-xs flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" /> Edit request pending approval
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="w-full" onClick={(e) => e.stopPropagation()}>
                        Manage Program <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="joined">{renderJoinedPrograms()}</TabsContent>
        </Tabs>
      ) : (
        renderJoinedPrograms()
      )}

      {/* Edit Request Dialog */}
      <Dialog open={editRequestOpen} onOpenChange={setEditRequestOpen}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileEdit className="w-5 h-5" /> Request Program Edit</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Explain what you'd like to change. Admin will review and grant edit access if approved.</p>
            <Textarea value={editRequestReason} onChange={(e) => setEditRequestReason(e.target.value)} placeholder="I need to update the reward structure because..." rows={4} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRequestOpen(false)}>Cancel</Button>
            <Button onClick={submitEditRequest} disabled={!editRequestReason.trim() || isSubmittingRequest}>
              {isSubmittingRequest ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  function renderJoinedPrograms() {
    if (!hasParticipated) {
      return (
        <Card className="border-dashed border-border">
          <CardContent className="p-8 text-center">
            <Rocket className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="font-medium text-foreground mb-1">No programs joined yet</p>
            <p className="text-sm text-muted-foreground mb-4">Explore LearnFi programs and start earning</p>
            <Button asChild variant="outline"><Link to="/learnfi">Browse Programs <ArrowRight className="w-4 h-4 ml-1" /></Link></Button>
          </CardContent>
        </Card>
      );
    }
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {participations.map((part) => {
          const prog = programs.find((p) => p.id === part.program_id);
          if (!prog) return null;
          return (
            <Card key={part.program_id} className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer" onClick={() => { setViewMode("participate"); setSelectedProgramId(part.program_id); }}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                    {prog.project_logo_url ? <img src={prog.project_logo_url} alt="" className="w-full h-full object-cover" /> : <Rocket className="w-4 h-4 text-muted-foreground" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{prog.title}</h3>
                    <p className="text-xs text-muted-foreground">{prog.project_name}</p>
                  </div>
                  <Badge variant={prog.status === "live" ? "default" : "secondary"}>{prog.status === "live" ? "Live" : prog.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="flex items-center gap-1 text-primary font-medium"><Trophy className="w-4 h-4" /> {part.total_xp} XP</span>
                  <span className="flex items-center gap-1 text-muted-foreground"><Target className="w-4 h-4" /> {part.missions_completed} missions</span>
                  <Badge variant="secondary" className="text-xs capitalize">{REWARD_LABELS[prog.reward_type] || prog.reward_type}</Badge>
                </div>
                <Button size="sm" variant="outline" className="w-full">Open Program <ArrowRight className="w-3.5 h-3.5 ml-1" /></Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }
};

export default DashboardLearnFi;
