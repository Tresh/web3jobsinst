import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Eye, EyeOff, Trash2 } from "lucide-react";
import type { Bootcamp } from "@/types/bootcamp";

interface AdminBootcampSettingsProps {
  bootcamp: Bootcamp;
  onUpdate: () => void;
}

const AdminBootcampSettings = ({ bootcamp, onUpdate }: AdminBootcampSettingsProps) => {
  const [updating, setUpdating] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(bootcamp.registration_open);
  const [isFeatured, setIsFeatured] = useState(bootcamp.is_featured);
  const [maxParticipants, setMaxParticipants] = useState(bootcamp.max_participants.toString());

  const handleSaveSettings = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("bootcamps")
        .update({
          registration_open: registrationOpen,
          is_featured: isFeatured,
          max_participants: parseInt(maxParticipants) || bootcamp.max_participants,
        })
        .eq("id", bootcamp.id);

      if (error) throw error;

      toast.success("Settings saved");
      onUpdate();
    } catch (err: any) {
      toast.error("Failed to save settings", { description: err.message });
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelBootcamp = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from("bootcamps")
        .update({ status: "cancelled" })
        .eq("id", bootcamp.id);

      if (error) throw error;

      toast.success("Bootcamp cancelled");
      onUpdate();
    } catch (err: any) {
      toast.error("Failed to cancel bootcamp", { description: err.message });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure bootcamp visibility and registration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="registration">Registration Open</Label>
              <p className="text-sm text-muted-foreground">
                Allow new users to apply for this bootcamp
              </p>
            </div>
            <Switch
              id="registration"
              checked={registrationOpen}
              onCheckedChange={setRegistrationOpen}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="featured">Featured Bootcamp</Label>
              <p className="text-sm text-muted-foreground">
                Show this bootcamp prominently on the bootcamps page
              </p>
            </div>
            <Switch
              id="featured"
              checked={isFeatured}
              onCheckedChange={setIsFeatured}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxParticipants">Max Participants</Label>
            <Input
              id="maxParticipants"
              type="number"
              min="1"
              max="1000"
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(e.target.value)}
              className="w-32"
            />
            <p className="text-sm text-muted-foreground">
              Current: {bootcamp.current_participants} participants
            </p>
          </div>

          <Button onClick={handleSaveSettings} disabled={updating}>
            {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible actions that affect the bootcamp
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {bootcamp.status !== "cancelled" && bootcamp.status !== "completed" && (
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <p className="font-medium">Cancel Bootcamp</p>
                <p className="text-sm text-muted-foreground">
                  This will cancel the bootcamp and prevent further participation
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Cancel Bootcamp
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Bootcamp?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel <strong>{bootcamp.title}</strong>? This action
                      cannot be undone. All participants will be notified.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Bootcamp</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelBootcamp}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Yes, Cancel Bootcamp
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}

          {(bootcamp.status === "cancelled" || bootcamp.status === "completed") && (
            <p className="text-sm text-muted-foreground text-center py-4">
              This bootcamp is {bootcamp.status}. No further actions available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBootcampSettings;
