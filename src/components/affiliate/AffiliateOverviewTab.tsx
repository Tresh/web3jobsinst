import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Link2, ShoppingCart, Percent } from "lucide-react";
import { useAffiliateStats } from "@/hooks/useAffiliate";
import { usePublicProducts } from "@/hooks/useProducts";

const AffiliateOverviewTab = () => {
  const stats = useAffiliateStats();
  const { data: products } = usePublicProducts();

  const topProducts = (products ?? []).filter((p) => p.price > 0 && !p.coming_soon).slice(0, 4);

  const statCards = [
    { label: "Total Sales", value: stats.totalSales, icon: ShoppingCart },
    { label: "Total Earnings", value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign },
    { label: "Commission Rate", value: `${stats.commissionRate}%`, icon: Percent },
    { label: "Active Links", value: stats.activeLinks, icon: Link2 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <s.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className="text-lg font-bold text-foreground">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Products to Promote</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No products available yet.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                  <div>
                    <p className="font-medium text-foreground text-sm">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Price: {p.price === 0 ? "Free" : `₦${(p.price / 100).toLocaleString()}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Commission</p>
                    <p className="text-sm font-semibold text-primary">
                      {p.price === 0 ? "—" : `₦${((p.price / 100) * 0.4).toLocaleString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateOverviewTab;
