// Strapi API Client
// This client fetches content from your Strapi CMS instance

import type {
  StrapiResponse,
  StrapiCourse,
  StrapiCourseWithModules,
  StrapiModuleWithLessons,
  StrapiLesson,
  CourseQueryParams,
  Course,
  Module,
  Lesson,
  transformCourse,
  transformModule,
  transformLesson,
} from '@/types/strapi';

// ============================================
// CONFIGURATION
// ============================================

/**
 * Get Strapi configuration from environment
 * These should be set as Cloud secrets in Lovable
 */
function getStrapiConfig() {
  // For now, we'll use placeholder values that will be replaced
  // when you add the actual secrets via Lovable Cloud
  const apiUrl = import.meta.env.VITE_STRAPI_API_URL || '';
  const apiToken = import.meta.env.VITE_STRAPI_API_TOKEN || '';
  
  return { apiUrl, apiToken };
}

/**
 * Check if Strapi is configured
 */
export function isStrapiConfigured(): boolean {
  const { apiUrl, apiToken } = getStrapiConfig();
  return Boolean(apiUrl && apiToken);
}

// ============================================
// API CLIENT
// ============================================

interface FetchOptions {
  populate?: string | Record<string, unknown>;
  filters?: Record<string, unknown>;
  sort?: string | string[];
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}

/**
 * Generic Strapi fetch function
 */
async function strapiRequest<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<StrapiResponse<T>> {
  const { apiUrl, apiToken } = getStrapiConfig();
  
  if (!apiUrl || !apiToken) {
    throw new Error('Strapi is not configured. Please add VITE_STRAPI_API_URL and VITE_STRAPI_API_TOKEN to your environment.');
  }
  
  // Build query string
  const params = new URLSearchParams();
  
  // Handle populate
  if (options.populate) {
    if (typeof options.populate === 'string') {
      params.set('populate', options.populate);
    } else {
      params.set('populate', JSON.stringify(options.populate));
    }
  }
  
  // Handle filters
  if (options.filters) {
    Object.entries(options.filters).forEach(([key, value]) => {
      if (typeof value === 'object') {
        Object.entries(value as Record<string, unknown>).forEach(([op, val]) => {
          params.set(`filters[${key}][${op}]`, String(val));
        });
      } else {
        params.set(`filters[${key}]`, String(value));
      }
    });
  }
  
  // Handle sort
  if (options.sort) {
    const sortValue = Array.isArray(options.sort) ? options.sort.join(',') : options.sort;
    params.set('sort', sortValue);
  }
  
  // Handle pagination
  if (options.pagination) {
    if (options.pagination.page) {
      params.set('pagination[page]', String(options.pagination.page));
    }
    if (options.pagination.pageSize) {
      params.set('pagination[pageSize]', String(options.pagination.pageSize));
    }
  }
  
  const queryString = params.toString();
  const url = `${apiUrl}/api/${endpoint}${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Strapi API error (${response.status}): ${errorText}`);
  }
  
  return response.json();
}

// ============================================
// COURSE API
// ============================================

/**
 * Fetch all published courses
 */
export async function fetchCourses(params: CourseQueryParams = {}): Promise<{
  courses: StrapiCourse[];
  pagination: StrapiResponse<StrapiCourse[]>['meta']['pagination'];
}> {
  const filters: Record<string, unknown> = {
    status: { $eq: 'published' },
  };
  
  if (params.level) {
    filters.level = { $eq: params.level };
  }
  
  if (params.category) {
    filters.category = { $eq: params.category };
  }
  
  if (params.isFree !== undefined) {
    filters.isFree = { $eq: params.isFree };
  }
  
  if (params.search) {
    filters.$or = [
      { title: { $containsi: params.search } },
      { shortDescription: { $containsi: params.search } },
      { category: { $containsi: params.search } },
    ];
  }
  
  const response = await strapiRequest<StrapiCourse[]>('courses', {
    populate: 'coverImage,skills,modules',
    filters,
    sort: 'createdAt:desc',
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 12,
    },
  });
  
  return {
    courses: response.data,
    pagination: response.meta.pagination,
  };
}

/**
 * Fetch a single course by slug with full details
 */
export async function fetchCourseBySlug(slug: string): Promise<StrapiCourseWithModules | null> {
  const response = await strapiRequest<StrapiCourseWithModules[]>('courses', {
    filters: {
      slug: { $eq: slug },
      status: { $eq: 'published' },
    },
    populate: {
      coverImage: true,
      skills: true,
      modules: {
        populate: {
          lessons: {
            populate: 'resources',
          },
        },
        sort: 'order:asc',
      },
    },
  });
  
  return response.data[0] || null;
}

/**
 * Fetch a single course by ID
 */
export async function fetchCourseById(id: number): Promise<StrapiCourseWithModules | null> {
  try {
    const response = await strapiRequest<StrapiCourseWithModules>(`courses/${id}`, {
      populate: {
        coverImage: true,
        skills: true,
        modules: {
          populate: {
            lessons: {
              populate: 'resources',
            },
          },
          sort: 'order:asc',
        },
      },
    });
    
    return response.data;
  } catch {
    return null;
  }
}

// ============================================
// MODULE API
// ============================================

/**
 * Fetch modules for a course
 */
export async function fetchModulesByCourse(courseId: number): Promise<StrapiModuleWithLessons[]> {
  const response = await strapiRequest<StrapiModuleWithLessons[]>('modules', {
    filters: {
      course: { id: { $eq: courseId } },
    },
    populate: {
      lessons: {
        populate: 'resources',
        sort: 'order:asc',
      },
    },
    sort: 'order:asc',
  });
  
  return response.data;
}

/**
 * Fetch a single module by ID
 */
export async function fetchModuleById(id: number): Promise<StrapiModuleWithLessons | null> {
  try {
    const response = await strapiRequest<StrapiModuleWithLessons>(`modules/${id}`, {
      populate: {
        lessons: {
          populate: 'resources',
          sort: 'order:asc',
        },
        course: true,
      },
    });
    
    return response.data;
  } catch {
    return null;
  }
}

// ============================================
// LESSON API
// ============================================

/**
 * Fetch lessons for a module
 */
export async function fetchLessonsByModule(moduleId: number): Promise<StrapiLesson[]> {
  const response = await strapiRequest<StrapiLesson[]>('lessons', {
    filters: {
      module: { id: { $eq: moduleId } },
    },
    populate: 'resources',
    sort: 'order:asc',
  });
  
  return response.data;
}

/**
 * Fetch a single lesson by ID
 */
export async function fetchLessonById(id: number): Promise<StrapiLesson | null> {
  try {
    const response = await strapiRequest<StrapiLesson>(`lessons/${id}`, {
      populate: 'resources,module.course',
    });
    
    return response.data;
  } catch {
    return null;
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get all categories from courses
 */
export async function fetchCategories(): Promise<string[]> {
  const { courses } = await fetchCourses({ pageSize: 100 });
  const categories = new Set(courses.map(c => c.category));
  return Array.from(categories).sort();
}

/**
 * Get course count by category
 */
export async function fetchCategoryCounts(): Promise<Record<string, number>> {
  const { courses } = await fetchCourses({ pageSize: 100 });
  const counts: Record<string, number> = {};
  
  courses.forEach(course => {
    counts[course.category] = (counts[course.category] || 0) + 1;
  });
  
  return counts;
}
