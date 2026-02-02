import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Search, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { BootcampParticipant } from "@/types/bootcamp";

interface ParticipantWithProfile extends BootcampParticipant {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface BootcampParticipantsProps {
  participants: BootcampParticipant[];
  currentUserId?: string;
}

const BootcampParticipants = ({ participants, currentUserId }: BootcampParticipantsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [participantsWithProfiles, setParticipantsWithProfiles] = useState<ParticipantWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, [participants]);

  const fetchProfiles = async () => {
    if (participants.length === 0) {
      setParticipantsWithProfiles([]);
      setLoading(false);
      return;
    }

    try {
      const userIds = participants.map((p) => p.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);
      
      const withProfiles = participants.map((p) => ({
        ...p,
        profile: profileMap.get(p.user_id),
      }));

      setParticipantsWithProfiles(withProfiles);
    } catch (err) {
      console.error("Failed to fetch profiles:", err);
      setParticipantsWithProfiles(participants);
    } finally {
      setLoading(false);
    }
  };

  const filteredParticipants = participantsWithProfiles.filter((p) => {
    const name = p.profile?.full_name || "Anonymous";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading participants...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Participants ({participants.length})
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search participants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredParticipants.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No participants found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredParticipants.map((participant) => {
              const isCurrentUser = participant.user_id === currentUserId;
              const name = participant.profile?.full_name || "Anonymous";
              
              return (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                    isCurrentUser ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                  }`}
                >
                  <Avatar>
                    <AvatarImage src={participant.profile?.avatar_url || undefined} />
                    <AvatarFallback>
                      {name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{name}</p>
                      {isCurrentUser && (
                        <Badge variant="outline" className="text-xs shrink-0">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Zap className="w-3 h-3" />
                      {participant.total_xp} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BootcampParticipants;
