import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
  DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Loader2, Pencil, Trash2, Megaphone, Users, Calendar, Search, Eye, CheckCircle, XCircle,
} from "lucide-react";
import { format } from "date-fns";

const campaignTypes = [
  { value: "social", label: "Social Media" },
  { value: "referral", label: "Refer to Earn" },
  { value: "airdrop", label: "Airdrop" },
  { value: "content", label: "Content Creation" },
  { value: "community", label: "Community" },
];

const campaignStatuses = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended" },
];

interface Campaign {
  id: string; title: string; description: string | null; type: string; reward: string | null;
  max_participants: number; deadline: string | null; status: string; project: string | null;
  requirements: any; cover_image_url: string | null; is_published: boolean;
  created_at: string; updated_at: string;
}

interface CampaignParticipant {
  id: string; campaign_id: string; user_id: string; status: string;
  submission_url: string | null; submission_text: string | null;
  submission_proof_url: string | null; admin_notes: string | null;
  reviewed_at: string | null; created_at: string;
}

const AdminCampaigns = () => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [participants, setParticipants] = useState<CampaignParticipant[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { full_name: string | null; avatar_url: string | null }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("campaigns");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Campaign form
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selected, setSelected] = useState<Campaign | null>(null);
  const emptyForm = {
    title: "", description: "", type: "social", reward: "", max_participants: "1000",
    deadline: "", status: "draft", project: "", requirements: "",
    cover_image_url: "", is_published: false,
  };
  const [form, setForm] = useState(emptyForm);

  // Participant view
  const [viewCampaignId, setViewCampaignId] = useState("_all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [cr, pr] = await Promise.all([
      supabase.from("platform_campaigns").select("*").order("created_at", { ascending: false }),
      supabase.from("campaign_participants").select("*").order("created_at", { ascending: false }),
    ]);
    const cData = (cr.data || []) as Campaign[];
    const pData = (pr.data || []) as CampaignParticipant[];
    setCampaigns(cData);
    setParticipants(pData);

    // Fetch participant profiles
    const userIds = [...new Set(pData.map(p => p.user_id))];
    if (userIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("user_id, full_name, avatar_url").in("user_id", userIds);
      const map: Record<string, { full_name: string | null; avatar_url: string | null }> = {};
      (profs || []).forEach((p: any) => { map[p.user_id] = { full_name: p.full_name, avatar_url: p.avatar_url }; });
      setProfiles(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resetForm = () => { setForm(emptyForm); setSelected(null); setIsEditing(false); };
  const openEdit = (c: Campaign) => {
    setSelected(c); setIsEditing(true);
    const reqs = Array.isArray(c.requirements) ? c.requirements.join("\n") : "";
    setForm({
      title: c.title, description: c.description || "", type: c.type, reward: c.reward || "",
      max_participants: String(c.max_participants), deadline: c.deadline ? c.deadline.split("T")[0] : "",
      status: c.status, project: c.project || "", requirements: reqs,
      cover_image_url: c.cover_image_url || "", is_published: c.is_published,
    });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast({ title: "Title required", variant: "destructive" }); return; }
    setIsSaving(true);
    const reqs = form.requirements.split("\n").map(r => r.trim()).filter(Boolean);
    const payload = {
      title: form.title, description: form.description || null, type: form.type,
      reward: form.reward || null, max_participants: parseInt(form.max_participants) || 1000,
      deadline: form.deadline ? new Date(form.deadline).toISOString() : null,
      status: form.status, project: form.project || null,
      requirements: reqs, cover_image_url: form.cover_image_url || null,
      is_published: form.is_published,
    };
    try {
      if (isEditing && selected) {
        const { error } = await supabase.from("platform_campaigns").update(payload).eq("id", selected.id);
        if (error) throw error; toast({ title: "Campaign updated" });
      } else {
        const { error } = await supabase.from("platform_campaigns").insert(payload);
        if (error) throw error; toast({ title: "Campaign created" });
      }
      setIsDialogOpen(false); resetForm(); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      const { error } = await supabase.from("platform_campaigns").delete().eq("id", id);
      if (error) throw error; toast({ title: "Campaign deleted" }); fetchData();
    } catch (err: any) { toast({ title: "Error", description: err.message, variant: "destructive" }); }
    finally { setIsDeleting(null); }
  };

  const togglePublished = async (id: string, cur: boolean) => {
    const { error } = await supabase.from("platform_campaigns").update({ is_published: !cur }).eq("id", id);
    if (!error) fetchData();
  };

  const updateParticipantStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("campaign_participants").update({ status, reviewed_at: new Date().toISOString() }).eq("id", id);
    if (!error) { toast({ title: `Participant ${status}` }); fetchData(); }
  };

  const filtered = campaigns.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredParticipants = viewCampaignId === "_all" ? participants : participants.filter(p => p.campaign_id === viewCampaignId);
  const getCampaign = (id: string) => campaigns.find(c => c.id === id);

  const getStatusBadge = (s: string) => {
    const map: Record<string, string> = { active: "default", upcoming: "secondary", ended: "outline", draft: "outline" };
    return <Badge variant={(map[s] || "outline") as any} className="capitalize">{s}</Badge>;
  };

  if (loading) return <div className="flex items-center justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Campaign Management</h1><p className="text-muted-foreground mt-1">Create & manage campaigns and track participants</p></div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="campaigns" className="gap-2"><Megaphone className="w-4 h-4" /> Campaigns ({campaigns.length})</TabsTrigger>
          <TabsTrigger value="participants" className="gap-2"><Users className="w-4 h-4" /> Participants ({participants.length})</TabsTrigger>
        </TabsList>

        {/* CAMPAIGNS TAB */}
        <TabsContent value="campaigns" className="space-y-4 mt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" onClick={resetForm}><Plus className="w-4 h-4" /> Create Campaign</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditing ? "Edit Campaign" : "Create Campaign"}</DialogTitle>
                  <DialogDescription>Set up campaign details and requirements</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2"><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
                    <div className="col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
                    <div><Label>Type</Label>
                      <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{campaignTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Status</Label>
                      <Select value={form.status} onValueChange={v => setForm(p => ({ ...p, status: v }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{campaignStatuses.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Reward</Label><Input value={form.reward} onChange={e => setForm(p => ({ ...p, reward: e.target.value }))} placeholder="$10 coupon" /></div>
                    <div><Label>Project</Label><Input value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))} placeholder="Project name" /></div>
                    <div><Label>Max Participants</Label><Input type="number" value={form.max_participants} onChange={e => setForm(p => ({ ...p, max_participants: e.target.value }))} /></div>
                    <div><Label>Deadline</Label><Input type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} /></div>
                    <div className="col-span-2"><Label>Cover Image URL</Label><Input value={form.cover_image_url} onChange={e => setForm(p => ({ ...p, cover_image_url: e.target.value }))} placeholder="https://..." /></div>
                    <div className="col-span-2"><Label>Requirements (one per line)</Label><Textarea value={form.requirements} onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} rows={3} placeholder="Post on X with #tag&#10;Tag @account" /></div>
                    <div className="flex items-center gap-3 col-span-2"><Switch checked={form.is_published} onCheckedChange={v => setForm(p => ({ ...p, is_published: v }))} /><Label>Published (visible to users)</Label></div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSave} disabled={isSaving}>{isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{isEditing ? "Save" : "Create"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {filtered.length === 0 ? (
            <Card className="border-dashed"><CardContent className="p-12 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Campaigns Yet</h3>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}><Plus className="w-4 h-4 mr-2" /> Create Campaign</Button>
            </CardContent></Card>
          ) : (
            <div className="rounded-md border"><Table>
              <TableHeader><TableRow>
                <TableHead>Campaign</TableHead><TableHead>Type</TableHead><TableHead>Reward</TableHead>
                <TableHead className="text-center">Participants</TableHead><TableHead>Deadline</TableHead>
                <TableHead>Status</TableHead><TableHead className="text-center">Live</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filtered.map(c => {
                  const pCount = participants.filter(p => p.campaign_id === c.id).length;
                  return (
                    <TableRow key={c.id}>
                      <TableCell><p className="font-medium line-clamp-1">{c.title}</p><p className="text-xs text-muted-foreground line-clamp-1">{c.project}</p></TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{c.type}</Badge></TableCell>
                      <TableCell className="font-medium text-primary">{c.reward || "-"}</TableCell>
                      <TableCell className="text-center"><span className="flex items-center justify-center gap-1 text-muted-foreground"><Users className="h-4 w-4" />{pCount}/{c.max_participants}</span></TableCell>
                      <TableCell>{c.deadline ? format(new Date(c.deadline), "MMM d, yyyy") : "-"}</TableCell>
                      <TableCell>{getStatusBadge(c.status)}</TableCell>
                      <TableCell className="text-center"><Switch checked={c.is_published} onCheckedChange={() => togglePublished(c.id, c.is_published)} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)} disabled={isDeleting === c.id}>
                            {isDeleting === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table></div>
          )}
        </TabsContent>

        {/* PARTICIPANTS TAB */}
        <TabsContent value="participants" className="space-y-4 mt-4">
          <div className="flex items-center gap-4 flex-wrap">
            <Label>Filter by Campaign:</Label>
            <Select value={viewCampaignId} onValueChange={setViewCampaignId}>
              <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All Campaigns</SelectItem>
                {campaigns.map(c => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
            <Badge variant="secondary">{filteredParticipants.length} participants</Badge>
          </div>

          {filteredParticipants.length === 0 ? (
            <Card className="border-dashed"><CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Participants Yet</h3>
            </CardContent></Card>
          ) : (
            <div className="rounded-md border"><Table>
              <TableHeader><TableRow>
                <TableHead>User</TableHead><TableHead>Campaign</TableHead><TableHead>Status</TableHead>
                <TableHead>Submission</TableHead><TableHead>Joined</TableHead><TableHead className="text-right">Actions</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredParticipants.map(p => {
                  const camp = getCampaign(p.campaign_id);
                  const prof = profiles[p.user_id];
                  return (
                    <TableRow key={p.id}>
                      <TableCell><p className="font-medium">{prof?.full_name || p.user_id.slice(0, 8)}</p></TableCell>
                      <TableCell><Badge variant="outline">{camp?.title || "Unknown"}</Badge></TableCell>
                      <TableCell>{getStatusBadge(p.status)}</TableCell>
                      <TableCell>
                        {p.submission_url ? <a href={p.submission_url} target="_blank" rel="noopener noreferrer" className="text-primary underline text-sm">View</a> : p.submission_text ? <span className="text-sm line-clamp-1">{p.submission_text}</span> : <span className="text-xs text-muted-foreground">None</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{format(new Date(p.created_at), "MMM d")}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" title="Approve" onClick={() => updateParticipantStatus(p.id, "approved")}>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Reject" onClick={() => updateParticipantStatus(p.id, "rejected")}>
                            <XCircle className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table></div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCampaigns;
