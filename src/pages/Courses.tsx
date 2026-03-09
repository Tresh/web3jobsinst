import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import CoursesNavbar from "@/components/courses/CoursesNavbar";
import FilterSheet from "@/components/courses/FilterSheet";
import LearningPathTabs from "@/components/courses/LearningPathTabs";
import CourseGrid from "@/components/courses/CourseGrid";
import ActiveFilters from "@/components/courses/ActiveFilters";
import WhyDifferentSection from "@/components/courses/WhyDifferentSection";
import { learningPaths, type Course } from "@/data/coursesData";
import { usePlatformCourses, type PlatformCourse } from "@/hooks/usePlatformCourses";

const Courses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPath, setSelectedPath] = useState("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const { courses: dbCourses, loading } = usePlatformCourses({
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    level: selectedLevel !== "all" ? selectedLevel : undefined,
    search: searchQuery || undefined,
  });

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedLevel !== "all") count++;
    return count;
  }, [selectedCategory, selectedLevel]);

  const handleCourseClick = (course: PlatformCourse) => {
    if (course.is_coming_soon) return; // Don't navigate for coming soon
    navigate(`/courses/${course.slug || course.id}`);
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSearchQuery("");
  };

  const currentPathName = selectedPath !== "all"
    ? learningPaths.find(p => p.id === selectedPath)?.name
    : null;

  return (
    <div className="min-h-screen">
      <CoursesNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      <section className="pt-[72px]">
        <div className="section-container py-6 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Courses</h1>
          <p className="text-sm md:text-base text-muted-foreground">Explore Web3 skills that actually pay</p>
        </div>
      </section>

      <section className="section-container pb-6">
        <LearningPathTabs paths={learningPaths} selectedPath={selectedPath} onPathSelect={setSelectedPath} />
      </section>

      {(selectedCategory !== "all" || selectedLevel !== "all") && (
        <section className="section-container pb-4">
          <ActiveFilters
            selectedCategory={selectedCategory} selectedLevel={selectedLevel} selectedPath="all"
            onCategoryChange={setSelectedCategory} onLevelChange={setSelectedLevel}
            onPathChange={() => {}} onClearAll={clearAllFilters} totalResults={dbCourses.length}
          />
        </section>
      )}

      <section className="section-container pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {currentPathName ? `${currentPathName} Path` : "All Courses"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${dbCourses.length} ${dbCourses.length === 1 ? "course" : "courses"} available`}
            </p>
          </div>
        </div>
      </section>

      <section className="section-container pb-20">
        <PlatformCourseGrid courses={dbCourses} onCourseClick={handleCourseClick} loading={loading} />
      </section>

      <WhyDifferentSection />

      <section className="section-container py-20">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">Start Building Your Web3 Career</h2>
          <Button variant="outline" size="lg" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Explore Paths
          </Button>
        </div>
      </section>

      <Footer />

      <FilterSheet
        open={filterSheetOpen} onOpenChange={setFilterSheetOpen}
        selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
        selectedLevel={selectedLevel} onLevelChange={setSelectedLevel}
        selectedPath={selectedPath} onPathChange={setSelectedPath}
        onClearAll={clearAllFilters}
      />
    </div>
  );
};

// Simple grid for platform courses from Supabase
import { Badge } from "@/components/ui/badge";
import { Clock, Award, Loader2 } from "lucide-react";
import { categoryImages, type Category } from "@/data/coursesData";

const PlatformCourseGrid = ({ courses, onCourseClick, loading }: {
  courses: PlatformCourse[];
  onCourseClick: (c: PlatformCourse) => void;
  loading: boolean;
}) => {
  if (loading) {
    return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }
  if (courses.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-muted-foreground">No courses match your search.</p>
      </div>
    );
  }

  const levelColors: Record<string, string> = {
    Beginner: "bg-green-500/20 text-green-400",
    Intermediate: "bg-amber-500/20 text-amber-400",
    Advanced: "bg-rose-500/20 text-rose-400",
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 md:gap-4">
      {courses.map(course => {
        const fallbackImage = categoryImages[course.category as Category] || "";
        return (
          <button
            key={course.id}
            onClick={() => onCourseClick(course)}
            className="group text-left bg-card border border-border rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col h-full"
          >
            <div className="aspect-[4/3] overflow-hidden bg-muted relative">
              <img
                src={course.cover_image_url || fallbackImage}
                alt={course.title}
                className={cn(
                  "w-full h-full object-cover",
                  course.is_coming_soon ? "filter blur-[2px] scale-105" : "group-hover:scale-105 transition-transform duration-300"
                )}
                loading="lazy"
              />
              {course.is_coming_soon && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <span className="text-xs font-medium text-foreground bg-secondary px-2 py-1 rounded">Coming Soon</span>
                </div>
              )}
            </div>
            <div className="p-3 flex flex-col flex-1">
              <Badge variant="secondary" className={`${levelColors[course.level] || ""} border-0 text-[9px] font-medium px-1.5 py-0 w-fit mb-2`}>
                {course.level}
              </Badge>
              <h3 className="font-medium text-xs text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2 flex-1">
                {course.title}
              </h3>
              <div className="flex items-center gap-2 mt-auto pt-2">
                {course.total_duration && (
                  <div className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" /> {course.total_duration}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

import { cn } from "@/lib/utils";

export default Courses;
