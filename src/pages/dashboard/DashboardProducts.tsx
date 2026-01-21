import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Plus } from "lucide-react";

const DashboardProducts = () => {
  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your digital products and listings
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Empty State */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg mb-2">No products yet</CardTitle>
          <CardDescription className="text-center max-w-sm mb-6">
            Start selling your digital products like templates, ebooks, courses, or design assets.
          </CardDescription>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            List Your First Product
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardProducts;
