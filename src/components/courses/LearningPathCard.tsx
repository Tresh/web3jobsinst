import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import type { LearningPath } from "@/data/coursesData";

interface LearningPathCardProps {
  path: LearningPath;
  onClick: () => void;
}

const LearningPathCard = ({ path, onClick }: LearningPathCardProps) => {
  return (
    <div className="min-w-[280px] md:min-w-[320px] bg-background border border-secondary rounded-xl p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors duration-150">
      <div className="text-3xl">{path.icon}</div>
      <div className="flex-1">
        <h3 className="font-semibold text-foreground mb-2">{path.name}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {path.description}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {path.courseCount} courses
        </span>
        <Button variant="ghost" size="sm" onClick={onClick} className="text-primary hover:text-primary">
          View Path
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default LearningPathCard;
