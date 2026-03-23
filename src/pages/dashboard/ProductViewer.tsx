import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, Briefcase, GraduationCap, Gift, FileText, Maximize2, Minimize2 } from "lucide-react";
import { useMyOrders } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SocialTasksGate from "@/components/products/SocialTasksGate";

const ProductViewer = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: orders = [], isLoading } = useMyOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const matchingOrder = useMemo(
    () => orders.find((o) => o.product_id === productId),
    [orders, productId]
  );
  const product = matchingOrder?.products;
  const hasAccess = !!product;

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
  const allowDownload = (product as any).allow_download !== false;

  // Determine file type from URL
  const getFileType = (url: string | null): "pdf" | "doc" | "image" | "unknown" => {
    if (!url) return "unknown";
    const lower = url.toLowerCase().split("?")[0];
    if (lower.endsWith(".pdf")) return "pdf";
    if (lower.endsWith(".docx") || lower.endsWith(".doc") || lower.endsWith(".pptx") || lower.endsWith(".xlsx")) return "doc";
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || lower.endsWith(".gif")) return "image";
    return "unknown";
  };

  const fileType = getFileType(viewerUrl);

  // Build the viewer embed URL
  const getEmbedUrl = (url: string, type: string): string => {
    if (type === "pdf") {
      // Use Google Docs viewer for PDFs too (more reliable cross-browser)
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    if (type === "doc") {
      // Use Google Docs Viewer for Office formats
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

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

  const renderViewer = () => {
    if (!viewerUrl) {
      return (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">
            No viewer content available for this product yet.
          </p>
        </div>
      );
    }

    if (fileType === "image") {
      return (
        <div className="rounded-xl overflow-hidden border border-border bg-card">
          <img src={viewerUrl} alt={product.title} className="w-full h-auto" />
        </div>
      );
    }

    // PDF, DOCX, and other document types — use iframe with Google Docs Viewer
    const embedUrl = getEmbedUrl(viewerUrl, fileType);

    return (
      <div className={`relative rounded-xl overflow-hidden border border-border bg-card ${isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""}`} style={isFullscreen ? {} : { height: "75vh" }}>
        {isFullscreen && (
          <div className="absolute top-3 right-3 z-10">
            <Button variant="secondary" size="sm" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="w-4 h-4 mr-1" />Exit Fullscreen
            </Button>
          </div>
        )}
        <iframe
          src={embedUrl}
          className="w-full h-full"
          title={product.title}
          sandbox="allow-scripts allow-same-origin allow-popups"
        />
      </div>
    );
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
          <div className="flex gap-2">
            {!isFullscreen && viewerUrl && fileType !== "image" && (
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(true)}>
                <Maximize2 className="w-4 h-4 mr-1" />Fullscreen
              </Button>
            )}
            {allowDownload && product.download_url && (
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-1" />Download
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderViewer()}

            {product.description && (
              <Card className="mt-6">
                <CardContent className="p-5">
                  <h3 className="font-semibold mb-2">About this product</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
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
