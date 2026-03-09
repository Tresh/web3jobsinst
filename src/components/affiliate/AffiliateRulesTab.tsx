import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, BookOpen, Package } from "lucide-react";

const AffiliateRulesTab = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> Affiliate Program Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal pl-5 space-y-3 text-sm text-foreground">
            <li>
              <strong>Eligible Products:</strong> Affiliates can promote courses and digital products listed on the platform.
            </li>
            <li>
              <strong>Commission Confirmation:</strong> Commissions are paid only after successful payment confirmation from the buyer.
            </li>
            <li>
              <strong>No Self-Purchases:</strong> Self-purchases using your own affiliate links are strictly prohibited and will result in commission forfeiture.
            </li>
            <li>
              <strong>No Spam Marketing:</strong> Spam marketing, misleading ads, and deceptive promotions are prohibited.
            </li>
            <li>
              <strong>Link Attribution:</strong> Each affiliate link is uniquely tied to your account. Commissions are only tracked through your unique links.
            </li>
            <li>
              <strong>Payout Minimum:</strong> A minimum balance of $10 is required to request a withdrawal.
            </li>
            <li>
              <strong>Payout Processing:</strong> Payout requests are reviewed and processed within 5–7 business days.
            </li>
            <li>
              <strong>Violations:</strong> Violating these rules may result in immediate removal from the affiliate program and forfeiture of all pending commissions.
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Commission Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <BookOpen className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Courses</p>
                <p className="text-2xl font-bold text-primary">30%</p>
                <p className="text-xs text-muted-foreground">commission per sale</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-secondary/50">
              <Package className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Digital Products</p>
                <p className="text-2xl font-bold text-primary">40%</p>
                <p className="text-xs text-muted-foreground">commission per sale</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateRulesTab;
