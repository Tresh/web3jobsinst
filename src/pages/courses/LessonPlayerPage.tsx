import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStrapiLessonById, useStrapiCourseBySlug } from '@/hooks/useStrapiCourses';
import { transformModule, transformLesson } from '@/types/strapi';
import { isStrapiConfigured } from '@/lib/strapi';
import VimeoPlayer from '@/components/courses/VimeoPlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Play,
  Lock,
  CheckCircle,
  BookOpen,
  FileText,
  ExternalLink,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Footer from '@/components/Footer';

const LessonPlayerPage = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [progress, setProgress] = useState<{ seconds: number; duration: number }>({ seconds: 0, duration: 0 });

  // Fetch course for curriculum sidebar
  const { data: course, isLoading: courseLoading } = useStrapiCourseBySlug(slug);
  
  // Fetch current lesson
  const { data: lesson, isLoading: lessonLoading } = useStrapiLessonById(
    lessonId ? parseInt(lessonId, 10) : undefined
  );

  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle time update
  const handleTimeUpdate = useCallback((seconds: number, duration: number) => {
    setProgress({ seconds, duration });
    // TODO: Save progress to Supabase
  }, []);

  // Handle lesson ended
  const handleLessonEnded = useCallback(() => {
    // TODO: Mark lesson as complete in Supabase
    console.log('Lesson completed');
  }, []);

  // Check if Strapi is configured
  if (!isStrapiConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">CMS Not Configured</h1>
          <p className="text-muted-foreground mb-6">
            Strapi CMS is not connected yet.
          </p>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const isLoading = courseLoading || lessonLoading;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="flex h-screen">
          <div className="flex-1 p-4">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-8 w-3/4 mt-4" />
            <Skeleton className="h-4 w-1/2 mt-2" />
          </div>
          <div className="w-80 border-l border-border p-4 hidden lg:block">
            <Skeleton className="h-8 w-full mb-4" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error or not found
  if (!lesson || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Lesson Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This lesson doesn't exist or you don't have access to it.
          </p>
          <Button variant="outline" onClick={() => navigate(`/courses/${slug}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
        </div>
      </div>
    );
  }

  const transformedLesson = transformLesson(lesson);
  const modules = course.modules?.map(transformModule) || [];
  
  // Flatten all lessons for navigation
  const allLessons = modules.flatMap((m) => m.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === transformedLesson.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Check if lesson is accessible
  const isAccessible = transformedLesson.accessLevel === 'free' || transformedLesson.isPreview;
  // TODO: Check user enrollment for paid lessons

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b border-border/50 z-50 flex items-center px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/courses/${slug}`)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{course.title}</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="flex-1 min-w-0 mx-4">
          <p className="text-sm font-medium truncate">{transformedLesson.title}</p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex pt-14 h-screen">
        {/* Main content */}
        <div className={cn(
          'flex-1 overflow-auto transition-all duration-300',
          sidebarOpen ? 'lg:mr-80' : ''
        )}>
          <div className="max-w-4xl mx-auto p-4 pb-20">
            {/* Video player */}
            <VimeoPlayer
              videoId={transformedLesson.vimeoVideoId}
              title={transformedLesson.title}
              isLocked={!isAccessible}
              onLockedClick={() => navigate(`/courses/${slug}`)}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleLessonEnded}
              className="mb-6"
            />

            {/* Progress bar */}
            {progress.duration > 0 && (
              <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${(progress.seconds / progress.duration) * 100}%` }}
                />
              </div>
            )}

            {/* Lesson info */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{transformedLesson.duration}</Badge>
                {transformedLesson.accessLevel === 'free' && (
                  <Badge variant="secondary">Free</Badge>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">
                {transformedLesson.title}
              </h1>
              {transformedLesson.description && (
                <p className="text-muted-foreground">{transformedLesson.description}</p>
              )}
            </div>

            {/* Resources */}
            {transformedLesson.resources.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Resources</h2>
                <div className="space-y-2">
                  {transformedLesson.resources.map((resource, i) => (
                    <a
                      key={i}
                      href={resource.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                    >
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <span className="flex-1 text-sm">{resource.resourceTitle}</span>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              {prevLesson ? (
                <Link to={`/learn/${slug}/${prevLesson.id}`}>
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                </Link>
              ) : (
                <div />
              )}
              
              {nextLesson ? (
                <Link to={`/learn/${slug}/${nextLesson.id}`}>
                  <Button size="sm">
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <Button size="sm" onClick={() => navigate(`/courses/${slug}`)}>
                  Complete Course
                  <CheckCircle className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed right-0 top-14 bottom-0 w-80 bg-background/80 backdrop-blur-md border-l border-border/50 transition-transform duration-300 z-40',
            sidebarOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="font-semibold mb-4">Course Content</h2>
              
              {modules.map((module, moduleIdx) => (
                <div key={module.id} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                      {moduleIdx + 1}
                    </span>
                    <p className="text-sm font-medium">{module.title}</p>
                  </div>
                  
                  <div className="pl-7 space-y-1">
                    {module.lessons.map((l) => {
                      const isCurrent = l.id === transformedLesson.id;
                      const isLessonAccessible = l.accessLevel === 'free' || l.isPreview;
                      
                      return (
                        <Link
                          key={l.id}
                          to={`/learn/${slug}/${l.id}`}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-lg text-sm transition-colors',
                            isCurrent
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-secondary/50'
                          )}
                        >
                          {isLessonAccessible ? (
                            <Play className="w-3.5 h-3.5 shrink-0" />
                          ) : (
                            <Lock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          )}
                          <span className="flex-1 truncate">{l.title}</span>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {l.duration}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </aside>
      </div>
    </div>
  );
};

export default LessonPlayerPage;
