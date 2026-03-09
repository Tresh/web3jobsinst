import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAffiliateSales } from "@/hooks/useAffiliate";
import { format } from "date-fns";

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  confirmed: "bg-green-500/10 text-green-600",
  paid: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const AffiliateSalesTab = () => {
  const { data: sales, isLoading } = useAffiliateSales();

  if (isLoading) {
    return <div className="text-center py-12 text-muted-foreground">Loading sales...</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Sales History</h3>

      {!sales || sales.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No sales yet. Share your affiliate links to start earning.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Product</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Buyer</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Commission</th>
                    <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b border-border/50 last:border-0">
                      <td className="p-3 text-foreground font-medium">{sale.product_title}</td>
                      <td className="p-3 text-muted-foreground">{sale.buyer_name || sale.buyer_email || "—"}</td>
                      <td className="p-3 text-muted-foreground">{format(new Date(sale.created_at), "MMM dd, yyyy")}</td>
                      <td className="p-3 text-right font-semibold text-foreground">${Number(sale.commission_amount).toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <Badge className={statusColor[sale.status] || ""} variant="secondary">
                          {sale.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AffiliateSalesTab;
