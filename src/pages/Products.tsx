import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";
import Footer from "@/components/Footer";
import ProductsNavbar from "@/components/products/ProductsNavbar";
import ProductFilterSheet from "@/components/products/ProductFilterSheet";
import ProductGrid from "@/components/products/ProductGrid";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import ScholarshipFormDialog from "@/components/ScholarshipFormDialog";
import { products, type Product, type ProductCategory, type ProductPriceType } from "@/data/productsData";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("all");
  const [selectedPriceType, setSelectedPriceType] = useState<ProductPriceType>("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [listProductOpen, setListProductOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <ProductsNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Header */}
      <section className="pt-[72px]">
        <div className="section-container py-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Digital Products
              </h1>
              <p className="text-muted-foreground">
                Browse tools, ebooks, bots, and resources for your Web3 journey
              </p>
            </div>
            <Button onClick={() => setListProductOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              List a Product
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-container pb-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{products.length}</p>
            <p className="text-xs text-muted-foreground">Products</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{products.filter(p => p.price === 0).length}</p>
            <p className="text-xs text-muted-foreground">Free Resources</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{products.reduce((acc, p) => acc + p.downloads, 0).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Downloads</p>
          </div>
        </div>
      </section>

      {/* Results info */}
      <section className="section-container pb-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> products
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

      {/* Dialogs */}
      <ScholarshipFormDialog
        open={scholarshipOpen}
        onOpenChange={setScholarshipOpen}
      />
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
