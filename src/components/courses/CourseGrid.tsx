import { Badge } from "@/components/ui/badge";
import { Award, Clock, ArrowRight } from "lucide-react";
import type { Course } from "@/data/coursesData";

interface CourseGridProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
}

const CourseGrid = ({ courses, onCourseClick }: CourseGridProps) => {
  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No courses match your search.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} onClick={() => onCourseClick(course)} />
      ))}
    </div>
  );
};

interface CourseCardProps {
  course: Course;
  onClick: () => void;
}

const CourseCard = ({ course, onClick }: CourseCardProps) => {
  const levelColors = {
    Beginner: "bg-emerald-100 text-emerald-700",
    Intermediate: "bg-amber-100 text-amber-700",
    Advanced: "bg-rose-100 text-rose-700",
  };

  return (
    <button
      onClick={onClick}
      className="group text-left bg-background border border-secondary rounded-xl p-5 hover:border-primary/30 hover:shadow-sm transition-all duration-150 flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <Badge
          variant="secondary"
          className={`${levelColors[course.level]} border-0 text-[10px] font-medium px-2 py-0.5`}
        >
          {course.level}
        </Badge>
        {course.isComingSoon && (
          <span className="text-[10px] font-medium text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            Soon
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {course.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
        {course.description}
      </p>

      {/* Category */}
      <p className="text-xs text-muted-foreground mb-3">
        {course.category}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-secondary">
        <div className="flex items-center gap-3">
          {course.duration && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {course.duration}
            </div>
          )}
          {course.hasCertificate && (
            <div className="flex items-center gap-1 text-xs text-primary">
              <Award className="w-3 h-3" />
              Cert
            </div>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
};

export default CourseGrid;
