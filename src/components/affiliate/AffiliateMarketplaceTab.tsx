import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Loader2, Package } from "lucide-react";
import { usePublicProducts } from "@/hooks/useProducts";
import { useAffiliateLinks, useCreateAffiliateLink } from "@/hooks/useAffiliate";
import { useToast } from "@/hooks/use-toast";

const PRODUCT_COMMISSION = 40;

const AffiliateMarketplaceTab = () => {
  const { data: products, isLoading } = usePublicProducts();
  const { data: existingLinks } = useAffiliateLinks();
  const createLink = useCreateAffiliateLink();
  const { toast } = useToast();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const hasLink = (productId: string) =>
    existingLinks?.some((l) => l.product_id === productId && l.is_active);

  const handleGenerate = async (productId: string, rate: number) => {
    if (hasLink(productId)) {
      toast({ title: "Link already exists for this product" });
      return;
    }
    setGeneratingId(productId);
    try {
      await createLink.mutateAsync({ productId, productType: "product", commissionRate: rate });
    } finally {
      setGeneratingId(null);
    }
  };

  // Only show live, paid products (not coming soon)
  const liveProducts = (products ?? []).filter((p) => p.price > 0 && !p.coming_soon);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" /> Products Available for Promotion
        </h3>
        {liveProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No products available for affiliate promotion yet. Check back later.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {liveProducts.map((p) => {
              const priceDisplay = `₦${(p.price / 100).toLocaleString()}`;
              const commissionAmount = ((p.price / 100) * PRODUCT_COMMISSION) / 100;
              return (
                <Card key={p.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{p.title}</p>
                        <p className="text-sm text-muted-foreground">Price: {priceDisplay}</p>
                      </div>
                      <Badge variant="secondary">{PRODUCT_COMMISSION}% commission</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-primary font-semibold">
                        Earn ₦{commissionAmount.toLocaleString()} per sale
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleGenerate(p.id, PRODUCT_COMMISSION)}
                        disabled={!!hasLink(p.id) || generatingId === p.id}
                      >
                        {generatingId === p.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : hasLink(p.id) ? (
                          "Link Created"
                        ) : (
                          <>
                            <Link2 className="w-4 h-4" /> Generate Link
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateMarketplaceTab;
