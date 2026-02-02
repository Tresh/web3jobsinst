import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Campaign } from "@/data/campaignsData";
import { Users, Calendar, Gift, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 8;

interface CampaignGridProps {
  campaigns: Campaign[];
  onCampaignClick: (campaign: Campaign) => void;
  onJoinClick: (campaign: Campaign) => void;
}

const CampaignGrid = ({ campaigns, onCampaignClick, onJoinClick }: CampaignGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(campaigns.length / ITEMS_PER_PAGE);

  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return campaigns.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [campaigns, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [campaigns]);

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No campaigns found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {paginatedCampaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onClick={() => onCampaignClick(campaign)}
            onJoinClick={() => onJoinClick(campaign)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

interface CampaignCardProps {
  campaign: Campaign;
  onClick: () => void;
  onJoinClick: () => void;
}

const CampaignCard = ({ campaign, onClick, onJoinClick }: CampaignCardProps) => {
  const statusColors = {
    active: "bg-green-500/20 text-green-400",
    upcoming: "bg-blue-500/20 text-blue-400",
    coming_soon: "bg-primary/20 text-primary",
    ended: "bg-secondary text-muted-foreground",
  };

  const statusLabels = {
    active: "Active",
    upcoming: "Upcoming",
    coming_soon: "Coming Soon",
    ended: "Ended",
  };

  const typeLabels = {
    social: "Social Media",
    referral: "Refer to Earn",
    airdrop: "Airdrop",
    content: "Content Creation",
    community: "Community",
  };

  const isDisabled = campaign.status === "coming_soon" || campaign.status === "ended";

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors duration-150 flex flex-col h-full">
      <button
        onClick={onClick}
        className="text-left w-full flex flex-col flex-1"
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="outline" className="text-xs font-medium">
            {typeLabels[campaign.type]}
          </Badge>
          {campaign.status !== "coming_soon" && (
            <Badge className={`text-xs font-medium ${statusColors[campaign.status]}`}>
              {statusLabels[campaign.status]}
            </Badge>
          )}
        </div>

        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
          {campaign.title}
        </h3>

        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
          {campaign.description}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Gift className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">{campaign.reward}</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{campaign.participants}/{campaign.maxParticipants}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(campaign.deadline).toLocaleDateString()}</span>
            </div>
          </div>

          {campaign.status === "active" && (
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((campaign.participants / campaign.maxParticipants) * 100, 100)}%` }}
              />
            </div>
          )}
        </div>
      </button>

      <Button
        variant={isDisabled ? "outline" : "default"}
        size="sm"
        className="w-full mt-4"
        disabled={isDisabled}
        onClick={(e) => {
          e.stopPropagation();
          onJoinClick();
        }}
      >
        {campaign.status === "coming_soon" ? "Coming Soon" : campaign.status === "ended" ? "Ended" : "Join Campaign"}
      </Button>
    </div>
  );
};

export default CampaignGrid;
