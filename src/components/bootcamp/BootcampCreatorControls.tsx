import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Trash,
  Lock,
  Unlock,
  Loader2,
  Hash,
  Megaphone,
  Settings,
  Pin,
} from "lucide-react";
import type { BootcampCommunityTopic, Bootcamp } from "@/types/bootcamp";

interface BootcampCreatorControlsProps {
  bootcamp: Bootcamp;
  isHost: boolean;
}

const TOPIC_ICONS = ["📌", "🎯", "💡", "💬", "🧠", "🆘", "🎉", "📚", "🔥", "⭐", "🚀", "💪", "📊", "🎨", "💼", "🏆"];

const BootcampCreatorControls = ({ bootcamp, isHost }: BootcampCreatorControlsProps) => {
  const { user } = useAuth();
  const { topics, loading, createTopic, updateTopic, deleteTopic, refetch } = useBootcampCommunityTopics(bootcamp.id);
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<BootcampCommunityTopic | null>(null);
  const [processing, setProcessing] = useState(false);
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementText, setAnnouncementText] = useState("");

  // Form state
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("📌");
  const [newDescription, setNewDescription] = useState("");

  if (!isHost) {
    return null;
  }

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      toast.error("Topic title is required");
      return;
    }

    setProcessing(true);
    const result = await createTopic(newTitle.trim(), newIcon, newDescription.trim() || undefined);
    setProcessing(false);

    if (result.success) {
      toast.success("Room created successfully!");
      setCreateDialogOpen(false);
      setNewTitle("");
      setNewIcon("📌");
      setNewDescription("");
    } else {
      toast.error("Failed to create room");
    }
  };

  const handleToggleLock = async (topic: BootcampCommunityTopic) => {
    const result = await updateTopic(topic.id, { is_locked: !topic.is_locked });
    if (result.success) {
      toast.success(topic.is_locked ? "Room unlocked" : "Room locked");
    } else {
      toast.error("Failed to update room");
    }
  };

  const handleDelete = async (topic: BootcampCommunityTopic) => {
    if (topic.is_default) {
      toast.error("Cannot delete default rooms");
      return;
    }

    if (!confirm(`Delete room "${topic.title}"? All messages in this room will be deleted.`)) {
      return;
    }

    const result = await deleteTopic(topic.id);
    if (result.success) {
      toast.success("Room deleted");
    } else {
      toast.error("Failed to delete room");
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
      toast.success("Room updated");
      setEditingTopic(null);
    } else {
      toast.error("Failed to update room");
    }
  };

  const openEditDialog = (topic: BootcampCommunityTopic) => {
    setEditingTopic(topic);
    setNewTitle(topic.title);
    setNewIcon(topic.icon || "📌");
    setNewDescription(topic.description || "");
  };

  const handlePostAnnouncement = async () => {
    if (!announcementText.trim()) {
      toast.error("Announcement text is required");
      return;
    }

    // Find the general/default topic to post announcement
    const generalTopic = topics.find((t) => t.is_default) || topics[0];
    if (!generalTopic) {
      toast.error("No room available for announcements");
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("bootcamp_messages")
        .insert({
          bootcamp_id: bootcamp.id,
          topic_id: generalTopic.id,
          user_id: user?.id,
          user_name: bootcamp.host_name,
          message: `📢 ANNOUNCEMENT: ${announcementText}`,
          message_type: "announcement",
          is_pinned: true,
        });

      if (error) throw error;

      toast.success("Announcement posted and pinned!");
      setAnnouncementOpen(false);
      setAnnouncementText("");
    } catch (err: any) {
      toast.error("Failed to post announcement");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Host Controls
            </CardTitle>
            <CardDescription>Manage rooms and announcements</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Room</DialogTitle>
                <DialogDescription>
                  Add a custom discussion room for your bootcamp
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
                  <Label htmlFor="roomTitle">Room Name *</Label>
                  <Input
                    id="roomTitle"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Portfolio Review"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roomDesc">Description (optional)</Label>
                  <Textarea
                    id="roomDesc"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="What is this room about?"
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={processing || !newTitle.trim()}>
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Room"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Megaphone className="w-4 h-4 mr-2" />
                Post Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Post Announcement</DialogTitle>
                <DialogDescription>
                  This will be pinned in the General room
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="Write your announcement..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAnnouncementOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handlePostAnnouncement} disabled={processing || !announcementText.trim()}>
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post & Pin"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Separator />

        {/* Room List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Manage Rooms ({topics.length})
          </h4>

          {topics.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No rooms created yet. Default rooms will appear when the bootcamp becomes active.
            </p>
          ) : (
            <div className="space-y-2">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{topic.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{topic.title}</span>
                        {topic.is_default && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                        {topic.is_locked && (
                          <Badge variant="outline" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                      {topic.description && (
                        <p className="text-xs text-muted-foreground">{topic.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleLock(topic)}
                      title={topic.is_locked ? "Unlock room" : "Lock room"}
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
                      className="h-8 w-8"
                      onClick={() => openEditDialog(topic)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    {!topic.is_default && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(topic)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={!!editingTopic} onOpenChange={() => setEditingTopic(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
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
              <Label htmlFor="editTitle">Room Name *</Label>
              <Input
                id="editTitle"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDesc">Description</Label>
              <Textarea
                id="editDesc"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTopic(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={processing || !newTitle.trim()}>
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BootcampCreatorControls;
