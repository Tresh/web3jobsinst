# Fix: Modules Not Showing as Available for Students

## Problem Identified

There are two issues preventing "Go Live (Immediate)" modules from appearing available to students:

1. **`getModuleStatus` always defaults to "locked"**: The function in `useScholarshipData.ts` (line 221-224) only checks if a `scholarship_module_progress` record exists. If there's no progress record (i.e., the student hasn't started the module yet), it returns `"locked"` regardless of the module's `unlock_type`. This means even "immediate" modules appear locked.

2. **Missing `xp_threshold` in the query**: The modules query (line 83) explicitly lists columns but does not include `xp_threshold`, so the XP-gating logic in `PortalModules` silently fails.

## Solution

### 1. Update the modules query to include `xp_threshold`
**File:** `src/hooks/useScholarshipData.ts` (line 83)
- Add `xp_threshold` to the select column list.

### 2. Fix `getModuleStatus` to consider unlock rules
**File:** `src/hooks/useScholarshipData.ts` (lines 221-224)
- Rewrite `getModuleStatus` to check the module's `unlock_type`, `unlock_day`, and the student's current day number.
- If a module has `unlock_type = "immediate"`, return `"available"` (not `"locked"`).
- If `unlock_type = "day"` and the student has reached that day, return `"available"`.
- If there's a completed progress record, return `"completed"`.
- Otherwise, return `"locked"`.

This requires the function to accept the module object (not just the ID), or to look up the module from the modules list.

### Technical Details

**`useScholarshipData.ts` changes:**

```
// Line 83 - Add xp_threshold to select
.select("id, program_id, title, description, order_index, unlock_type, unlock_day, unlock_task_id, is_published, cover_image_url, video_url, video_duration, xp_value, xp_threshold, created_at, updated_at")

// Lines 221-224 - Rewrite getModuleStatus
const getModuleStatus = (moduleId: string): "locked" | "available" | "completed" => {
  const progress = moduleProgress.find((p) => p.module_id === moduleId);
  if (progress?.status === "completed") return "completed";

  const mod = modules.find((m) => m.id === moduleId);
  if (!mod) return "locked";

  const dayNumber = getDayNumber();

  if (mod.unlock_type === "immediate") return "available";
  if (mod.unlock_type === "day" && mod.unlock_day && dayNumber >= mod.unlock_day) return "available";

  // For "task" and "manual" types, remain locked unless progress exists
  return "locked";
};
```

### Files to Edit
- `src/hooks/useScholarshipData.ts` -- add `xp_threshold` to query and fix `getModuleStatus` logic

No new files or database changes needed.

