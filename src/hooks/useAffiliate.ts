import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface AffiliateLink {
  id: string;
  user_id: string;
  product_id: string;
  product_type: "course" | "product";
  referral_code: string;
  clicks: number;
  conversions: number;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
}

export interface AffiliateSale {
  id: string;
  affiliate_link_id: string;
  affiliate_user_id: string;
  buyer_email: string | null;
  buyer_name: string | null;
  product_id: string;
  product_type: string;
  product_title: string;
  sale_amount: number;
  commission_amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export interface AffiliatePayout {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payout_method: string;
  wallet_address: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export const useAffiliateLinks = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["affiliate-links", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("affiliate_links")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AffiliateLink[];
    },
  });
};

export const useAffiliateSales = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["affiliate-sales", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("affiliate_sales")
        .select("*")
        .eq("affiliate_user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AffiliateSale[];
    },
  });
};

export const useAffiliatePayouts = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["affiliate-payouts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("affiliate_payouts")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AffiliatePayout[];
    },
  });
};

export const useCreateAffiliateLink = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      productId,
      productType,
      commissionRate,
    }: {
      productId: string;
      productType: "course" | "product";
      commissionRate: number;
    }) => {
      // Generate a unique referral code using username + random
      const username = user?.email?.split("@")[0] || "aff";
      const { data: codeData } = await (supabase as any).rpc("generate_affiliate_code");
      const referralCode = `${username}_${codeData || Math.random().toString(36).slice(2, 8)}`;

      const { data, error } = await (supabase as any)
        .from("affiliate_links")
        .insert({
          user_id: user!.id,
          product_id: productId,
          product_type: productType,
          referral_code: referralCode,
          commission_rate: commissionRate,
        })
        .select()
        .single();
      if (error) throw error;
      return data as AffiliateLink;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-links"] });
      toast({ title: "Affiliate link created!" });
    },
    onError: (err: any) => {
      toast({ title: "Error creating link", description: err.message, variant: "destructive" });
    },
  });
};

export const useRequestPayout = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      amount,
      payoutMethod,
      walletAddress,
    }: {
      amount: number;
      payoutMethod: string;
      walletAddress?: string;
    }) => {
      const { data, error } = await (supabase as any)
        .from("affiliate_payouts")
        .insert({
          user_id: user!.id,
          amount,
          payout_method: payoutMethod,
          wallet_address: walletAddress || null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["affiliate-payouts"] });
      toast({ title: "Payout request submitted!" });
    },
    onError: (err: any) => {
      toast({ title: "Error requesting payout", description: err.message, variant: "destructive" });
    },
  });
};

// Compute aggregate stats from links and sales
export const useAffiliateStats = () => {
  const { data: links } = useAffiliateLinks();
  const { data: sales } = useAffiliateSales();
  const { data: payouts } = useAffiliatePayouts();

  const totalSales = sales?.filter((s) => s.status === "confirmed" || s.status === "paid").length ?? 0;
  const totalEarnings = sales?.filter((s) => s.status === "confirmed" || s.status === "paid").reduce((sum, s) => sum + Number(s.commission_amount), 0) ?? 0;
  const pendingEarnings = sales?.filter((s) => s.status === "pending").reduce((sum, s) => sum + Number(s.commission_amount), 0) ?? 0;
  const paidOut = payouts?.filter((p) => p.status === "completed").reduce((sum, p) => sum + Number(p.amount), 0) ?? 0;
  const availableBalance = totalEarnings - paidOut;
  const activeLinks = links?.filter((l) => l.is_active).length ?? 0;

  return {
    totalSales,
    totalEarnings,
    pendingEarnings,
    availableBalance,
    activeLinks,
    commissionRate: 30,
  };
};
