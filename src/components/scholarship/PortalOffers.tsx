import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gift, ExternalLink, Clock, Briefcase, Megaphone, GraduationCap, Zap, Loader2 } from "lucide-react";
import { format } from "date-fns";

interface Offer {
  id: string;
  title: string;
  description: string | null;
  category: string;
  reward_type: string;
  deadline: string | null;
  external_link: string | null;
  status: string;
  created_at: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  job: <Briefcase className="w-4 h-4" />,
  campaign: <Megaphone className="w-4 h-4" />,
  internship: <GraduationCap className="w-4 h-4" />,
  gig: <Zap className="w-4 h-4" />,
};

const CATEGORY_LABELS: Record<string, string> = {
  job: "Job",
  campaign: "Campaign",
  internship: "Internship",
  gig: "Gig",
};

const REWARD_LABELS: Record<string, string> = {
  paid: "Paid",
  commission: "Commission",
  exposure: "Exposure",
};

export function PortalOffers() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOffers() {
      const { data } = await supabase
        .from("scholarship_offers")
        .select("*")
        .eq("status", "live")
        .order("created_at", { ascending: false });

      setOffers((data || []) as unknown as Offer[]);
      setIsLoading(false);
    }
    fetchOffers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-12 text-center">
          <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Offers Available Yet</h3>
          <p className="text-muted-foreground">
            Exclusive job opportunities, campaigns, and gigs will appear here. Check back soon!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Exclusive Offers</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {offers.map((offer) => {
          const isExpired = offer.deadline && new Date(offer.deadline) < new Date();

          return (
            <Card key={offer.id} className={isExpired ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{offer.title}</CardTitle>
                  <div className="flex gap-1.5 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs gap-1">
                      {CATEGORY_ICONS[offer.category] || <Gift className="w-3 h-3" />}
                      {CATEGORY_LABELS[offer.category] || offer.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {REWARD_LABELS[offer.reward_type] || offer.reward_type}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {offer.description && (
                  <p className="text-sm text-muted-foreground">{offer.description}</p>
                )}
                <div className="flex items-center justify-between">
                  {offer.deadline && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {isExpired ? "Expired" : `Deadline: ${format(new Date(offer.deadline), "MMM d, yyyy")}`}
                    </span>
                  )}
                  {offer.external_link && !isExpired && (
                    <Button size="sm" asChild>
                      <a href={offer.external_link} target="_blank" rel="noopener noreferrer">
                        Apply Now
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
