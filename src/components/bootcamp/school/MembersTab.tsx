import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Crown,
  User,
  Circle,
  Zap,
  Loader2,
} from "lucide-react";
import type { Bootcamp, BootcampParticipant, BootcampLeaderboardEntry } from "@/types/bootcamp";

interface MemberProfile {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  headline: string | null;
  role: "host" | "student";
  total_xp: number;
  tasks_completed: number;
  joined_at: string;
  is_online: boolean;
}

interface MembersTabProps {
  bootcamp: Bootcamp;
  participants: BootcampParticipant[];
  leaderboard: BootcampLeaderboardEntry[];
  isHost: boolean;
}

const MembersTab = ({ bootcamp, participants, leaderboard, isHost }: MembersTabProps) => {
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberProfile | null>(null);

  useEffect(() => {
    fetchMembers();
  }, [participants]);

  const fetchMembers = async () => {
    try {
      setLoading(true);

      // Get all participant user IDs including host
      const userIds = [...participants.map((p) => p.user_id), bootcamp.host_user_id];
      const uniqueUserIds = [...new Set(userIds)];

      // Fetch profiles
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, headline")
        .in("user_id", uniqueUserIds);

      if (error) throw error;

      // Create member profiles
      const memberProfiles: MemberProfile[] = uniqueUserIds.map((userId) => {
        const profile = profiles?.find((p) => p.user_id === userId);
        const participant = participants.find((p) => p.user_id === userId);
        const leaderboardEntry = leaderboard.find((e) => e.user_id === userId);
        const isHostUser = userId === bootcamp.host_user_id;

        return {
          user_id: userId,
          full_name: profile?.full_name || leaderboardEntry?.user_name || (isHostUser ? bootcamp.host_name : "Anonymous"),
          avatar_url: profile?.avatar_url || leaderboardEntry?.user_avatar || null,
          headline: profile?.headline || null,
          role: isHostUser ? "host" : "student",
          total_xp: participant?.total_xp || 0,
          tasks_completed: participant?.tasks_completed || 0,
          joined_at: participant?.joined_at || bootcamp.created_at,
          is_online: Math.random() > 0.7, // Simulated online status
        };
      });

      // Sort: host first, then by XP
      memberProfiles.sort((a, b) => {
        if (a.role === "host") return -1;
        if (b.role === "host") return 1;
        return b.total_xp - a.total_xp;
      });

      setMembers(memberProfiles);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = searchQuery
    ? members.filter((m) =>
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : members;

  const onlineCount = members.filter((m) => m.is_online).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      {/* Header Stats */}
      <div className="px-4 py-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold">Members</h2>
            <p className="text-sm text-muted-foreground">
              {members.length} members • {onlineCount} online
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="divide-y divide-border/50">
        {filteredMembers.map((member) => (
          <button
            key={member.user_id}
            onClick={() => setSelectedMember(member)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
          >
            {/* Avatar with online indicator */}
            <div className="relative">
              <Avatar className="w-12 h-12 border border-border">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {member.full_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {member.is_online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium truncate">{member.full_name}</p>
                {member.role === "host" && (
                  <Badge className="bg-primary/10 text-primary border-primary/30 text-xs">
                    <Crown className="w-3 h-3 mr-1" />
                    Host
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {member.headline || (member.role === "host" ? "Bootcamp Host" : "Student")}
              </p>
            </div>

            {/* XP */}
            <div className="text-right shrink-0">
              <p className="text-sm font-medium flex items-center gap-1 justify-end">
                <Zap className="w-3 h-3 text-primary" />
                {member.total_xp}
              </p>
              <p className="text-xs text-muted-foreground">
                {member.tasks_completed} tasks
              </p>
            </div>
          </button>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <User className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No members found</p>
        </div>
      )}

      {/* Member Profile Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Member Profile</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="text-center py-4">
              {/* Avatar */}
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 border-2 border-border">
                  <AvatarImage src={selectedMember.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {selectedMember.full_name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {selectedMember.is_online && (
                  <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background" />
                )}
              </div>

              {/* Name & Role */}
              <h3 className="text-xl font-semibold">{selectedMember.full_name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1">
                {selectedMember.role === "host" ? (
                  <Badge className="bg-primary/10 text-primary border-primary/30">
                    <Crown className="w-3 h-3 mr-1" />
                    Host
                  </Badge>
                ) : (
                  <Badge variant="secondary">Student</Badge>
                )}
                {selectedMember.is_online ? (
                  <span className="flex items-center gap-1 text-xs text-green-500">
                    <Circle className="w-2 h-2 fill-current" />
                    Online
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">Offline</span>
                )}
              </div>

              {/* Bio */}
              {selectedMember.headline && (
                <p className="text-muted-foreground mt-3">{selectedMember.headline}</p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="text-2xl font-bold text-primary">{selectedMember.total_xp}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{selectedMember.tasks_completed}</p>
                  <p className="text-xs text-muted-foreground">Tasks Done</p>
                </div>
              </div>

              {/* Joined Date */}
              <p className="text-xs text-muted-foreground mt-4">
                Joined {new Date(selectedMember.joined_at).toLocaleDateString()}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MembersTab;
