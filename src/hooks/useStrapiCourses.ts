// React Query hooks for Strapi course data

import { useQuery } from '@tanstack/react-query';
import {
  fetchCourses,
  fetchCourseBySlug,
  fetchCourseById,
  fetchModulesByCourse,
  fetchModuleById,
  fetchLessonsByModule,
  fetchLessonById,
  isStrapiConfigured,
} from '@/lib/strapi';
import type { CourseQueryParams } from '@/types/strapi';

// ============================================
// QUERY KEYS
// ============================================

export const strapiQueryKeys = {
  all: ['strapi'] as const,
  courses: () => [...strapiQueryKeys.all, 'courses'] as const,
  coursesList: (params: CourseQueryParams) => [...strapiQueryKeys.courses(), 'list', params] as const,
  courseBySlug: (slug: string) => [...strapiQueryKeys.courses(), 'slug', slug] as const,
  courseById: (id: number) => [...strapiQueryKeys.courses(), 'id', id] as const,
  modules: () => [...strapiQueryKeys.all, 'modules'] as const,
  modulesByCourse: (courseId: number) => [...strapiQueryKeys.modules(), 'course', courseId] as const,
  moduleById: (id: number) => [...strapiQueryKeys.modules(), 'id', id] as const,
  lessons: () => [...strapiQueryKeys.all, 'lessons'] as const,
  lessonsByModule: (moduleId: number) => [...strapiQueryKeys.lessons(), 'module', moduleId] as const,
  lessonById: (id: number) => [...strapiQueryKeys.lessons(), 'id', id] as const,
};

// ============================================
// COURSE HOOKS
// ============================================

/**
 * Fetch all courses with filtering and pagination
 */
export function useStrapiCourses(params: CourseQueryParams = {}) {
  return useQuery({
    queryKey: strapiQueryKeys.coursesList(params),
    queryFn: () => fetchCourses(params),
    enabled: isStrapiConfigured(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch a single course by slug (for course detail page)
 */
export function useStrapiCourseBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: strapiQueryKeys.courseBySlug(slug || ''),
    queryFn: () => fetchCourseBySlug(slug!),
    enabled: isStrapiConfigured() && Boolean(slug),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single course by ID
 */
export function useStrapiCourseById(id: number | undefined) {
  return useQuery({
    queryKey: strapiQueryKeys.courseById(id || 0),
    queryFn: () => fetchCourseById(id!),
    enabled: isStrapiConfigured() && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// MODULE HOOKS
// ============================================

/**
 * Fetch modules for a specific course
 */
export function useStrapiModules(courseId: number | undefined) {
  return useQuery({
    queryKey: strapiQueryKeys.modulesByCourse(courseId || 0),
    queryFn: () => fetchModulesByCourse(courseId!),
    enabled: isStrapiConfigured() && Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single module by ID
 */
export function useStrapiModuleById(id: number | undefined) {
  return useQuery({
    queryKey: strapiQueryKeys.moduleById(id || 0),
    queryFn: () => fetchModuleById(id!),
    enabled: isStrapiConfigured() && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// LESSON HOOKS
// ============================================

/**
 * Fetch lessons for a specific module
 */
export function useStrapiLessons(moduleId: number | undefined) {
  return useQuery({
    queryKey: strapiQueryKeys.lessonsByModule(moduleId || 0),
    queryFn: () => fetchLessonsByModule(moduleId!),
    enabled: isStrapiConfigured() && Boolean(moduleId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch a single lesson by ID
 */
export function useStrapiLessonById(id: number | undefined) {
  return useQuery({
    queryKey: strapiQueryKeys.lessonById(id || 0),
    queryFn: () => fetchLessonById(id!),
    enabled: isStrapiConfigured() && Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Check if Strapi is properly configured
 */
export function useStrapiStatus() {
  const isConfigured = isStrapiConfigured();
  
  // Try to fetch a single course to verify connection
  const { isLoading, isError, error } = useQuery({
    queryKey: [...strapiQueryKeys.all, 'status'],
    queryFn: () => fetchCourses({ pageSize: 1 }),
    enabled: isConfigured,
    retry: 1,
    staleTime: 60 * 1000, // 1 minute
  });
  
  return {
    isConfigured,
    isConnected: isConfigured && !isLoading && !isError,
    isLoading,
    isError,
    error,
  };
}
