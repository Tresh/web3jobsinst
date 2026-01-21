import { useState, useMemo } from "react";
import PageNavbar from "@/components/PageNavbar";
import Footer from "@/components/Footer";
import TalentGrid from "@/components/talent/TalentGrid";
import TalentFilterSheet from "@/components/talent/TalentFilterSheet";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import ScholarshipFormDialog from "@/components/ScholarshipFormDialog";
import { talents, type Talent, type TalentCategory } from "@/data/talentsData";
import { UserPlus } from "lucide-react";
const TalentMarket = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TalentCategory>("all");
  const [selectedAvailability, setSelectedAvailability] = useState<"all" | "available" | "busy">("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [listTalentDialogOpen, setListTalentDialogOpen] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState<Talent | null>(null);

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
        talent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        talent.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" ||
        (selectedCategory === "developer" && talent.title.toLowerCase().includes("developer")) ||
        (selectedCategory === "designer" && talent.title.toLowerCase().includes("designer")) ||
        (selectedCategory === "marketer" && (talent.title.toLowerCase().includes("market") || talent.title.toLowerCase().includes("growth"))) ||
        (selectedCategory === "writer" && (talent.title.toLowerCase().includes("writer") || talent.title.toLowerCase().includes("content"))) ||
        (selectedCategory === "trader" && talent.title.toLowerCase().includes("trad")) ||
        (selectedCategory === "community" && talent.title.toLowerCase().includes("community"));

      const matchesAvailability =
        selectedAvailability === "all" ||
        (selectedAvailability === "available" && talent.available) ||
        (selectedAvailability === "busy" && !talent.available);

      return matchesSearch && matchesCategory && matchesAvailability;
    });
  }, [searchQuery, selectedCategory, selectedAvailability]);

  const handleTalentClick = (talent: Talent) => {
    setSelectedTalent(talent);
    setComingSoonOpen(true);
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedAvailability("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
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
          <TalentGrid talents={filteredTalents} onTalentClick={handleTalentClick} />
        </section>

        {/* List as a Talent Card */}
        <section className="section-container pb-20">
          <button
            onClick={() => setListTalentDialogOpen(true)}
            className="w-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-6 md:p-8 hover:border-primary/40 hover:from-primary/15 hover:to-primary/10 transition-all duration-200 text-left group"
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
          </button>
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

      {/* Dialogs */}
      <ScholarshipFormDialog open={scholarshipOpen} onOpenChange={setScholarshipOpen} />
      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={selectedTalent ? `${selectedTalent.name}'s Profile` : "Profile Coming Soon"}
        onScholarshipClick={() => setScholarshipOpen(true)}
      />
      <ComingSoonDialog
        open={listTalentDialogOpen}
        onOpenChange={setListTalentDialogOpen}
        title="List as a Talent"
        onScholarshipClick={() => setScholarshipOpen(true)}
      />
    </div>
  );
};

export default TalentMarket;
