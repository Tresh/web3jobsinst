import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Briefcase, MapPin, Clock, ExternalLink, Mail, Loader2 } from "lucide-react";

interface InternProfile {
  id: string;
  full_name: string;
  email: string;
  telegram_username: string | null;
  twitter_handle: string | null;
  portfolio_link: string | null;
  profile_photo_url: string | null;
  primary_skill_category: string;
  skill_level: string;
  tools_known: string[];
  experience_description: string | null;
  paid_preference: string;
  hours_per_week: string;
  work_mode: string;
  open_to_immediate: boolean;
  internship_status: string;
}

const SKILL_CATEGORIES = [
  { value: "_all", label: "All Categories" },
  { value: "web_development", label: "Web Development" },
  { value: "mobile_development", label: "Mobile Development" },
  { value: "design", label: "UI/UX Design" },
  { value: "marketing", label: "Digital Marketing" },
  { value: "content_creation", label: "Content Creation" },
  { value: "data_science", label: "Data Science" },
  { value: "blockchain", label: "Blockchain / Web3" },
  { value: "video_editing", label: "Video Editing" },
  { value: "community_management", label: "Community Management" },
  { value: "project_management", label: "Project Management" },
  { value: "general", label: "General" },
];

const SKILL_LEVELS = [
  { value: "_all", label: "All Levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active_intern: { label: "Active Intern", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  open_to_internship: { label: "Open to Work", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  currently_placed: { label: "Currently Placed", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  not_available: { label: "Not Available", color: "bg-muted text-muted-foreground border-border" },
};

const InternshipMarket = () => {
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("_all");
  const [levelFilter, setLevelFilter] = useState("_all");
  const [paidFilter, setPaidFilter] = useState("_all");

  useEffect(() => {
    const fetchInterns = async () => {
      const { data } = await supabase
        .from("internship_profiles")
        .select("*")
        .eq("is_public", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });
      setInterns((data || []) as unknown as InternProfile[]);
      setIsLoading(false);
    };
    fetchInterns();
  }, []);

  const filtered = interns.filter((intern) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !intern.full_name.toLowerCase().includes(q) &&
        !intern.primary_skill_category.toLowerCase().includes(q) &&
        !(intern.experience_description || "").toLowerCase().includes(q) &&
        !(intern.tools_known || []).some((t) => t.toLowerCase().includes(q))
      ) return false;
    }
    if (categoryFilter !== "_all" && intern.primary_skill_category !== categoryFilter) return false;
    if (levelFilter !== "_all" && intern.skill_level !== levelFilter) return false;
    if (paidFilter !== "_all" && intern.paid_preference !== paidFilter) return false;
    return true;
  });

  const getCategoryLabel = (val: string) =>
    SKILL_CATEGORIES.find((c) => c.value === val)?.label || val;

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />
      <main className="pt-24 pb-16">
        <div className="section-container">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Internship Market
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover skilled interns from our scholarship program. Filter by skill, level, and availability to find the right fit for your team.
            </p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search interns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger><SelectValue placeholder="Skill Level" /></SelectTrigger>
              <SelectContent>
                {SKILL_LEVELS.map((l) => (
                  <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={paidFilter} onValueChange={setPaidFilter}>
              <SelectTrigger><SelectValue placeholder="Paid Preference" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_all">All</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No interns found</p>
              <p className="text-sm mt-1">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((intern) => {
                const status = STATUS_LABELS[intern.internship_status] || STATUS_LABELS.open_to_internship;
                return (
                  <Card key={intern.id} className="bg-card border-border hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar className="w-14 h-14 border-2 border-primary/20">
                          <AvatarImage src={intern.profile_photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {intern.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{intern.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{getCategoryLabel(intern.primary_skill_category)}</p>
                          <Badge className={`mt-1 text-xs ${status.color}`}>{status.label}</Badge>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 text-sm">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Briefcase className="w-3.5 h-3.5 shrink-0" />
                          <span className="capitalize">{intern.skill_level} · {intern.paid_preference === "both" ? "Paid/Unpaid" : intern.paid_preference}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{intern.hours_per_week} hrs/week · {intern.work_mode}</span>
                        </div>
                        {intern.open_to_immediate && (
                          <div className="flex items-center gap-2 text-green-500">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="text-xs">Available immediately</span>
                          </div>
                        )}
                      </div>

                      {intern.tools_known && intern.tools_known.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {intern.tools_known.slice(0, 5).map((tool) => (
                            <Badge key={tool} variant="secondary" className="text-xs">{tool}</Badge>
                          ))}
                          {intern.tools_known.length > 5 && (
                            <Badge variant="secondary" className="text-xs">+{intern.tools_known.length - 5}</Badge>
                          )}
                        </div>
                      )}

                      {intern.experience_description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {intern.experience_description}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="default" asChild className="flex-1">
                          <a href={`mailto:${intern.email}`}>
                            <Mail className="w-3.5 h-3.5 mr-1.5" />
                            Contact
                          </a>
                        </Button>
                        {intern.portfolio_link && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={intern.portfolio_link} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InternshipMarket;
