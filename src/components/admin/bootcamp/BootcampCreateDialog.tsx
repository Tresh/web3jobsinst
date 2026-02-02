import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface BootcampCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const BootcampCreateDialog = ({ open, onOpenChange, onSuccess }: BootcampCreateDialogProps) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_days: "20",
    bootcamp_type: "free",
    max_participants: "100",
    start_date: "",
    end_date: "",
    host_name: "",
    community_enabled: true,
    xp_enabled: true,
    rules: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Please enter a bootcamp title");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("bootcamps")
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() || null,
          duration_days: parseInt(formData.duration_days),
          host_user_id: user?.id,
          host_name: formData.host_name.trim() || profile?.full_name || "Admin",
          bootcamp_type: formData.bootcamp_type as "free" | "paid",
          max_participants: parseInt(formData.max_participants),
          start_date: formData.start_date || null,
          end_date: formData.end_date || null,
          status: "approved", // Admin-created bootcamps are auto-approved
          registration_open: true,
        });

      if (error) throw error;

      toast.success("Bootcamp created successfully");
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        duration_days: "20",
        bootcamp_type: "free",
        max_participants: "100",
        start_date: "",
        end_date: "",
        host_name: "",
        community_enabled: true,
        xp_enabled: true,
        rules: "",
      });
    } catch (err: any) {
      toast.error("Failed to create bootcamp", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Bootcamp</DialogTitle>
          <DialogDescription>
            Create a new bootcamp with tasks, community, and XP tracking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Bootcamp Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Web3 Developer Bootcamp"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what participants will learn..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="host_name">Hosted By</Label>
              <Input
                id="host_name"
                value={formData.host_name}
                onChange={(e) => setFormData({ ...formData, host_name: e.target.value })}
                placeholder={profile?.full_name || "Host name"}
              />
            </div>
          </div>

          {/* Duration & Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                value={formData.duration_days}
                onValueChange={(val) => setFormData({ ...formData, duration_days: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                  <SelectItem value="20">20 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Bootcamp Type</Label>
              <Select
                value={formData.bootcamp_type}
                onValueChange={(val) => setFormData({ ...formData, bootcamp_type: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Participants & Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max_participants">Participant Limit</Label>
              <Input
                id="max_participants"
                type="number"
                min="1"
                max="10000"
                value={formData.max_participants}
                onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            />
          </div>

          {/* Rules */}
          <div className="space-y-2">
            <Label htmlFor="rules">Rules & Requirements</Label>
            <Textarea
              id="rules"
              value={formData.rules}
              onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
              placeholder="Enter bootcamp rules and requirements..."
              rows={3}
            />
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="community">Community Enabled</Label>
                <p className="text-xs text-muted-foreground">Allow participants to chat</p>
              </div>
              <Switch
                id="community"
                checked={formData.community_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, community_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="xp">XP Tracking Enabled</Label>
                <p className="text-xs text-muted-foreground">Track participant XP from tasks</p>
              </div>
              <Switch
                id="xp"
                checked={formData.xp_enabled}
                onCheckedChange={(checked) => setFormData({ ...formData, xp_enabled: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Bootcamp
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BootcampCreateDialog;
