import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseFilters from "@/components/courses/CourseFilters";
import LearningPathCard from "@/components/courses/LearningPathCard";
import CategorySection from "@/components/courses/CategorySection";
import WhyDifferentSection from "@/components/courses/WhyDifferentSection";
import ScholarshipFormDialog from "@/components/ScholarshipFormDialog";
import ComingSoonDialog from "@/components/ComingSoonDialog";
import {
  courses,
  learningPaths,
  categories,
  type Course,
  type Category,
} from "@/data/coursesData";

const Courses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedPath, setSelectedPath] = useState("all");
  const [scholarshipOpen, setScholarshipOpen] = useState(false);
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchQuery === "" ||
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase());

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

  // Group courses by category
  const coursesByCategory = useMemo(() => {
    const grouped: Partial<Record<Category, Course[]>> = {};
    filteredCourses.forEach((course) => {
      if (!grouped[course.category]) {
        grouped[course.category] = [];
      }
      grouped[course.category]!.push(course);
    });
    return grouped;
  }, [filteredCourses]);

  const handleCourseClick = (course: Course) => {
    setSelectedCourse(course);
    setComingSoonOpen(true);
  };

  const handlePathClick = (pathId: string) => {
    setSelectedPath(pathId);
    // Scroll to filters
    document.getElementById("course-filters")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-[72px] bg-background">
        <div className="section-container py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6 tracking-tight">
              Explore Web3 Skills That{" "}
              <span className="text-primary">Actually Pay</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Learn real Web3 skills. Build proof of work. Get real opportunities.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="default"
                size="lg"
                onClick={() => setScholarshipOpen(true)}
              >
                Join Scholarship
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("learning-paths")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                View Learning Paths
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section id="course-filters" className="section-container pb-8">
        <CourseFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          selectedPath={selectedPath}
          onPathChange={setSelectedPath}
        />
      </section>

      {/* Learning Paths Section */}
      <section id="learning-paths" className="section-container section-padding">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Featured Learning Paths
          </h2>
          <p className="text-muted-foreground">
            Structured paths to guide your Web3 career journey.
          </p>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
          {learningPaths.map((path) => (
            <LearningPathCard
              key={path.id}
              path={path}
              onClick={() => handlePathClick(path.id)}
            />
          ))}
        </div>
      </section>

      {/* Course Categories */}
      <section className="section-container section-padding">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            All Courses
          </h2>
          <p className="text-muted-foreground">
            {filteredCourses.length} courses available
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
            {selectedLevel !== "all" && ` • ${selectedLevel}`}
            {selectedPath !== "all" &&
              ` • ${learningPaths.find((p) => p.id === selectedPath)?.name}`}
          </p>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground mb-4">
              No courses match your filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedLevel("all");
                setSelectedPath("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {categories
              .filter((cat) => coursesByCategory[cat]?.length)
              .map((category) => (
                <CategorySection
                  key={category}
                  category={category}
                  courses={coursesByCategory[category]!}
                  onCourseClick={handleCourseClick}
                  defaultExpanded={selectedCategory !== "all"}
                />
              ))}
          </div>
        )}
      </section>

      {/* Scholarship CTA */}
      <section className="section-container section-padding">
        <div className="rounded-xl border border-secondary bg-secondary/30 p-8 md:p-12 lg:p-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Don't Know Where to Start?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join our scholarship program and we'll guide you step by step through
            your Web3 journey.
          </p>
          <Button
            variant="default"
            size="lg"
            onClick={() => setScholarshipOpen(true)}
          >
            Join Scholarship Program
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </section>

      {/* Why Different Section */}
      <WhyDifferentSection />

      {/* Final CTA */}
      <section className="section-container section-padding">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            Start Building Your Web3 Career
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="default"
              size="lg"
              onClick={() => setScholarshipOpen(true)}
            >
              Join Scholarship
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() =>
                document
                  .getElementById("learning-paths")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Explore Paths
            </Button>
          </div>
        </div>
      </section>

      <Footer />

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
