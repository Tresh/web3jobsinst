import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PlatformCourse {
  id: string;
  title: string;
  description: string | null;
  category: string;
  level: string;
  duration: string | null;
  cover_image_url: string | null;
  skill_outcome: string | null;
  instructor: string | null;
  total_duration: string | null;
  is_published: boolean;
  is_coming_soon: boolean;
  order_index: number;
  slug: string | null;
  created_at: string;
}

export interface PlatformModule {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  order_index: number;
  is_published: boolean;
}

export interface PlatformLesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  video_url: string | null;
  video_duration: string | null;
  cover_image_url: string | null;
  resources: any;
  order_index: number;
  is_published: boolean;
  is_free_preview: boolean;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  completed_at: string | null;
  progress_percent: number;
  last_lesson_id: string | null;
  status: string;
}

export interface LessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  course_id: string;
  watched_seconds: number;
  total_seconds: number;
  is_completed: boolean;
  completed_at: string | null;
  last_watched_at: string;
}

// Fetch all published courses
export const usePlatformCourses = (filters?: {
  category?: string;
  level?: string;
  search?: string;
}) => {
  const [courses, setCourses] = useState<PlatformCourse[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("platform_courses")
      .select("*")
      .eq("is_published", true)
      .order("order_index");

    if (filters?.category && filters.category !== "all") {
      query = query.eq("category", filters.category);
    }
    if (filters?.level && filters.level !== "all") {
      query = query.eq("level", filters.level);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (!error && data) {
      setCourses(data as PlatformCourse[]);
    }
    setLoading(false);
  }, [filters?.category, filters?.level, filters?.search]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  return { courses, loading, refetch: fetchCourses };
};

// Fetch single course with modules and lessons
export const usePlatformCourseDetail = (slugOrId: string | undefined) => {
  const [course, setCourse] = useState<PlatformCourse | null>(null);
  const [modules, setModules] = useState<(PlatformModule & { lessons: PlatformLesson[] })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slugOrId) return;
    const fetch = async () => {
      setLoading(true);
      // Try by slug first, then by id
      let { data: courseData } = await supabase
        .from("platform_courses")
        .select("*")
        .eq("slug", slugOrId)
        .maybeSingle();

      if (!courseData) {
        const { data } = await supabase
          .from("platform_courses")
          .select("*")
          .eq("id", slugOrId)
          .maybeSingle();
        courseData = data;
      }

      if (!courseData) {
        setCourse(null);
        setModules([]);
        setLoading(false);
        return;
      }

      setCourse(courseData as PlatformCourse);

      // Fetch modules
      const { data: modulesData } = await supabase
        .from("platform_course_modules")
        .select("*")
        .eq("course_id", courseData.id)
        .eq("is_published", true)
        .order("order_index");

      const mods = (modulesData || []) as PlatformModule[];

      // Fetch lessons for all modules
      if (mods.length > 0) {
        const { data: lessonsData } = await supabase
          .from("platform_course_lessons")
          .select("*")
          .in("module_id", mods.map(m => m.id))
          .eq("is_published", true)
          .order("order_index");

        const lessons = (lessonsData || []) as PlatformLesson[];
        const modulesWithLessons = mods.map(m => ({
          ...m,
          lessons: lessons.filter(l => l.module_id === m.id),
        }));
        setModules(modulesWithLessons);
      } else {
        setModules([]);
      }

      setLoading(false);
    };
    fetch();
  }, [slugOrId]);

  return { course, modules, loading };
};

// Fetch single lesson
export const usePlatformLesson = (lessonId: string | undefined) => {
  const [lesson, setLesson] = useState<PlatformLesson | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!lessonId) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("platform_course_lessons")
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();
      setLesson(data as PlatformLesson | null);
      setLoading(false);
    };
    fetch();
  }, [lessonId]);

  return { lesson, loading };
};

// Course enrollment hook
export const useCourseEnrollment = (courseId: string | undefined) => {
  const { user } = useAuth();
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEnrollment = useCallback(async () => {
    if (!user || !courseId) return;
    setLoading(true);
    const { data } = await supabase
      .from("course_enrollments")
      .select("*")
      .eq("course_id", courseId)
      .eq("user_id", user.id)
      .maybeSingle();
    setEnrollment(data as CourseEnrollment | null);
    setLoading(false);
  }, [user, courseId]);

  useEffect(() => { fetchEnrollment(); }, [fetchEnrollment]);

  const enroll = async () => {
    if (!user || !courseId) return false;
    const { error } = await supabase.from("course_enrollments").insert({
      user_id: user.id,
      course_id: courseId,
    });
    if (!error) { await fetchEnrollment(); return true; }
    return false;
  };

  return { enrollment, loading, enroll, refetch: fetchEnrollment };
};

// User's enrolled courses
export const useMyEnrolledCourses = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<(CourseEnrollment & { course?: PlatformCourse })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    const fetch = async () => {
      setLoading(true);
      const { data: enrollData } = await supabase
        .from("course_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      if (!enrollData || enrollData.length === 0) {
        setEnrollments([]);
        setLoading(false);
        return;
      }

      const courseIds = enrollData.map((e: any) => e.course_id);
      const { data: coursesData } = await supabase
        .from("platform_courses")
        .select("*")
        .in("id", courseIds);

      const courseMap: Record<string, PlatformCourse> = {};
      (coursesData || []).forEach((c: any) => { courseMap[c.id] = c as PlatformCourse; });

      setEnrollments(enrollData.map((e: any) => ({
        ...e,
        course: courseMap[e.course_id],
      })) as any);
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { enrollments, loading };
};

// Lesson progress hook
export const useLessonProgress = (lessonId: string | undefined, courseId: string | undefined) => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<LessonProgress | null>(null);

  useEffect(() => {
    if (!user || !lessonId) return;
    supabase
      .from("course_lesson_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle()
      .then(({ data }) => setProgress(data as LessonProgress | null));
  }, [user, lessonId]);

  const updateProgress = async (watchedSeconds: number, totalSeconds: number) => {
    if (!user || !lessonId || !courseId) return;
    const isCompleted = totalSeconds > 0 && watchedSeconds / totalSeconds >= 0.9;
    const payload = {
      user_id: user.id,
      lesson_id: lessonId,
      course_id: courseId,
      watched_seconds: watchedSeconds,
      total_seconds: totalSeconds,
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
      last_watched_at: new Date().toISOString(),
    };

    const { data } = await supabase
      .from("course_lesson_progress")
      .upsert(payload, { onConflict: "user_id,lesson_id" })
      .select()
      .maybeSingle();
    if (data) setProgress(data as LessonProgress);
  };

  const markComplete = async () => {
    if (!user || !lessonId || !courseId) return;
    const { data } = await supabase
      .from("course_lesson_progress")
      .upsert({
        user_id: user.id,
        lesson_id: lessonId,
        course_id: courseId,
        is_completed: true,
        completed_at: new Date().toISOString(),
        last_watched_at: new Date().toISOString(),
        watched_seconds: progress?.total_seconds || 0,
        total_seconds: progress?.total_seconds || 0,
      }, { onConflict: "user_id,lesson_id" })
      .select()
      .maybeSingle();
    if (data) setProgress(data as LessonProgress);
  };

  return { progress, updateProgress, markComplete };
};
