import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Loader2, Settings, Eye, MessageCircle, ShieldCheck } from "lucide-react";
import { useMessageSettings, useProfileVisibility } from "@/hooks/useMessageSettings";
import { toast } from "sonner";

interface MessageSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MessageSettingsDialog = ({ open, onOpenChange }: MessageSettingsDialogProps) => {
  const { settings, loading: settingsLoading, updateSettings } = useMessageSettings();
  const { visibility, loading: visibilityLoading, updateVisibility } = useProfileVisibility();
  const [saving, setSaving] = useState(false);

  // Local form state
  const [allowFrom, setAllowFrom] = useState<"everyone" | "verified_only" | "none">("everyone");
  const [showReadReceipts, setShowReadReceipts] = useState(true);
  const [disclaimerText, setDisclaimerText] = useState("");
  const [autoReply, setAutoReply] = useState("");

  // Visibility state
  const [showScholarship, setShowScholarship] = useState(true);
  const [showInternship, setShowInternship] = useState(true);
  const [showTalent, setShowTalent] = useState(true);
  const [showBootcamp, setShowBootcamp] = useState(true);
  const [showLearnfi, setShowLearnfi] = useState(true);
  const [showXp, setShowXp] = useState(true);

  // Sync form state with fetched settings
  useEffect(() => {
    if (settings) {
      setAllowFrom(settings.allow_messages_from);
      setShowReadReceipts(settings.show_read_receipts);
      setDisclaimerText(settings.disclaimer_text || "");
      setAutoReply(settings.auto_reply_message || "");
    }
  }, [settings]);

  useEffect(() => {
    if (visibility) {
      setShowScholarship(visibility.show_scholarship_status);
      setShowInternship(visibility.show_internship_info);
      setShowTalent(visibility.show_talent_profile);
      setShowBootcamp(visibility.show_bootcamp_activity);
      setShowLearnfi(visibility.show_learnfi_progress);
      setShowXp(visibility.show_xp_stats);
    }
  }, [visibility]);

  const handleSave = async () => {
    setSaving(true);

    const settingsResult = await updateSettings({
      allow_messages_from: allowFrom,
      show_read_receipts: showReadReceipts,
      disclaimer_text: disclaimerText || null,
      auto_reply_message: autoReply || null,
    });

    const visibilityResult = await updateVisibility({
      show_scholarship_status: showScholarship,
      show_internship_info: showInternship,
      show_talent_profile: showTalent,
      show_bootcamp_activity: showBootcamp,
      show_learnfi_progress: showLearnfi,
      show_xp_stats: showXp,
    });

    setSaving(false);

    if (settingsResult?.error || visibilityResult?.error) {
      toast.error("Failed to save settings");
    } else {
      toast.success("Settings saved");
      onOpenChange(false);
    }
  };

  const loading = settingsLoading || visibilityLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Message & Profile Settings
          </DialogTitle>
          <DialogDescription>
            Control who can message you and what they see
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Messaging Settings */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Messaging
              </h4>

              <div className="space-y-2">
                <Label>Who can message you</Label>
                <Select value={allowFrom} onValueChange={(v) => setAllowFrom(v as typeof allowFrom)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">Everyone</SelectItem>
                    <SelectItem value="verified_only">Verified users only</SelectItem>
                    <SelectItem value="none">No one (disable messages)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="read-receipts">Show read receipts</Label>
                <Switch
                  id="read-receipts"
                  checked={showReadReceipts}
                  onCheckedChange={setShowReadReceipts}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disclaimer">
                  Disclaimer (shown to new contacts)
                </Label>
                <Textarea
                  id="disclaimer"
                  placeholder="e.g., No refunds for services. Payment via crypto only."
                  value={disclaimerText}
                  onChange={(e) => setDisclaimerText(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auto-reply">
                  Auto-reply (when messages are disabled)
                </Label>
                <Textarea
                  id="auto-reply"
                  placeholder="e.g., I'm currently not accepting new inquiries..."
                  value={autoReply}
                  onChange={(e) => setAutoReply(e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </div>

            <Separator />

            {/* Profile Visibility */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Profile Visibility
              </h4>
              <p className="text-xs text-muted-foreground">
                Choose what others can see on your profile when they view it
              </p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-scholarship" className="text-sm">
                    Scholarship status
                  </Label>
                  <Switch
                    id="show-scholarship"
                    checked={showScholarship}
                    onCheckedChange={setShowScholarship}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-internship" className="text-sm">
                    Internship info
                  </Label>
                  <Switch
                    id="show-internship"
                    checked={showInternship}
                    onCheckedChange={setShowInternship}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-talent" className="text-sm">
                    Talent profile
                  </Label>
                  <Switch
                    id="show-talent"
                    checked={showTalent}
                    onCheckedChange={setShowTalent}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-bootcamp" className="text-sm">
                    Bootcamp activity
                  </Label>
                  <Switch
                    id="show-bootcamp"
                    checked={showBootcamp}
                    onCheckedChange={setShowBootcamp}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-learnfi" className="text-sm">
                    LearnFi progress
                  </Label>
                  <Switch
                    id="show-learnfi"
                    checked={showLearnfi}
                    onCheckedChange={setShowLearnfi}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-xp" className="text-sm">
                    XP & Stats
                  </Label>
                  <Switch
                    id="show-xp"
                    checked={showXp}
                    onCheckedChange={setShowXp}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Important Notice */}
            <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-xs text-yellow-700 dark:text-yellow-400">
                  <p className="font-medium">Important:</p>
                  <p>
                    All transactions are final. No refunds for completed services.
                    Always verify before making payments.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MessageSettingsDialog;
