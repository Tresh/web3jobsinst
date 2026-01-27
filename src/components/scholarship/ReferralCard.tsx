import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Users, Coins, Clock, CheckCircle } from "lucide-react";

// Referral program deadline
const REFERRAL_DEADLINE = new Date("2025-02-02T23:59:59Z");

export function ReferralCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [wjiBalance, setWjiBalance] = useState(0);
  const [referralCount, setReferralCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  const isReferralActive = new Date() <= REFERRAL_DEADLINE;
  const timeRemaining = REFERRAL_DEADLINE.getTime() - Date.now();
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  const fetchReferralData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Get or generate referral code
      const { data: codeData } = await supabase
        .from("scholar_referral_codes")
        .select("referral_code")
        .eq("user_id", user.id)
        .maybeSingle();

      if (codeData) {
        setReferralCode(codeData.referral_code);
      } else {
        // Generate new code via edge function
        const { data, error } = await supabase.functions.invoke("wji-referral-handler", {
          body: { action: "generate_code", user_id: user.id },
        });
        if (!error && data?.referral_code) {
          setReferralCode(data.referral_code);
        }
      }

      // Get WJI balance
      const { data: balanceData } = await supabase
        .from("wji_balances")
        .select("balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (balanceData) {
        setWjiBalance(balanceData.balance);
      }

      // Get referral count
      const { count } = await supabase
        .from("scholar_referrals")
        .select("*", { count: "exact", head: true })
        .eq("referrer_user_id", user.id);

      setReferralCount(count || 0);
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralLink = async () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    await navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading referral data...</div>
        </CardContent>
      </Card>
    );
  }

  const referralLink = referralCode
    ? `${window.location.origin}/signup?ref=${referralCode}`
    : "";

  return (
    <Card className="bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-transparent border-amber-500/20">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-500" />
            WJI Referral Program
          </CardTitle>
          {isReferralActive ? (
            <Badge variant="outline" className="border-green-500/30 text-green-500">
              <Clock className="w-3 h-3 mr-1" />
              {daysRemaining}d left
            </Badge>
          ) : (
            <Badge variant="outline" className="border-red-500/30 text-red-500">
              Ended
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Invite friends to join the scholarship program. Earn 1 WJI for each approved referral!
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-amber-500">{wjiBalance}</div>
            <div className="text-xs text-muted-foreground">WJI Earned</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-primary">{referralCount}</div>
            <div className="text-xs text-muted-foreground">Referrals</div>
          </div>
        </div>

        {/* Referral Link */}
        {isReferralActive && referralCode && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Referral Link</label>
            <div className="flex gap-2">
              <Input
                value={referralLink}
                readOnly
                className="text-xs bg-background/50"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyReferralLink}
                className="shrink-0"
              >
                {isCopied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        {!isReferralActive && (
          <div className="text-center text-sm text-muted-foreground py-2">
            The referral program has ended. Thank you for participating!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
