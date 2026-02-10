import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import CoursesNavbar from "@/components/courses/CoursesNavbar";
import FilterSheet from "@/components/courses/FilterSheet";
import LearningPathTabs from "@/components/courses/LearningPathTabs";
import CourseGrid from "@/components/courses/CourseGrid";
import ActiveFilters from "@/components/courses/ActiveFilters";
import WhyDifferentSection from "@/components/courses/WhyDifferentSection";
import ScholarshipFormDialog from "@/components/ScholarshipFormDialog";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import { courses as hardcodedCourses, learningPaths, type Course } from "@/data/coursesData";
import { useStrapiCourses } from "@/hooks/useStrapiCourses";
import { isStrapiConfigured } from "@/lib/strapi";
import { transformCourse } from "@/types/strapi";

const Courses = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPath, setSelectedPath] = useState("all");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Strapi data fetching
  const strapiConfigured = isStrapiConfigured();
  const { data: strapiData } = useStrapiCourses({
    search: searchQuery || undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
    level: selectedLevel !== "all" ? (selectedLevel as "Beginner" | "Intermediate" | "Advanced") : undefined,
  });

  // Transform Strapi courses into a unified shape for the grid
  const strapiUrl = import.meta.env.VITE_STRAPI_API_URL || '';
  const strapiCourses = useMemo(() => {
    if (!strapiConfigured || !strapiData?.courses) return [];
    return strapiData.courses.map(c => transformCourse(c, strapiUrl));
  }, [strapiConfigured, strapiData, strapiUrl]);

  // Count active filters (excluding path since it's handled by tabs)
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedLevel !== "all") count++;
    return count;
  }, [selectedCategory, selectedLevel]);

  // Filter hardcoded courses (fallback)
  const filteredHardcoded = useMemo(() => {
    if (strapiConfigured) return []; // Don't use hardcoded when Strapi is active
    return hardcodedCourses.filter((course) => {
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
  }, [searchQuery, selectedCategory, selectedLevel, selectedPath, strapiConfigured]);

  // Determine which data source to use
  const isUsingStrapi = strapiConfigured && strapiCourses.length >= 0;
  const displayCount = isUsingStrapi ? strapiCourses.length : filteredHardcoded.length;

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setComingSoonOpen(true);
  };

  const handleStrapiCourseClick = (slug: string) => {
    navigate(`/courses/${slug}`);
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

      {/* Header */}
      <section className="pt-[72px]">
        <div className="section-container py-6 md:py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">
            Courses
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Explore Web3 skills that actually pay
          </p>
        </div>
      </section>

      {/* Learning Path Tabs */}
      <section className="section-container pb-6">
        <LearningPathTabs
          paths={learningPaths}
          selectedPath={selectedPath}
          onPathSelect={setSelectedPath}
        />
      </section>

      {/* Active Filters */}
      {(selectedCategory !== "all" || selectedLevel !== "all") && (
        <section className="section-container pb-4">
          <ActiveFilters
            selectedCategory={selectedCategory}
            selectedLevel={selectedLevel}
            selectedPath="all"
            onCategoryChange={setSelectedCategory}
            onLevelChange={setSelectedLevel}
            onPathChange={() => {}}
            onClearAll={clearAllFilters}
            totalResults={displayCount}
          />
        </section>
      )}

      {/* Course Section Header */}
      <section className="section-container pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {currentPathName ? `${currentPathName} Path` : "All Courses"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {displayCount} {displayCount === 1 ? "course" : "courses"} available
            </p>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="section-container pb-20">
        {isUsingStrapi ? (
          <CourseGrid
            strapiCourses={strapiCourses}
            onStrapiCourseClick={handleStrapiCourseClick}
          />
        ) : (
          <CourseGrid
            courses={filteredHardcoded}
            onCourseClick={handleCourseClick}
          />
        )}
      </section>

      {/* Scholarship CTA */}
      <section className="section-container pb-20">
        <div className="rounded-2xl border border-border bg-card p-10 md:p-14 text-center">
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
