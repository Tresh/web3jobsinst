import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Clock, ArrowRight } from "lucide-react";
import type { Course } from "@/data/coursesData";

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const levelColors: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700 border-green-200",
  Intermediate: "bg-amber-100 text-amber-700 border-amber-200",
  Advanced: "bg-red-100 text-red-700 border-red-200",
};

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  return (
    <div className="bg-background border border-secondary rounded-xl p-6 flex flex-col gap-4 hover:shadow-md hover:border-primary/20 transition-all duration-150">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1 leading-tight">
            {course.title}
          </h3>
          <span className="text-xs text-muted-foreground">{course.category}</span>
        </div>
        <Badge
          variant="outline"
          className={`text-xs shrink-0 ${levelColors[course.level]}`}
        >
          {course.level}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
        {course.description}
      </p>

      {/* Skill Outcome */}
      <div className="bg-secondary/50 rounded-lg p-3">
        <p className="text-xs text-foreground">
          <span className="font-medium">You'll learn:</span> {course.skillOutcome}
        </p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        {course.duration && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {course.duration}
          </div>
        )}
        {course.hasCertificate && (
          <div className="flex items-center gap-1 text-primary">
            <Award className="w-3 h-3" />
            Certificate
          </div>
        )}
      </div>

      {/* CTA */}
      <Button
        variant={course.isComingSoon ? "outline" : "default"}
        size="sm"
        onClick={onClick}
        className="w-full mt-auto"
        disabled={course.isComingSoon}
      >
        {course.isComingSoon ? (
          "Coming Soon"
        ) : (
          <>
            View Course
            <ArrowRight className="w-3 h-3 ml-1" />
          </>
        )}
      </Button>
    </div>
  );
};

export default CourseCard;
