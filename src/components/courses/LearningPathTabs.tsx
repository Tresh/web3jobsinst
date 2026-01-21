import type { LearningPath } from "@/data/coursesData";

interface LearningPathTabsProps {
  paths: LearningPath[];
  selectedPath: string;
  onPathSelect: (pathId: string) => void;
}

const LearningPathTabs = ({ paths, selectedPath, onPathSelect }: LearningPathTabsProps) => {
  return (
    <div className="relative">
      {/* Scrollable container - hidden scrollbar */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* All tab */}
        <button
          onClick={() => onPathSelect("all")}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150 ${
            selectedPath === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
          }`}
        >
          All Courses
        </button>

        {/* Path tabs */}
        {paths.map((path) => (
          <button
            key={path.id}
            onClick={() => onPathSelect(path.id === selectedPath ? "all" : path.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-150 ${
              selectedPath === path.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
            }`}
          >
            <img 
              src={path.image} 
              alt="" 
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="whitespace-nowrap">{path.name}</span>
            <span className={`text-xs ${
              selectedPath === path.id ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}>
              {path.courseCount}
            </span>
          </button>
        ))}
      </div>

      {/* Fade edges for scroll indication */}
      <div className="absolute right-0 top-0 bottom-3 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none md:hidden" />
    </div>
  );
};

export default LearningPathTabs;
