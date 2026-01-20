import { X } from "lucide-react";
import { learningPaths } from "@/data/coursesData";

interface ActiveFiltersProps {
  selectedCategory: string;
  selectedLevel: string;
  selectedPath: string;
  onCategoryChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onPathChange: (value: string) => void;
  onClearAll: () => void;
  totalResults: number;
}

const ActiveFilters = ({
  selectedCategory,
  selectedLevel,
  selectedPath,
  onCategoryChange,
  onLevelChange,
  onPathChange,
  onClearAll,
  totalResults,
}: ActiveFiltersProps) => {
  const hasFilters =
    selectedCategory !== "all" ||
    selectedLevel !== "all" ||
    selectedPath !== "all";

  const getPathName = (pathId: string) => {
    const path = learningPaths.find((p) => p.id === pathId);
    return path?.name.replace(" Path", "") || pathId;
  };

  if (!hasFilters) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing all <span className="font-medium text-foreground">{totalResults}</span> courses
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground mr-1">Filters:</span>
      
      {selectedCategory !== "all" && (
        <FilterTag
          label={selectedCategory}
          onRemove={() => onCategoryChange("all")}
        />
      )}
      
      {selectedLevel !== "all" && (
        <FilterTag
          label={selectedLevel}
          onRemove={() => onLevelChange("all")}
        />
      )}
      
      {selectedPath !== "all" && (
        <FilterTag
          label={getPathName(selectedPath)}
          onRemove={() => onPathChange("all")}
        />
      )}

      <button
        onClick={onClearAll}
        className="text-xs text-primary hover:underline ml-2"
      >
        Clear all
      </button>

      <span className="text-sm text-muted-foreground ml-auto">
        <span className="font-medium text-foreground">{totalResults}</span> results
      </span>
    </div>
  );
};

interface FilterTagProps {
  label: string;
  onRemove: () => void;
}

const FilterTag = ({ label, onRemove }: FilterTagProps) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
    {label}
    <button
      onClick={onRemove}
      className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
    >
      <X className="w-3 h-3" />
    </button>
  </span>
);

export default ActiveFilters;
