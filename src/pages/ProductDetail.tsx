import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMyOrders, useInitializePayment, useVerifyPayment, formatPrice, type DBProduct } from "@/hooks/useProducts";
import { useProductSocialTasks, useMyTaskCompletions } from "@/hooks/useProductSocialTasks";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Share2, ShoppingCart } from "lucide-react";
import PageNavbar from "@/components/PageNavbar";
import Footer from "@/components/Footer";
import SocialTasksGate from "@/components/products/SocialTasksGate";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const initPayment = useInitializePayment();
  const verifyPayment = useVerifyPayment();
  const { data: myOrders = [] } = useMyOrders();
  const [showTasksGate, setShowTasksGate] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["products", "detail", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_published", true)
        .single();
      if (error) throw error;
      return data as DBProduct;
    },
  });

  const isOwned = myOrders.some((o) => o.product_id === id);

  // Check social tasks for this product
  const { data: socialTasks = [] } = useProductSocialTasks(id || "");
  const { data: completions = [] } = useMyTaskCompletions(id || "");
  const completedTaskIds = new Set(completions.map((c) => c.task_id));
  const allTasksCompleted = socialTasks.length === 0 || socialTasks.every((t) => completedTaskIds.has(t.id));

  // Handle Paystack callback
  useEffect(() => {
    const reference = searchParams.get("reference");
    if (reference) {
      verifyPayment.mutate(reference, {
        onSuccess: (data) => {
          if (data.status === "success") {
            toast({ title: "Payment successful!", description: "Your product is now available in your dashboard." });
          } else {
            toast({ title: "Payment not completed", description: "Please try again.", variant: "destructive" });
          }
        },
        onError: () => {
          toast({ title: "Verification failed", variant: "destructive" });
        },
      });
      window.history.replaceState({}, "", `/products/${id}`);
    }
  }, [searchParams]);

  // When tasks are all completed and gate is showing, proceed with acquisition
  useEffect(() => {
    if (showTasksGate && allTasksCompleted && user && product && !isOwned) {
      setShowTasksGate(false);
      proceedWithAcquisition();
    }
  }, [allTasksCompleted, showTasksGate]);

  const proceedWithAcquisition = () => {
    if (!product) return;
    const callbackUrl = `${window.location.origin}/products/${id}?reference=`;
    initPayment.mutate(
      { productId: product.id, callbackUrl },
      {
        onSuccess: (data) => {
          if (data.free) {
            toast({ title: "Product acquired!", description: "Check your dashboard for the download." });
          } else if (data.authorization_url) {
            window.location.href = data.authorization_url;
          }
        },
      }
    );
  };

  const handleBuyNow = async () => {
    if (!product) return;

    if (isOwned) {
      navigate(`/dashboard/library/${id}`);
      return;
    }

    if (!user) {
      navigate("/login", { state: { from: { pathname: `/products/${id}`, search: window.location.search, hash: window.location.hash } } });
      return;
    }

    // If there are incomplete social tasks, show the gate first
    if (!allTasksCompleted) {
      setShowTasksGate(true);
      return;
    }

    proceedWithAcquisition();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/products/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product?.title, text: product?.description || "", url });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied to clipboard!" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <PageNavbar />
        <div className="pt-[72px] flex items-center justify-center min-h-[60vh]">
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen">
        <PageNavbar />
        <div className="pt-[72px] flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-muted-foreground">Product not found</p>
          <Button variant="outline" onClick={() => navigate("/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Products
          </Button>
        </div>
      </div>
    );
  }

  // Show social tasks gate fullscreen-style
  if (showTasksGate && !allTasksCompleted) {
    return (
      <div className="min-h-screen">
        <PageNavbar />
        <main className="pt-[72px]">
          <section className="section-container py-6">
            <Button variant="ghost" size="sm" onClick={() => setShowTasksGate(false)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Product
            </Button>
            <SocialTasksGate productId={id!}>
              {/* This renders once all tasks are complete — the useEffect above handles acquisition */}
              <div className="text-center py-8">
                <p className="text-muted-foreground">All tasks completed! Processing your product...</p>
              </div>
            </SocialTasksGate>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <PageNavbar />
      <main className="pt-[72px]">
        <section className="section-container py-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/products")} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> All Products
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <div className="rounded-xl overflow-hidden border border-border bg-card">
              <img
                src={product.image_url || "/placeholder.svg"}
                alt={product.title}
                className="w-full aspect-[4/3] object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="uppercase text-xs">{product.category}</Badge>
                {product.coming_soon && <Badge variant="outline">Coming Soon</Badge>}
                {isOwned && <Badge className="bg-primary text-primary-foreground">Purchased</Badge>}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{product.title}</h1>

              <p className="text-sm text-muted-foreground">by {product.creator_name}</p>

              <div className="text-2xl font-bold text-primary">
                {isOwned ? "Owned" : formatPrice(product.price, product.currency)}
              </div>

              <div className="flex gap-3 mt-2">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={product.coming_soon || (!isOwned && initPayment.isPending)}
                >
                  {product.coming_soon
                    ? "Coming Soon"
                    : isOwned
                    ? "View in Dashboard"
                    : initPayment.isPending
                    ? "Processing..."
                    : product.price === 0
                    ? "Get Free"
                    : `Buy Now — ${formatPrice(product.price, product.currency)}`}
                </Button>
                <Button variant="outline" size="lg" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {isOwned && product.download_url && product.allow_download && (
                <Button variant="outline" asChild>
                  <a href={product.download_url} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </a>
                </Button>
              )}

              <div className="border-t border-border pt-4 mt-2">
                <h2 className="font-semibold text-foreground mb-2">Description</h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
