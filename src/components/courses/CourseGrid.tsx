import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { Course } from "@/data/coursesData";

interface CourseGridProps {
  courses: Course[];
  onCourseClick: (course: Course) => void;
}

const ITEMS_PER_PAGE = 12;

const CourseGrid = ({ courses, onCourseClick }: CourseGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(courses.length / ITEMS_PER_PAGE);

  // Reset to page 1 when courses change (e.g., filters applied)
  useEffect(() => {
    setCurrentPage(1);
  }, [courses]);

  const displayedCourses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return courses.slice(start, start + ITEMS_PER_PAGE);
  }, [courses, currentPage]);

  if (courses.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-muted-foreground mb-2">No courses match your search.</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters.</p>
      </div>
    );
  }

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push("...");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push("...");
      
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
        {displayedCourses.map((course) => (
          <CourseCard key={course.id} course={course} onClick={() => onCourseClick(course)} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {/* Previous */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="gap-1 h-8 px-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </Button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) => (
              typeof page === "number" ? (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0 text-xs"
                >
                  {page}
                </Button>
              ) : (
                <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">
                  ...
                </span>
              )
            ))}
          </div>

          {/* Next */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="gap-1 h-8 px-2"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
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
      className="group text-left bg-background border border-secondary rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-secondary/30 relative">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {course.isComingSoon && (
          <div className="absolute top-2 right-2 bg-background/90 backdrop-blur-sm text-[10px] font-medium text-muted-foreground px-1.5 py-0.5 rounded">
            Soon
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Level */}
        <Badge
          variant="secondary"
          className={`${levelColors[course.level]} border-0 text-[9px] font-medium px-1.5 py-0 w-fit mb-2`}
        >
          {course.level}
        </Badge>

        {/* Title */}
        <h3 className="font-medium text-xs text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2 flex-1">
          {course.title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-2 mt-auto pt-2">
          {course.duration && (
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {course.duration}
            </div>
          )}
          {course.hasCertificate && (
            <div className="flex items-center gap-0.5 text-[10px] text-primary">
              <Award className="w-2.5 h-2.5" />
            </div>
          )}
        </div>
      </div>
    </button>
  );
};

export default CourseGrid;
