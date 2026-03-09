import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Gift, ChevronLeft, ChevronRight } from "lucide-react";
import type { DBCampaign } from "@/hooks/useCampaigns";

const ITEMS_PER_PAGE = 8;

interface CampaignGridProps {
  campaigns: DBCampaign[];
  onCampaignClick: (campaign: DBCampaign) => void;
  onJoinClick: (campaign: DBCampaign) => void;
}

const CampaignGrid = ({ campaigns, onCampaignClick, onJoinClick }: CampaignGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(campaigns.length / ITEMS_PER_PAGE);

  const paginatedCampaigns = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return campaigns.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [campaigns, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [campaigns]);

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
          <CampaignCard key={campaign.id} campaign={campaign} onClick={() => onCampaignClick(campaign)} onJoinClick={() => onJoinClick(campaign)} />
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)} className="w-8 h-8 p-0">{page}</Button>
          ))}
          <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
};

const CampaignCard = ({ campaign, onClick, onJoinClick }: { campaign: DBCampaign; onClick: () => void; onJoinClick: () => void }) => {
  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400", upcoming: "bg-blue-500/20 text-blue-400",
    ended: "bg-secondary text-muted-foreground", draft: "bg-secondary text-muted-foreground",
  };
  const typeLabels: Record<string, string> = {
    social: "Social Media", referral: "Refer to Earn", airdrop: "Airdrop",
    content: "Content Creation", community: "Community",
  };
  const isDisabled = campaign.status !== "active";

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-colors duration-150 flex flex-col h-full">
      <button onClick={onClick} className="text-left w-full flex flex-col flex-1">
        {campaign.cover_image_url && (
          <img src={campaign.cover_image_url} alt="" className="w-full h-28 object-cover rounded-lg mb-3" />
        )}
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="outline" className="text-xs font-medium">{typeLabels[campaign.type] || campaign.type}</Badge>
          <Badge className={`text-xs font-medium ${statusColors[campaign.status] || ""}`}>{campaign.status}</Badge>
        </div>
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{campaign.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">{campaign.description}</p>
        <div className="space-y-3">
          {campaign.reward && (
            <div className="flex items-center gap-2 text-sm">
              <Gift className="h-4 w-4 text-primary" />
              <span className="font-medium text-foreground">{campaign.reward}</span>
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /><span>{campaign.participant_count || 0}/{campaign.max_participants}</span></div>
            {campaign.deadline && <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /><span>{new Date(campaign.deadline).toLocaleDateString()}</span></div>}
          </div>
          {campaign.status === "active" && (
            <div className="w-full bg-secondary rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${Math.min(((campaign.participant_count || 0) / campaign.max_participants) * 100, 100)}%` }} />
            </div>
          )}
        </div>
      </button>
      <Button variant={isDisabled ? "outline" : "default"} size="sm" className="w-full mt-4" disabled={isDisabled} onClick={e => { e.stopPropagation(); onJoinClick(); }}>
        {campaign.status === "active" ? "Join Campaign" : campaign.status === "upcoming" ? "Coming Soon" : "Ended"}
      </Button>
    </div>
  );
};

export default CampaignGrid;
