import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useBootcampCommunityTopics } from "@/hooks/useBootcampCommunity";
import { toast } from "sonner";
import { Plus, Edit, Trash, Lock, Unlock, Loader2, Hash, GripVertical } from "lucide-react";
import type { BootcampCommunityTopic } from "@/types/bootcamp";

interface BootcampCommunityManagementProps {
  bootcampId: string;
}

const TOPIC_ICONS = ["📌", "🎯", "💡", "💬", "🧠", "🆘", "🎉", "📚", "🔥", "⭐", "🚀", "💪"];

const BootcampCommunityManagement = ({ bootcampId }: BootcampCommunityManagementProps) => {
  const { topics, loading, createTopic, updateTopic, deleteTopic } = useBootcampCommunityTopics(bootcampId);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<BootcampCommunityTopic | null>(null);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("📌");
  const [newDescription, setNewDescription] = useState("");

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error("Topic title is required");
      return;
    }

    setProcessing(true);
    const result = await createTopic(newTitle.trim(), newIcon, newDescription.trim() || undefined);
    setProcessing(false);

    if (result.success) {
      toast.success("Topic created");
      setCreateDialogOpen(false);
      setNewTitle("");
      setNewIcon("📌");
      setNewDescription("");
    } else {
      toast.error("Failed to create topic");
    }
  };

  const handleToggleLock = async (topic: BootcampCommunityTopic) => {
    const result = await updateTopic(topic.id, { is_locked: !topic.is_locked });
    if (result.success) {
      toast.success(topic.is_locked ? "Topic unlocked" : "Topic locked");
    } else {
      toast.error("Failed to update topic");
    }
  };

  const handleDelete = async (topic: BootcampCommunityTopic) => {
    if (topic.is_default) {
      toast.error("Cannot delete default topics");
      return;
    }

    if (!confirm(`Delete topic "${topic.title}"? All messages in this topic will be deleted.`)) {
      return;
    }

    const result = await deleteTopic(topic.id);
    if (result.success) {
      toast.success("Topic deleted");
    } else {
      toast.error("Failed to delete topic");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTopic) return;

    setProcessing(true);
    const result = await updateTopic(editingTopic.id, {
      title: newTitle.trim(),
      icon: newIcon,
      description: newDescription.trim() || null,
    });
    setProcessing(false);

    if (result.success) {
      toast.success("Topic updated");
      setEditingTopic(null);
    } else {
      toast.error("Failed to update topic");
    }
  };

  const openEditDialog = (topic: BootcampCommunityTopic) => {
    setEditingTopic(topic);
    setNewTitle(topic.title);
    setNewIcon(topic.icon);
    setNewDescription(topic.description || "");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Community Topics</h4>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Topic
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Topic</DialogTitle>
              <DialogDescription>
                Add a new discussion topic to the community
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="flex flex-wrap gap-2">
                  {TOPIC_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={`w-10 h-10 text-xl rounded-lg border transition-colors ${
                        newIcon === icon
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="topicTitle">Title *</Label>
                <Input
                  id="topicTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Resources"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topicDesc">Description (optional)</Label>
                <Input
                  id="topicDesc"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="What is this topic about?"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={processing || !newTitle.trim()}>
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Hash className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No topics created yet</p>
          <p className="text-sm">Topics will be auto-created when the bootcamp is approved</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Topic</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topics.map((topic) => (
              <TableRow key={topic.id}>
                <TableCell>
                  <span className="text-xl">{topic.icon}</span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{topic.title}</p>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {topic.is_locked ? (
                    <Badge variant="secondary">
                      <Lock className="w-3 h-3 mr-1" />
                      Locked
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <Unlock className="w-3 h-3 mr-1" />
                      Open
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {topic.is_default ? (
                    <Badge variant="outline">Default</Badge>
                  ) : (
                    <Badge variant="secondary">Custom</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleLock(topic)}
                      title={topic.is_locked ? "Unlock topic" : "Lock topic"}
                    >
                      {topic.is_locked ? (
                        <Unlock className="w-4 h-4" />
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(topic)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!topic.is_default && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(topic)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Topic</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="flex flex-wrap gap-2">
                {TOPIC_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewIcon(icon)}
                    className={`w-10 h-10 text-xl rounded-lg border transition-colors ${
                      newIcon === icon
                        ? "border-primary bg-primary/10"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDesc">Description (optional)</Label>
              <Input
                id="editDesc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTopic(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={processing || !newTitle.trim()}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BootcampCommunityManagement;
