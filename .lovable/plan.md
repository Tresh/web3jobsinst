

# Strapi + Vimeo Frontend Integration Plan

## Current State

The integration is **80% built**. The Strapi API client, types, React Query hooks, VimeoPlayer component, CourseDetailPage, and LessonPlayerPage all exist and are well-structured. However, the system is currently non-functional because:

1. **No Strapi credentials are configured** (missing `VITE_STRAPI_API_URL` and `VITE_STRAPI_API_TOKEN`)
2. **The Courses listing page still uses hardcoded data** instead of fetching from Strapi
3. A broken import in `src/lib/strapi.ts` (imports transform functions as types)

## What Will Be Done

### 1. Fix broken import in `src/lib/strapi.ts`

The file currently imports `transformCourse`, `transformModule`, `transformLesson` inside a `type` import, but these are runtime functions used only as type references. This import is unused and will be cleaned up to prevent build issues.

### 2. Connect the Courses listing page to Strapi

The `/courses` page (`src/pages/Courses.tsx`) currently renders from `src/data/coursesData.ts` (hardcoded array of ~40+ courses). This will be upgraded to:

- Use `useStrapiCourses()` hook to fetch live data from Strapi when configured
- **Fall back to hardcoded data** when Strapi is not configured (preserves current behavior)
- Navigate to `/courses/:slug` (the existing CourseDetailPage) instead of showing "Coming Soon" dialog
- Remove the blurred "Coming Soon" overlay for Strapi-sourced courses

### 3. Update CourseGrid to support both data sources

The `CourseGrid` component currently only accepts the hardcoded `Course` type from `coursesData.ts`. It will be updated to also render Strapi-sourced courses with proper thumbnails and clickable links to the detail page.

### 4. Environment variables guidance

Since `VITE_STRAPI_API_URL` and `VITE_STRAPI_API_TOKEN` are **public/publishable** keys (they're read-only API tokens embedded in the frontend bundle), they will be added directly to the codebase as environment references. You will need to provide:

- Your Strapi instance URL (e.g., `https://your-app.strapiapp.com`)
- A read-only API token generated from Strapi Admin > Settings > API Tokens

## Files to Be Modified

| File | Change |
|------|--------|
| `src/lib/strapi.ts` | Fix broken type-only import of transform functions |
| `src/pages/Courses.tsx` | Add Strapi data fetching with fallback to hardcoded data; route to detail page for live courses |
| `src/components/courses/CourseGrid.tsx` | Support rendering Strapi-sourced courses (with cover images, no "Coming Soon" overlay, clickable to detail page) |

## Files NOT Modified

All other existing features remain untouched: scholarship system, bootcamp system, admin dashboards, auth flows, dashboard pages, etc.

## Technical Details

### Data Flow
```text
Strapi CMS (content)  -->  src/lib/strapi.ts (API client)
                            --> src/hooks/useStrapiCourses.ts (React Query)
                                --> src/pages/Courses.tsx (listing)
                                --> src/pages/courses/CourseDetailPage.tsx (detail)
                                --> src/pages/courses/LessonPlayerPage.tsx (player)

Vimeo (video hosting)  -->  vimeoVideoId stored in Strapi lesson
                            --> VimeoPlayer component renders iframe embed
```

### Access Control Logic (already implemented)
- `lesson.accessLevel === 'free'` or `lesson.isPreview === true` -- playback allowed
- Otherwise -- locked UI shown with "Enroll to access" message
- Enrollment check is stubbed with TODO comments for future backend integration

## Remaining Steps After This Implementation

1. **Add Strapi credentials** -- You must provide your Strapi URL and read-only API token
2. **Enrollment system** -- Backend logic to track paid course enrollments (Supabase)
3. **Progress tracking** -- Save lesson watch progress to Supabase (TODOs already in code)
4. **Tutor dashboard** -- Admin interface for content creators to manage their courses
5. **Authentication-gated content** -- Wire up Supabase auth to check enrollment before unlocking paid lessons

## Assumptions

- Strapi is deployed and accessible with the content types (Course, Module, Lesson) already created
- The `@vimeo/player` npm package is NOT needed since the existing VimeoPlayer component uses iframe embeds (lighter, works without additional dependencies)
- `axios` is NOT needed since native `fetch` is already used in the Strapi client
- Hardcoded course data is preserved as fallback for when Strapi is not yet connected

