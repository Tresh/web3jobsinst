import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import LearnFiPartnerForm from "@/components/learnfi/LearnFiPartnerForm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  BookOpen,
  Target,
  Trophy,
  Users,
  Clock,
  ArrowRight,
  Zap,
  Globe,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LearnFiProgram {
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
  status: string;
  participants_count: number;
  max_participants: number | null;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-green-500/10 text-green-400 border-green-500/20" },
  coming_soon: { label: "Coming Soon", className: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  closed: { label: "Closed", className: "bg-muted text-muted-foreground border-border" },
};

const REWARD_LABELS: Record<string, string> = {
  token: "Token",
  paid: "Paid",
  xp: "XP",
  internship: "Internship",
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "text-green-400",
  intermediate: "text-amber-400",
  advanced: "text-red-400",
};

const HOW_IT_WORKS = [
  { icon: BookOpen, title: "Join a Program", desc: "Browse and enroll in structured ecosystem programs" },
  { icon: Target, title: "Complete Modules", desc: "Learn through curated content and guided lessons" },
  { icon: Zap, title: "Submit Missions", desc: "Apply your knowledge with hands-on task submissions" },
  { icon: Trophy, title: "Earn Rewards", desc: "Get tokens, XP, or internship opportunities" },
];

const LearnFi = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<LearnFiProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [partnerFormOpen, setPartnerFormOpen] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      const { data } = await supabase
        .from("learnfi_programs")
        .select("*")
        .in("status", ["live", "coming_soon", "closed"])
        .order("created_at", { ascending: false });
      setPrograms((data || []) as unknown as LearnFiProgram[]);
      setIsLoading(false);
    };
    fetchPrograms();
  }, []);

  const livePrograms = useMemo(() => programs.filter((p) => p.status === "live"), [programs]);
  const otherPrograms = useMemo(() => programs.filter((p) => p.status !== "live"), [programs]);
  const sortedPrograms = useMemo(() => [...livePrograms, ...otherPrograms], [livePrograms, otherPrograms]);

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />

      <main className="pt-[72px]">
        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-background to-background" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />

          <div className="section-container relative py-16 md:py-24 text-center">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-6 text-sm px-4 py-1.5">
              <Rocket className="w-3.5 h-3.5 mr-1.5" />
              Public Ecosystem Hub
            </Badge>

            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
              LearnFi
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-3">
              Learn. Complete Missions. Earn.
            </p>
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-8">
              Participate in structured ecosystem programs powered by Web3, AI, and creator projects.
              Open to everyone.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => {
                  document.getElementById("programs")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="gap-2"
              >
                Explore Programs
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setPartnerFormOpen(true)}
                className="gap-2"
              >
                <Globe className="w-4 h-4" />
                Launch a Program
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section className="section-container py-12 md:py-16">
          <h2 className="text-xl md:text-2xl font-bold text-foreground text-center mb-10">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.title}
                className="relative bg-card border border-border rounded-xl p-6 text-center group hover:border-primary/30 transition-all duration-200"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </div>
                <step.icon className="w-8 h-8 text-primary mx-auto mb-4 mt-2" />
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════ PROGRAM GRID ═══════════════ */}
        <section id="programs" className="section-container py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">
                Featured Programs
              </h2>
              <p className="text-sm text-muted-foreground">
                {sortedPrograms.length} program{sortedPrograms.length !== 1 ? "s" : ""} available
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : sortedPrograms.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-border rounded-xl">
              <Rocket className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-foreground mb-2">No programs yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Be the first to launch a LearnFi program for your project.
              </p>
              <Button onClick={() => setPartnerFormOpen(true)} variant="outline">
                Launch a Program
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPrograms.map((program) => {
                const statusCfg = STATUS_CONFIG[program.status] || STATUS_CONFIG.coming_soon;
                return (
                  <Card
                    key={program.id}
                    className="bg-card border-border hover:border-primary/30 transition-all duration-300 group"
                  >
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center shrink-0 overflow-hidden">
                          {program.project_logo_url ? (
                            <img
                              src={program.project_logo_url}
                              alt={program.project_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Rocket className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {program.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">{program.project_name}</p>
                        </div>
                        <Badge className={`text-xs shrink-0 ${statusCfg.className}`}>
                          {statusCfg.label}
                        </Badge>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="text-xs capitalize">
                          {program.category}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {REWARD_LABELS[program.reward_type] || program.reward_type}
                          {program.reward_token_symbol && ` · ${program.reward_token_symbol}`}
                        </Badge>
                        <Badge variant="secondary" className={`text-xs capitalize ${DIFFICULTY_COLORS[program.difficulty] || ""}`}>
                          {program.difficulty}
                        </Badge>
                      </div>

                      {/* Description */}
                      {program.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {program.description}
                        </p>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {program.participants_count}
                          {program.max_participants && `/${program.max_participants}`}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {program.duration_days}d
                        </span>
                        {program.reward_pool_size && (
                          <span className="flex items-center gap-1">
                            <Trophy className="w-3.5 h-3.5" />
                            {program.reward_pool_size.toLocaleString()} pool
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <Button
                        size="sm"
                        variant={program.status === "live" ? "default" : "outline"}
                        className="w-full"
                        disabled={program.status === "closed"}
                        onClick={() => {
                          if (program.status === "coming_soon") return;
                          navigate(`/learnfi/${program.id}`);
                        }}
                      >
                        {program.status === "live"
                          ? "View Program"
                          : program.status === "coming_soon"
                          ? "Coming Soon"
                          : "Closed"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* ═══════════════ LAUNCH CTA ═══════════════ */}
        <section className="section-container pb-20">
          <div
            onClick={() => setPartnerFormOpen(true)}
            className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 md:p-8 hover:border-primary/40 hover:from-primary/15 hover:to-primary/10 transition-all duration-200 cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  Launch a LearnFi Program
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Onboard users into your ecosystem with structured learn-to-earn programs
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors hidden sm:block" />
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <LearnFiPartnerForm open={partnerFormOpen} onOpenChange={setPartnerFormOpen} />
    </div>
  );
};

export default LearnFi;
