import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePlatformCourseDetail, usePlatformLesson, useLessonProgress, useCourseEnrollment } from '@/hooks/usePlatformCourses';
import { useAuth } from '@/contexts/AuthContext';
import VimeoPlayer from '@/components/courses/VimeoPlayer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Play, Lock, CheckCircle, BookOpen,
  FileText, ExternalLink, Menu, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LessonPlayerPage = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { course, modules, loading: courseLoading } = usePlatformCourseDetail(slug);
  const { lesson, loading: lessonLoading } = usePlatformLesson(lessonId);
  const { enrollment } = useCourseEnrollment(course?.id);
  const { progress, updateProgress, markComplete } = useLessonProgress(lessonId, course?.id);

  useEffect(() => {
    const handleResize = () => setSidebarOpen(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTimeUpdate = useCallback((seconds: number, duration: number) => {
    updateProgress(Math.floor(seconds), Math.floor(duration));
  }, [updateProgress]);

  const handleLessonEnded = useCallback(() => {
    markComplete();
  }, [markComplete]);

  const isLoading = courseLoading || lessonLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex h-screen">
        <div className="flex-1 p-4">
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4 mt-4" />
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Lesson Not Found</h1>
          <Button variant="outline" onClick={() => navigate(`/courses/${slug}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course
          </Button>
        </div>
      </div>
    );
  }

  // Flatten all lessons for navigation
  const allLessons = modules.flatMap(m => m.lessons);
  const currentIndex = allLessons.findIndex(l => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isAccessible = lesson.is_free_preview || !!enrollment;

  // Extract Vimeo ID from URL
  const getVimeoId = (url: string | null) => {
    if (!url) return undefined;
    const match = url.match(/(\d+)/);
    return match ? match[1] : undefined;
  };

  const vimeoId = getVimeoId(lesson.video_url);
  const progressPercent = progress?.total_seconds ? (progress.watched_seconds / progress.total_seconds) * 100 : 0;

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b border-border/50 z-50 flex items-center px-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/courses/${slug}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{course.title}</span>
          <span className="sm:hidden">Back</span>
        </Button>
        <div className="flex-1 min-w-0 mx-4">
          <p className="text-sm font-medium truncate">{lesson.title}</p>
        </div>
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      <div className="flex pt-14 h-screen">
        <div className={cn('flex-1 overflow-auto transition-all duration-300', sidebarOpen ? 'lg:mr-80' : '')}>
          <div className="max-w-4xl mx-auto p-4 pb-20">
            {vimeoId && isAccessible ? (
              <VimeoPlayer
                videoId={vimeoId}
                title={lesson.title}
                isLocked={false}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleLessonEnded}
                className="mb-6"
              />
            ) : !isAccessible ? (
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center mb-6">
                <div className="text-center">
                  <Lock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Enroll in this course to access this lesson</p>
                  <Button className="mt-4" onClick={() => navigate(`/courses/${slug}`)}>
                    Go to Course
                  </Button>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-xl flex items-center justify-center mb-6">
                <p className="text-muted-foreground">No video available for this lesson</p>
              </div>
            )}

            {/* Progress bar */}
            {progressPercent > 0 && (
              <div className="h-1 bg-muted rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-primary transition-all duration-200" style={{ width: `${progressPercent}%` }} />
              </div>
            )}

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                {lesson.video_duration && <Badge variant="outline">{lesson.video_duration}</Badge>}
                {lesson.is_free_preview && <Badge variant="secondary">Free Preview</Badge>}
                {progress?.is_completed && <Badge className="bg-green-500/20 text-green-400">✓ Completed</Badge>}
              </div>
              <h1 className="text-xl md:text-2xl font-bold mb-2">{lesson.title}</h1>
              {lesson.description && <p className="text-muted-foreground">{lesson.description}</p>}
            </div>

            {/* Mark complete button */}
            {isAccessible && !progress?.is_completed && (
              <Button variant="outline" size="sm" onClick={markComplete} className="mb-6 gap-2">
                <CheckCircle className="w-4 h-4" /> Mark as Complete
              </Button>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-border">
              {prevLesson ? (
                <Link to={`/learn/${slug}/${prevLesson.id}`}>
                  <Button variant="outline" size="sm"><ChevronLeft className="w-4 h-4 mr-1" /> Previous</Button>
                </Link>
              ) : <div />}
              {nextLesson ? (
                <Link to={`/learn/${slug}/${nextLesson.id}`}>
                  <Button size="sm">Next <ChevronRight className="w-4 h-4 ml-1" /></Button>
                </Link>
              ) : (
                <Button size="sm" onClick={() => navigate(`/courses/${slug}`)}>
                  Complete Course <CheckCircle className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className={cn(
          'fixed right-0 top-14 bottom-0 w-80 bg-background/80 backdrop-blur-md border-l border-border/50 transition-transform duration-300 z-40',
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        )}>
          <ScrollArea className="h-full">
            <div className="p-4">
              <h2 className="font-semibold mb-4">Course Content</h2>
              {modules.map((mod, idx) => (
                <div key={mod.id} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">{idx + 1}</span>
                    <p className="text-sm font-medium">{mod.title}</p>
                  </div>
                  <div className="pl-7 space-y-1">
                    {mod.lessons.map(l => {
                      const isCurrent = l.id === lessonId;
                      const canAccess = l.is_free_preview || !!enrollment;
                      return (
                        <Link
                          key={l.id}
                          to={`/learn/${slug}/${l.id}`}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-lg text-sm transition-colors',
                            isCurrent ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
                          )}
                        >
                          {canAccess ? <Play className="w-3.5 h-3.5 shrink-0" /> : <Lock className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
                          <span className="flex-1 truncate">{l.title}</span>
                          {l.video_duration && <span className="text-xs text-muted-foreground shrink-0">{l.video_duration}</span>}
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
