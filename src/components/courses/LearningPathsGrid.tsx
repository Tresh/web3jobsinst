import { ArrowRight } from "lucide-react";
import type { LearningPath } from "@/data/coursesData";

interface LearningPathsGridProps {
  paths: LearningPath[];
  selectedPath: string;
  onPathSelect: (pathId: string) => void;
}

const LearningPathsGrid = ({ paths, selectedPath, onPathSelect }: LearningPathsGridProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6">
      {paths.map((path) => (
        <button
          key={path.id}
          onClick={() => onPathSelect(path.id === selectedPath ? "all" : path.id)}
          className={`group text-left rounded-xl border overflow-hidden transition-all duration-150 ${
            selectedPath === path.id
              ? "border-primary ring-2 ring-primary/20"
              : "border-secondary bg-background hover:border-primary/30 hover:shadow-md"
          }`}
        >
          {/* Image */}
          <div className="aspect-[4/3] overflow-hidden bg-secondary/30">
            <img 
              src={path.image} 
              alt={path.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-sm text-foreground mb-1">
              {path.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 hidden sm:block">
              {path.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {path.courseCount} courses
              </span>
              <ArrowRight className={`w-3 h-3 transition-colors ${
                selectedPath === path.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              }`} />
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default LearningPathsGrid;
