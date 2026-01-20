import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { categories, levels, learningPaths } from "@/data/coursesData";
import { X } from "lucide-react";

interface FilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  selectedLevel: string;
  onLevelChange: (value: string) => void;
  selectedPath: string;
  onPathChange: (value: string) => void;
  onClearAll: () => void;
}

const FilterSheet = ({
  open,
  onOpenChange,
  selectedCategory,
  onCategoryChange,
  selectedLevel,
  onLevelChange,
  selectedPath,
  onPathChange,
  onClearAll,
}: FilterSheetProps) => {
  const hasActiveFilters =
    selectedCategory !== "all" ||
    selectedLevel !== "all" ||
    selectedPath !== "all";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[320px] bg-background overflow-y-auto">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Filters</SheetTitle>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-primary hover:text-primary"
            >
              Clear all
            </Button>
          )}
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Category Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Category</h3>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="All"
                isActive={selectedCategory === "all"}
                onClick={() => onCategoryChange("all")}
              />
              {categories.map((category) => (
                <FilterChip
                  key={category}
                  label={category}
                  isActive={selectedCategory === category}
                  onClick={() => onCategoryChange(category)}
                />
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Level</h3>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="All Levels"
                isActive={selectedLevel === "all"}
                onClick={() => onLevelChange("all")}
              />
              {levels.map((level) => (
                <FilterChip
                  key={level}
                  label={level}
                  isActive={selectedLevel === level}
                  onClick={() => onLevelChange(level)}
                />
              ))}
            </div>
          </div>

          {/* Learning Path Filter */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Learning Path</h3>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="All Paths"
                isActive={selectedPath === "all"}
                onClick={() => onPathChange("all")}
              />
              {learningPaths.map((path) => (
                <FilterChip
                  key={path.id}
                  label={path.name.replace(" Path", "")}
                  isActive={selectedPath === path.id}
                  onClick={() => onPathChange(path.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <Button
            variant="default"
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
  isActive: boolean;
  onClick: () => void;
}

const FilterChip = ({ label, isActive, onClick }: FilterChipProps) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-150 ${
      isActive
        ? "bg-primary text-primary-foreground"
        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
    }`}
  >
    {label}
  </button>
);

export default FilterSheet;
