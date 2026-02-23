import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
  Search, Plus, Edit, Trash2, Rocket, Users, Eye, CheckCircle, XCircle,
  Loader2, BookOpen, Target,
} from "lucide-react";

interface LearnFiProgram {
  id: string;
  title: string;
  project_name: string;
  category: string;
  status: string;
  participants_count: number;
  reward_type: string;
  created_at: string;
}

interface LearnFiModule {
  id: string;
  program_id: string;
  title: string;
  description: string | null;
  order_index: number;
  xp_value: number;
  is_published: boolean;
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

const AdminLearnFi = () => {
  const [programs, setPrograms] = useState<LearnFiProgram[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [modules, setModules] = useState<LearnFiModule[]>([]);
  const [missions, setMissions] = useState<LearnFiMission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTab, setActiveTab] = useState("programs");

  // Dialog states
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [missionDialogOpen, setMissionDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<LearnFiModule | null>(null);
  const [editingMission, setEditingMission] = useState<LearnFiMission | null>(null);

  // Module form
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", order_index: "0", xp_value: "0" });
  // Mission form
  const [missionForm, setMissionForm] = useState({ title: "", description: "", xp_value: "10", order_index: "0", external_link: "", module_id: "" });

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgram) {
      fetchProgramDetails(selectedProgram);
    }
  }, [selectedProgram]);

  const fetchPrograms = async () => {
    const { data } = await supabase.from("learnfi_programs").select("*").order("created_at", { ascending: false });
    setPrograms((data || []) as unknown as LearnFiProgram[]);
    setIsLoading(false);
  };

  const fetchProgramDetails = async (programId: string) => {
    const [modRes, misRes, subRes] = await Promise.all([
      supabase.from("learnfi_modules").select("*").eq("program_id", programId).order("order_index"),
      supabase.from("learnfi_missions").select("*").eq("program_id", programId).order("order_index"),
      supabase.from("learnfi_mission_submissions").select("*").eq("program_id", programId).order("created_at", { ascending: false }),
    ]);
    setModules((modRes.data || []) as unknown as LearnFiModule[]);
    setMissions((misRes.data || []) as unknown as LearnFiMission[]);
    setSubmissions((subRes.data || []) as unknown as Submission[]);
  };

  const updateProgramStatus = async (programId: string, status: string) => {
    const { error } = await supabase.from("learnfi_programs").update({ status }).eq("id", programId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Program status set to ${status}` });
      fetchPrograms();
    }
  };

  const handleSaveModule = async () => {
    if (!selectedProgram || !moduleForm.title) return;
    const payload = {
      program_id: selectedProgram,
      title: moduleForm.title,
      description: moduleForm.description || null,
      order_index: parseInt(moduleForm.order_index) || 0,
      xp_value: parseInt(moduleForm.xp_value) || 0,
      is_published: true,
    };
    if (editingModule) {
      await supabase.from("learnfi_modules").update(payload).eq("id", editingModule.id);
    } else {
      await supabase.from("learnfi_modules").insert(payload);
    }
    setModuleDialogOpen(false);
    setEditingModule(null);
    setModuleForm({ title: "", description: "", order_index: "0", xp_value: "0" });
    fetchProgramDetails(selectedProgram);
    toast({ title: "Saved" });
  };

  const handleSaveMission = async () => {
    if (!selectedProgram || !missionForm.title) return;
    const payload = {
      program_id: selectedProgram,
      title: missionForm.title,
      description: missionForm.description || null,
      xp_value: parseInt(missionForm.xp_value) || 10,
      order_index: parseInt(missionForm.order_index) || 0,
      external_link: missionForm.external_link || null,
      module_id: missionForm.module_id || null,
      is_published: true,
    };
    if (editingMission) {
      await supabase.from("learnfi_missions").update(payload).eq("id", editingMission.id);
    } else {
      await supabase.from("learnfi_missions").insert(payload);
    }
    setMissionDialogOpen(false);
    setEditingMission(null);
    setMissionForm({ title: "", description: "", xp_value: "10", order_index: "0", external_link: "", module_id: "" });
    fetchProgramDetails(selectedProgram);
    toast({ title: "Saved" });
  };

  const handleReviewSubmission = async (subId: string, status: string, xpValue: number) => {
    const update: any = { status, reviewed_at: new Date().toISOString() };
    if (status === "approved") update.xp_awarded = xpValue;
    await supabase.from("learnfi_mission_submissions").update(update).eq("id", subId);
    if (selectedProgram) fetchProgramDetails(selectedProgram);
    toast({ title: `Submission ${status}` });
  };

  const deleteModule = async (id: string) => {
    await supabase.from("learnfi_modules").delete().eq("id", id);
    if (selectedProgram) fetchProgramDetails(selectedProgram);
  };

  const deleteMission = async (id: string) => {
    await supabase.from("learnfi_missions").delete().eq("id", id);
    if (selectedProgram) fetchProgramDetails(selectedProgram);
  };

  const filtered = programs.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.project_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      live: "bg-green-500/10 text-green-400",
      pending_approval: "bg-amber-500/10 text-amber-400",
      coming_soon: "bg-blue-500/10 text-blue-400",
      closed: "bg-muted text-muted-foreground",
    };
    return <Badge className={styles[status] || ""}>{status.replace("_", " ")}</Badge>;
  };

  if (selectedProgram) {
    const prog = programs.find((p) => p.id === selectedProgram);
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedProgram(null)} className="mb-2">
              ← Back to Programs
            </Button>
            <h1 className="text-2xl font-bold">{prog?.title || "Program"}</h1>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="modules">Modules ({modules.length})</TabsTrigger>
            <TabsTrigger value="missions">Missions ({missions.length})</TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
          </TabsList>

          {/* Modules Tab */}
          <TabsContent value="modules" className="space-y-4">
            <Button size="sm" onClick={() => { setEditingModule(null); setModuleForm({ title: "", description: "", order_index: String(modules.length), xp_value: "0" }); setModuleDialogOpen(true); }}>
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
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingModule(mod);
                        setModuleForm({ title: mod.title, description: mod.description || "", order_index: String(mod.order_index), xp_value: String(mod.xp_value) });
                        setModuleDialogOpen(true);
                      }}><Edit className="w-4 h-4" /></Button>
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
                      <Button variant="ghost" size="icon" onClick={() => {
                        setEditingMission(mis);
                        setMissionForm({ title: mis.title, description: mis.description || "", xp_value: String(mis.xp_value), order_index: String(mis.order_index), external_link: mis.external_link || "", module_id: mis.module_id || "" });
                        setMissionDialogOpen(true);
                      }}><Edit className="w-4 h-4" /></Button>
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
                <TableHeader>
                  <TableRow>
                    <TableHead>Mission</TableHead>
                    <TableHead>Submission</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => {
                    const mission = missions.find((m) => m.id === sub.mission_id);
                    return (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{mission?.title || "—"}</TableCell>
                        <TableCell>
                          {sub.submission_url && <a href={sub.submission_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">Link</a>}
                          {sub.submission_text && <p className="text-sm text-muted-foreground line-clamp-1">{sub.submission_text}</p>}
                        </TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell className="text-right">
                          {sub.status === "pending" && (
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="outline" className="text-green-500" onClick={() => handleReviewSubmission(sub.id, "approved", mission?.xp_value || 10)}>
                                <CheckCircle className="w-3 h-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleReviewSubmission(sub.id, "rejected", 0)}>
                                <XCircle className="w-3 h-3 mr-1" /> Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {submissions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No submissions yet</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Module Dialog */}
        <Dialog open={moduleDialogOpen} onOpenChange={setModuleDialogOpen}>
          <DialogContent className="bg-background border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingModule ? "Edit Module" : "Add Module"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={moduleForm.title} onChange={(e) => setModuleForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={moduleForm.description} onChange={(e) => setModuleForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Order</Label><Input type="number" value={moduleForm.order_index} onChange={(e) => setModuleForm(p => ({ ...p, order_index: e.target.value }))} /></div>
                <div><Label>XP Value</Label><Input type="number" value={moduleForm.xp_value} onChange={(e) => setModuleForm(p => ({ ...p, xp_value: e.target.value }))} /></div>
              </div>
              <Button onClick={handleSaveModule} className="w-full">Save Module</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Mission Dialog */}
        <Dialog open={missionDialogOpen} onOpenChange={setMissionDialogOpen}>
          <DialogContent className="bg-background border-border max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMission ? "Edit Mission" : "Add Mission"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={missionForm.title} onChange={(e) => setMissionForm(p => ({ ...p, title: e.target.value }))} /></div>
              <div><Label>Description</Label><Textarea value={missionForm.description} onChange={(e) => setMissionForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
              <div><Label>External Link</Label><Input value={missionForm.external_link} onChange={(e) => setMissionForm(p => ({ ...p, external_link: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>XP Value</Label><Input type="number" value={missionForm.xp_value} onChange={(e) => setMissionForm(p => ({ ...p, xp_value: e.target.value }))} /></div>
                <div><Label>Order</Label><Input type="number" value={missionForm.order_index} onChange={(e) => setMissionForm(p => ({ ...p, order_index: e.target.value }))} /></div>
              </div>
              {modules.length > 0 && (
                <div>
                  <Label>Linked Module (optional)</Label>
                  <Select value={missionForm.module_id || "none"} onValueChange={(v) => setMissionForm(p => ({ ...p, module_id: v === "none" ? "" : v }))}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <Button onClick={handleSaveMission} className="w-full">Save Mission</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">LearnFi Management</h1>
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

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((prog) => (
              <TableRow key={prog.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{prog.title}</p>
                      <p className="text-xs text-muted-foreground">{prog.project_name}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><Badge variant="outline" className="capitalize">{prog.category}</Badge></TableCell>
                <TableCell className="capitalize">{prog.reward_type}</TableCell>
                <TableCell><Users className="inline w-4 h-4 mr-1" />{prog.participants_count}</TableCell>
                <TableCell>{getStatusBadge(prog.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => { setSelectedProgram(prog.id); setActiveTab("modules"); }}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    {prog.status === "pending_approval" && (
                      <Button variant="ghost" size="sm" className="text-green-500" onClick={() => updateProgramStatus(prog.id, "live")}>
                        Approve
                      </Button>
                    )}
                    {prog.status === "live" && (
                      <Button variant="ghost" size="sm" onClick={() => updateProgramStatus(prog.id, "closed")}>
                        Close
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <Rocket className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No programs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminLearnFi;
