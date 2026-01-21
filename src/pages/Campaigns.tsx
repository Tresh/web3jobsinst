import { useState, useMemo } from "react";
import PageNavbar from "@/components/PageNavbar";
import Footer from "@/components/Footer";
import CampaignGrid from "@/components/campaigns/CampaignGrid";
import CampaignFilterSheet from "@/components/campaigns/CampaignFilterSheet";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import ScholarshipFormDialog from "@/components/ScholarshipFormDialog";
import { campaigns, Campaign, CampaignType, CampaignStatus } from "@/data/campaignsData";
import { Button } from "@/components/ui/button";

const Campaigns = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<CampaignType | "all">("all");
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | "all">("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedType !== "all") count++;
    if (selectedStatus !== "all") count++;
    return count;
  }, [selectedType, selectedStatus]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((campaign) => {
      const matchesSearch =
        searchQuery === "" ||
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.project.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = selectedType === "all" || campaign.type === selectedType;
      const matchesStatus = selectedStatus === "all" || campaign.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [searchQuery, selectedType, selectedStatus]);

  const handleCampaignClick = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setComingSoonOpen(true);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedType("all");
    setSelectedStatus("all");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <PageNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
        searchPlaceholder="Search campaigns..."
        showSearch={true}
      />

      <main className="flex-1 pt-[72px]">
        <div className="section-container py-8 md:py-12">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Campaigns
            </h1>
            <p className="text-base md:text-lg text-muted-foreground">
              Participate in campaigns and earn rewards
            </p>
          </div>

          {/* Results count and clear filters */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? "s" : ""} found
            </p>
            {(activeFiltersCount > 0 || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-primary hover:text-primary/80"
              >
                Clear filters
              </Button>
            )}
          </div>

          {/* Campaign Grid */}
          <CampaignGrid
            campaigns={filteredCampaigns}
            onCampaignClick={handleCampaignClick}
          />
        </div>
      </main>

      <Footer />

      {/* Filter Sheet */}
      <CampaignFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {/* Dialogs */}
      <ScholarshipFormDialog open={scholarshipOpen} onOpenChange={setScholarshipOpen} />
      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={selectedCampaign ? `${selectedCampaign.title} - Coming Soon` : "Campaign Details Coming Soon"}
        onScholarshipClick={() => setScholarshipOpen(true)}
      />
    </div>
  );
};

export default Campaigns;
