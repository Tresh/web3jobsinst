import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";
import { type Product, productCategoryLabels } from "@/data/productsData";

const ITEMS_PER_PAGE = 8;

interface ProductGridProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ProductGrid = ({ products, onProductClick }: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [products]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No products found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="icon"
                onClick={() => setCurrentPage(page)}
                className="w-8 h-8"
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  onClick: () => void;
}

const ProductCard = ({ product, onClick }: ProductCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group text-left w-full bg-background border border-secondary rounded-xl overflow-hidden hover:border-primary/30 transition-colors duration-150"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] bg-secondary/50 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover blur-[2px]"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="bg-background/90 text-foreground text-xs font-medium px-3 py-1.5 rounded-full">
            Coming Soon
          </span>
        </div>
        {/* Price Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-bold rounded ${
            product.price === 0 
              ? "bg-green-500/90 text-white" 
              : "bg-primary/90 text-primary-foreground"
          }`}>
            {product.price === 0 ? "FREE" : `$${product.price}`}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {productCategoryLabels[product.category]}
        </span>
        <h3 className="font-semibold text-foreground text-sm mt-1 line-clamp-2 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
          {product.description}
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <Download className="w-3 h-3" />
          <span>{product.downloads} downloads</span>
        </div>
      </div>
    </button>
  );
};

export default ProductGrid;
