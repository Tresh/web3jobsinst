import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, BookOpen, Download, Library } from "lucide-react";
import { useMyOrders, formatPrice } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DashboardLibrary = () => {
  const { data: orders = [], isLoading } = useMyOrders();
  const { user } = useAuth();
  const navigate = useNavigate();

  const libraryItems = useMemo(() => {
    const map = new Map<string, (typeof orders)[number]>();
    for (const order of orders) {
      const key = order.product_id;
      const existing = map.get(key);
      if (!existing || new Date(order.created_at).getTime() > new Date(existing.created_at).getTime()) {
        map.set(key, order);
      }
    }
    return Array.from(map.values());
  }, [orders]);

  const logAccess = async (productId: string, action: "view" | "download") => {
    if (!user) return;
    await supabase.from("product_access_logs").insert({
      user_id: user.id,
      product_id: productId,
      action,
    });
  };

  const handleView = (order: (typeof orders)[number]) => {
    const product = order.products;
    if (!product) return;
    logAccess(product.id, "view");
    navigate(`/dashboard/library/${product.id}`);
  };

  const handleDownload = (order: (typeof orders)[number]) => {
    const product = order.products;
    if (!product?.download_url) return;
    logAccess(product.id, "download");
    window.open(product.download_url, "_blank");
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My Library</h1>
          <p className="text-muted-foreground mt-1">Access your purchased digital products</p>
        </div>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : libraryItems.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Library className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-semibold mb-2">Your library is empty</h2>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Purchase digital products from our marketplace to access them here.
            </p>
            <Button onClick={() => navigate("/products")}>Explore Products</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {libraryItems.map((order) => {
            const product = order.products;
            if (!product) return null;
            const allowDownload = (product as any).allow_download !== false;

            return (
              <Card key={order.id} className="overflow-hidden group hover:shadow-md transition-shadow">
                {product.image_url ? (
                  <div className="aspect-video bg-secondary overflow-hidden">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-secondary flex items-center justify-center">
                    <Package className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">{product.title}</h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Added {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={() => handleView(order)}>
                      <BookOpen className="w-4 h-4 mr-2" />Read / View
                    </Button>
                    {allowDownload && product.download_url && (
                      <Button variant="outline" size="sm" onClick={() => handleDownload(order)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardLibrary;
