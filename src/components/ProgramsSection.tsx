import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Award, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { courses } from "@/data/coursesData";
import ComingSoonDialog from "./ComingSoonDialog";
import ScholarshipFormDialog from "./ScholarshipFormDialog";

// Show first 6 courses from the actual data
const displayCourses = courses.slice(0, 6);

const ProgramsSection = () => {
  const [comingSoonOpen, setComingSoonOpen] = useState(false);
  const [scholarshipOpen, setScholarshipOpen] = useState(false);

  const levelColors = {
    Beginner: "bg-emerald-100 text-emerald-700",
    Intermediate: "bg-amber-100 text-amber-700",
    Advanced: "bg-rose-100 text-rose-700",
  };

  return (
    <>
      <section id="programs" className="bg-background-secondary section-padding">
        <div className="section-container">
          <div className="text-center mb-12">
            <span className="badge-minimal mb-6 inline-block">Programs</span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-balance">
              Courses & Programs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Practical, industry-relevant courses designed to get you earning in Web3
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {displayCourses.map((course) => (
              <button
                key={course.id}
                onClick={() => setComingSoonOpen(true)}
                className="group text-left bg-card border border-secondary rounded-lg overflow-hidden hover:border-primary/30 hover:shadow-md transition-all duration-200 flex flex-col h-full"
              >
                {/* Image with blur overlay */}
                <div className="aspect-[4/3] overflow-hidden bg-secondary/30 relative">
                  <img 
                    src={course.image} 
                    alt={course.title}
                    className="w-full h-full object-cover filter blur-[2px] scale-105"
                  />
                  {/* Coming Soon overlay */}
                  <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                    <span className="text-xs font-medium text-foreground bg-secondary/90 px-2 py-1 rounded">
                      Coming Soon
                    </span>
                  </div>
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
            ))}
          </div>

          {/* View All Button */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" asChild>
              <Link to="/courses">
                View All Courses
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <ComingSoonDialog 
        open={comingSoonOpen} 
        onOpenChange={setComingSoonOpen}
        title="Course Coming Soon"
        onScholarshipClick={() => setScholarshipOpen(true)}
      />
      <ScholarshipFormDialog open={scholarshipOpen} onOpenChange={setScholarshipOpen} />
    </>
  );
};

export default ProgramsSection;
