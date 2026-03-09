import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wallet } from "lucide-react";
import { useAffiliateStats, useAffiliatePayouts, useRequestPayout } from "@/hooks/useAffiliate";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const payoutMethods = [
  { value: "usdc_base", label: "USDC (Base)" },
  { value: "solana", label: "Solana" },
  { value: "paypal", label: "PayPal" },
  { value: "bank_transfer", label: "Bank Transfer" },
];

const statusColor: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-blue-500/10 text-blue-600",
  completed: "bg-green-500/10 text-green-600",
  failed: "bg-destructive/10 text-destructive",
};

const AffiliatePayoutsTab = () => {
  const stats = useAffiliateStats();
  const { data: payouts, isLoading } = useAffiliatePayouts();
  const requestPayout = useRequestPayout();
  const { toast } = useToast();

  const [method, setMethod] = useState("");
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");

  const handleWithdraw = async () => {
    const numAmount = parseFloat(amount);
    if (!method) return toast({ title: "Select a payout method", variant: "destructive" });
    if (!numAmount || numAmount <= 0) return toast({ title: "Enter a valid amount", variant: "destructive" });
    if (numAmount > stats.availableBalance) return toast({ title: "Insufficient balance", variant: "destructive" });

    await requestPayout.mutateAsync({
      amount: numAmount,
      payoutMethod: method,
      walletAddress: wallet || undefined,
    });
    setAmount("");
    setWallet("");
  };

  return (
    <div className="space-y-6">
      {/* Withdraw Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" /> Withdraw Earnings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-secondary/50">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold text-foreground">${stats.availableBalance.toFixed(2)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Withdraw to</label>
              <Select value={method} onValueChange={setMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {payoutMethods.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Amount ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          {(method === "usdc_base" || method === "solana") && (
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Wallet Address</label>
              <Input
                placeholder="Enter your wallet address"
                value={wallet}
                onChange={(e) => setWallet(e.target.value)}
              />
            </div>
          )}

          <Button
            onClick={handleWithdraw}
            disabled={requestPayout.isPending || stats.availableBalance <= 0}
            className="w-full md:w-auto"
          >
            {requestPayout.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Request Withdrawal
          </Button>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : !payouts || payouts.length === 0 ? (
            <p className="text-muted-foreground text-sm">No payouts yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted-foreground font-medium">Date</th>
                    <th className="text-left p-3 text-muted-foreground font-medium">Method</th>
                    <th className="text-right p-3 text-muted-foreground font-medium">Amount</th>
                    <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 last:border-0">
                      <td className="p-3 text-muted-foreground">{format(new Date(p.created_at), "MMM dd, yyyy")}</td>
                      <td className="p-3 text-foreground">
                        {payoutMethods.find((m) => m.value === p.payout_method)?.label || p.payout_method}
                      </td>
                      <td className="p-3 text-right font-semibold text-foreground">${Number(p.amount).toFixed(2)}</td>
                      <td className="p-3 text-center">
                        <Badge className={statusColor[p.status] || ""} variant="secondary">{p.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AffiliatePayoutsTab;
