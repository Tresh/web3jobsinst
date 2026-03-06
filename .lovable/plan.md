

# Implementation Plan: System Improvements & Fixes

This plan covers all 10 items plus the hero polish, organized into implementation phases.

---

## Phase 1: Critical Fixes

### 1A. Email Branding (Purple to Orange)
- **Files**: `supabase/functions/admin-broadcast-email/index.ts`, `supabase/functions/scholarship-notify/index.ts`
- Replace `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` with `linear-gradient(135deg, #FF4D00 0%, #E64500 100%)` (brand orange) in all email templates
- Also update CTA button gradients in scholarship-notify

### 1B. Fix Continuous Page Refresh Bug
- **File**: `src/contexts/AuthContext.tsx`
- The `onAuthStateChange` listener fires on every token refresh, triggering `fetchProfile` and `fetchRole` each time. This can cause re-render cascades.
- Fix: Add a `mounted` ref guard and cache the last fetched user ID to skip redundant fetches. Add `event` type checks to only re-fetch on `SIGNED_IN`, `TOKEN_REFRESHED` (first time), and `USER_UPDATED`.

### 1C. Admin User Page: Server-Side Pagination + Search
- **File**: `src/pages/admin/AdminUsers.tsx`
- Replace full table load with paginated fetch (30 per page)
- Add server-side search using Supabase `.ilike()` on `full_name` and `email`
- Add debounced search input (300ms)
- Add "Load More" button or page navigation
- Join roles via separate query (already done), but only for the current page

---

## Phase 2: Performance Optimization

### 2A. QueryClient Cache Configuration
- **File**: `src/App.tsx`
- Configure `QueryClient` with `staleTime: 5 * 60 * 1000` (5 min), `gcTime: 10 * 60 * 1000`, and `refetchOnWindowFocus: false` to prevent re-fetching on tab return

### 2B. Database Pagination (30 records)
- Apply `.limit(30)` + offset/cursor pagination to all list pages that fetch from Supabase:
  - `src/pages/admin/AdminScholarships.tsx` (already has recursive fetch — replace with paginated)
  - `src/pages/admin/AdminBugReports.tsx`
  - `src/pages/admin/AdminBootcamps.tsx`
  - `src/pages/admin/AdminTutors.tsx`
  - `src/pages/admin/AdminCampaigns.tsx`
  - Dashboard pages that list data
- Add "Load More" buttons where appropriate
- Admin dashboard stats use `count: "exact", head: true` (already optimized, no change needed)

### 2C. Fix Page Refresh on Return from External Sites
- The `refetchOnWindowFocus: false` config in 2A handles most of this
- Ensure `AuthContext` doesn't re-trigger full profile/role fetch on `TOKEN_REFRESHED` events (covered in 1B)

---

## Phase 3: New Features

### 3A. Notification System
- **Database migration**: Create `notifications` table:
  ```sql
  CREATE TABLE public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    title text NOT NULL,
    message text,
    type text DEFAULT 'info',
    is_read boolean DEFAULT false,
    link text,
    created_at timestamptz DEFAULT now()
  );
  ```
  With RLS: users can read/update own notifications, admins can read all, system can insert
- **New component**: `src/components/NotificationBell.tsx` — bell icon with unread count badge, dropdown showing recent notifications
- **Integration**: Add bell to `AdminLayout.tsx` header and user dashboard header
- Notifications created by existing triggers (task approved, scholarship status change) via a simple DB function

### 3B. Admin Analytics Page
- **New file**: `src/pages/admin/AdminAnalytics.tsx`
- Show: user signups over time (last 30 days), active users, page-level engagement counts, scholarship completion rates
- Use Recharts (already installed) for charts
- Data sourced from existing tables using aggregate queries
- **Route**: Add `/admin/analytics` route
- **Sidebar**: Add "Analytics" nav item to `AdminLayout.tsx`

### 3C. Sidebar Collapse/Expand
- The sidebar already uses Radix `SidebarProvider` with `collapsible="icon"` — this feature exists
- Verify the `SidebarTrigger` toggle works on desktop (it does based on the code)
- Add hover-to-expand behavior: update the `Sidebar` component to use `collapsible="icon"` with CSS `:hover` to temporarily expand when collapsed
- No structural changes needed — just ensure the existing collapse behavior is working properly

---

## Phase 4: PWA + Hero

### 4A. PWA Install Button
- PWA config already exists in `vite.config.ts` with manifest and service worker
- **New component**: `src/components/PWAInstallPrompt.tsx` — captures `beforeinstallprompt` event, shows an "Install App" button in the navbar/footer when available
- Add to `UnifiedNavbar.tsx` or footer

### 4B. Hero Section Polish
- **File**: `src/components/HeroSection.tsx`
- Keep the same structure but improve visual impact:
  - Add a subtle gradient background or pattern overlay
  - Improve spacing and typography weight for the headline
  - Add a subtle animation (fade-in on load)
  - Make trust indicators more prominent with icons
- No layout or structural changes

---

## Summary of Files Modified

| Phase | Files | Type |
|-------|-------|------|
| 1A | 2 edge functions | Color fix |
| 1B | AuthContext.tsx | Bug fix |
| 1C | AdminUsers.tsx | Pagination + search |
| 2A | App.tsx | Cache config |
| 2B | ~6 admin pages | Pagination |
| 2C | Covered by 2A + 1B | - |
| 3A | Migration + NotificationBell.tsx + layouts | New feature |
| 3B | AdminAnalytics.tsx + AdminLayout.tsx + App.tsx | New page |
| 3C | Sidebar CSS tweaks | Enhancement |
| 4A | PWAInstallPrompt.tsx + navbar | New component |
| 4B | HeroSection.tsx | Visual polish |

Total: ~15-20 files touched, 1 DB migration, 2 edge function updates.

