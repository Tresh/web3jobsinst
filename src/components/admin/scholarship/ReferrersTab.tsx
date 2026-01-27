import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users, Eye, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

interface ReferrerStats {
  referrer_user_id: string;
  referrer_name: string;
  referrer_email: string;
  referral_code: string;
  is_enabled: boolean;
  total_referrals: number;
  approved_referrals: number;
  total_wji_earned: number;
  fraud_count: number;
}

interface ReferredUser {
  referred_user_id: string;
  referred_name: string;
  referred_email: string;
  signup_date: string;
  scholarship_status: string;
  approval_date: string | null;
  wji_generated: number;
}

interface FraudFlag {
  id: string;
  referrer_user_id: string;
  referred_user_id: string | null;
  rule_triggered: string;
  details: Record<string, unknown>;
  created_at: string;
}

// Referral deadline for status display
const REFERRAL_DEADLINE = new Date("2025-02-02T23:59:59Z");

export function ReferrersTab() {
  const { toast } = useToast();
  const [referrers, setReferrers] = useState<ReferrerStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReferrer, setSelectedReferrer] = useState<ReferrerStats | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [fraudFlags, setFraudFlags] = useState<FraudFlag[]>([]);
  const [showFraudDialog, setShowFraudDialog] = useState(false);
  const [selectedFraudReferrer, setSelectedFraudReferrer] = useState<ReferrerStats | null>(null);

  const isReferralActive = new Date() <= REFERRAL_DEADLINE;

  useEffect(() => {
    fetchReferrers();
  }, []);

  const fetchReferrers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc("get_referrer_stats");
      if (error) throw error;
      setReferrers((data as ReferrerStats[]) || []);
    } catch (error) {
      console.error("Error fetching referrer stats:", error);
      toast({ title: "Error", description: "Failed to load referrer data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReferredUsers = async (referrerId: string) => {
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase.rpc("get_referred_users", { p_referrer_id: referrerId });
      if (error) throw error;
      setReferredUsers((data as ReferredUser[]) || []);
    } catch (error) {
      console.error("Error fetching referred users:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const fetchFraudFlags = async (referrerId: string) => {
    try {
      const { data, error } = await supabase
        .from("referral_fraud_flags")
        .select("*")
        .eq("referrer_user_id", referrerId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setFraudFlags((data as FraudFlag[]) || []);
    } catch (error) {
      console.error("Error fetching fraud flags:", error);
    }
  };

  const toggleReferrerEnabled = async (referrerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("scholar_referral_codes")
        .update({ is_enabled: !currentStatus })
        .eq("user_id", referrerId);

      if (error) throw error;

      toast({
        title: currentStatus ? "Referrer Disabled" : "Referrer Enabled",
        description: currentStatus
          ? "Future referral rewards are now blocked"
          : "Referral rewards are now active",
      });

      fetchReferrers();
    } catch (error) {
      console.error("Error toggling referrer:", error);
      toast({ title: "Error", description: "Failed to update referrer status", variant: "destructive" });
    }
  };

  const handleViewDetails = (referrer: ReferrerStats) => {
    setSelectedReferrer(referrer);
    fetchReferredUsers(referrer.referrer_user_id);
  };

  const handleViewFraud = (referrer: ReferrerStats) => {
    setSelectedFraudReferrer(referrer);
    fetchFraudFlags(referrer.referrer_user_id);
    setShowFraudDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="outline" className="border-green-500/30 text-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="outline" className="border-red-500/30 text-red-500">Rejected</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-yellow-500/30 text-yellow-500">Pending</Badge>;
      default:
        return <Badge variant="outline" className="border-muted-foreground/30">No Application</Badge>;
    }
  };

  const getFraudBadge = (fraudCount: number) => {
    if (fraudCount === 0) {
      return <Badge variant="outline" className="border-green-500/30 text-green-500"><CheckCircle className="w-3 h-3 mr-1" />Clean</Badge>;
    }
    return (
      <Badge variant="outline" className="border-amber-500/30 text-amber-500 cursor-pointer">
        <AlertTriangle className="w-3 h-3 mr-1" />{fraudCount} Flag{fraudCount > 1 ? "s" : ""}
      </Badge>
    );
  };

  const getRuleLabel = (rule: string) => {
    switch (rule) {
      case "self_referral":
        return "Self-Referral Attempt";
      case "ip_abuse":
        return "IP Address Abuse";
      case "referral_cap_exceeded":
        return "Daily Cap Exceeded";
      default:
        return rule;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Referrer Dashboard
              </CardTitle>
              <CardDescription>View referral activity and manage referrers</CardDescription>
            </div>
            <Badge variant="outline" className={isReferralActive ? "border-green-500/30 text-green-500" : "border-red-500/30 text-red-500"}>
              {isReferralActive ? "Referral Program Active" : "Referral Program Expired"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : referrers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No referrers found. Referral codes are generated when scholars access their dashboard.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Referrer</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-center">Total Referrals</TableHead>
                  <TableHead className="text-center">Approved</TableHead>
                  <TableHead className="text-center">WJI Earned</TableHead>
                  <TableHead className="text-center">Fraud Status</TableHead>
                  <TableHead className="text-center">Enabled</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrers.map((referrer) => (
                  <TableRow key={referrer.referrer_user_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{referrer.referrer_name}</div>
                        <div className="text-sm text-muted-foreground">{referrer.referrer_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{referrer.referral_code}</code>
                    </TableCell>
                    <TableCell className="text-center">{referrer.total_referrals}</TableCell>
                    <TableCell className="text-center">{referrer.approved_referrals}</TableCell>
                    <TableCell className="text-center font-medium text-amber-500">{referrer.total_wji_earned}</TableCell>
                    <TableCell className="text-center">
                      <div onClick={() => referrer.fraud_count > 0 && handleViewFraud(referrer)} className={referrer.fraud_count > 0 ? "cursor-pointer" : ""}>
                        {getFraudBadge(referrer.fraud_count)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={referrer.is_enabled}
                        onCheckedChange={() => toggleReferrerEnabled(referrer.referrer_user_id, referrer.is_enabled)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(referrer)}>
                        <Eye className="w-4 h-4 mr-1" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Referred Users Dialog */}
      <Dialog open={!!selectedReferrer} onOpenChange={() => setSelectedReferrer(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Referred Users by {selectedReferrer?.referrer_name}</DialogTitle>
            <DialogDescription>
              Users who signed up using referral code: {selectedReferrer?.referral_code}
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : referredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No referred users found for this referrer.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Signup Date</TableHead>
                  <TableHead>Scholarship Status</TableHead>
                  <TableHead>Approval Date</TableHead>
                  <TableHead className="text-center">WJI Generated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referredUsers.map((user) => (
                  <TableRow key={user.referred_user_id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.referred_name || "Unknown"}</div>
                        <div className="text-sm text-muted-foreground">{user.referred_email || "N/A"}</div>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(user.signup_date), "MMM d, yyyy")}</TableCell>
                    <TableCell>{getStatusBadge(user.scholarship_status)}</TableCell>
                    <TableCell>
                      {user.approval_date ? format(new Date(user.approval_date), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {user.wji_generated > 0 ? (
                        <Badge className="bg-amber-500/10 text-amber-500">{user.wji_generated} WJI</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      {/* Fraud Flags Dialog */}
      <Dialog open={showFraudDialog} onOpenChange={setShowFraudDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Fraud Flags for {selectedFraudReferrer?.referrer_name}
            </DialogTitle>
            <DialogDescription>
              Review flagged referral activity for this user
            </DialogDescription>
          </DialogHeader>
          {fraudFlags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fraud flags found.
            </div>
          ) : (
            <div className="space-y-3">
              {fraudFlags.map((flag) => (
                <Card key={flag.id} className="border-amber-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-500 mb-2">
                          {getRuleLabel(flag.rule_triggered)}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(flag.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </div>
                    {flag.details && Object.keys(flag.details).length > 0 && (
                      <div className="mt-2 text-xs bg-muted p-2 rounded">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(flag.details, null, 2)}</pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
