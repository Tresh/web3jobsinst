import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import PageNavbar from "@/components/PageNavbar";
import ProductFilterSheet from "@/components/products/ProductFilterSheet";
import ProductGrid from "@/components/products/ProductGrid";
import CartDialog from "@/components/CartDialog";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import ScholarshipFormDialog from "@/components/ScholarshipFormDialog";
import { products, type Product, type ProductCategory, type ProductPriceType } from "@/data/productsData";

interface CartItem {
  product: Product;
  quantity: number;
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("all");
  const [selectedPriceType, setSelectedPriceType] = useState<ProductPriceType>("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [listProductOpen, setListProductOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedPriceType !== "all") count++;
    return count;
  }, [selectedCategory, selectedPriceType]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        searchQuery === "" ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;

      const matchesPriceType =
        selectedPriceType === "all" ||
        (selectedPriceType === "free" && product.price === 0) ||
        (selectedPriceType === "paid" && product.price > 0);

      return matchesSearch && matchesCategory && matchesPriceType;
    });
  }, [searchQuery, selectedCategory, selectedPriceType]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setComingSoonOpen(true);
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedPriceType("all");
    setSearchQuery("");
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(items => items.filter(item => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageNavbar
        showSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
        searchPlaceholder="Search products..."
        showCart
        cartItemsCount={cartItems.length}
        onCartClick={() => setCartOpen(true)}
      />

      <main className="pt-[72px]">
        {/* Header */}
        <section className="section-container py-8 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Digital Products
          </h1>
          <p className="text-muted-foreground">
            Browse tools, ebooks, bots, and resources for your Web3 journey
          </p>
        </section>

        {/* Results info */}
        <section className="section-container pb-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filteredProducts.length}</span> products found
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Product Grid */}
        <section className="section-container pb-20">
          <ProductGrid products={filteredProducts} onProductClick={handleProductClick} />
        </section>

        {/* CTA */}
        <section className="section-container pb-20">
          <div className="rounded-2xl border border-secondary bg-secondary/20 p-10 md:p-14 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
              Have a Product to Share?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              List your digital products, tools, or resources on our marketplace and reach the Web3 community.
            </p>
            <Button variant="default" size="lg" onClick={() => setListProductOpen(true)}>
              List Your Product
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />

      {/* Filter Sheet */}
      <ProductFilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedPriceType={selectedPriceType}
        onPriceTypeChange={setSelectedPriceType}
        onClearAll={clearAllFilters}
      />

      {/* Cart Dialog */}
      <CartDialog
        open={cartOpen}
        onOpenChange={setCartOpen}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      {/* Dialogs */}
      <ScholarshipFormDialog open={scholarshipOpen} onOpenChange={setScholarshipOpen} />
      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={selectedProduct?.title || "Product Coming Soon"}
        onScholarshipClick={() => setScholarshipOpen(true)}
      />
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
