import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Clock, Wallet } from "lucide-react";
import { useAffiliateStats } from "@/hooks/useAffiliate";

const AffiliateEarningsTab = () => {
  const stats = useAffiliateStats();

  const cards = [
    { label: "Total Earnings", value: `$${stats.totalEarnings.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
    { label: "Available Balance", value: `$${stats.availableBalance.toFixed(2)}`, icon: Wallet, color: "text-green-500" },
    { label: "Pending Commission", value: `$${stats.pendingEarnings.toFixed(2)}`, icon: Clock, color: "text-yellow-500" },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Earnings Summary</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardContent className="p-6 flex flex-col items-center text-center gap-3">
              <div className="p-3 rounded-full bg-secondary">
                <c.icon className={`w-6 h-6 ${c.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{c.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold text-foreground mb-2">How Earnings Work</h4>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
            <li>Commissions are confirmed after the buyer's payment is verified.</li>
            <li>Pending commissions typically clear within 7 days.</li>
            <li>Available balance can be withdrawn from the Payouts tab.</li>
            <li>Courses earn 30% commission; digital products earn 40%.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliateEarningsTab;
