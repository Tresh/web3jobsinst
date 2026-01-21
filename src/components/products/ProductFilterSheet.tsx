import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { productCategories, productCategoryLabels, type ProductCategory, type ProductPriceType } from "@/data/productsData";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  selectedPriceType: ProductPriceType;
  onPriceTypeChange: (priceType: ProductPriceType) => void;
  onClearAll: () => void;
}

const priceTypes: { value: ProductPriceType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
];

const ProductFilterSheet = ({
  open,
  onOpenChange,
  selectedCategory,
  onCategoryChange,
  selectedPriceType,
  onPriceTypeChange,
  onClearAll,
}: FilterSheetProps) => {
  const hasFilters = selectedCategory !== "all" || selectedPriceType !== "all";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] bg-background">
        <SheetHeader className="mb-6">
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {hasFilters && (
              <button
                onClick={onClearAll}
                className="text-xs text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Category */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Category</h4>
            <div className="flex flex-wrap gap-2">
              {productCategories.map((category) => (
                <FilterChip
                  key={category}
                  label={productCategoryLabels[category]}
                  active={selectedCategory === category}
                  onClick={() => onCategoryChange(category)}
                />
              ))}
            </div>
          </div>

          {/* Price Type */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Price</h4>
            <div className="flex flex-wrap gap-2">
              {priceTypes.map((type) => (
                <FilterChip
                  key={type.value}
                  label={type.label}
                  active={selectedPriceType === type.value}
                  onClick={() => onPriceTypeChange(type.value)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button 
            className="w-full" 
            onClick={() => onOpenChange(false)}
          >
            Apply Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterChip = ({ label, active, onClick }: FilterChipProps) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors duration-150 ${
      active
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-muted-foreground hover:text-foreground"
    }`}
  >
    {label}
  </button>
);

export default ProductFilterSheet;
