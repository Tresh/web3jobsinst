import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Coins, CheckCircle, Users, UserCheck, UserX, Clock } from "lucide-react";

interface ReferralStats {
  totalReferrals: number;
  approvedReferrals: number;
  failedReferrals: number;
  pendingReferrals: number;
}

export function ReferralCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [wjiBalance, setWjiBalance] = useState(0);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    approvedReferrals: 0,
    failedReferrals: 0,
    pendingReferrals: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  useEffect(() => {
    if (user) {
      fetchReferralData();
    }
  }, [user]);

  // Realtime subscription for referral and WJI updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`referral-updates-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scholar_referrals",
          filter: `referrer_user_id=eq.${user.id}`,
        },
        () => fetchReferralData()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wji_balances",
          filter: `user_id=eq.${user.id}`,
        },
        () => fetchReferralData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

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

      // Get all referrals made by this user
      const { data: referrals } = await supabase
        .from("scholar_referrals")
        .select("id, referred_user_id, wji_awarded")
        .eq("referrer_user_id", user.id);

      if (referrals && referrals.length > 0) {
        const totalReferrals = referrals.length;
        
        // Get fraud flags for this user's referrals
        const { data: fraudFlags } = await supabase
          .from("referral_fraud_flags")
          .select("referred_user_id")
          .eq("referrer_user_id", user.id);

        const fraudgedReferredIds = new Set(fraudFlags?.map(f => f.referred_user_id) || []);
        
        // Count by state
        let approvedCount = 0;
        let failedCount = 0;
        let pendingCount = 0;

        for (const ref of referrals) {
          if (fraudgedReferredIds.has(ref.referred_user_id)) {
            failedCount++;
          } else if (ref.wji_awarded) {
            approvedCount++;
          } else {
            pendingCount++;
          }
        }

        setStats({
          totalReferrals,
          approvedReferrals: approvedCount,
          failedReferrals: failedCount,
          pendingReferrals: pendingCount,
        });
      }
    } catch (error) {
      console.error("Error fetching referral data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyReferralCode = async () => {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setIsCopied(true);
    toast({ title: "Copied!", description: "Referral code copied to clipboard" });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const copyReferralLink = async () => {
    if (!referralCode) return;
    const link = `${window.location.origin}/signup?ref=${referralCode}`;
    await navigator.clipboard.writeText(link);
    setIsLinkCopied(true);
    toast({ title: "Copied!", description: "Referral link copied to clipboard" });
    setTimeout(() => setIsLinkCopied(false), 2000);
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
          <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground">
            Ended
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          When you refer your friends to the Web3 Jobs Institute Scholarship Program, you earn WJI — our upcoming in-app reward.
        </p>
        <p className="text-sm text-muted-foreground">
          Referrals are only approved after your friend completes their first task. Once approved, you'll automatically earn WJI, our upcoming in-app reward used to unlock exclusive opportunities across the W3JI ecosystem.
        </p>

        {/* Stats Row - 4 counters */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold text-primary">{stats.totalReferrals}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-500">{stats.pendingReferrals}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <UserCheck className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-500">{stats.approvedReferrals}</div>
            <div className="text-xs text-muted-foreground">Approved</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <UserX className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-500">{stats.failedReferrals}</div>
            <div className="text-xs text-muted-foreground">Failed</div>
          </div>
          <div className="bg-background/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Coins className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-500">{wjiBalance}</div>
            <div className="text-xs text-muted-foreground">WJI Earned</div>
          </div>
        </div>

        {/* Referral Code */}
        {referralCode && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Referral Code</label>
            <div className="flex gap-2">
              <Input
                value={referralCode}
                readOnly
                className="text-center font-mono text-lg bg-background/50 tracking-wider"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={copyReferralCode}
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

        {/* Referral Link */}
        {referralCode && (
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
                {isLinkCopied ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
