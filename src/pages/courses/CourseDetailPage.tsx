import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStrapiCourseBySlug } from '@/hooks/useStrapiCourses';
import { transformCourse, transformModule } from '@/types/strapi';
import { isStrapiConfigured } from '@/lib/strapi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  ArrowLeft, 
  Clock, 
  BookOpen, 
  Play, 
  Lock, 
  CheckCircle,
  ChevronRight,
  Award,
} from 'lucide-react';
import Footer from '@/components/Footer';
import UnifiedNavbar from '@/components/UnifiedNavbar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const levelColors = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const { data: course, isLoading, error } = useStrapiCourseBySlug(slug);

  // Check if Strapi is configured
  if (!isStrapiConfigured()) {
    return (
      <div className="min-h-screen">
        <UnifiedNavbar />
        <div className="pt-[72px]">
          <div className="section-container py-20 text-center">
            <div className="max-w-md mx-auto">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">CMS Not Configured</h1>
              <p className="text-muted-foreground mb-6">
                Strapi CMS is not connected yet. Please configure VITE_STRAPI_API_URL and VITE_STRAPI_API_TOKEN.
              </p>
              <Button variant="outline" onClick={() => navigate('/courses')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <UnifiedNavbar />
        <div className="pt-[72px]">
          <div className="section-container py-8">
            <Skeleton className="h-8 w-24 mb-6" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-xl" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div>
                <Skeleton className="h-96 w-full rounded-xl" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error or not found
  if (error || !course) {
    return (
      <div className="min-h-screen">
        <UnifiedNavbar />
        <div className="pt-[72px]">
          <div className="section-container py-20 text-center">
            <div className="max-w-md mx-auto">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The course you're looking for doesn't exist or has been removed.
              </p>
              <Button variant="outline" onClick={() => navigate('/courses')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Browse Courses
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const strapiUrl = import.meta.env.VITE_STRAPI_API_URL || '';
  const transformedCourse = transformCourse(course, strapiUrl);
  const modules = course.modules?.map(transformModule) || [];
  
  // Calculate total lessons
  const totalLessons = modules.reduce((acc, m) => acc + m.lessonCount, 0);

  return (
    <div className="min-h-screen">
      <UnifiedNavbar />
      
      <div className="pt-[72px]">
        {/* Back button */}
        <div className="section-container py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>

        {/* Course Header */}
        <div className="section-container pb-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Cover image */}
              {transformedCourse.coverImageUrl && (
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                  <img
                    src={transformedCourse.coverImageUrl}
                    alt={transformedCourse.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Title and meta */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={levelColors[transformedCourse.level]}>
                    {transformedCourse.level}
                  </Badge>
                  <Badge variant="outline">{transformedCourse.category}</Badge>
                  {transformedCourse.isFree && (
                    <Badge variant="secondary">Free</Badge>
                  )}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                  {transformedCourse.title}
                </h1>
                
                <p className="text-muted-foreground">
                  {transformedCourse.shortDescription}
                </p>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {modules.length} modules
                  </div>
                  <div className="flex items-center gap-1">
                    <Play className="w-4 h-4" />
                    {totalLessons} lessons
                  </div>
                  {transformedCourse.estimatedDuration && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {transformedCourse.estimatedDuration}
                    </div>
                  )}
                </div>
              </div>

              {/* Full description */}
              {transformedCourse.fullDescription && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <h2 className="text-lg font-semibold mb-2">About this course</h2>
                  <div dangerouslySetInnerHTML={{ __html: transformedCourse.fullDescription }} />
                </div>
              )}

              {/* Skills */}
              {transformedCourse.skills.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">What you'll learn</h2>
                  <div className="grid sm:grid-cols-2 gap-2">
                    {transformedCourse.skills.map((skill, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                        <span className="text-sm">{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Curriculum */}
              <div>
                <h2 className="text-lg font-semibold mb-3">Course Curriculum</h2>
                <Accordion type="single" collapsible className="w-full">
                  {modules.map((module, idx) => (
                    <AccordionItem key={module.id} value={`module-${module.id}`}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="font-medium">{module.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {module.lessonCount} lessons
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="pl-9 space-y-2">
                          {module.lessons.map((lesson) => (
                            <Link
                              key={lesson.id}
                              to={`/learn/${slug}/${lesson.id}`}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                              {lesson.accessLevel === 'free' || lesson.isPreview ? (
                                <Play className="w-4 h-4 text-primary" />
                              ) : (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate">{lesson.title}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {lesson.duration}
                              </span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground" />
                            </Link>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {/* Enrollment card */}
                <div className="bg-card border border-border rounded-xl p-6">
                  {transformedCourse.isFree ? (
                    <p className="text-2xl font-bold mb-4">Free</p>
                  ) : (
                    <p className="text-2xl font-bold mb-4">
                      ${transformedCourse.price?.toFixed(2) || '0.00'}
                    </p>
                  )}
                  
                  <Button className="w-full mb-3" size="lg">
                    {transformedCourse.isFree ? 'Start Learning' : 'Enroll Now'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Full lifetime access
                  </p>

                  {/* Course includes */}
                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <p className="text-sm font-medium">This course includes:</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        <span>{totalLessons} video lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{modules.length} modules</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{transformedCourse.estimatedDuration || 'Self-paced'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4" />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructor */}
                {transformedCourse.instructorName && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-sm font-medium mb-2">Instructor</p>
                    <p className="text-muted-foreground">{transformedCourse.instructorName}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetailPage;
