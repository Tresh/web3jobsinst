import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Share2, Briefcase, GraduationCap, Gift, FileText, Maximize2, Minimize2, ChevronLeft, BookOpen, Rocket, X } from "lucide-react";
import { useMyOrders } from "@/hooks/useProducts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SocialTasksGate from "@/components/products/SocialTasksGate";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ProductViewer = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: orders = [], isLoading } = useMyOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <BookOpen className="w-10 h-10 text-primary animate-pulse" />
          <p className="text-muted-foreground text-sm">Opening your book...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess || !product) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">You don't have access to this product.</p>
          <Button onClick={() => navigate("/products")}>Browse Products</Button>
        </div>
      </div>
    );
  }

  const viewerUrl = product.viewer_url || product.download_url;
  const allowDownload = (product as any).allow_download !== false;

  const getFileType = (url: string | null): "pdf" | "doc" | "image" | "unknown" => {
    if (!url) return "unknown";
    const lower = url.toLowerCase().split("?")[0];
    if (lower.endsWith(".pdf")) return "pdf";
    if (lower.endsWith(".docx") || lower.endsWith(".doc") || lower.endsWith(".pptx") || lower.endsWith(".xlsx")) return "doc";
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || lower.endsWith(".gif")) return "image";
    return "unknown";
  };

  const fileType = getFileType(viewerUrl);

  const getEmbedUrl = (url: string, type: string): string => {
    if (type === "pdf" || type === "doc") {
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

  // Fullscreen reader mode (Wattpad-like)
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Reader top bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)}>
              <ChevronLeft className="w-4 h-4 mr-1" />Back
            </Button>
            <div className="hidden sm:block">
              <p className="text-sm font-medium line-clamp-1">{product.title}</p>
              <p className="text-xs text-muted-foreground">{product.creator_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {allowDownload && product.download_url && (
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(false)}>
              <Minimize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {/* Reader content */}
        <div className="flex-1 overflow-hidden">
          {viewerUrl ? (
            fileType === "image" ? (
              <div className="h-full overflow-auto flex items-start justify-center p-4 bg-muted/30">
                <img src={viewerUrl} alt={product.title} className="max-w-full h-auto rounded-lg shadow-lg" />
              </div>
            ) : (
              <iframe
                src={getEmbedUrl(viewerUrl, fileType)}
                className="w-full h-full border-0"
                title={product.title}
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No content available for viewing.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        <div className="rounded-xl overflow-hidden border border-border bg-card cursor-pointer" onClick={() => setIsFullscreen(true)}>
          <img src={viewerUrl} alt={product.title} className="w-full h-auto" />
        </div>
      );
    }

    const embedUrl = getEmbedUrl(viewerUrl, fileType);
    return (
      <div
        className="relative rounded-xl overflow-hidden border border-border bg-card group cursor-pointer"
        style={{ height: "75vh" }}
        onClick={() => setIsFullscreen(true)}
      >
        {/* Click-to-read overlay */}
        <div className="absolute inset-0 z-10 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="bg-background/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
            <Maximize2 className="w-4 h-4" />
            <span className="text-sm font-medium">Click to read fullscreen</span>
          </div>
        </div>
        <iframe
          src={embedUrl}
          className="w-full h-full pointer-events-none"
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
            {viewerUrl && fileType !== "image" && (
              <Button size="sm" onClick={() => setIsFullscreen(true)}>
                <BookOpen className="w-4 h-4 mr-2" />Read Now
              </Button>
            )}
            {allowDownload && product.download_url && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
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
              <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <h3 className="font-semibold mb-2">About this product</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
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
            </div>
          </div>
        </div>
      </div>
    </SocialTasksGate>
  );
};

export default ProductViewer;
