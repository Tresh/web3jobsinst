import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageNavbar from "@/components/PageNavbar";
import Footer from "@/components/Footer";
import TalentGrid from "@/components/talent/TalentGrid";
import TalentFilterSheet from "@/components/talent/TalentFilterSheet";
import { useTalentMarketplace, TALENT_CATEGORIES, type TalentProfileWithUser } from "@/hooks/useTalentProfile";
import { type TalentCategory } from "@/data/talentsData";
import { UserPlus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const TalentMarket = () => {
  const { user } = useAuth();
  const { talents, loading } = useTalentMarketplace();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TalentCategory>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<"all" | "available" | "busy">("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedAvailability !== "all") count++;
    return count;
  }, [selectedCategory, selectedAvailability]);

  const filteredTalents = useMemo(() => {
    return talents.filter((talent) => {
      const matchesSearch =
        searchQuery === "" ||
        talent.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "developer" && (talent.category === "developer" || talent.category === "ai_developer")) ||
        (selectedCategory === "designer" && talent.category === "designer") ||
        (selectedCategory === "marketer" && talent.category === "marketer") ||
        (selectedCategory === "writer" && talent.category === "writer") ||
        (selectedCategory === "trader" && talent.category === "trader") ||
        (selectedCategory === "community" && talent.category === "community_manager");

      const matchesAvailability =
        selectedAvailability === "all" ||
        talent.availability === selectedAvailability;

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [searchQuery, selectedCategory, selectedAvailability, talents]);

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedAvailability("all");
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
        searchPlaceholder="Search talents, skills..."
      />

      <main className="pt-[72px]">
        {/* Header */}
        <section className="section-container py-6 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            Talents
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Connect with verified Web3 freelancers, developers, and creators
          </p>
        </section>

        {/* Results info */}
        <section className="section-container pb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredTalents.length}</span> talents found
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Talent Grid */}
        <section className="section-container pb-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <TalentGrid talents={filteredTalents} />
          )}
        </section>

        {/* List as a Talent Card */}
        <section className="section-container pb-20">
          <Link
            to={user ? "/dashboard/talent" : "/login"}
            className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 md:p-8 hover:border-primary/40 hover:from-primary/15 hover:to-primary/10 transition-all duration-200 text-left group block"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                  List as a Talent
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Showcase your skills, get discovered by Web3 projects, and start earning
                </p>
              </div>
            </div>
          </Link>
        </section>
      </main>

      <Footer />

      {/* Filter Sheet */}
      <TalentFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedAvailability={selectedAvailability}
        onAvailabilityChange={setSelectedAvailability}
        onClearAll={clearAllFilters}
      />
    </div>
  );
};

export default TalentMarket;
