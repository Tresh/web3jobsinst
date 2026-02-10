import { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { Course } from "@/data/coursesData";
import type { Course as StrapiCourse } from "@/types/strapi";

interface CourseGridPropsHardcoded {
  courses: Course[];
  onCourseClick: (course: Course) => void;
  strapiCourses?: never;
  onStrapiCourseClick?: never;
}

interface CourseGridPropsStrapi {
  strapiCourses: StrapiCourse[];
  onStrapiCourseClick: (slug: string) => void;
  courses?: never;
  onCourseClick?: never;
}

type CourseGridProps = CourseGridPropsHardcoded | CourseGridPropsStrapi;

const ITEMS_PER_PAGE = 12;

const CourseGrid = (props: CourseGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);

  const isStrapi = Boolean(props.strapiCourses);
  const totalItems = isStrapi ? props.strapiCourses!.length : props.courses!.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [totalItems]);

  const displayedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    if (isStrapi) {
      return props.strapiCourses!.slice(start, start + ITEMS_PER_PAGE);
    }
    return props.courses!.slice(start, start + ITEMS_PER_PAGE);
  }, [isStrapi, props.strapiCourses, props.courses, currentPage]);

  if (totalItems === 0) {
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
        {isStrapi
          ? (displayedItems as StrapiCourse[]).map((course) => (
              <StrapiCourseCard
                key={course.id}
                course={course}
                onClick={() => props.onStrapiCourseClick!(course.slug)}
              />
            ))
          : (displayedItems as Course[]).map((course) => (
              <HardcodedCourseCard
                key={course.id}
                course={course}
                onClick={() => props.onCourseClick!(course)}
              />
            ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
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

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, idx) =>
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
            )}
          </div>

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

// ============================================
// STRAPI COURSE CARD (live data, no blur)
// ============================================

const StrapiCourseCard = ({ course, onClick }: { course: StrapiCourse; onClick: () => void }) => {
  const levelColors = {
    Beginner: "bg-green-500/20 text-green-400",
    Intermediate: "bg-amber-500/20 text-amber-400",
    Advanced: "bg-rose-500/20 text-rose-400",
  };

  return (
    <button
      onClick={onClick}
      className="group text-left bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        {course.coverImageUrl ? (
          <img
            src={course.coverImageUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No image
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <Badge
          variant="secondary"
          className={`${levelColors[course.level]} border-0 text-[9px] font-medium px-1.5 py-0 w-fit mb-2`}
        >
          {course.level}
        </Badge>

        <h3 className="font-medium text-xs text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2 flex-1">
          {course.title}
        </h3>

        <div className="flex items-center gap-2 mt-auto pt-2">
          {course.estimatedDuration && (
            <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
              <Clock className="w-2.5 h-2.5" />
              {course.estimatedDuration}
            </div>
          )}
          {course.isFree && (
            <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-primary/20 text-primary border-0">
              Free
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
};

// ============================================
// HARDCODED COURSE CARD (Coming Soon, blurred)
// ============================================

const HardcodedCourseCard = ({ course, onClick }: { course: Course; onClick: () => void }) => {
  const levelColors = {
    Beginner: "bg-green-500/20 text-green-400",
    Intermediate: "bg-amber-500/20 text-amber-400",
    Advanced: "bg-rose-500/20 text-rose-400",
  };

  return (
    <button
      onClick={onClick}
      className="group text-left bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col h-full"
    >
      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        <img
          src={course.image}
          alt={course.title}
          className="w-full h-full object-cover filter blur-[2px] scale-105"
        />
        <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
          <span className="text-xs font-medium text-foreground bg-secondary px-2 py-1 rounded">
            Coming Soon
          </span>
        </div>
      </div>

      <div className="p-3 flex flex-col flex-1">
        <Badge
          variant="secondary"
          className={`${levelColors[course.level]} border-0 text-[9px] font-medium px-1.5 py-0 w-fit mb-2`}
        >
          {course.level}
        </Badge>

        <h3 className="font-medium text-xs text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2 flex-1">
          {course.title}
        </h3>

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
