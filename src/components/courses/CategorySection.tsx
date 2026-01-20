import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import CourseCard from "./CourseCard";
import type { Course, Category } from "@/data/coursesData";
import { categoryDescriptions } from "@/data/coursesData";

interface CategorySectionProps {
  category: Category;
  courses: Course[];
  onCourseClick: (course: Course) => void;
  defaultExpanded?: boolean;
}

const CategorySection = ({
  category,
  courses,
  onCourseClick,
  defaultExpanded = true,
}: CategorySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAll, setShowAll] = useState(false);

  const displayedCourses = showAll ? courses : courses.slice(0, 4);

  return (
    <div className="border-b border-secondary pb-12 last:border-b-0">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <div className="text-left">
          <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {category}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {categoryDescriptions[category]}
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-sm">{courses.length} courses</span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </button>

      {/* Course Grid */}
      {isExpanded && (
        <div className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onClick={() => onCourseClick(course)}
              />
            ))}
          </div>

          {courses.length > 4 && (
            <div className="mt-6 text-center">
              <Button
                variant="ghost"
                onClick={() => setShowAll(!showAll)}
                className="text-primary hover:text-primary"
              >
                {showAll ? "Show Less" : `View All ${courses.length} Courses`}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategorySection;
