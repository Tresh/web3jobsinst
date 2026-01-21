import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { BookOpen, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardCourses = () => {
  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold">My Courses</h1>
        <p className="text-muted-foreground mt-1">
          Track your learning progress and enrolled courses
        </p>
      </div>

      {/* Empty State */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-lg mb-2">No courses enrolled</CardTitle>
          <CardDescription className="text-center max-w-sm mb-6">
            Start your Web3 journey by enrolling in our courses on development, trading, marketing, and more.
          </CardDescription>
          <Button asChild>
            <Link to="/courses">
              Browse Courses
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCourses;
