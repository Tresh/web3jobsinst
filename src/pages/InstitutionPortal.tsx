import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Award, 
  Users, 
  GraduationCap,
  Clock,
  ExternalLink
} from "lucide-react";
import UnifiedNavbar from "@/components/UnifiedNavbar";
import Footer from "@/components/Footer";
import OpportunitiesStrip from "@/components/OpportunitiesStrip";
import { institutions, categoryLabels } from "@/data/institutionsData";

// Mock courses for institutions
const mockCourses = [
  {
    id: "1",
    title: "Introduction to Blockchain Development",
    level: "Beginner",
    duration: "4 hours",
    enrolled: 1200,
  },
  {
    id: "2",
    title: "Smart Contract Security",
    level: "Intermediate",
    duration: "6 hours",
    enrolled: 800,
  },
  {
    id: "3",
    title: "Building DApps from Scratch",
    level: "Advanced",
    duration: "10 hours",
    enrolled: 450,
  },
  {
    id: "4",
    title: "Tokenomics Fundamentals",
    level: "Beginner",
    duration: "3 hours",
    enrolled: 950,
  },
];

const learningPaths = [
  { name: "Beginner", courses: 4, color: "bg-green-100 text-green-800" },
  { name: "Intermediate", courses: 6, color: "bg-yellow-100 text-yellow-800" },
  { name: "Advanced", courses: 3, color: "bg-red-100 text-red-800" },
];

const certifications = [
  { name: "Certified Developer", holders: 234 },
  { name: "Smart Contract Specialist", holders: 128 },
  { name: "DeFi Expert", holders: 89 },
];

const InstitutionPortal = () => {
  const { slug } = useParams();
  const institution = institutions.find((i) => i.slug === slug);

  if (!institution) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavbar />
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Institution Not Found</h1>
          <p className="text-muted-foreground mb-8">The institution you're looking for doesn't exist.</p>
          <Link to="/institutions">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Institutions
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavbar />

      {/* Header */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl">
          <Link 
            to="/institutions" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Institutions
          </Link>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={institution.logo}
              alt={institution.name}
              className="w-20 h-20 rounded-xl object-cover bg-background border border-border"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {institution.name}
                </h1>
                {institution.verified && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Verified
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="mb-3">
                {categoryLabels[institution.category]}
              </Badge>
              <p className="text-muted-foreground max-w-2xl">
                {institution.description}
              </p>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{institution.coursesCount}</p>
                <p className="text-sm text-muted-foreground">Courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{institution.learnersCount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Learners</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground">
              Official Courses
            </h2>
            <Button variant="outline" size="sm">
              View All
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockCourses.map((course) => (
              <Card key={course.id} className="border-border hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-5">
                  <Badge variant="outline" className="mb-3 text-xs">
                    {course.level}
                  </Badge>
                  <h3 className="font-semibold text-foreground mb-3 line-clamp-2">
                    {course.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {course.enrolled}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
            Learning Paths
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {learningPaths.map((path) => (
              <Card key={path.name} className="border-border bg-background">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{path.name}</h3>
                      <p className="text-sm text-muted-foreground">{path.courses} courses</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    Start Path
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
            Official Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {certifications.map((cert) => (
              <Card key={cert.name} className="border-border">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{cert.name}</h3>
                      <p className="text-sm text-muted-foreground">{cert.holders} holders</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    View Requirements
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon Sections */}
      <section className="py-12 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border bg-background">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Bootcamps</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Intensive cohort-based programs coming soon
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
            <Card className="border-border bg-background">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">Job Pipeline</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Direct hiring from trained talent pool
                </p>
                <Badge variant="secondary">Coming Soon</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Community Programs placeholder */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-8">
            Community Programs
          </h2>
          <Card className="border-border">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Community programs and events will be listed here. 
                Check back soon for updates from {institution.name}.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <OpportunitiesStrip />
      <Footer />
    </div>
  );
};

export default InstitutionPortal;
