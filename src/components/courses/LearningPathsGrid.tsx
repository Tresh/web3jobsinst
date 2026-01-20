import { ArrowRight } from "lucide-react";
import type { LearningPath } from "@/data/coursesData";

interface LearningPathsGridProps {
  paths: LearningPath[];
  selectedPath: string;
  onPathSelect: (pathId: string) => void;
}

const LearningPathsGrid = ({ paths, selectedPath, onPathSelect }: LearningPathsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-3">
      {paths.map((path) => (
        <button
          key={path.id}
          onClick={() => onPathSelect(path.id === selectedPath ? "all" : path.id)}
          className={`group text-left p-4 rounded-xl border transition-all duration-150 ${
            selectedPath === path.id
              ? "border-primary bg-primary/5"
              : "border-secondary bg-background hover:border-primary/30"
          }`}
        >
          <div className="text-2xl mb-2">{path.icon}</div>
          <h3 className="font-medium text-sm text-foreground mb-1 line-clamp-1">
            {path.name.replace(" Path", "")}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
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
        </button>
      ))}
    </div>
  );
};

export default LearningPathsGrid;
