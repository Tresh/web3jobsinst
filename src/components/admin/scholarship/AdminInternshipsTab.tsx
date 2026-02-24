import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Briefcase, Loader2, Search, Eye, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface InternProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  telegram_username: string | null;
  twitter_handle: string | null;
  portfolio_link: string | null;
  profile_photo_url: string | null;
  primary_skill_category: string;
  skill_level: string;
  tools_known: string[];
  experience_description: string | null;
  paid_preference: string;
  hours_per_week: string;
  work_mode: string;
  open_to_immediate: boolean;
  is_public: boolean;
  is_approved: boolean;
  internship_status: string;
  admin_notes: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "active_intern", label: "Active Intern" },
  { value: "open_to_internship", label: "Open to Internship" },
  { value: "currently_placed", label: "Currently Placed" },
  { value: "not_available", label: "Not Available" },
];

const STATUS_COLORS: Record<string, string> = {
  active_intern: "bg-green-500/10 text-green-500 border-green-500/20",
  open_to_internship: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  currently_placed: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  not_available: "bg-muted text-muted-foreground border-border",
};

export function AdminInternshipsTab() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<InternProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<InternProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Edit form
  const [editStatus, setEditStatus] = useState("open_to_internship");
  const [editApproved, setEditApproved] = useState(false);
  const [editPublic, setEditPublic] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  const fetchProfiles = async () => {
    const { data } = await supabase
      .from("internship_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    setProfiles((data || []) as unknown as InternProfile[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchProfiles(); }, []);

  const openDetail = (p: InternProfile) => {
    setSelected(p);
    setEditStatus(p.internship_status);
    setEditApproved(p.is_approved);
    setEditPublic(p.is_public);
    setEditNotes(p.admin_notes || "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("internship_profiles")
      .update({
        internship_status: editStatus,
        is_approved: editApproved,
        is_public: editPublic,
        admin_notes: editNotes || null,
      })
      .eq("id", selected.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      setDialogOpen(false);
      fetchProfiles();
    }
    setSaving(false);
  };

  const handleQuickApprove = async (id: string) => {
    await supabase.from("internship_profiles").update({ is_approved: true, is_public: true }).eq("id", id);
    toast({ title: "Profile approved and published to market" });
    fetchProfiles();
  };

  const handleRemoveFromMarket = async (id: string) => {
    await supabase.from("internship_profiles").update({ is_public: false }).eq("id", id);
    toast({ title: "Removed from public listing" });
    fetchProfiles();
  };

  const filtered = profiles.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.full_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q) ||
      p.primary_skill_category.toLowerCase().includes(q)
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Internship Management
            </CardTitle>
            <CardDescription>Manage intern profiles, approve and update statuses</CardDescription>
          </div>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search interns..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
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
                <TableHead>Intern</TableHead>
                <TableHead>Skill</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved</TableHead>
                <TableHead>Public</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={p.profile_photo_url || undefined} />
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {p.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{p.full_name}</p>
                        <p className="text-xs text-muted-foreground">{p.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm capitalize">{p.primary_skill_category.replace("_", " ")}</TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${STATUS_COLORS[p.internship_status] || ""}`}>
                      {STATUS_OPTIONS.find((s) => s.value === p.internship_status)?.label || p.internship_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {p.is_approved ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_public ? "default" : "secondary"} className="text-xs">
                      {p.is_public ? "Public" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(p.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {!p.is_approved && (
                      <Button size="sm" variant="default" onClick={() => handleQuickApprove(p.id)}>
                        <CheckCircle className="w-3 h-3 mr-1" /> Approve
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openDetail(p)}>
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                    {p.is_public && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRemoveFromMarket(p.id)}>
                        Remove
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No internship profiles yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Manage Intern — {selected?.full_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
                <div><span className="text-muted-foreground">Telegram:</span> {selected.telegram_username || "—"}</div>
                <div><span className="text-muted-foreground">X:</span> {selected.twitter_handle || "—"}</div>
                <div><span className="text-muted-foreground">Level:</span> <span className="capitalize">{selected.skill_level}</span></div>
                <div><span className="text-muted-foreground">Hours:</span> {selected.hours_per_week}/week</div>
                <div><span className="text-muted-foreground">Mode:</span> <span className="capitalize">{selected.work_mode}</span></div>
              </div>

              {selected.tools_known?.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tools</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selected.tools_known.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Internship Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Approved</Label>
                <Switch checked={editApproved} onCheckedChange={setEditApproved} />
              </div>

              <div className="flex items-center justify-between">
                <Label>Public Visibility</Label>
                <Switch checked={editPublic} onCheckedChange={setEditPublic} />
              </div>

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={2} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
