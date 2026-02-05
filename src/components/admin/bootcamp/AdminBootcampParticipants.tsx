import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Trophy, UserMinus, Loader2, Users } from "lucide-react";
import type { BootcampLeaderboardEntry } from "@/types/bootcamp";

interface AdminBootcampParticipantsProps {
  bootcampId: string;
}

const AdminBootcampParticipants = ({ bootcampId }: AdminBootcampParticipantsProps) => {
  const [participants, setParticipants] = useState<BootcampLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<BootcampLeaderboardEntry | null>(null);

  useEffect(() => {
    fetchParticipants();
  }, [bootcampId]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .rpc("get_bootcamp_leaderboard", { p_bootcamp_id: bootcampId });

      if (error) throw error;
      setParticipants((data as BootcampLeaderboardEntry[]) || []);
    } catch (err: any) {
      console.error("Failed to fetch participants:", err);
      toast.error("Failed to load participants");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async () => {
    if (!confirmRemove) return;

    setRemoving(confirmRemove.user_id);
    try {
      const { error } = await supabase
        .from("bootcamp_participants")
        .delete()
        .eq("bootcamp_id", bootcampId)
        .eq("user_id", confirmRemove.user_id);

      if (error) throw error;

      toast.success("Participant removed");
      setConfirmRemove(null);
      fetchParticipants();
    } catch (err: any) {
      toast.error("Failed to remove participant", { description: err.message });
    } finally {
      setRemoving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (participants.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No approved participants yet</p>
        <p className="text-sm">Participants will appear here after their applications are approved</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Participant</TableHead>
            <TableHead>XP Earned</TableHead>
            <TableHead>Tasks Completed</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {participants.map((p) => (
            <TableRow key={p.user_id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {p.rank <= 3 && (
                    <Trophy
                      className={`w-4 h-4 ${
                        p.rank === 1
                          ? "text-yellow-500"
                          : p.rank === 2
                          ? "text-gray-400"
                          : "text-amber-600"
                      }`}
                    />
                  )}
                  #{p.rank}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={p.user_avatar || undefined} />
                    <AvatarFallback>
                      {p.user_name?.charAt(0)?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{p.user_name}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{p.total_xp} XP</Badge>
              </TableCell>
              <TableCell>{p.tasks_completed}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setConfirmRemove(p)}
                  disabled={removing === p.user_id}
                >
                  {removing === p.user_id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserMinus className="w-4 h-4 mr-1" />
                      Remove
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirm Remove Dialog */}
      <AlertDialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Participant?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{confirmRemove?.user_name}</strong> from this
              bootcamp? This will remove their progress and XP data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveParticipant}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove Participant
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminBootcampParticipants;
