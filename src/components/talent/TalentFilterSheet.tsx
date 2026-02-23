import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { type TalentCategory, talentCategoryLabels } from "@/data/talentsData";

interface TalentFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: TalentCategory;
  onCategoryChange: (category: TalentCategory) => void;
  selectedAvailability: "all" | "available" | "busy";
  onAvailabilityChange: (availability: "all" | "available" | "busy") => void;
  onClearAll: () => void;
}

const TalentFilterSheet = ({
  open,
  onOpenChange,
  selectedCategory,
  onCategoryChange,
  selectedAvailability,
  onAvailabilityChange,
  onClearAll,
}: TalentFilterSheetProps) => {
  const categories: TalentCategory[] = [
    "all",
    "developer",
    "designer",
    "marketer",
    "writer",
    "trader",
    "community",
  ];

  const availabilityOptions = [
    { value: "all", label: "All" },
    { value: "available", label: "Available" },
    { value: "busy", label: "Busy" },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[300px] bg-background overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left">Filters</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Category Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Category</h4>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => onCategoryChange(category)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {talentCategoryLabels[category]}
                </button>
              ))}
            </div>
          </div>

          {/* Availability Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3">Availability</h4>
            <div className="space-y-1">
              {availabilityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => onAvailabilityChange(option.value as "all" | "available" | "busy")}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedAvailability === option.value
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear All */}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              onClearAll();
              onOpenChange(false);
            }}
          >
            Clear All Filters
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TalentFilterSheet;
