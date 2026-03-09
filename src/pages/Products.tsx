import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import PageNavbar from "@/components/PageNavbar";
import ProductFilterSheet from "@/components/products/ProductFilterSheet";
import ProductGrid from "@/components/products/ProductGrid";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import ScholarshipFormDialog from "@/components/ScholarshipFormDialog";
import G6LaunchSection from "@/components/products/G6LaunchSection";
import { type ProductCategory, type ProductPriceType } from "@/data/productsData";
import { usePublicProducts, useInitializePayment, useVerifyPayment, formatPrice, type DBProduct } from "@/hooks/useProducts";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("all");
  const [selectedPriceType, setSelectedPriceType] = useState<ProductPriceType>("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [listProductOpen, setListProductOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<DBProduct | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data: products = [], isLoading } = usePublicProducts();
  const { data: myOrders = [] } = useMyOrders();
  const initPayment = useInitializePayment();
  const verifyPayment = useVerifyPayment();
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

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
      // Clean URL
      window.history.replaceState({}, "", "/products");
    }
  }, [searchParams]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedPriceType !== "all") count++;
    return count;
  }, [selectedCategory, selectedPriceType]);

  const ownedProductIds = useMemo(() => {
    return new Set(myOrders.map((o) => o.product_id));
  }, [myOrders]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.description || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesPriceType =
        selectedPriceType === "all" ||
        (selectedPriceType === "free" && product.price === 0) ||
        (selectedPriceType === "paid" && product.price > 0);
      return matchesSearch && matchesCategory && matchesPriceType;
    });
  }, [searchQuery, selectedCategory, selectedPriceType, products]);

  const handleProductClick = (product: DBProduct) => {
    setSelectedProduct(product);
    if (product.coming_soon) {
      // show coming soon
      setDetailOpen(false);
    } else {
      setDetailOpen(true);
    }
  };

  const handleBuyNow = async () => {
    if (!selectedProduct) return;

    // If already purchased, send them to their dashboard downloads
    if (ownedProductIds.has(selectedProduct.id)) {
      setDetailOpen(false);
      navigate("/dashboard/products");
      return;
    }

    if (!user) {
      toast({ title: "Please log in to purchase", variant: "destructive" });
      return;
    }

    const callbackUrl = `${window.location.origin}/products?reference=`;

    initPayment.mutate(
      { productId: selectedProduct.id, callbackUrl: callbackUrl },
      {
        onSuccess: (data) => {
          if (data.free) {
            toast({ title: "Product acquired!", description: "Check your dashboard for the download." });
            setDetailOpen(false);
          } else if (data.authorization_url) {
            window.location.href = data.authorization_url;
          }
        },
      }
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedPriceType("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen">
      <PageNavbar
        showSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
        searchPlaceholder="Search products..."
      />

      <main className="pt-[72px]">
        {/* G6 Launch Announcement */}
        <section className="section-container py-8 md:py-12">
          <G6LaunchSection />
        </section>

        {/* Divider */}
        <div className="section-container pb-4">
          <div className="border-t border-border" />
        </div>

        <section className="section-container py-6 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Digital Products</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Browse tools, ebooks, bots, and resources for your Web3 journey
          </p>
        </section>

        <section className="section-container pb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredProducts.length}</span> products found
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="text-xs text-primary hover:underline">Clear filters</button>
            )}
          </div>
        </section>

        <section className="section-container pb-20">
          {isLoading ? (
            <div className="text-center py-16 text-muted-foreground">Loading products...</div>
          ) : (
            <ProductGrid
              products={filteredProducts}
              onProductClick={handleProductClick}
              purchasedProductIds={ownedProductIds}
            />
          )}
        </section>

        <section className="section-container pb-20">
          <div className="rounded-2xl border border-border bg-card p-10 md:p-14 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">Have a Product to Share?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              List your digital products, tools, or resources on our marketplace and reach the Web3 community.
            </p>
            <Button variant="default" size="lg" onClick={() => setListProductOpen(true)}>
              List Your Product <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      <ProductFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriceType={selectedPriceType}
        onPriceTypeChange={setSelectedPriceType}
        onClearAll={clearAllFilters}
      />

      {/* Product Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.title}</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <img
                src={selectedProduct.image_url || "/placeholder.svg"}
                alt={selectedProduct.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">by {selectedProduct.creator_name}</span>
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(selectedProduct.price, selectedProduct.currency)}
                </span>
              </div>
              <Button
                className="w-full"
                onClick={handleBuyNow}
                disabled={initPayment.isPending}
              >
                {initPayment.isPending
                  ? "Processing..."
                  : selectedProduct.price === 0
                  ? "Get Free"
                  : `Buy Now — ${formatPrice(selectedProduct.price, selectedProduct.currency)}`}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ScholarshipFormDialog open={scholarshipOpen} onOpenChange={setScholarshipOpen} />
      <ComingSoonDialog
        open={listProductOpen}
        onOpenChange={setListProductOpen}
        title="List a Product - Coming Soon"
        onScholarshipClick={() => setScholarshipOpen(true)}
      />
    </div>
  );
};

export default Products;
