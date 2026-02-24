import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Briefcase, Loader2, Search, Eye, CheckCircle, XCircle, ExternalLink, Settings2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface WaitlistEntry {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  telegram_username: string | null;
  twitter_handle: string | null;
  retweet_link: string | null;
  tag_proof_link: string | null;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-primary/10 text-primary border-primary/20",
  approved: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AdminInternshipWaitlistTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<WaitlistEntry | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  // Tweet link config
  const [tweetUrl, setTweetUrl] = useState("");
  const [savingTweet, setSavingTweet] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const fetchEntries = async () => {
    const { data } = await supabase
      .from("internship_waitlist")
      .select("*")
      .order("created_at", { ascending: false });
    setEntries((data || []) as unknown as WaitlistEntry[]);
    setIsLoading(false);
  };

  const fetchTweetUrl = async () => {
    const { data } = await supabase
      .from("platform_settings")
      .select("value")
      .eq("key", "internship_waitlist_tweet_url")
      .maybeSingle();
    setTweetUrl(data?.value || "");
  };

  useEffect(() => {
    fetchEntries();
    fetchTweetUrl();
  }, []);

  const handleApprove = async (entry: WaitlistEntry) => {
    const { error } = await supabase
      .from("internship_waitlist")
      .update({
        status: "approved",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", entry.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Applicant approved" });
      fetchEntries();
    }
  };

  const handleReject = async (entry: WaitlistEntry) => {
    const { error } = await supabase
      .from("internship_waitlist")
      .update({
        status: "rejected",
        reviewed_by: user?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", entry.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Applicant rejected" });
      fetchEntries();
    }
  };

  const handleSaveNotes = async () => {
    if (!selected) return;
    setSaving(true);
    const { error } = await supabase
      .from("internship_waitlist")
      .update({ admin_notes: editNotes || null })
      .eq("id", selected.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Notes saved" });
      setDialogOpen(false);
      fetchEntries();
    }
    setSaving(false);
  };

  const handleSaveTweetUrl = async () => {
    setSavingTweet(true);
    const { error } = await supabase
      .from("platform_settings")
      .update({ value: tweetUrl, updated_by: user?.id })
      .eq("key", "internship_waitlist_tweet_url");

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Tweet link updated" });
      setShowSettings(false);
    }
    setSavingTweet(false);
  };

  const openDetail = (e: WaitlistEntry) => {
    setSelected(e);
    setEditNotes(e.admin_notes || "");
    setDialogOpen(true);
  };

  const filtered = entries.filter((e) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return e.full_name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q);
  });

  const pendingCount = entries.filter((e) => e.status === "pending").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Internship Waitlist
              {pendingCount > 0 && (
                <Badge className="bg-primary/10 text-primary border-primary/20 ml-2">
                  {pendingCount} pending
                </Badge>
              )}
            </CardTitle>
            <CardDescription>Manage internship waitlist applications</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
              <Settings2 className="w-4 h-4 mr-1" />
              Tweet Link
            </Button>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search applicants..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </div>

        {/* Tweet URL Settings */}
        {showSettings && (
          <div className="mt-4 rounded-lg border border-border p-4 space-y-3">
            <Label className="text-sm font-medium">Retweet Post URL</Label>
            <p className="text-xs text-muted-foreground">
              Set the tweet/post that applicants must retweet and tag friends on. Leave empty to disable this requirement.
            </p>
            <div className="flex gap-2">
              <Input
                value={tweetUrl}
                onChange={(e) => setTweetUrl(e.target.value)}
                placeholder="https://x.com/yourhandle/status/..."
                className="flex-1"
              />
              <Button size="sm" onClick={handleSaveTweetUrl} disabled={savingTweet}>
                {savingTweet ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                Save
              </Button>
            </div>
          </div>
        )}
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
                <TableHead>Applicant</TableHead>
                <TableHead>Twitter</TableHead>
                <TableHead>Retweet</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{e.full_name}</p>
                      <p className="text-xs text-muted-foreground">{e.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{e.twitter_handle || "—"}</TableCell>
                  <TableCell>
                    {e.retweet_link ? (
                      <a href={e.retweet_link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`text-xs ${STATUS_COLORS[e.status] || ""}`}>
                      {e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(e.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {e.status === "pending" && (
                      <>
                        <Button size="sm" variant="default" onClick={() => handleApprove(e)}>
                          <CheckCircle className="w-3 h-3 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleReject(e)}>
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline" onClick={() => openDetail(e)}>
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No waitlist applications yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Applicant — {selected?.full_name}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {selected.email}</div>
                <div><span className="text-muted-foreground">Telegram:</span> {selected.telegram_username || "—"}</div>
                <div><span className="text-muted-foreground">Twitter:</span> {selected.twitter_handle || "—"}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={`text-xs ${STATUS_COLORS[selected.status]}`}>{selected.status}</Badge></div>
              </div>

              {selected.retweet_link && (
                <div>
                  <Label className="text-xs text-muted-foreground">Retweet Link</Label>
                  <a href={selected.retweet_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                    {selected.retweet_link.slice(0, 60)}... <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {selected.tag_proof_link && (
                <div>
                  <Label className="text-xs text-muted-foreground">Tag Proof Link</Label>
                  <a href={selected.tag_proof_link} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1 mt-1">
                    {selected.tag_proof_link.slice(0, 60)}... <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="space-y-2">
                <Label>Admin Notes</Label>
                <Textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} rows={3} />
              </div>
            </div>
          )}
          <DialogFooter className="flex gap-2">
            {selected?.status === "pending" && (
              <>
                <Button variant="default" onClick={() => { handleApprove(selected!); setDialogOpen(false); }}>
                  Approve
                </Button>
                <Button variant="ghost" className="text-destructive" onClick={() => { handleReject(selected!); setDialogOpen(false); }}>
                  Reject
                </Button>
              </>
            )}
            <Button variant="outline" onClick={handleSaveNotes} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
