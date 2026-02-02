export type BootcampStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'rejected' | 'cancelled';
export type BootcampType = 'free' | 'paid';
export type BootcampPricingModel = 'fixed_fee' | 'revenue_share';

export interface Bootcamp {
  id: string;
  title: string;
  description: string | null;
  duration_days: number;
  host_user_id: string;
  host_name: string;
  bootcamp_type: BootcampType;
  pricing_model: BootcampPricingModel | null;
  price_amount: number | null;
  platform_fee: number | null;
  revenue_share_percent: number | null;
  max_participants: number;
  current_participants: number;
  status: BootcampStatus;
  start_date: string | null;
  end_date: string | null;
  registration_open: boolean;
  is_featured: boolean;
  cover_image_url: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BootcampParticipant {
  id: string;
  bootcamp_id: string;
  user_id: string;
  joined_at: string;
  total_xp: number;
  tasks_completed: number;
  last_active_at: string | null;
  status: string;
}

export interface BootcampTask {
  id: string;
  bootcamp_id: string;
  title: string;
  description: string | null;
  task_type: string;
  xp_value: number;
  day_number: number | null;
  start_time: string | null;
  end_time: string | null;
  external_link: string | null;
  is_published: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BootcampTaskSubmission {
  id: string;
  task_id: string;
  user_id: string;
  bootcamp_id: string;
  submission_text: string | null;
  submission_url: string | null;
  status: string;
  xp_awarded: number | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface BootcampMessage {
  id: string;
  bootcamp_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  message: string;
  message_type: string;
  is_pinned: boolean;
  topic_id: string | null;
  created_at: string;
}

export interface BootcampLeaderboardEntry {
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  total_xp: number;
  tasks_completed: number;
  rank: number;
}

export interface BootcampApplication {
  id: string;
  bootcamp_id: string;
  user_id: string;
  full_name: string;
  email: string;
  why_join: string;
  goals: string;
  skill_level: string;
  availability_commitment: boolean;
  agreed_to_rules: boolean;
  status: string;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BootcampCommunityTopic {
  id: string;
  bootcamp_id: string;
  title: string;
  description: string | null;
  icon: string;
  order_index: number;
  is_locked: boolean;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
