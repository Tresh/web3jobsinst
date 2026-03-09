import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface DBProduct {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number; // kobo
  currency: string;
  image_url: string | null;
  creator_name: string;
  creator_user_id: string | null;
  download_url: string | null;
  downloads_count: number;
  is_published: boolean;
  coming_soon: boolean;
  created_at: string;
  updated_at: string;
}

export interface DBProductOrder {
  id: string;
  user_id: string;
  product_id: string;
  email: string;
  amount: number;
  currency: string;
  paystack_reference: string | null;
  paystack_transaction_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  products?: DBProduct;
}

export const usePublicProducts = () => {
  return useQuery({
    queryKey: ["products", "public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DBProduct[];
    },
  });
};

export const useAdminProducts = () => {
  return useQuery({
    queryKey: ["products", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DBProduct[];
    },
  });
};

export const useAdminOrders = () => {
  return useQuery({
    queryKey: ["product-orders", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_orders")
        .select("*, products(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DBProductOrder[];
    },
  });
};

export const useMyOrders = () => {
  const { user } = useAuth();

  return useQuery<DBProductOrder[]>({
    queryKey: ["product-orders", "my", user?.id ?? null],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("product_orders")
        .select("*, products(*)")
        .eq("status", "success")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as DBProductOrder[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: Partial<DBProduct>) => {
      const { data, error } = await supabase
        .from("products")
        .insert(product as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product created" });
    },
    onError: (err: any) => {
      toast({ title: "Error creating product", description: err.message, variant: "destructive" });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DBProduct> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product updated" });
    },
    onError: (err: any) => {
      toast({ title: "Error updating product", description: err.message, variant: "destructive" });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Product deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Error deleting product", description: err.message, variant: "destructive" });
    },
  });
};

export const useInitializePayment = () => {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ productId, callbackUrl }: { productId: string; callbackUrl: string }) => {
      const { data, error } = await supabase.functions.invoke("paystack-initialize", {
        body: { product_id: productId, callback_url: callbackUrl },
      });
      if (error) throw error;
      return data;
    },
    onError: (err: any) => {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reference: string) => {
      const { data, error } = await supabase.functions.invoke("paystack-verify", {
        body: { reference },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Helper to format price from kobo
export const formatPrice = (priceInKobo: number, currency = "NGN"): string => {
  if (priceInKobo === 0) return "FREE";
  const amount = priceInKobo / 100;
  return `₦${amount.toLocaleString()}`;
};
