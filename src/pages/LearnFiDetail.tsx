import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import {
  Rocket, BookOpen, Target, Trophy, Users, Clock, Globe, Loader2,
  CheckCircle, Circle, ExternalLink, ArrowLeft, Zap, Send,
} from "lucide-react";

interface Program {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  duration_days: number;
  project_name: string;
  project_logo_url: string | null;
  project_website: string | null;
  reward_type: string;
  reward_amount: number | null;
  reward_token_symbol: string | null;
  reward_pool_size: number | null;
  reward_distribution_method: string | null;
  status: string;
  participants_count: number;
  max_participants: number | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  video_url: string | null;
  video_duration: string | null;
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

const REWARD_LABELS: Record<string, string> = {
  token: "Token Rewards",
  paid: "Paid Rewards",
  xp: "XP Rewards",
  internship: "Internship Opportunity",
};

const LearnFiDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [program, setProgram] = useState<Program | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // Submission form state
  const [activeMission, setActiveMission] = useState<string | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      const [progRes, modRes, misRes] = await Promise.all([
        supabase.from("learnfi_programs").select("*").eq("id", id).single(),
        supabase.from("learnfi_modules").select("*").eq("program_id", id).eq("is_published", true).order("order_index"),
        supabase.from("learnfi_missions").select("*").eq("program_id", id).eq("is_published", true).order("order_index"),
      ]);

      if (progRes.data) setProgram(progRes.data as unknown as Program);
      setModules((modRes.data || []) as unknown as Module[]);
      setMissions((misRes.data || []) as unknown as Mission[]);

      // Check participation & submissions
      if (user) {
        const [partRes, subRes] = await Promise.all([
          supabase.from("learnfi_participants").select("id").eq("program_id", id).eq("user_id", user.id).maybeSingle(),
          supabase.from("learnfi_mission_submissions").select("mission_id, status, xp_awarded").eq("program_id", id).eq("user_id", user.id),
        ]);
        setIsParticipant(!!partRes.data);
        setSubmissions((subRes.data || []) as unknown as Submission[]);
      }

      // Leaderboard
      const { data: lb } = await supabase.rpc("get_learnfi_leaderboard", { p_program_id: id });
      setLeaderboard((lb || []) as unknown as LeaderboardEntry[]);

      setIsLoading(false);
    };
    fetchAll();
  }, [id, user]);

  const handleJoin = async () => {
    if (!user) {
      navigate("/login", { state: { from: { pathname: `/learnfi/${id}` } } });
      return;
    }
    setIsJoining(true);
    const { error } = await supabase.from("learnfi_participants").insert({
      program_id: id!,
      user_id: user.id,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setIsParticipant(true);
      toast({ title: "Joined!", description: "You've joined this LearnFi program." });
    }
    setIsJoining(false);
  };

  const handleSubmitMission = async (missionId: string) => {
    if (!user || !id) return;
    if (!submissionUrl && !submissionText) {
      toast({ title: "Provide a submission", description: "Enter a URL or text.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from("learnfi_mission_submissions").insert({
      mission_id: missionId,
      program_id: id,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavbar />
        <div className="flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavbar />
        <div className="text-center pt-32">
          <p className="text-muted-foreground">Program not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/learnfi")}>
            Back to LearnFi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />

      <main className="pt-[72px]">
        {/* Header */}
        <section className="border-b border-border">
          <div className="section-container py-6 md:py-10">
            <Button variant="ghost" size="sm" onClick={() => navigate("/learnfi")} className="mb-4 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to LearnFi
            </Button>

            <div className="flex flex-col md:flex-row md:items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                {program.project_logo_url ? (
                  <img src={program.project_logo_url} alt={program.project_name} className="w-full h-full object-cover" />
                ) : (
                  <Rocket className="w-7 h-7 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={program.status === "live" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}>
                    {program.status === "live" ? "Live" : program.status === "coming_soon" ? "Coming Soon" : "Closed"}
                  </Badge>
                  <Badge variant="secondary" className="capitalize">{program.category}</Badge>
                  <Badge variant="secondary" className="capitalize">{program.difficulty}</Badge>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">{program.title}</h1>
                <p className="text-sm text-muted-foreground mb-3">by {program.project_name}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4" />{program.participants_count} participants</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{program.duration_days} days</span>
                  <span className="flex items-center gap-1"><Trophy className="w-4 h-4" />{REWARD_LABELS[program.reward_type] || program.reward_type}</span>
                  {program.project_website && (
                    <a href={program.project_website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                      <Globe className="w-4 h-4" />Website
                    </a>
                  )}
                </div>
              </div>

              <div className="shrink-0">
                {program.status === "live" && !isParticipant ? (
                  <Button onClick={handleJoin} disabled={isJoining} size="lg" className="gap-2">
                    {isJoining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                    {user ? "Join Program" : "Sign in to Join"}
                  </Button>
                ) : isParticipant ? (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-sm px-4 py-2">
                    <CheckCircle className="w-4 h-4 mr-1.5" /> Joined
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <section className="section-container py-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="flex overflow-x-auto scrollbar-hide w-full justify-start bg-secondary/30 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="modules">Modules ({modules.length})</TabsTrigger>
              <TabsTrigger value="missions">Missions ({missions.length})</TabsTrigger>
              <TabsTrigger value="rewards">Rewards</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            {/* Overview */}
            <TabsContent value="overview">
              <div className="max-w-3xl">
                <h2 className="text-lg font-semibold text-foreground mb-3">About this Program</h2>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {program.description || "No description provided yet."}
                </p>
              </div>
            </TabsContent>

            {/* Modules */}
            <TabsContent value="modules">
              {modules.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No modules published yet.</p>
              ) : (
                <div className="space-y-3 max-w-3xl">
                  {modules.map((mod, i) => (
                    <Card key={mod.id} className="bg-card border-border">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground">{mod.title}</h3>
                          {mod.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">{mod.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                          {mod.video_duration && <span>{mod.video_duration}</span>}
                          {mod.xp_value > 0 && (
                            <Badge variant="secondary" className="text-xs">{mod.xp_value} XP</Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Missions */}
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
                              {isComplete ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : isPending ? (
                                <Clock className="w-5 h-5 text-amber-500" />
                              ) : (
                                <Circle className="w-5 h-5 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-foreground">{mission.title}</h3>
                                <Badge variant="secondary" className="text-xs">{mission.xp_value} XP</Badge>
                              </div>
                              {mission.description && (
                                <p className="text-sm text-muted-foreground mb-2">{mission.description}</p>
                              )}
                              {mission.external_link && (
                                <a href={mission.external_link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1 mb-2">
                                  <ExternalLink className="w-3 h-3" /> Resource Link
                                </a>
                              )}

                              {/* Status badges */}
                              {isPending && <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">Pending Review</Badge>}
                              {isComplete && <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Approved · +{sub.xp_awarded} XP</Badge>}
                              {sub?.status === "rejected" && <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-xs">Rejected</Badge>}

                              {/* Submission form */}
                              {!sub && isParticipant && program.status === "live" && (
                                activeMission === mission.id ? (
                                  <div className="mt-3 space-y-2">
                                    <Input
                                      placeholder="Submission URL (optional)"
                                      value={submissionUrl}
                                      onChange={(e) => setSubmissionUrl(e.target.value)}
                                    />
                                    <Textarea
                                      placeholder="Describe your work..."
                                      value={submissionText}
                                      onChange={(e) => setSubmissionText(e.target.value)}
                                      rows={3}
                                    />
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

            {/* Rewards */}
            <TabsContent value="rewards">
              <div className="max-w-3xl">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Reward Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-secondary/30 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Reward Type</p>
                        <p className="font-semibold text-foreground capitalize">{program.reward_type}</p>
                      </div>
                      {program.reward_amount && (
                        <div className="bg-secondary/30 rounded-lg p-4">
                          <p className="text-xs text-muted-foreground mb-1">Reward Amount</p>
                          <p className="font-semibold text-foreground">
                            {program.reward_amount} {program.reward_token_symbol || ""}
                          </p>
                        </div>
                      )}
                      {program.reward_pool_size && (
                        <div className="bg-secondary/30 rounded-lg p-4">
                          <p className="text-xs text-muted-foreground mb-1">Total Pool</p>
                          <p className="font-semibold text-foreground">
                            {program.reward_pool_size.toLocaleString()} {program.reward_token_symbol || ""}
                          </p>
                        </div>
                      )}
                      <div className="bg-secondary/30 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Distribution</p>
                        <p className="font-semibold text-foreground capitalize">
                          {program.reward_distribution_method || "Manual"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Leaderboard */}
            <TabsContent value="leaderboard">
              {leaderboard.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">No participants yet.</p>
              ) : (
                <div className="max-w-2xl space-y-2">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.user_id}
                      className={`flex items-center gap-3 p-3 rounded-lg border ${
                        entry.rank <= 3 ? "border-primary/20 bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        entry.rank === 1 ? "bg-amber-500 text-black" :
                        entry.rank === 2 ? "bg-gray-400 text-black" :
                        entry.rank === 3 ? "bg-amber-700 text-white" :
                        "bg-secondary text-muted-foreground"
                      }`}>
                        {entry.rank}
                      </div>
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={entry.user_avatar || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {entry.user_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">{entry.user_name}</p>
                        <p className="text-xs text-muted-foreground">{entry.missions_completed} missions</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{entry.total_xp} XP</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LearnFiDetail;
