import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Rocket, Trophy, Target, ArrowRight, Loader2 } from "lucide-react";

interface Participation {
  program_id: string;
  total_xp: number;
  missions_completed: number;
  status: string;
  joined_at: string;
}

interface ProgramInfo {
  id: string;
  title: string;
  project_name: string;
  project_logo_url: string | null;
  status: string;
  reward_type: string;
}

const DashboardLearnFi = () => {
  const { user } = useAuth();
  const [participations, setParticipations] = useState<Participation[]>([]);
  const [programs, setPrograms] = useState<ProgramInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: parts } = await supabase
        .from("learnfi_participants")
        .select("program_id, total_xp, missions_completed, status, joined_at")
        .eq("user_id", user.id);

      const participationData = (parts || []) as unknown as Participation[];
      setParticipations(participationData);

      if (participationData.length > 0) {
        const ids = participationData.map((p) => p.program_id);
        const { data: progs } = await supabase
          .from("learnfi_programs")
          .select("id, title, project_name, project_logo_url, status, reward_type")
          .in("id", ids);
        setPrograms((progs || []) as unknown as ProgramInfo[]);
      }
      setIsLoading(false);
    };
    fetch();
  }, [user]);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My LearnFi Programs</h1>
        <p className="text-muted-foreground text-sm mt-1">Track your learn-to-earn progress</p>
      </div>

      {participations.length === 0 ? (
        <Card className="border-dashed border-border">
          <CardContent className="p-8 text-center">
            <Rocket className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="font-medium text-foreground mb-1">No programs joined yet</p>
            <p className="text-sm text-muted-foreground mb-4">Explore LearnFi programs and start earning</p>
            <Button asChild variant="outline">
              <Link to="/learnfi">Browse Programs <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {participations.map((part) => {
            const prog = programs.find((p) => p.id === part.program_id);
            if (!prog) return null;
            return (
              <Card key={part.program_id} className="bg-card border-border hover:border-primary/30 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                      {prog.project_logo_url ? (
                        <img src={prog.project_logo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Rocket className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{prog.title}</h3>
                      <p className="text-xs text-muted-foreground">{prog.project_name}</p>
                    </div>
                    <Badge className={prog.status === "live" ? "bg-green-500/10 text-green-400" : "bg-muted text-muted-foreground"} >
                      {prog.status === "live" ? "Live" : prog.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-4">
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Trophy className="w-4 h-4" /> {part.total_xp} XP
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Target className="w-4 h-4" /> {part.missions_completed} missions
                    </span>
                  </div>

                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to={`/learnfi/${part.program_id}`}>
                      Continue <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardLearnFi;
