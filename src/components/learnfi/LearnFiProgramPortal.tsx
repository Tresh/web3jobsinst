import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  Zap, BookOpen, Target, Trophy, Gift, Loader2,
  CheckCircle, Circle, Clock, ExternalLink, Send,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";

interface LearnFiProgramPortalProps {
  programId: string;
  isCreator?: boolean;
}

interface Program {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  duration_days: number;
  project_name: string;
  project_logo_url: string | null;
  reward_type: string;
  reward_amount: number | null;
  reward_token_symbol: string | null;
  reward_pool_size: number | null;
  status: string;
  participants_count: number;
  internship_details: string | null;
  leaderboard_tiers: any;
  reward_amount_type: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  video_url: string | null;
  video_duration: string | null;
  cover_image_url: string | null;
  xp_value: number;
}

interface Mission {
  id: string;
  title: string;
  description: string | null;
  mission_type: string;
  external_link: string | null;
  xp_value: number;
  order_index: number;
  module_id: string | null;
}

interface Submission {
  mission_id: string;
  status: string;
  xp_awarded: number | null;
}

interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  total_xp: number;
  missions_completed: number;
  rank: number;
}

interface Participation {
  total_xp: number;
  missions_completed: number;
  status: string;
  joined_at: string;
}

const REWARD_LABELS: Record<string, string> = { token: "Token", paid: "Paid", xp: "XP", internship: "Internship" };

export default function LearnFiProgramPortal({ programId, isCreator = false }: LearnFiProgramPortalProps) {
  const { user } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [participation, setParticipation] = useState<Participation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user || !programId) return;
    const fetchAll = async () => {
      const [progRes, modRes, misRes, partRes, subRes, lbRes] = await Promise.all([
        supabase.from("learnfi_programs").select("*").eq("id", programId).single(),
        supabase.from("learnfi_modules").select("*").eq("program_id", programId).eq("is_published", true).order("order_index"),
        supabase.from("learnfi_missions").select("*").eq("program_id", programId).eq("is_published", true).order("order_index"),
        supabase.from("learnfi_participants").select("total_xp, missions_completed, status, joined_at").eq("program_id", programId).eq("user_id", user.id).maybeSingle(),
        supabase.from("learnfi_mission_submissions").select("mission_id, status, xp_awarded").eq("program_id", programId).eq("user_id", user.id),
        supabase.rpc("get_learnfi_leaderboard", { p_program_id: programId }),
      ]);

      if (progRes.data) setProgram(progRes.data as unknown as Program);
      setModules((modRes.data || []) as unknown as Module[]);
      setMissions((misRes.data || []) as unknown as Mission[]);
      setParticipation(partRes.data as unknown as Participation | null);
      setSubmissions((subRes.data || []) as unknown as Submission[]);
      setLeaderboard((lbRes.data || []) as unknown as LeaderboardEntry[]);
      setIsLoading(false);
    };
    fetchAll();
  }, [user, programId]);

  const handleSubmitMission = async (missionId: string) => {
    if (!user) return;
    if (!submissionUrl && !submissionText) {
      toast({ title: "Provide a submission", description: "Enter a URL or text.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from("learnfi_mission_submissions").insert({
      mission_id: missionId,
      program_id: programId,
      user_id: user.id,
      submission_url: submissionUrl || null,
      submission_text: submissionText || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubmissions((prev) => [...prev, { mission_id: missionId, status: "pending", xp_awarded: null }]);
      setActiveMission(null);
      setSubmissionUrl("");
      setSubmissionText("");
      toast({ title: "Submitted!", description: "Your mission submission is under review." });
    }
    setIsSubmitting(false);
  };

  const getSubmission = (missionId: string) => submissions.find((s) => s.mission_id === missionId);
  const userRank = leaderboard.find((e) => e.user_id === user?.id);
  const approvedCount = submissions.filter((s) => s.status === "approved").length;

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        <p>Program not found.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/dashboard/learnfi">Back to LearnFi</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
            {program.project_logo_url ? (
              <img src={program.project_logo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Zap className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{program.title}</h1>
            <p className="text-sm text-muted-foreground">by {program.project_name}</p>
          </div>
        </div>

        {/* Stats bar */}
        {participation && (
          <div className="flex flex-wrap gap-4 text-sm">
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <Trophy className="w-3.5 h-3.5" /> {participation.total_xp} XP
            </Badge>
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
              <Target className="w-3.5 h-3.5" /> {approvedCount}/{missions.length} Missions
            </Badge>
            {userRank && (
              <Badge variant="secondary" className="gap-1.5 py-1.5 px-3">
                Rank #{userRank.rank}
              </Badge>
            )}
            <Badge variant="secondary" className="gap-1.5 py-1.5 px-3 capitalize">
              {REWARD_LABELS[program.reward_type] || program.reward_type} Reward
            </Badge>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto scrollbar-hide lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview" className="gap-2">
            <Zap className="w-4 h-4 hidden sm:inline" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <BookOpen className="w-4 h-4 hidden sm:inline" />
            <span>Modules</span>
          </TabsTrigger>
          <TabsTrigger value="missions" className="gap-2">
            <Target className="w-4 h-4 hidden sm:inline" />
            <span>Missions</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="gap-2">
            <Trophy className="w-4 h-4 hidden sm:inline" />
            <span>Leaderboard</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2">
            <Gift className="w-4 h-4 hidden sm:inline" />
            <span>Rewards</span>
          </TabsTrigger>
        </TabsList>

        {/* ═══ Overview ═══ */}
        <TabsContent value="overview">
          <div className="max-w-3xl space-y-6">
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-3">About this Program</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {program.description || "No description provided yet."}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{participation?.total_xp || 0}</p>
                  <p className="text-xs text-muted-foreground">Total XP</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{approvedCount}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">#{userRank?.rank || "-"}</p>
                  <p className="text-xs text-muted-foreground">Rank</p>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{program.duration_days}d</p>
                  <p className="text-xs text-muted-foreground">Duration</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ═══ Modules ═══ */}
        <TabsContent value="modules">
          {modules.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No modules published yet.</p>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {modules.map((mod, i) => (
                <Card key={mod.id} className="bg-card border-border hover:border-primary/20 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    {mod.cover_image_url ? (
                      <img src={mod.cover_image_url} alt="" className="w-24 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-24 h-14 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground">{mod.title}</h3>
                      {mod.description && <p className="text-sm text-muted-foreground line-clamp-1">{mod.description}</p>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      {mod.video_duration && <span>{mod.video_duration}</span>}
                      {mod.xp_value > 0 && <Badge variant="secondary" className="text-xs">{mod.xp_value} XP</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ Missions ═══ */}
        <TabsContent value="missions">
          {missions.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No missions published yet.</p>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {missions.map((mission) => {
                const sub = getSubmission(mission.id);
                const isComplete = sub?.status === "approved";
                const isPending = sub?.status === "pending";

                return (
                  <Card key={mission.id} className={`bg-card border-border ${isComplete ? "border-green-500/20" : ""}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {isComplete ? <CheckCircle className="w-5 h-5 text-green-500" /> : isPending ? <Clock className="w-5 h-5 text-amber-500" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">{mission.title}</h3>
                            <Badge variant="secondary" className="text-xs">{mission.xp_value} XP</Badge>
                          </div>
                          {mission.description && <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>}
                          {mission.external_link && (
                            <a href={mission.external_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-2">
                              <ExternalLink className="w-3 h-3" /> Resource Link
                            </a>
                          )}
                          {isPending && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">Pending Review</Badge>}
                          {isComplete && <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Approved · +{sub.xp_awarded} XP</Badge>}
                          {sub?.status === "rejected" && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Rejected</Badge>}

                          {!sub && program.status === "live" && (
                            activeMission === mission.id ? (
                              <div className="mt-3 space-y-2">
                                <Input placeholder="Submission URL (optional)" value={submissionUrl} onChange={(e) => setSubmissionUrl(e.target.value)} />
                                <Textarea placeholder="Describe your work..." value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} rows={3} />
                                <div className="flex gap-2">
                                  <Button size="sm" onClick={() => handleSubmitMission(mission.id)} disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Send className="w-3 h-3 mr-1" />}
                                    Submit
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => setActiveMission(null)}>Cancel</Button>
                                </div>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" className="mt-2" onClick={() => setActiveMission(mission.id)}>
                                Submit Mission
                              </Button>
                            )
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ═══ Leaderboard ═══ */}
        <TabsContent value="leaderboard">
          {leaderboard.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No participants yet.</p>
          ) : (
            <div className="max-w-2xl space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.user_id === user?.id ? "bg-primary/5 border border-primary/20" : "bg-card border border-border"
                  }`}
                >
                  <span className={`w-8 text-center font-bold text-sm ${entry.rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>
                    #{entry.rank}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={entry.user_avatar || undefined} />
                    <AvatarFallback className="text-xs">{entry.user_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="flex-1 font-medium text-sm text-foreground truncate">
                    {entry.user_name}
                    {entry.user_id === user?.id && <span className="text-primary ml-1">(You)</span>}
                  </span>
                  <Badge variant="secondary" className="text-xs">{entry.total_xp} XP</Badge>
                  <span className="text-xs text-muted-foreground">{entry.missions_completed} missions</span>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ═══ Rewards ═══ */}
        <TabsContent value="rewards">
          <div className="max-w-2xl">
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-semibold text-foreground">Reward Info</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Type</span>
                    <Badge variant="secondary" className="capitalize">{REWARD_LABELS[program.reward_type]}</Badge>
                  </div>
                  {program.reward_amount && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Amount</span>
                      <span className="text-sm font-medium text-foreground">
                        {program.reward_amount} {program.reward_token_symbol || ""}
                        {program.reward_amount_type === "per_participant" && " per participant"}
                      </span>
                    </div>
                  )}
                  {program.internship_details && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-1">Internship Details</p>
                      <p className="text-sm text-foreground whitespace-pre-wrap">{program.internship_details}</p>
                    </div>
                  )}
                  {program.leaderboard_tiers && Array.isArray(program.leaderboard_tiers) && program.leaderboard_tiers.length > 0 && (
                    <div className="pt-2">
                      <p className="text-sm text-muted-foreground mb-2">Leaderboard Tiers</p>
                      <div className="space-y-1">
                        {(program.leaderboard_tiers as any[]).map((tier: any, i: number) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {tier.rank_from === tier.rank_to || !tier.rank_to
                                ? `#${tier.rank_from || tier.rank}`
                                : `#${tier.rank_from} - #${tier.rank_to}`}
                            </span>
                            <span className="font-medium text-foreground">{tier.amount} {program.reward_token_symbol || ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
