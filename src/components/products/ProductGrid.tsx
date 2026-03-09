import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Download, Star } from "lucide-react";
import { type DBProduct, formatPrice } from "@/hooks/useProducts";
import { productCategoryLabels, type ProductCategory } from "@/data/productsData";

const ITEMS_PER_PAGE = 8;

interface ProductGridProps {
  products: DBProduct[];
  onProductClick: (product: DBProduct) => void;
  purchasedProductIds?: Set<string>;
}

const ProductGrid = ({ products, onProductClick, purchasedProductIds }: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return products.slice(start, start + ITEMS_PER_PAGE);
  }, [products, currentPage]);

  useEffect(() => { setCurrentPage(1); }, [products]);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No products found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isPurchased={purchasedProductIds?.has(product.id) ?? false}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={currentPage === page ? "default" : "ghost"} size="icon" onClick={() => setCurrentPage(page)} className="w-8 h-8">
                {page}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const ProductCard = ({
  product,
  isPurchased,
  onClick,
}: {
  product: DBProduct;
  isPurchased: boolean;
  onClick: () => void;
}) => {
  const categoryLabel = productCategoryLabels[product.category as ProductCategory] || product.category;

  return (
    <button
      onClick={onClick}
      className="group text-left w-full bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200"
    >
      <div className="relative aspect-square bg-muted overflow-hidden">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.title}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${product.coming_soon ? "blur-[2px]" : ""}`}
        />
        {product.coming_soon && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="bg-card text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-sm border border-border">
              Coming Soon
            </span>
          </div>
        )}

        <div className="absolute top-3 right-3">
          {isPurchased ? (
            <span className="px-2.5 py-1 text-xs font-bold rounded-full shadow-sm bg-primary text-primary-foreground">
              Owned
            </span>
          ) : (
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-full shadow-sm ${
                product.price === 0 ? "bg-green-500 text-white" : "bg-foreground text-background"
              }`}
            >
              {formatPrice(product.price, product.currency)}
            </span>
          )}
        </div>

        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 text-[10px] uppercase tracking-wider font-medium bg-card text-foreground rounded-full border border-border">
            {categoryLabel}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors mb-1">
          {product.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{product.description}</p>
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Download className="w-3 h-3" />
            <span>{product.downloads_count.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs font-medium text-foreground">4.8</span>
          </div>
        </div>
      </div>
    </button>
  );
};

export default ProductGrid;
