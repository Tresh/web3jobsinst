import { useState } from "react";
import { useCampaigns, useCampaignParticipation, type DBCampaign } from "@/hooks/useCampaigns";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, ArrowRight, Loader2, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardCampaigns = () => {
  const { campaigns, loading } = useCampaigns();

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground mt-1">Participate in ecosystem campaigns and earn rewards</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/campaigns">Browse All</Link>
        </Button>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Megaphone className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg mb-2">No active campaigns</CardTitle>
            <CardDescription className="text-center max-w-sm mb-6">
              Check back later for new campaigns to participate in.
            </CardDescription>
            <Button asChild>
              <Link to="/campaigns">
                View Campaigns <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map(campaign => {
            const statusColors: Record<string, string> = {
              active: "bg-green-500/20 text-green-400",
              upcoming: "bg-blue-500/20 text-blue-400",
              ended: "bg-secondary text-muted-foreground",
            };
            return (
              <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {campaign.cover_image_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                      <img src={campaign.cover_image_url} alt={campaign.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize text-xs">{campaign.type}</Badge>
                    <Badge className={`${statusColors[campaign.status] || ""} text-xs`}>{campaign.status}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{campaign.title}</h3>
                  {campaign.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{campaign.description}</p>
                  )}
                  {campaign.reward && (
                    <p className="text-xs text-primary font-medium mb-2">🎁 {campaign.reward}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{campaign.participant_count || 0}/{campaign.max_participants} joined</span>
                    {campaign.deadline && (
                      <span>Ends {new Date(campaign.deadline).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardCampaigns;
