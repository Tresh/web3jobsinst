import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import PageNavbar from "@/components/PageNavbar";
import Footer from "@/components/Footer";
import InternshipFilterSheet from "@/components/internships/InternshipFilterSheet";
import InternshipWaitlistDialog from "@/components/internships/InternshipWaitlistDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Clock, ExternalLink, MessageSquare, MapPin, Loader2, UserPlus } from "lucide-react";
import { useStartConversation } from "@/hooks/useMessages";
import { useToast } from "@/hooks/use-toast";

interface InternProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  telegram_username: string | null;
  twitter_handle: string | null;
  portfolio_link: string | null;
  profile_photo_url: string | null;
  avatar_url: string | null;
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

const CATEGORY_LABELS: Record<string, string> = {
  web_development: "Web Development",
  mobile_development: "Mobile Development",
  design: "UI/UX Design",
  marketing: "Digital Marketing",
  content_creation: "Content Creation",
  data_science: "Data Science",
  blockchain: "Blockchain / Web3",
  video_editing: "Video Editing",
  community_management: "Community Management",
  project_management: "Project Management",
  general: "General",
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  active_intern: { label: "Active Intern", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  open_to_internship: { label: "Open to Work", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  currently_placed: { label: "Currently Placed", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  not_available: { label: "Not Available", color: "bg-muted text-muted-foreground border-border" },
};

const InternshipMarket = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [interns, setInterns] = useState<InternProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [paidFilter, setPaidFilter] = useState("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const [alreadyOnWaitlist, setAlreadyOnWaitlist] = useState(false);

  // Check if user is already on waitlist
  useEffect(() => {
    const checkWaitlist = async () => {
      if (!user?.id) return;
      const { data } = await supabase
        .from("internship_waitlist")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      setAlreadyOnWaitlist(!!data);
    };
    checkWaitlist();
  }, [user?.id, waitlistOpen]);

  useEffect(() => {
    const fetchInterns = async () => {
      const { data } = await supabase
        .from("internship_profiles")
        .select("*")
        .eq("is_public", true)
        .eq("is_approved", true)
        .order("created_at", { ascending: false });

      if (!data || data.length === 0) {
        setInterns([]);
        setIsLoading(false);
        return;
      }

      // Fetch avatar_url from profiles table
      const userIds = data.map((d: any) => d.user_id);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, avatar_url")
        .in("user_id", userIds);

      const merged = data.map((d: any) => {
        const userProfile = profilesData?.find((p) => p.user_id === d.user_id);
        return {
          ...d,
          avatar_url: userProfile?.avatar_url || null,
        };
      }) as InternProfile[];

      setInterns(merged);
      setIsLoading(false);
    };
    fetchInterns();
  }, []);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (categoryFilter !== "all") count++;
    if (levelFilter !== "all") count++;
    if (paidFilter !== "all") count++;
    return count;
  }, [categoryFilter, levelFilter, paidFilter]);

  const filtered = useMemo(() => {
    return interns.filter((intern) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !intern.full_name.toLowerCase().includes(q) &&
          !intern.primary_skill_category.toLowerCase().includes(q) &&
          !(intern.experience_description || "").toLowerCase().includes(q) &&
          !(intern.tools_known || []).some((t) => t.toLowerCase().includes(q))
        ) return false;
      }
      if (categoryFilter !== "all" && intern.primary_skill_category !== categoryFilter) return false;
      if (levelFilter !== "all" && intern.skill_level !== levelFilter) return false;
      if (paidFilter !== "all" && intern.paid_preference !== paidFilter) return false;
      return true;
    });
  }, [searchQuery, categoryFilter, levelFilter, paidFilter, interns]);

  const clearAllFilters = () => {
    setCategoryFilter("all");
    setLevelFilter("all");
    setPaidFilter("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen">
      <PageNavbar
        showSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
        searchPlaceholder="Search interns, skills..."
      />

      <main className="pt-[72px]">
        {/* Header */}
        <section className="section-container py-6 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            Internship Market
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Discover skilled interns from our scholarship program. Filter by skill, level, and availability.
          </p>
          <div className="mt-4">
            {alreadyOnWaitlist ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-sm py-1.5 px-4">
                <Clock className="w-4 h-4 mr-1.5" />
                You're on the waitlist — Pending Approval
              </Badge>
            ) : (
              <Button
                onClick={() => {
                  if (!user) {
                    navigate("/signup");
                  } else {
                    setWaitlistOpen(true);
                  }
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Internship Waitlist
              </Button>
            )}
          </div>
        </section>

        {/* Results info */}
        <section className="section-container pb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filtered.length}</span> interns found
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="text-xs text-primary hover:underline">
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Grid */}
        <section className="section-container pb-20">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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
                          <AvatarImage src={intern.avatar_url || intern.profile_photo_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {intern.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground truncate">{intern.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{CATEGORY_LABELS[intern.primary_skill_category] || intern.primary_skill_category}</p>
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
                        <InternContactButton intern={intern} />
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
        </section>
      </main>

      <Footer />

      <InternshipFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        selectedCategory={categoryFilter}
        onCategoryChange={setCategoryFilter}
        selectedLevel={levelFilter}
        onLevelChange={setLevelFilter}
        selectedPaid={paidFilter}
        onPaidChange={setPaidFilter}
        onClearAll={clearAllFilters}
      />

      <InternshipWaitlistDialog
        open={waitlistOpen}
        onOpenChange={setWaitlistOpen}
      />
    </div>
  );
};

const InternContactButton = ({ intern }: { intern: InternProfile }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { startConversation } = useStartConversation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleContact = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.id === intern.user_id) {
      toast({ title: "That's you!", description: "You can't message yourself." });
      return;
    }
    setLoading(true);
    const convoId = await startConversation(intern.user_id);
    setLoading(false);
    if (convoId) {
      navigate("/dashboard/messages");
    }
  };

  return (
    <Button size="sm" variant="default" className="flex-1" onClick={handleContact} disabled={loading}>
      <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
      {loading ? "Starting..." : "Contact"}
    </Button>
  );
};

export default InternshipMarket;
