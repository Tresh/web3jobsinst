import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, Loader2, BookOpen, Package } from "lucide-react";
import { usePublicProducts } from "@/hooks/useProducts";
import { useAffiliateLinks, useCreateAffiliateLink } from "@/hooks/useAffiliate";
import { useToast } from "@/hooks/use-toast";

const COURSE_COMMISSION = 30;
const PRODUCT_COMMISSION = 40;

// Static course data for affiliate marketplace
const affiliateCourses = [
  { id: "web3-job-hunting", title: "Web3 Job Hunting Bootcamp", price: 99, type: "course" as const },
  { id: "ai-creator-playbook", title: "AI Creator Playbook", price: 49, type: "course" as const },
  { id: "web3-marketing", title: "Web3 Marketing Masterclass", price: 79, type: "course" as const },
  { id: "defi-fundamentals", title: "DeFi Fundamentals Course", price: 59, type: "course" as const },
  { id: "content-monetization", title: "Content Monetization System", price: 39, type: "course" as const },
];

const AffiliateMarketplaceTab = () => {
  const { data: products } = usePublicProducts();
  const { data: existingLinks } = useAffiliateLinks();
  const createLink = useCreateAffiliateLink();
  const { toast } = useToast();
  const [generatingId, setGeneratingId] = useState<string | null>(null);

  const hasLink = (productId: string) =>
    existingLinks?.some((l) => l.product_id === productId && l.is_active);

  const handleGenerate = async (productId: string, productType: "course" | "product", rate: number) => {
    if (hasLink(productId)) {
      toast({ title: "Link already exists for this product" });
      return;
    }
    setGeneratingId(productId);
    try {
      await createLink.mutateAsync({ productId, productType, commissionRate: rate });
    } finally {
      setGeneratingId(null);
    }
  };

  const dbProducts = (products ?? []).filter((p) => p.price > 0);

  return (
    <div className="space-y-6">
      {/* Courses section */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Courses
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {affiliateCourses.map((c) => (
            <Card key={c.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-foreground">{c.title}</p>
                    <p className="text-sm text-muted-foreground">Price: ${c.price}</p>
                  </div>
                  <Badge variant="secondary">{COURSE_COMMISSION}% commission</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-primary font-semibold">
                    Earn ${((c.price * COURSE_COMMISSION) / 100).toFixed(2)} per sale
                  </p>
                  <Button
                    size="sm"
                    onClick={() => handleGenerate(c.id, "course", COURSE_COMMISSION)}
                    disabled={!!hasLink(c.id) || generatingId === c.id}
                  >
                    {generatingId === c.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : hasLink(c.id) ? (
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
          ))}
        </div>
      </div>

      {/* Digital Products section */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" /> Digital Products
        </h3>
        {dbProducts.length === 0 ? (
          <p className="text-muted-foreground text-sm">No paid products available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dbProducts.map((p) => {
              const priceUsd = p.price / 100;
              return (
                <Card key={p.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-foreground">{p.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Price: ₦{priceUsd.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="secondary">{PRODUCT_COMMISSION}% commission</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-primary font-semibold">
                        Earn ₦{((priceUsd * PRODUCT_COMMISSION) / 100).toLocaleString()} per sale
                      </p>
                      <Button
                        size="sm"
                        onClick={() => handleGenerate(p.id, "product", PRODUCT_COMMISSION)}
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
