import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ArrowRight, Clock, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMyEnrolledCourses } from "@/hooks/usePlatformCourses";
import { Progress } from "@/components/ui/progress";

const DashboardCourses = () => {
  const { enrollments, loading } = useMyEnrolledCourses();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My Courses</h1>
          <p className="text-muted-foreground mt-1">Track your learning progress</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/courses">Browse Courses</Link>
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-lg mb-2">No courses enrolled</CardTitle>
            <CardDescription className="text-center max-w-sm mb-6">
              Start your Web3 journey by enrolling in our courses.
            </CardDescription>
            <Button asChild>
              <Link to="/courses">
                Browse Courses <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {enrollments.map(enrollment => {
            const course = enrollment.course;
            if (!course) return null;
            return (
              <Card
                key={enrollment.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/courses/${course.slug || course.id}`)}
              >
                <CardContent className="p-4">
                  {course.cover_image_url && (
                    <div className="aspect-video rounded-lg overflow-hidden bg-muted mb-3">
                      <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-xs">{course.category}</Badge>
                    <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                  </div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">{course.title}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{enrollment.progress_percent}%</span>
                    </div>
                    <Progress value={enrollment.progress_percent} className="h-1.5" />
                  </div>
                  {enrollment.status === 'active' && (
                    <Button size="sm" className="w-full mt-3">
                      Continue Learning
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DashboardCourses;
