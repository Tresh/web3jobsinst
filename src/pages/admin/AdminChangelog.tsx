import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Sparkles, Wrench, Zap, Shield } from "lucide-react";

interface ChangelogEntry {
  id: string;
  date: string;
  title: string;
  type: "feature" | "improvement" | "fix" | "security";
  items: string[];
  is_published: boolean;
  order_index: number;
}

const typeConfig = {
  feature: { label: "Feature", icon: Sparkles, className: "bg-primary/10 text-primary" },
  improvement: { label: "Improvement", icon: Wrench, className: "bg-blue-500/10 text-blue-500" },
  fix: { label: "Fix", icon: Zap, className: "bg-amber-500/10 text-amber-500" },
  security: { label: "Security", icon: Shield, className: "bg-green-500/10 text-green-500" },
};

const emptyForm: {
  date: string;
  title: string;
  type: "feature" | "improvement" | "fix" | "security";
  items: string[];
  is_published: boolean;
  order_index: number;
} = {
  date: new Date().toISOString().split("T")[0],
  title: "",
  type: "feature",
  items: [""],
  is_published: false,
  order_index: 0,
};

const AdminChangelog = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["admin-changelog"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data as unknown as ChangelogEntry[]) ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (entry: Omit<ChangelogEntry, "id"> & { id?: string }) => {
      const payload = {
        date: entry.date,
        title: entry.title,
        type: entry.type,
        items: entry.items.filter(Boolean),
        is_published: entry.is_published,
        order_index: entry.order_index,
      };
      if (entry.id) {
        const { error } = await supabase.from("changelog_entries").update(payload).eq("id", entry.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("changelog_entries").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-changelog"] });
      setDialogOpen(false);
      toast({ title: editingId ? "Entry updated" : "Entry created" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("changelog_entries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-changelog"] });
      toast({ title: "Entry deleted" });
    },
  });

  const togglePublish = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("changelog_entries").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-changelog"] }),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (entry: ChangelogEntry) => {
    setEditingId(entry.id);
    setForm({
      date: entry.date,
      title: entry.title,
      type: entry.type as "feature" | "improvement" | "fix" | "security",
      items: entry.items.length ? entry.items : [""],
      is_published: entry.is_published,
      order_index: entry.order_index,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    saveMutation.mutate({ ...form, id: editingId ?? undefined });
  };

  const updateItem = (idx: number, value: string) => {
    const newItems = [...form.items];
    newItems[idx] = value;
    setForm({ ...form, items: newItems });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, ""] });
  const removeItem = (idx: number) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Changelog</h1>
          <p className="text-muted-foreground text-sm">Manage public changelog entries</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Add Entry</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : entries.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No changelog entries yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => {
            const config = typeConfig[entry.type];
            return (
              <Card key={entry.id}>
                <CardContent className="py-4 px-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Badge variant="outline" className={config.className}>{config.label}</Badge>
                      <span className="text-xs text-muted-foreground">{entry.date}</span>
                      {!entry.is_published && <Badge variant="secondary" className="text-xs">Draft</Badge>}
                    </div>
                    <h3 className="font-semibold text-foreground">{entry.title}</h3>
                    <ul className="mt-1 space-y-0.5">
                      {entry.items.map((item, j) => (
                        <li key={j} className="text-sm text-muted-foreground">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Switch
                      checked={entry.is_published}
                      onCheckedChange={(v) => togglePublish.mutate({ id: entry.id, is_published: v })}
                    />
                    <Button variant="ghost" size="icon" onClick={() => openEdit(entry)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(entry.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Entry" : "New Changelog Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
                    <SelectItem value="fix">Fix</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What changed?" />
            </div>
            <div className="space-y-2">
              <Label>Items</Label>
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input value={item} onChange={(e) => updateItem(idx, e.target.value)} placeholder={`Item ${idx + 1}`} />
                  {form.items.length > 1 && (
                    <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" />Add item</Button>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_published} onCheckedChange={(v) => setForm({ ...form, is_published: v })} />
              <Label>Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending || !form.title}>
              {saveMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminChangelog;
