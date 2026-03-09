import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Package, Download } from "lucide-react";
import { useMyOrders, formatPrice } from "@/hooks/useProducts";
import { useNavigate } from "react-router-dom";

const DashboardProducts = () => {
  const { data: orders = [], isLoading } = useMyOrders();
  const navigate = useNavigate();

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My Products</h1>
          <p className="text-muted-foreground mt-1">Your purchased digital products</p>
        </div>
        <Button onClick={() => navigate("/products")}>Browse Products</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-muted-foreground">Loading...</div>
      ) : orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <Package className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg mb-2">No purchases yet</CardTitle>
            <CardDescription className="text-center max-w-sm mb-6">
              Browse our marketplace to find tools, ebooks, bots, and more.
            </CardDescription>
            <Button onClick={() => navigate("/products")}>Explore Products</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground line-clamp-1">{order.products?.title || "Product"}</h3>
                    <p className="text-xs text-muted-foreground">{formatPrice(order.amount, order.currency)}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                {order.products?.download_url && (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={order.products.download_url} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />Download
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardProducts;
