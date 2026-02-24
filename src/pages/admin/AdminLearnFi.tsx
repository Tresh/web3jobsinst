import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  HoverCard, HoverCardContent, HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Search, Plus, Edit, Trash2, Rocket, Users, Eye, CheckCircle, XCircle,
  Loader2, BookOpen, Target, ExternalLink, Globe, DollarSign, Coins,
  Briefcase, FileEdit, Clock,
} from "lucide-react";
import { format } from "date-fns";

interface LearnFiProgramFull {
  id: string;
  title: string;
  project_name: string;
  project_website: string | null;
  description: string | null;
  category: string;
  status: string;
  participants_count: number;
  reward_type: string;
  reward_amount: number | null;
  reward_amount_type: string | null;
  reward_pool_size: number | null;
  reward_token_symbol: string | null;
  reward_distribution_method: string | null;
  token_name: string | null;
  token_contract_address: string | null;
  token_is_stable: boolean | null;
  chain_network: string | null;
  internship_details: string | null;
  leaderboard_tiers: any;
  difficulty: string;
  duration_days: number;
  max_participants: number | null;
  partner_name: string | null;
  partner_email: string | null;
  linked_course_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  edit_allowed: boolean | null;
}

interface LearnFiModule {
  id: string;
  program_id: string;
  title: string;
  description: string | null;
  order_index: number;
  xp_value: number;
  is_published: boolean;
  video_url: string | null;
  video_duration: string | null;
  cover_image_url: string | null;
}

interface LearnFiMission {
  id: string;
  program_id: string;
  module_id: string | null;
  title: string;
  description: string | null;
  xp_value: number;
  is_published: boolean;
  order_index: number;
  external_link: string | null;
}

interface Submission {
  id: string;
  mission_id: string;
  user_id: string;
  submission_url: string | null;
  submission_text: string | null;
  status: string;
  xp_awarded: number | null;
  created_at: string;
}

interface EditRequest {
  id: string;
  program_id: string;
  user_id: string;
  reason: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
}

interface ProfileInfo {
  user_id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

// User hover card component
const UserHoverCard = ({ userId, profiles, children }: { userId: string; profiles: ProfileInfo[]; children: React.ReactNode }) => {
  const p = profiles.find(pr => pr.user_id === userId);
  if (!p) return <>{children}</>;
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <span className="cursor-pointer hover:underline text-primary">{children}</span>
      </HoverCardTrigger>
      <HoverCardContent className="w-64">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={p.avatar_url || undefined} />
            <AvatarFallback>{p.full_name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{p.full_name || "Unknown"}</p>
            <p className="text-xs text-muted-foreground truncate">{p.email}</p>
          </div>
        </div>
        <div className="mt-2">
          <a href={`/admin/users/${userId}`} className="text-xs text-primary hover:underline flex items-center gap-1">
            View Full Profile <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

const AdminLearnFi = () => {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<LearnFiProgramFull[]>([]);
  const [profiles, setProfiles] = useState<ProfileInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [modules, setModules] = useState<LearnFiModule[]>([]);
  const [missions, setMissions] = useState<LearnFiMission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [editRequests, setEditRequests] = useState<EditRequest[]>([]);
  const [activeTab, setActiveTab] = useState("details");

  // Program detail dialog
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingProgram, setViewingProgram] = useState<LearnFiProgramFull | null>(null);

  // Editing program
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  // Module/mission dialogs
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<LearnFiModule | null>(null);
  const [editingMission, setEditingMission] = useState<LearnFiMission | null>(null);
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", order_index: "0", xp_value: "0", video_url: "", video_duration: "", cover_image_url: "" });
  const [missionForm, setMissionForm] = useState({ title: "", description: "", xp_value: "10", order_index: "0", external_link: "", module_id: "" });

  useEffect(() => { fetchPrograms(); }, []);

  useEffect(() => {
    if (selectedProgram) fetchProgramDetails(selectedProgram);
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    const [progRes, profileRes] = await Promise.all([
      supabase.from("learnfi_programs").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("user_id, full_name, email, avatar_url"),
    ]);
    setPrograms((progRes.data || []) as unknown as LearnFiProgramFull[]);
    setProfiles((profileRes.data || []) as unknown as ProfileInfo[]);
    setIsLoading(false);
  };

  const fetchProgramDetails = async (programId: string) => {
    const [modRes, misRes, subRes, editRes] = await Promise.all([
      supabase.from("learnfi_modules").select("*").eq("program_id", programId).order("order_index"),
      supabase.from("learnfi_missions").select("*").eq("program_id", programId).order("order_index"),
      supabase.from("learnfi_mission_submissions").select("*").eq("program_id", programId).order("created_at", { ascending: false }),
      supabase.from("learnfi_edit_requests").select("*").eq("program_id", programId).order("created_at", { ascending: false }),
    ]);
    setModules((modRes.data || []) as unknown as LearnFiModule[]);
    setMissions((misRes.data || []) as unknown as LearnFiMission[]);
    setSubmissions((subRes.data || []) as unknown as Submission[]);
    setEditRequests((editRes.data || []) as unknown as EditRequest[]);
  };

  const updateProgramStatus = async (programId: string, status: string) => {
    const { error } = await supabase.from("learnfi_programs").update({ status }).eq("id", programId);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: `Program ${status}` }); fetchPrograms(); }
  };

  const handleEditProgram = (prog: LearnFiProgramFull) => {
    setEditForm({
      title: prog.title,
      project_name: prog.project_name,
      project_website: prog.project_website || "",
      description: prog.description || "",
      category: prog.category,
      difficulty: prog.difficulty,
      duration_days: String(prog.duration_days),
      reward_type: prog.reward_type,
      reward_amount: prog.reward_amount ? String(prog.reward_amount) : "",
      max_participants: prog.max_participants ? String(prog.max_participants) : "",
      status: prog.status,
    });
    setEditDialogOpen(true);
  };

  const saveEditProgram = async () => {
    if (!viewingProgram) return;
    const { error } = await supabase.from("learnfi_programs").update({
      title: editForm.title,
      project_name: editForm.project_name,
      project_website: editForm.project_website || null,
      description: editForm.description || null,
      category: editForm.category,
      difficulty: editForm.difficulty,
      duration_days: parseInt(editForm.duration_days) || 30,
      reward_amount: parseFloat(editForm.reward_amount) || null,
      max_participants: parseInt(editForm.max_participants) || null,
      status: editForm.status,
    }).eq("id", viewingProgram.id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Program updated" }); setEditDialogOpen(false); fetchPrograms(); }
  };

  const handleEditRequest = async (requestId: string, approved: boolean) => {
    const programId = editRequests.find(r => r.id === requestId)?.program_id;
    const { error } = await supabase.from("learnfi_edit_requests").update({
      status: approved ? "approved" : "rejected",
      reviewed_by: user?.id,
      reviewed_at: new Date().toISOString(),
    }).eq("id", requestId);

    if (!error && approved && programId) {
      await supabase.from("learnfi_programs").update({ edit_allowed: true }).eq("id", programId);
    }

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: approved ? "Edit approved" : "Edit rejected" }); if (selectedProgram) fetchProgramDetails(selectedProgram); }
  };

  const handleSaveModule = async () => {
    if (!selectedProgram || !moduleForm.title) return;
    const payload = {
      program_id: selectedProgram, title: moduleForm.title, description: moduleForm.description || null,
      order_index: parseInt(moduleForm.order_index) || 0, xp_value: parseInt(moduleForm.xp_value) || 0,
      video_url: moduleForm.video_url || null, video_duration: moduleForm.video_duration || null,
      cover_image_url: moduleForm.cover_image_url || null, is_published: true,
    };
    if (editingModule) await supabase.from("learnfi_modules").update(payload).eq("id", editingModule.id);
    else await supabase.from("learnfi_modules").insert(payload);
    setModuleDialogOpen(false); setEditingModule(null);
    setModuleForm({ title: "", description: "", order_index: "0", xp_value: "0", video_url: "", video_duration: "", cover_image_url: "" });
    fetchProgramDetails(selectedProgram); toast({ title: "Saved" });
  };

  const handleSaveMission = async () => {
    if (!selectedProgram || !missionForm.title) return;
    const payload = {
      program_id: selectedProgram, title: missionForm.title, description: missionForm.description || null,
      xp_value: parseInt(missionForm.xp_value) || 10, order_index: parseInt(missionForm.order_index) || 0,
      external_link: missionForm.external_link || null, module_id: missionForm.module_id || null, is_published: true,
    };
    if (editingMission) await supabase.from("learnfi_missions").update(payload).eq("id", editingMission.id);
    else await supabase.from("learnfi_missions").insert(payload);
    setMissionDialogOpen(false); setEditingMission(null);
    setMissionForm({ title: "", description: "", xp_value: "10", order_index: "0", external_link: "", module_id: "" });
    fetchProgramDetails(selectedProgram); toast({ title: "Saved" });
  };

  const handleReviewSubmission = async (subId: string, status: string, xpValue: number) => {
    const update: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: user?.id };
    if (status === "approved") update.xp_awarded = xpValue;
    await supabase.from("learnfi_mission_submissions").update(update).eq("id", subId);
    if (selectedProgram) fetchProgramDetails(selectedProgram);
    toast({ title: `Submission ${status}` });
  };

  const deleteModule = async (id: string) => { await supabase.from("learnfi_modules").delete().eq("id", id); if (selectedProgram) fetchProgramDetails(selectedProgram); };
  const deleteMission = async (id: string) => { await supabase.from("learnfi_missions").delete().eq("id", id); if (selectedProgram) fetchProgramDetails(selectedProgram); };

  const filtered = programs.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      live: "default", pending_approval: "secondary", coming_soon: "outline", closed: "secondary",
    };
    return <Badge variant={(map[status] || "secondary") as any}>{status.replace("_", " ")}</Badge>;
  };

  const getCreatorName = (createdBy: string | null) => {
    if (!createdBy) return "Platform";
    const p = profiles.find(pr => pr.user_id === createdBy);
    return p?.full_name || "Unknown";
  };

  const rewardIcon = (type: string) => {
    if (type === "token") return <Coins className="w-4 h-4" />;
    if (type === "paid") return <DollarSign className="w-4 h-4" />;
    if (type === "internship") return <Briefcase className="w-4 h-4" />;
    return <Target className="w-4 h-4" />;
  };

  // ════════════════════════════════════════
  // Program Detail View
  // ════════════════════════════════════════
  if (selectedProgram) {
    const prog = programs.find((p) => p.id === selectedProgram);
    const pendingEdits = editRequests.filter(r => r.status === "pending");

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedProgram(null); setActiveTab("details"); }} className="mb-2">← Back to Programs</Button>
            <h1 className="text-2xl font-bold">{prog?.title || "Program"}</h1>
            <p className="text-sm text-muted-foreground">{prog?.project_name} · Created by {prog?.created_by ? (
              <UserHoverCard userId={prog.created_by} profiles={profiles}>{getCreatorName(prog.created_by)}</UserHoverCard>
            ) : "Platform"}</p>
          </div>
          <div className="flex gap-2">
            {prog && <Button variant="outline" size="sm" onClick={() => { setViewingProgram(prog); handleEditProgram(prog); }}><Edit className="w-4 h-4 mr-1" /> Edit</Button>}
          </div>
        </div>

        {pendingEdits.length > 0 && (
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-4">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2"><FileEdit className="w-4 h-4" /> Pending Edit Requests ({pendingEdits.length})</h3>
              {pendingEdits.map(req => (
                <div key={req.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm"><UserHoverCard userId={req.user_id} profiles={profiles}>{getCreatorName(req.user_id)}</UserHoverCard></p>
                    <p className="text-xs text-muted-foreground">{req.reason}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(req.created_at), "PPp")}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" onClick={() => handleEditRequest(req.id, true)}><CheckCircle className="w-3 h-3 mr-1" /> Allow Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleEditRequest(req.id, false)}><XCircle className="w-3 h-3 mr-1" /> Deny</Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="modules">Modules ({modules.length})</TabsTrigger>
            <TabsTrigger value="missions">Missions ({missions.length})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
            <TabsTrigger value="edit-requests">Edit Requests ({editRequests.length})</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            {prog && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-foreground">Program Info</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Title:</span><p className="font-medium">{prog.title}</p></div>
                      <div><span className="text-muted-foreground">Project:</span><p className="font-medium">{prog.project_name}</p></div>
                      <div><span className="text-muted-foreground">Category:</span><p className="font-medium capitalize">{prog.category}</p></div>
                      <div><span className="text-muted-foreground">Difficulty:</span><p className="font-medium capitalize">{prog.difficulty}</p></div>
                      <div><span className="text-muted-foreground">Duration:</span><p className="font-medium">{prog.duration_days} days</p></div>
                      <div><span className="text-muted-foreground">Status:</span>{getStatusBadge(prog.status)}</div>
                      <div><span className="text-muted-foreground">Participants:</span><p className="font-medium">{prog.participants_count}{prog.max_participants ? ` / ${prog.max_participants}` : ""}</p></div>
                      <div><span className="text-muted-foreground">Created:</span><p className="font-medium">{format(new Date(prog.created_at), "PPp")}</p></div>
                    </div>
                    {prog.project_website && (
                      <a href={prog.project_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline">
                        <Globe className="w-3 h-3" /> {prog.project_website}
                      </a>
                    )}
                    {prog.description && <p className="text-sm text-muted-foreground border-t border-border pt-3">{prog.description}</p>}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="font-semibold text-foreground">Creator & Reward</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-muted-foreground">Partner Name:</span><p className="font-medium">{prog.partner_name || "—"}</p></div>
                      <div><span className="text-muted-foreground">Partner Email:</span><p className="font-medium">{prog.partner_email || "—"}</p></div>
                      <div><span className="text-muted-foreground">Reward Type:</span><p className="font-medium capitalize flex items-center gap-1">{rewardIcon(prog.reward_type)} {prog.reward_type}</p></div>
                      {prog.reward_amount && <div><span className="text-muted-foreground">Amount:</span><p className="font-medium">{prog.reward_amount} {prog.reward_amount_type === "per_participant" ? "(per person)" : "(total)"}</p></div>}
                      {prog.reward_token_symbol && <div><span className="text-muted-foreground">Token:</span><p className="font-medium">{prog.reward_token_symbol} ({prog.token_name || ""})</p></div>}
                      {prog.chain_network && <div><span className="text-muted-foreground">Chain:</span><p className="font-medium">{prog.chain_network}</p></div>}
                      {prog.token_contract_address && <div className="col-span-2"><span className="text-muted-foreground">Contract:</span><p className="font-medium text-xs break-all">{prog.token_contract_address}</p></div>}
                    </div>
                    {prog.internship_details && (
                      <div className="border-t border-border pt-3 text-sm">
                        <span className="text-muted-foreground">Internship Details:</span>
                        <p className="mt-1">{prog.internship_details}</p>
                      </div>
                    )}
                    {prog.leaderboard_tiers && Array.isArray(prog.leaderboard_tiers) && prog.leaderboard_tiers.length > 0 && (
                      <div className="border-t border-border pt-3">
                        <span className="text-sm text-muted-foreground">Leaderboard Tiers:</span>
                        <div className="mt-1 space-y-1">
                          {(prog.leaderboard_tiers as any[]).map((tier: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Badge variant="outline">#{tier.rank_from === tier.rank_to ? tier.rank_from : `${tier.rank_from}-${tier.rank_to}`}</Badge>
                              <span className="font-medium">{tier.amount} {prog.reward_token_symbol || "tokens"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <Button size="sm" onClick={() => { setEditingModule(null); setModuleForm({ title: "", description: "", order_index: String(modules.length), xp_value: "0", video_url: "", video_duration: "", cover_image_url: "" }); setModuleDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Module
            </Button>
            <div className="space-y-2">
              {modules.map((mod) => (
                <Card key={mod.id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{mod.order_index + 1}. {mod.title}</p>
                      <p className="text-xs text-muted-foreground">{mod.xp_value} XP · {mod.is_published ? "Published" : "Draft"}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingModule(mod); setModuleForm({ title: mod.title, description: mod.description || "", order_index: String(mod.order_index), xp_value: String(mod.xp_value), video_url: mod.video_url || "", video_duration: mod.video_duration || "", cover_image_url: mod.cover_image_url || "" }); setModuleDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteModule(mod.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Missions Tab */}
          <TabsContent value="missions" className="space-y-4">
            <Button size="sm" onClick={() => { setEditingMission(null); setMissionForm({ title: "", description: "", xp_value: "10", order_index: String(missions.length), external_link: "", module_id: "" }); setMissionDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-1" /> Add Mission
            </Button>
            <div className="space-y-2">
              {missions.map((mis) => (
                <Card key={mis.id} className="bg-card border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{mis.title}</p>
                      <p className="text-xs text-muted-foreground">{mis.xp_value} XP · {mis.is_published ? "Published" : "Draft"}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingMission(mis); setMissionForm({ title: mis.title, description: mis.description || "", xp_value: String(mis.xp_value), order_index: String(mis.order_index), external_link: mis.external_link || "", module_id: mis.module_id || "" }); setMissionDialogOpen(true); }}><Edit className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMission(mis.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader><TableRow>
                  <TableHead>User</TableHead><TableHead>Mission</TableHead><TableHead>Submission</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                </TableRow></TableHeader>
                <TableBody>
                  {submissions.map((sub) => {
                    const mission = missions.find((m) => m.id === sub.mission_id);
                    return (
                      <TableRow key={sub.id}>
                        <TableCell><UserHoverCard userId={sub.user_id} profiles={profiles}>{getCreatorName(sub.user_id)}</UserHoverCard></TableCell>
                        <TableCell className="font-medium">{mission?.title || "—"}</TableCell>
                        <TableCell>
                          {sub.submission_url && <a href={sub.submission_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Link</a>}
                          {sub.submission_text && <p className="text-sm text-muted-foreground line-clamp-1">{sub.submission_text}</p>}
                        </TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell className="text-right">
                          {sub.status === "pending" && (
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="outline" onClick={() => handleReviewSubmission(sub.id, "approved", mission?.xp_value || 10)}><CheckCircle className="w-3 h-3 mr-1" /> Approve</Button>
                              <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleReviewSubmission(sub.id, "rejected", 0)}><XCircle className="w-3 h-3 mr-1" /> Reject</Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {submissions.length === 0 && <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No submissions yet</TableCell></TableRow>}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Edit Requests Tab */}
          <TabsContent value="edit-requests">
            <div className="space-y-2">
              {editRequests.map(req => (
                <Card key={req.id} className="border-border">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium"><UserHoverCard userId={req.user_id} profiles={profiles}>{getCreatorName(req.user_id)}</UserHoverCard></p>
                      <p className="text-sm text-muted-foreground">{req.reason}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(req.created_at), "PPp")} · {getStatusBadge(req.status)}</p>
                    </div>
                    {req.status === "pending" && (
                      <div className="flex gap-1">
                        <Button size="sm" onClick={() => handleEditRequest(req.id, true)}><CheckCircle className="w-3 h-3 mr-1" /> Allow</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleEditRequest(req.id, false)}><XCircle className="w-3 h-3 mr-1" /> Deny</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {editRequests.length === 0 && <p className="text-center py-8 text-muted-foreground">No edit requests</p>}
            </div>
          </TabsContent>
        </Tabs>

        {/* Module Dialog */}
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogContent className="bg-background border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingModule ? "Edit Module" : "Add Module"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={moduleForm.title} onChange={(e) => setModuleForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={moduleForm.description} onChange={(e) => setModuleForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
              <div><Label>Video URL</Label><Input value={moduleForm.video_url} onChange={(e) => setModuleForm(p => ({ ...p, video_url: e.target.value }))} placeholder="https://..." /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Duration</Label><Input value={moduleForm.video_duration} onChange={(e) => setModuleForm(p => ({ ...p, video_duration: e.target.value }))} placeholder="12:30" /></div>
                <div><Label>XP</Label><Input type="number" value={moduleForm.xp_value} onChange={(e) => setModuleForm(p => ({ ...p, xp_value: e.target.value }))} /></div>
              </div>
              <div><Label>Cover Image URL</Label><Input value={moduleForm.cover_image_url} onChange={(e) => setModuleForm(p => ({ ...p, cover_image_url: e.target.value }))} /></div>
              <div><Label>Order</Label><Input type="number" value={moduleForm.order_index} onChange={(e) => setModuleForm(p => ({ ...p, order_index: e.target.value }))} /></div>
              <Button onClick={handleSaveModule} className="w-full">Save Module</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mission Dialog */}
        <Dialog open={missionDialogOpen} onOpenChange={setMissionDialogOpen}>
          <DialogContent className="bg-background border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editingMission ? "Edit Mission" : "Add Mission"}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={missionForm.title} onChange={(e) => setMissionForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={missionForm.description} onChange={(e) => setMissionForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
              <div><Label>External Link</Label><Input value={missionForm.external_link} onChange={(e) => setMissionForm(p => ({ ...p, external_link: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>XP</Label><Input type="number" value={missionForm.xp_value} onChange={(e) => setMissionForm(p => ({ ...p, xp_value: e.target.value }))} /></div>
                <div><Label>Order</Label><Input type="number" value={missionForm.order_index} onChange={(e) => setMissionForm(p => ({ ...p, order_index: e.target.value }))} /></div>
              </div>
              {modules.length > 0 && (
                <div><Label>Linked Module</Label>
                  <Select value={missionForm.module_id || "none"} onValueChange={(v) => setMissionForm(p => ({ ...p, module_id: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent><SelectItem value="none">None</SelectItem>{modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleSaveMission} className="w-full">Save Mission</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Program Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-background border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Edit Program</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={editForm.title || ""} onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Project Name</Label><Input value={editForm.project_name || ""} onChange={(e) => setEditForm(p => ({ ...p, project_name: e.target.value }))} /></div>
              <div><Label>Website</Label><Input value={editForm.project_website || ""} onChange={(e) => setEditForm(p => ({ ...p, project_website: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={editForm.description || ""} onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Category</Label>
                  <Select value={editForm.category || "general"} onValueChange={(v) => setEditForm(p => ({ ...p, category: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem><SelectItem value="web3">Web3</SelectItem>
                      <SelectItem value="ai">AI</SelectItem><SelectItem value="defi">DeFi</SelectItem>
                      <SelectItem value="development">Development</SelectItem><SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Status</Label>
                  <Select value={editForm.status || "pending_approval"} onValueChange={(v) => setEditForm(p => ({ ...p, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending_approval">Pending</SelectItem><SelectItem value="live">Live</SelectItem>
                      <SelectItem value="coming_soon">Coming Soon</SelectItem><SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Duration (days)</Label><Input type="number" value={editForm.duration_days || ""} onChange={(e) => setEditForm(p => ({ ...p, duration_days: e.target.value }))} /></div>
                <div><Label>Max Participants</Label><Input type="number" value={editForm.max_participants || ""} onChange={(e) => setEditForm(p => ({ ...p, max_participants: e.target.value }))} /></div>
              </div>
              <Button onClick={saveEditProgram} className="w-full">Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ════════════════════════════════════════
  // Programs List View
  // ════════════════════════════════════════
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">LearnFi Management</h1>
          <p className="text-muted-foreground mt-1">Manage programs, modules, missions & submissions</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search programs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Badge variant="secondary">{filtered.length} programs</Badge>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Program</TableHead>
              <TableHead className="hidden sm:table-cell">Creator</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead className="hidden md:table-cell">Participants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {filtered.map((prog) => (
                <TableRow key={prog.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center"><Rocket className="h-5 w-5 text-muted-foreground" /></div>
                      <div><p className="font-medium">{prog.title}</p><p className="text-xs text-muted-foreground">{prog.project_name}</p></div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {prog.created_by ? (
                      <UserHoverCard userId={prog.created_by} profiles={profiles}>
                        <span className="text-sm">{getCreatorName(prog.created_by)}</span>
                      </UserHoverCard>
                    ) : <span className="text-sm text-muted-foreground">Platform</span>}
                  </TableCell>
                  <TableCell><span className="flex items-center gap-1 capitalize text-sm">{rewardIcon(prog.reward_type)} {prog.reward_type}</span></TableCell>
                  <TableCell className="hidden md:table-cell"><Users className="inline w-4 h-4 mr-1" />{prog.participants_count}</TableCell>
                  <TableCell>{getStatusBadge(prog.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setSelectedProgram(prog.id); setActiveTab("details"); }}><Eye className="w-4 h-4" /></Button>
                      {prog.status === "pending_approval" && <Button variant="ghost" size="sm" onClick={() => updateProgramStatus(prog.id, "live")}>Approve</Button>}
                      {prog.status === "live" && <Button variant="ghost" size="sm" onClick={() => updateProgramStatus(prog.id, "closed")}>Close</Button>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground"><Rocket className="h-8 w-8 mx-auto mb-2 opacity-50" />No programs found</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AdminLearnFi;
