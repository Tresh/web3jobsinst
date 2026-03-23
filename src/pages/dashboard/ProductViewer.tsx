import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, Briefcase, BookOpen, GraduationCap, Gift } from "lucide-react";
import { useMyOrders, formatPrice } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SocialTasksGate from "@/components/products/SocialTasksGate";

const ProductViewer = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: orders = [], isLoading } = useMyOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const matchingOrder = orders.find((o) => o.product_id === productId);
    if (matchingOrder?.products) {
      setProduct(matchingOrder.products);
      setHasAccess(true);
    } else if (!isLoading && orders.length >= 0) {
      setHasAccess(false);
    }
  }, [orders, productId, isLoading]);

  useEffect(() => {
    if (hasAccess && user && productId) {
      supabase.from("product_access_logs").insert({
        user_id: user.id,
        product_id: productId,
        action: "view",
      });
    }
  }, [hasAccess, user, productId]);

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!hasAccess || !product) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-16">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have access to this product.</p>
          <Button onClick={() => navigate("/products")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  const viewerUrl = product.viewer_url || product.download_url;
  const allowDownload = product.allow_download !== false;
  const isPdf = viewerUrl?.toLowerCase().endsWith(".pdf");

  const handleDownload = () => {
    if (!product.download_url) return;
    if (user && productId) {
      supabase.from("product_access_logs").insert({
        user_id: user.id,
        product_id: productId,
        action: "download",
      });
    }
    window.open(product.download_url, "_blank");
  };

  return (
    <SocialTasksGate productId={productId!}>
    <div className="p-4 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard/library")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl lg:text-2xl font-bold">{product.title}</h1>
            <p className="text-sm text-muted-foreground">by {product.creator_name}</p>
          </div>
        </div>
        {allowDownload && product.download_url && (
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />Download
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {viewerUrl ? (
            isPdf ? (
              <div className="w-full rounded-xl overflow-hidden border border-border bg-card" style={{ height: "80vh" }}>
                <iframe
                  src={viewerUrl}
                  className="w-full h-full"
                  title={product.title}
                />
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-border bg-card p-6">
                <p className="text-muted-foreground mb-4">
                  This product content is available for viewing. Click below to open it.
                </p>
                <Button asChild>
                  <a href={viewerUrl} target="_blank" rel="noopener noreferrer">
                    <BookOpen className="w-4 h-4 mr-2" />Open Content
                  </a>
                </Button>
              </div>
            )
          ) : (
            <div className="rounded-xl border border-border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                No viewer content available for this product yet. Check back later.
              </p>
            </div>
          )}

          {product.description && (
            <Card className="mt-6">
              <CardContent className="p-5">
                <h3 className="font-semibold mb-2">About this product</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Engagement */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold text-sm">Explore More</h3>

              <Link to="/dashboard/affiliate" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Affiliate Program</p>
                  <p className="text-xs text-muted-foreground">Earn commissions</p>
                </div>
              </Link>

              <Link to="/dashboard/internship" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Apply for Internship</p>
                  <p className="text-xs text-muted-foreground">Gain experience</p>
                </div>
              </Link>

              <Link to="/courses" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Explore Courses</p>
                  <p className="text-xs text-muted-foreground">Learn new skills</p>
                </div>
              </Link>

              <Link to="/dashboard/scholarship" className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary transition-colors">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">View Offers</p>
                  <p className="text-xs text-muted-foreground">Scholarships & more</p>
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </SocialTasksGate>
  );
};

export default ProductViewer;
