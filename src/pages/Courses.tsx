import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import CoursesNavbar from "@/components/courses/CoursesNavbar";
import FilterSheet from "@/components/courses/FilterSheet";
import LearningPathsGrid from "@/components/courses/LearningPathsGrid";
import CourseGrid from "@/components/courses/CourseGrid";
import ActiveFilters from "@/components/courses/ActiveFilters";
import WhyDifferentSection from "@/components/courses/WhyDifferentSection";
import ScholarshipFormDialog from "@/components/ScholarshipFormDialog";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import { courses, learningPaths, type Course } from "@/data/coursesData";

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPath, setSelectedPath] = useState("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedLevel !== "all") count++;
    if (selectedPath !== "all") count++;
    return count;
  }, [selectedCategory, selectedLevel, selectedPath]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchQuery === "" ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;

      const matchesLevel =
        selectedLevel === "all" || course.level === selectedLevel;

      const matchesPath =
        selectedPath === "all" ||
        (course.learningPathIds && course.learningPathIds.includes(selectedPath));

      return matchesSearch && matchesCategory && matchesLevel && matchesPath;
    });
  }, [searchQuery, selectedCategory, selectedLevel, selectedPath]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setComingSoonOpen(true);
  };

  const clearAllFilters = () => {
    setSelectedCategory("all");
    setSelectedLevel("all");
    setSelectedPath("all");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-background">
      <CoursesNavbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterClick={() => setFilterSheetOpen(true)}
        activeFiltersCount={activeFiltersCount}
      />

      {/* Header */}
      <section className="pt-[72px]">
        <div className="section-container py-10 md:py-14">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Courses
          </h1>
          <p className="text-muted-foreground">
            Explore Web3 skills that actually pay
          </p>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="section-container pb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-foreground">
            Learning Paths
          </h2>
          {selectedPath !== "all" && (
            <button
              onClick={() => setSelectedPath("all")}
              className="text-sm text-primary hover:underline"
            >
              Clear selection
            </button>
          )}
        </div>
        <LearningPathsGrid
          paths={learningPaths}
          selectedPath={selectedPath}
          onPathSelect={setSelectedPath}
        />
      </section>

      {/* Divider */}
      <div className="section-container">
        <div className="border-t border-secondary" />
      </div>

      {/* Active Filters & Results */}
      <section className="section-container py-6">
        <ActiveFilters
          selectedCategory={selectedCategory}
          selectedLevel={selectedLevel}
          selectedPath={selectedPath}
          onCategoryChange={setSelectedCategory}
          onLevelChange={setSelectedLevel}
          onPathChange={setSelectedPath}
          onClearAll={clearAllFilters}
          totalResults={filteredCourses.length}
        />
      </section>

      {/* Course Grid */}
      <section className="section-container pb-20">
        <CourseGrid courses={filteredCourses} onCourseClick={handleCourseClick} />
      </section>

      {/* Scholarship CTA */}
      <section className="section-container pb-20">
        <div className="rounded-2xl border border-secondary bg-secondary/20 p-10 md:p-14 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-4">
            Don't Know Where to Start?
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Join our scholarship program and we'll guide you step by step through your Web3 journey.
          </p>
          <Button variant="default" size="lg" onClick={() => setScholarshipOpen(true)}>
            Join Scholarship Program
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Why Different */}
      <WhyDifferentSection />

      {/* Final CTA */}
      <section className="section-container py-20">
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
            Start Building Your Web3 Career
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="default" size="lg" onClick={() => setScholarshipOpen(true)}>
              Join Scholarship
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Explore Paths
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Filter Sheet */}
      <FilterSheet
        open={filterSheetOpen}
        onOpenChange={setFilterSheetOpen}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedLevel={selectedLevel}
        onLevelChange={setSelectedLevel}
        selectedPath={selectedPath}
        onPathChange={setSelectedPath}
        onClearAll={clearAllFilters}
      />

      {/* Dialogs */}
      <ScholarshipFormDialog
        open={scholarshipOpen}
        onOpenChange={setScholarshipOpen}
      />
      <ComingSoonDialog
        open={comingSoonOpen}
        onOpenChange={setComingSoonOpen}
        title={selectedCourse?.title || "Course Coming Soon"}
        onScholarshipClick={() => setScholarshipOpen(true)}
      />
    </div>
  );
};

export default Courses;
