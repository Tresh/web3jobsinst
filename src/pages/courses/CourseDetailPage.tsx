import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePlatformCourseDetail, useCourseEnrollment } from '@/hooks/usePlatformCourses';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Clock, BookOpen, Play, Lock, CheckCircle, ChevronRight, Award, Loader2,
} from 'lucide-react';
import Footer from '@/components/Footer';
import UnifiedNavbar from '@/components/UnifiedNavbar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const levelColors: Record<string, string> = {
  Beginner: 'bg-emerald-100 text-emerald-700',
  Intermediate: 'bg-amber-100 text-amber-700',
  Advanced: 'bg-rose-100 text-rose-700',
};

const CourseDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { course, modules, loading } = usePlatformCourseDetail(slug);
  const { enrollment, loading: enrollLoading, enroll } = useCourseEnrollment(course?.id);

  if (loading) {
    return (
      <div className="min-h-screen">
        <UnifiedNavbar />
        <div className="pt-[72px] section-container py-8">
          <Skeleton className="h-8 w-24 mb-6" />
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-xl" />
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen">
        <UnifiedNavbar />
        <div className="pt-[72px] section-container py-20 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-6">The course you're looking for doesn't exist.</p>
          <Button variant="outline" onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Browse Courses
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const isEnrolled = !!enrollment;

  const handleEnroll = async () => {
    if (!user) { navigate('/login'); return; }
    const ok = await enroll();
    if (ok) toast({ title: "Enrolled successfully!" });
    else toast({ title: "Failed to enroll", variant: "destructive" });
  };

  const handleStartLesson = (lessonId: string) => {
    if (!isEnrolled && !user) { navigate('/login'); return; }
    navigate(`/learn/${slug}/${lessonId}`);
  };

  return (
    <div className="min-h-screen">
      <UnifiedNavbar />
      <div className="pt-[72px]">
        <div className="section-container py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Courses
          </Button>
        </div>

        <div className="section-container pb-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {course.cover_image_url && (
                <div className="aspect-video rounded-xl overflow-hidden bg-muted">
                  <img src={course.cover_image_url} alt={course.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={levelColors[course.level] || ''}>{course.level}</Badge>
                  <Badge variant="outline">{course.category}</Badge>
                  {course.is_coming_soon && <Badge variant="secondary">Coming Soon</Badge>}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">{course.title}</h1>
                {course.description && <p className="text-muted-foreground">{course.description}</p>}

                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1"><BookOpen className="w-4 h-4" /> {modules.length} modules</div>
                  <div className="flex items-center gap-1"><Play className="w-4 h-4" /> {totalLessons} lessons</div>
                  {course.total_duration && (
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {course.total_duration}</div>
                  )}
                  {course.instructor && (
                    <div className="flex items-center gap-1">by {course.instructor}</div>
                  )}
                </div>
              </div>

              {course.skill_outcome && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">What you'll learn</h2>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm">{course.skill_outcome}</span>
                  </div>
                </div>
              )}

              {modules.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-3">Course Curriculum</h2>
                  <Accordion type="single" collapsible className="w-full">
                    {modules.map((mod, idx) => (
                      <AccordionItem key={mod.id} value={`module-${mod.id}`}>
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <span className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-medium">{mod.title}</p>
                              <p className="text-xs text-muted-foreground">{mod.lessons.length} lessons</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="pl-9 space-y-2">
                            {mod.lessons.map((lesson) => {
                              const canAccess = lesson.is_free_preview || isEnrolled;
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() => canAccess ? handleStartLesson(lesson.id) : handleEnroll()}
                                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left"
                                >
                                  {canAccess ? (
                                    <Play className="w-4 h-4 text-primary" />
                                  ) : (
                                    <Lock className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm truncate">{lesson.title}</p>
                                  </div>
                                  {lesson.video_duration && (
                                    <span className="text-xs text-muted-foreground">{lesson.video_duration}</span>
                                  )}
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                </button>
                              );
                            })}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {modules.length === 0 && !course.is_coming_soon && (
                <div className="text-center py-8 bg-secondary/30 rounded-xl">
                  <BookOpen className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Modules and lessons will be added soon.</p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <div className="bg-card border border-border rounded-xl p-6">
                  {course.is_coming_soon ? (
                    <>
                      <p className="text-lg font-bold mb-4">Coming Soon</p>
                      <Button className="w-full" size="lg" disabled>
                        Not Available Yet
                      </Button>
                    </>
                  ) : isEnrolled ? (
                    <>
                      <p className="text-lg font-bold mb-2 text-primary">✅ Enrolled</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Progress: {enrollment?.progress_percent || 0}%
                      </p>
                      {modules.length > 0 && modules[0].lessons.length > 0 && (
                        <Button
                          className="w-full"
                          size="lg"
                          onClick={() => handleStartLesson(
                            enrollment?.last_lesson_id || modules[0].lessons[0].id
                          )}
                        >
                          Continue Learning
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold mb-4">Free</p>
                      <Button className="w-full mb-3" size="lg" onClick={handleEnroll} disabled={enrollLoading}>
                        {enrollLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        {user ? 'Enroll Now' : 'Login to Enroll'}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center">Full lifetime access</p>
                    </>
                  )}

                  <div className="mt-6 pt-6 border-t border-border space-y-3">
                    <p className="text-sm font-medium">This course includes:</p>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2"><Play className="w-4 h-4" />{totalLessons} video lessons</div>
                      <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" />{modules.length} modules</div>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4" />{course.total_duration || 'Self-paced'}</div>
                      <div className="flex items-center gap-2"><Award className="w-4 h-4" />Certificate of completion</div>
                    </div>
                  </div>
                </div>

                {course.instructor && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <p className="text-sm font-medium mb-2">Instructor</p>
                    <p className="text-muted-foreground">{course.instructor}</p>
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
