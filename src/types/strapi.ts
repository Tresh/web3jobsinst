// Strapi CMS Types for Course Content

// ============================================
// BASE STRAPI RESPONSE TYPES
// ============================================

export interface StrapiMeta {
  pagination?: {
    page: number;
    pageSize: number;
    pageCount: number;
    total: number;
  };
}

export interface StrapiResponse<T> {
  data: T;
  meta: StrapiMeta;
}

export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
}

// ============================================
// CONTENT TYPES
// ============================================

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type CourseStatus = 'draft' | 'published';
export type LessonAccessLevel = 'free' | 'paid' | 'cohort-only';
export type UnlockRule = 'instant' | 'sequential';
export type ResourceType = 'pdf' | 'link' | 'download';

// ============================================
// COMPONENT TYPES
// ============================================

export interface SkillComponent {
  id: number;
  skill: string;
}

export interface ResourceComponent {
  id: number;
  resourceTitle: string;
  resourceUrl: string;
  resourceType: ResourceType;
}

// ============================================
// LESSON
// ============================================

export interface StrapiLesson {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  order: number;
  vimeoVideoId: string;
  duration: string;
  accessLevel: LessonAccessLevel;
  isPreview: boolean;
  resources: ResourceComponent[];
  hasQuiz: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiLessonWithModule extends StrapiLesson {
  module: StrapiModule;
}

// ============================================
// MODULE
// ============================================

export interface StrapiModule {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  order: number;
  unlockRule: UnlockRule;
  isOptional: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiModuleWithLessons extends StrapiModule {
  lessons: StrapiLesson[];
}

export interface StrapiModuleWithCourse extends StrapiModule {
  course: StrapiCourse;
  lessons: StrapiLesson[];
}

// ============================================
// COURSE
// ============================================

export interface StrapiCourse {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string | null;
  coverImage: StrapiImage | null;
  level: CourseLevel;
  category: string;
  isFree: boolean;
  price: number | null;
  status: CourseStatus;
  estimatedDuration: string | null;
  skills: SkillComponent[];
  instructorName: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
}

export interface StrapiCourseWithModules extends StrapiCourse {
  modules: StrapiModuleWithLessons[];
}

// ============================================
// API QUERY PARAMS
// ============================================

export interface CourseQueryParams {
  level?: CourseLevel;
  category?: string;
  isFree?: boolean;
  status?: CourseStatus;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ============================================
// FRONTEND TRANSFORMED TYPES
// These are cleaned-up versions for component use
// ============================================

export interface Course {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string | null;
  coverImageUrl: string | null;
  level: CourseLevel;
  category: string;
  isFree: boolean;
  price: number | null;
  estimatedDuration: string | null;
  skills: string[];
  instructorName: string | null;
  moduleCount: number;
  lessonCount: number;
}

export interface Module {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  order: number;
  unlockRule: UnlockRule;
  isOptional: boolean;
  lessonCount: number;
  lessons: Lesson[];
}

export interface Lesson {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  order: number;
  vimeoVideoId: string;
  duration: string;
  accessLevel: LessonAccessLevel;
  isPreview: boolean;
  resources: ResourceComponent[];
  hasQuiz: boolean;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get full image URL from Strapi
 */
export function getStrapiImageUrl(image: StrapiImage | null, strapiUrl: string): string | null {
  if (!image) return null;
  
  // If URL is already absolute, return as-is
  if (image.url.startsWith('http')) {
    return image.url;
  }
  
  // Otherwise, prepend Strapi URL
  return `${strapiUrl}${image.url}`;
}

/**
 * Transform Strapi course response to frontend-friendly format
 */
export function transformCourse(
  course: StrapiCourse | StrapiCourseWithModules,
  strapiUrl: string
): Course {
  const modulesData = 'modules' in course ? course.modules : [];
  
  return {
    id: course.id,
    documentId: course.documentId,
    title: course.title,
    slug: course.slug,
    shortDescription: course.shortDescription,
    fullDescription: course.fullDescription,
    coverImageUrl: getStrapiImageUrl(course.coverImage, strapiUrl),
    level: course.level,
    category: course.category,
    isFree: course.isFree,
    price: course.price,
    estimatedDuration: course.estimatedDuration,
    skills: course.skills?.map(s => s.skill) || [],
    instructorName: course.instructorName,
    moduleCount: modulesData.length,
    lessonCount: modulesData.reduce((acc, m) => acc + (m.lessons?.length || 0), 0),
  };
}

/**
 * Transform Strapi module response to frontend-friendly format
 */
export function transformModule(module: StrapiModuleWithLessons): Module {
  return {
    id: module.id,
    documentId: module.documentId,
    title: module.title,
    description: module.description,
    order: module.order,
    unlockRule: module.unlockRule,
    isOptional: module.isOptional,
    lessonCount: module.lessons?.length || 0,
    lessons: module.lessons?.map(transformLesson) || [],
  };
}

/**
 * Transform Strapi lesson response to frontend-friendly format
 */
export function transformLesson(lesson: StrapiLesson): Lesson {
  return {
    id: lesson.id,
    documentId: lesson.documentId,
    title: lesson.title,
    description: lesson.description,
    order: lesson.order,
    vimeoVideoId: lesson.vimeoVideoId,
    duration: lesson.duration,
    accessLevel: lesson.accessLevel,
    isPreview: lesson.isPreview,
    resources: lesson.resources || [],
    hasQuiz: lesson.hasQuiz,
  };
}

/**
 * Generate Vimeo embed URL from video ID
 */
export function getVimeoEmbedUrl(videoId: string): string {
  return `https://player.vimeo.com/video/${videoId}`;
}

/**
 * Generate Vimeo player options URL
 */
export function getVimeoPlayerUrl(videoId: string, options?: {
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}): string {
  const params = new URLSearchParams();
  
  if (options?.autoplay) params.set('autoplay', '1');
  if (options?.muted) params.set('muted', '1');
  if (options?.loop) params.set('loop', '1');
  if (options?.controls === false) params.set('controls', '0');
  
  // Default settings for better UX
  params.set('title', '0');
  params.set('byline', '0');
  params.set('portrait', '0');
  params.set('dnt', '1'); // Do not track
  
  const queryString = params.toString();
  return `https://player.vimeo.com/video/${videoId}${queryString ? `?${queryString}` : ''}`;
}
