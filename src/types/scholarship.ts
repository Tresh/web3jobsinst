export interface ScholarshipProgram {
  id: string;
  title: string;
  description: string | null;
  requirements: string | null;
  is_active: boolean;
  max_applications: number | null;
  application_deadline: string | null;
  telegram_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipApplication {
  id: string;
  user_id: string;
  program_id: string;
  status: "pending" | "approved" | "rejected" | "waitlist";
  full_name: string;
  email: string;
  telegram_username: string;
  twitter_handle: string;
  country: string;
  age_range: string;
  main_goal: string;
  hours_per_week: string;
  preferred_track: string;
  why_scholarship: string;
  rejection_reason: string | null;
  scholarship_start_date: string | null;
  total_xp: number;
  admin_notes: string | null;
  // Daily check-in streak fields
  current_streak: number;
  highest_streak: number;
  last_check_in_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipTask {
  id: string;
  program_id: string | null;
  title: string;
  description: string | null;
  task_type: "retweet" | "x_post" | "video_upload" | "complete_lesson" | "submit_link" | "custom" | "like_x_post" | "comment_x_post" | "create_x_post";
  xp_value: number;
  due_date: string | null;
  start_date: string | null;
  external_link: string | null;
  status: "draft" | "active" | "ended";
  is_global: boolean;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipTaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  submission_text: string | null;
  submission_url: string | null;
  status: "pending" | "approved" | "rejected";
  rejection_reason: string | null;
  xp_awarded: number | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  task?: ScholarshipTask;
}

export interface ScholarshipModule {
  id: string;
  program_id: string | null;
  title: string;
  description: string | null;
  order_index: number;
  unlock_type: "day" | "task" | "manual" | "immediate";
  unlock_day: number | null;
  unlock_task_id: string | null;
  is_published: boolean;
  // New fields for video content
  cover_image_url: string | null;
  video_url: string | null;
  video_duration: string | null;
  xp_value: number;
  xp_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipModuleProgress {
  id: string;
  module_id: string;
  user_id: string;
  status: "locked" | "available" | "completed";
  unlocked_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  module?: ScholarshipModule;
}

export interface ScholarshipNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: "status_change" | "new_task" | "task_approved" | "task_rejected" | "module_unlocked";
  is_read: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_xp: number;
  rank: number;
  wji_earned: number;
}

export type TaskType = ScholarshipTask["task_type"];
export type TaskStatus = ScholarshipTask["status"];

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  retweet: "Retweet a Post",
  like_x_post: "Like an X Post",
  comment_x_post: "Comment on X Post",
  create_x_post: "Create an X Post",
  x_post: "Make an X Post",
  video_upload: "Upload a Video",
  complete_lesson: "Complete a Lesson",
  submit_link: "Submit a Link",
  custom: "Custom Task",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  draft: "Draft",
  active: "Active",
  ended: "Ended",
};
