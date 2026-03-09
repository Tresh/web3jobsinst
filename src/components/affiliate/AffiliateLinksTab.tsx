import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink } from "lucide-react";
import { useAffiliateLinks } from "@/hooks/useAffiliate";
import { useToast } from "@/hooks/use-toast";

const SITE_URL = "https://web3jobsinst.lovable.app";

const AffiliateLinksTab = () => {
  const { data: links, isLoading } = useAffiliateLinks();
  const { toast } = useToast();

  const copyLink = (code: string, productType: string) => {
    const path = productType === "course" ? "courses" : "products";
    const url = `${SITE_URL}/${path}?ref=${code}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied to clipboard!" });
  };

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading links...</div>;
  }

  if (!links || links.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No affiliate links yet. Go to the Marketplace tab to generate your first link.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">My Affiliate Links</h3>
      <div className="space-y-3">
        {links.map((link) => {
          const path = link.product_type === "course" ? "courses" : "products";
          const url = `${SITE_URL}/${path}?ref=${link.referral_code}`;

          return (
            <Card key={link.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground text-sm">
                        {link.product_id}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {link.product_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-md">{url}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Clicks</p>
                      <p className="font-bold text-foreground">{link.clicks}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Conversions</p>
                      <p className="font-bold text-foreground">{link.conversions}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">Rate</p>
                      <p className="font-bold text-primary">{link.commission_rate}%</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(link.referral_code, link.product_type)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AffiliateLinksTab;
