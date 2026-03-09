import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import PageNavbar from "@/components/PageNavbar";
import Footer from "@/components/Footer";
import CampaignGrid from "@/components/campaigns/CampaignGrid";
import CampaignFilterSheet from "@/components/campaigns/CampaignFilterSheet";
import { useCampaigns, useCampaignParticipation, type DBCampaign } from "@/hooks/useCampaigns";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, ExternalLink, CheckCircle, Send } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const Campaigns = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { campaigns, loading } = useCampaigns();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Campaign detail dialog
  const [detailCampaign, setDetailCampaign] = useState<DBCampaign | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let c = 0;
    if (selectedType !== "all") c++;
    if (selectedStatus !== "all") c++;
    return c;
  }, [selectedType, selectedStatus]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(c => {
      const ms = searchQuery === "" || c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const mt = selectedType === "all" || c.type === selectedType;
      const mst = selectedStatus === "all" || c.status === selectedStatus;
      return ms && mt && mst;
    });
  }, [campaigns, searchQuery, selectedType, selectedStatus]);

  const clearAllFilters = () => {
    setSearchQuery(""); setSelectedType("all"); setSelectedStatus("all");
  };

  const handleCampaignClick = (campaign: DBCampaign) => {
    setDetailCampaign(campaign);
    setDetailOpen(true);
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
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Campaigns</h1>
            <p className="text-base md:text-lg text-muted-foreground">Participate in campaigns and earn rewards</p>
          </div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${filteredCampaigns.length} campaign${filteredCampaigns.length !== 1 ? "s" : ""} found`}
            </p>
            {(activeFiltersCount > 0 || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-primary">Clear filters</Button>
            )}
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
          ) : (
            <CampaignGrid
              campaigns={filteredCampaigns}
              onCampaignClick={handleCampaignClick}
              onJoinClick={handleCampaignClick}
            />
          )}
        </div>
      </main>
      <Footer />
      <CampaignFilterSheet
        open={filterSheetOpen} onOpenChange={setFilterSheetOpen}
        selectedType={selectedType as any} onTypeChange={setSelectedType as any}
        selectedStatus={selectedStatus as any} onStatusChange={setSelectedStatus as any}
      />
      {detailCampaign && (
        <CampaignDetailDialog
          campaign={detailCampaign}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </div>
  );
};

// ======= Campaign Detail Dialog =======
const CampaignDetailDialog = ({ campaign, open, onOpenChange }: {
  campaign: DBCampaign; open: boolean; onOpenChange: (o: boolean) => void;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { participation, loading, joinCampaign, submitProof } = useCampaignParticipation(campaign.id);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submissionText, setSubmissionText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleJoin = async () => {
    if (!user) { toast({ title: "Please log in first", variant: "destructive" }); return; }
    const ok = await joinCampaign();
    if (ok) toast({ title: "Joined campaign!" });
    else toast({ title: "Failed to join", variant: "destructive" });
  };

  const handleSubmit = async () => {
    if (!submissionUrl && !submissionText) { toast({ title: "Provide a submission", variant: "destructive" }); return; }
    setSubmitting(true);
    const ok = await submitProof(submissionUrl, submissionText);
    if (ok) toast({ title: "Submission sent!" });
    else toast({ title: "Failed to submit", variant: "destructive" });
    setSubmitting(false);
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-500/20 text-green-400", upcoming: "bg-blue-500/20 text-blue-400",
    ended: "bg-secondary text-muted-foreground", draft: "bg-secondary text-muted-foreground",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{campaign.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {campaign.cover_image_url && (
            <img src={campaign.cover_image_url} alt="" className="w-full h-40 object-cover rounded-lg" />
          )}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="capitalize">{campaign.type}</Badge>
            <Badge className={statusColors[campaign.status] || ""}>{campaign.status}</Badge>
            {campaign.project && <Badge variant="secondary">{campaign.project}</Badge>}
          </div>
          {campaign.description && <p className="text-sm text-muted-foreground">{campaign.description}</p>}
          {campaign.reward && (
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-sm font-medium text-primary">🎁 Reward: {campaign.reward}</p>
            </div>
          )}
          {campaign.requirements?.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Requirements:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {campaign.requirements.map((r: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{campaign.participant_count || 0}/{campaign.max_participants} joined</span>
            {campaign.deadline && <span>Deadline: {new Date(campaign.deadline).toLocaleDateString()}</span>}
          </div>

          {/* Participation State */}
          {campaign.status === "active" && (
            <div className="border-t border-border pt-4">
              {!participation ? (
                <Button className="w-full" onClick={handleJoin} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Join Campaign
                </Button>
              ) : participation.status === "joined" ? (
                <div className="space-y-3">
                  <Badge variant="secondary">✅ Joined</Badge>
                  <p className="text-sm font-medium">Submit your proof:</p>
                  <Input value={submissionUrl} onChange={e => setSubmissionUrl(e.target.value)} placeholder="Submission URL (tweet link, etc.)" />
                  <Textarea value={submissionText} onChange={e => setSubmissionText(e.target.value)} placeholder="Additional notes..." rows={2} />
                  <Button className="w-full gap-2" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Submit Proof
                  </Button>
                </div>
              ) : participation.status === "submitted" ? (
                <div className="text-center py-3">
                  <Badge variant="secondary" className="gap-1"><Send className="w-3 h-3" /> Submitted — Under Review</Badge>
                </div>
              ) : participation.status === "approved" ? (
                <div className="text-center py-3">
                  <Badge className="bg-green-500/20 text-green-400 gap-1"><CheckCircle className="w-3 h-3" /> Approved!</Badge>
                </div>
              ) : (
                <Badge variant="destructive">Rejected</Badge>
              )}
            </div>
          )}
          {campaign.status !== "active" && (
            <p className="text-sm text-muted-foreground text-center py-2">
              {campaign.status === "upcoming" ? "Campaign hasn't started yet" : campaign.status === "ended" ? "Campaign has ended" : "Campaign not available"}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Campaigns;
