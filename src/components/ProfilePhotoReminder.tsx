import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

const REMINDER_KEY = "profile_photo_reminder_last";
const ONE_HOUR = 60 * 60 * 1000;

const ProfilePhotoReminder = () => {
  const { user, profile, isLoading } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !user || !profile) return;
    // Has photo already — skip
    if (profile.avatar_url) return;

    const last = localStorage.getItem(REMINDER_KEY);
    if (last && Date.now() - Number(last) < ONE_HOUR) return;

    // Show after a short delay so app loads first
    const timer = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(REMINDER_KEY, String(Date.now()));
    }, 3000);

    return () => clearTimeout(timer);
  }, [isLoading, user, profile]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            Add a Profile Photo
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          A profile photo helps others recognise you across the platform — in bootcamps, talent listings, and messages.
        </p>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Later
          </Button>
          <Button
            onClick={() => {
              setOpen(false);
              navigate("/dashboard/settings");
            }}
          >
            Add Photo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePhotoReminder;
