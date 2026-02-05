export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bootcamp_applications: {
        Row: {
          admin_notes: string | null
          agreed_to_rules: boolean
          availability_commitment: boolean
          bootcamp_id: string
          created_at: string
          email: string
          full_name: string
          goals: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          skill_level: string
          status: string
          updated_at: string
          user_id: string
          why_join: string
        }
        Insert: {
          admin_notes?: string | null
          agreed_to_rules?: boolean
          availability_commitment?: boolean
          bootcamp_id: string
          created_at?: string
          email: string
          full_name: string
          goals: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_level?: string
          status?: string
          updated_at?: string
          user_id: string
          why_join: string
        }
        Update: {
          admin_notes?: string | null
          agreed_to_rules?: boolean
          availability_commitment?: boolean
          bootcamp_id?: string
          created_at?: string
          email?: string
          full_name?: string
          goals?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_level?: string
          status?: string
          updated_at?: string
          user_id?: string
          why_join?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_applications_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_community_topics: {
        Row: {
          bootcamp_id: string
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_default: boolean
          is_locked: boolean
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          bootcamp_id: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          is_locked?: boolean
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          bootcamp_id?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_default?: boolean
          is_locked?: boolean
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_community_topics_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_messages: {
        Row: {
          bootcamp_id: string
          created_at: string
          id: string
          is_pinned: boolean
          message: string
          message_type: string
          topic_id: string | null
          user_avatar: string | null
          user_id: string
          user_name: string
          voice_note_duration: number | null
          voice_note_url: string | null
        }
        Insert: {
          bootcamp_id: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          message: string
          message_type?: string
          topic_id?: string | null
          user_avatar?: string | null
          user_id: string
          user_name: string
          voice_note_duration?: number | null
          voice_note_url?: string | null
        }
        Update: {
          bootcamp_id?: string
          created_at?: string
          id?: string
          is_pinned?: boolean
          message?: string
          message_type?: string
          topic_id?: string | null
          user_avatar?: string | null
          user_id?: string
          user_name?: string
          voice_note_duration?: number | null
          voice_note_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_messages_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bootcamp_messages_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_community_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_participants: {
        Row: {
          bootcamp_id: string
          id: string
          joined_at: string
          last_active_at: string | null
          status: string
          tasks_completed: number
          total_xp: number
          user_id: string
        }
        Insert: {
          bootcamp_id: string
          id?: string
          joined_at?: string
          last_active_at?: string | null
          status?: string
          tasks_completed?: number
          total_xp?: number
          user_id: string
        }
        Update: {
          bootcamp_id?: string
          id?: string
          joined_at?: string
          last_active_at?: string | null
          status?: string
          tasks_completed?: number
          total_xp?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_participants_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_progress_logs: {
        Row: {
          blockers: string | null
          bootcamp_id: string
          created_at: string
          id: string
          log_date: string
          progress_notes: string | null
          updated_at: string
          user_id: string
          wins: string | null
          worked_on: string | null
        }
        Insert: {
          blockers?: string | null
          bootcamp_id: string
          created_at?: string
          id?: string
          log_date?: string
          progress_notes?: string | null
          updated_at?: string
          user_id: string
          wins?: string | null
          worked_on?: string | null
        }
        Update: {
          blockers?: string | null
          bootcamp_id?: string
          created_at?: string
          id?: string
          log_date?: string
          progress_notes?: string | null
          updated_at?: string
          user_id?: string
          wins?: string | null
          worked_on?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_progress_logs_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_task_submissions: {
        Row: {
          bootcamp_id: string
          created_at: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_text: string | null
          submission_url: string | null
          task_id: string
          updated_at: string
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          bootcamp_id: string
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_text?: string | null
          submission_url?: string | null
          task_id: string
          updated_at?: string
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          bootcamp_id?: string
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_text?: string | null
          submission_url?: string | null
          task_id?: string
          updated_at?: string
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_task_submissions_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bootcamp_task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_tasks: {
        Row: {
          bootcamp_id: string
          created_at: string
          created_by: string | null
          day_number: number | null
          description: string | null
          end_time: string | null
          external_link: string | null
          id: string
          is_published: boolean
          start_time: string | null
          task_type: string
          title: string
          updated_at: string
          xp_value: number
        }
        Insert: {
          bootcamp_id: string
          created_at?: string
          created_by?: string | null
          day_number?: number | null
          description?: string | null
          end_time?: string | null
          external_link?: string | null
          id?: string
          is_published?: boolean
          start_time?: string | null
          task_type?: string
          title: string
          updated_at?: string
          xp_value?: number
        }
        Update: {
          bootcamp_id?: string
          created_at?: string
          created_by?: string | null
          day_number?: number | null
          description?: string | null
          end_time?: string | null
          external_link?: string | null
          id?: string
          is_published?: boolean
          start_time?: string | null
          task_type?: string
          title?: string
          updated_at?: string
          xp_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_tasks_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_voice_room_participants: {
        Row: {
          id: string
          is_muted: boolean
          joined_at: string
          left_at: string | null
          role: string
          room_id: string
          user_avatar: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
          role?: string
          room_id: string
          user_avatar?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          id?: string
          is_muted?: boolean
          joined_at?: string
          left_at?: string | null
          role?: string
          room_id?: string
          user_avatar?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_voice_room_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_voice_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_voice_rooms: {
        Row: {
          bootcamp_id: string
          created_at: string
          ended_at: string | null
          host_user_id: string
          id: string
          is_recording: boolean
          recording_url: string | null
          started_at: string
          status: string
          title: string
        }
        Insert: {
          bootcamp_id: string
          created_at?: string
          ended_at?: string | null
          host_user_id: string
          id?: string
          is_recording?: boolean
          recording_url?: string | null
          started_at?: string
          status?: string
          title?: string
        }
        Update: {
          bootcamp_id?: string
          created_at?: string
          ended_at?: string | null
          host_user_id?: string
          id?: string
          is_recording?: boolean
          recording_url?: string | null
          started_at?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_voice_rooms_bootcamp_id_fkey"
            columns: ["bootcamp_id"]
            isOneToOne: false
            referencedRelation: "bootcamps"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamp_voice_speak_requests: {
        Row: {
          created_at: string
          id: string
          room_id: string
          status: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          room_id: string
          status?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          id?: string
          room_id?: string
          status?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "bootcamp_voice_speak_requests_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "bootcamp_voice_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      bootcamps: {
        Row: {
          admin_notes: string | null
          bootcamp_type: Database["public"]["Enums"]["bootcamp_type"]
          cover_image_url: string | null
          created_at: string
          current_participants: number
          description: string | null
          duration_days: number
          end_date: string | null
          host_name: string
          host_user_id: string
          id: string
          is_featured: boolean
          max_participants: number
          platform_fee: number | null
          price_amount: number | null
          pricing_model:
            | Database["public"]["Enums"]["bootcamp_pricing_model"]
            | null
          registration_open: boolean
          revenue_share_percent: number | null
          reviewed_at: string | null
          reviewed_by: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["bootcamp_status"]
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          bootcamp_type?: Database["public"]["Enums"]["bootcamp_type"]
          cover_image_url?: string | null
          created_at?: string
          current_participants?: number
          description?: string | null
          duration_days?: number
          end_date?: string | null
          host_name: string
          host_user_id: string
          id?: string
          is_featured?: boolean
          max_participants?: number
          platform_fee?: number | null
          price_amount?: number | null
          pricing_model?:
            | Database["public"]["Enums"]["bootcamp_pricing_model"]
            | null
          registration_open?: boolean
          revenue_share_percent?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["bootcamp_status"]
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          bootcamp_type?: Database["public"]["Enums"]["bootcamp_type"]
          cover_image_url?: string | null
          created_at?: string
          current_participants?: number
          description?: string | null
          duration_days?: number
          end_date?: string | null
          host_name?: string
          host_user_id?: string
          id?: string
          is_featured?: boolean
          max_participants?: number
          platform_fee?: number | null
          price_amount?: number | null
          pricing_model?:
            | Database["public"]["Enums"]["bootcamp_pricing_model"]
            | null
          registration_open?: boolean
          revenue_share_percent?: number | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["bootcamp_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bug_reports: {
        Row: {
          admin_notes: string | null
          browser_info: string | null
          created_at: string
          description: string
          device_info: string | null
          id: string
          page_url: string | null
          reporter_email: string | null
          reporter_name: string | null
          reporter_user_id: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_urls: string[] | null
          status: Database["public"]["Enums"]["bug_report_status"]
          title: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          browser_info?: string | null
          created_at?: string
          description: string
          device_info?: string | null
          id?: string
          page_url?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_urls?: string[] | null
          status?: Database["public"]["Enums"]["bug_report_status"]
          title: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          browser_info?: string | null
          created_at?: string
          description?: string
          device_info?: string | null
          id?: string
          page_url?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_user_id?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_urls?: string[] | null
          status?: Database["public"]["Enums"]["bug_report_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          audience: string
          body_preview: string
          completed_at: string | null
          created_at: string
          delivered_count: number
          failed_count: number
          id: string
          queued_count: number
          sending_count: number
          sent_by: string
          status: string
          subject: string
          total_recipients: number
        }
        Insert: {
          audience: string
          body_preview: string
          completed_at?: string | null
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          queued_count?: number
          sending_count?: number
          sent_by: string
          status?: string
          subject: string
          total_recipients?: number
        }
        Update: {
          audience?: string
          body_preview?: string
          completed_at?: string | null
          created_at?: string
          delivered_count?: number
          failed_count?: number
          id?: string
          queued_count?: number
          sending_count?: number
          sent_by?: string
          status?: string
          subject?: string
          total_recipients?: number
        }
        Relationships: []
      }
      email_deliveries: {
        Row: {
          campaign_id: string
          created_at: string
          failure_reason: string | null
          id: string
          recipient_email: string
          recipient_name: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          recipient_email: string
          recipient_name?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_deliveries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "email_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_attempts: {
        Row: {
          attempt_count: number
          created_at: string
          email: string
          id: string
          last_attempt_at: string
          locked_until: string | null
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          email: string
          id?: string
          last_attempt_at?: string
          locked_until?: string | null
        }
        Update: {
          attempt_count?: number
          created_at?: string
          email?: string
          id?: string
          last_attempt_at?: string
          locked_until?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          headline: string | null
          id: string
          onboarding_completed: boolean
          onboarding_step: number
          provider: string | null
          updated_at: string
          user_id: string
          wallet_address: string | null
          wallet_type: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          provider?: string | null
          updated_at?: string
          user_id: string
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          headline?: string | null
          id?: string
          onboarding_completed?: boolean
          onboarding_step?: number
          provider?: string | null
          updated_at?: string
          user_id?: string
          wallet_address?: string | null
          wallet_type?: string | null
        }
        Relationships: []
      }
      referral_fraud_flags: {
        Row: {
          created_at: string
          details: Json | null
          id: string
          referred_user_id: string | null
          referrer_user_id: string
          rule_triggered: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          id?: string
          referred_user_id?: string | null
          referrer_user_id: string
          rule_triggered: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          id?: string
          referred_user_id?: string | null
          referrer_user_id?: string
          rule_triggered?: string
        }
        Relationships: []
      }
      scholar_referral_codes: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          referral_code: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          referral_code: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          referral_code?: string
          user_id?: string
        }
        Relationships: []
      }
      scholar_referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          signup_ip: string | null
          wji_awarded: boolean | null
          wji_awarded_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_user_id: string
          referrer_user_id: string
          signup_ip?: string | null
          wji_awarded?: boolean | null
          wji_awarded_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_user_id?: string
          referrer_user_id?: string
          signup_ip?: string | null
          wji_awarded?: boolean | null
          wji_awarded_at?: string | null
        }
        Relationships: []
      }
      scholarship_applications: {
        Row: {
          admin_notes: string | null
          age_range: string
          agrees_community_rules: boolean
          country: string
          created_at: string
          current_streak: number
          email: string
          followed_accounts: Json
          full_name: string
          highest_streak: number
          hours_per_week: string
          how_made_money: string | null
          id: string
          intro_video_url: string | null
          last_check_in_date: string | null
          made_money_online: string
          main_goal: string
          preferred_track: string
          program_id: string
          rejection_reason: string | null
          retweet_link: string
          reviewed_at: string | null
          reviewed_by: string | null
          scholarship_start_date: string | null
          status: Database["public"]["Enums"]["scholarship_status"]
          tag_tweet_link: string
          telegram_username: string
          total_xp: number
          twitter_handle: string
          understands_credit_unlock: boolean
          understands_performance_based: boolean
          updated_at: string
          user_id: string
          why_scholarship: string
          willing_public_ranking: boolean
          willing_public_twitter: boolean
        }
        Insert: {
          admin_notes?: string | null
          age_range: string
          agrees_community_rules?: boolean
          country: string
          created_at?: string
          current_streak?: number
          email: string
          followed_accounts?: Json
          full_name: string
          highest_streak?: number
          hours_per_week: string
          how_made_money?: string | null
          id?: string
          intro_video_url?: string | null
          last_check_in_date?: string | null
          made_money_online: string
          main_goal: string
          preferred_track: string
          program_id: string
          rejection_reason?: string | null
          retweet_link: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          scholarship_start_date?: string | null
          status?: Database["public"]["Enums"]["scholarship_status"]
          tag_tweet_link: string
          telegram_username: string
          total_xp?: number
          twitter_handle: string
          understands_credit_unlock?: boolean
          understands_performance_based?: boolean
          updated_at?: string
          user_id: string
          why_scholarship: string
          willing_public_ranking?: boolean
          willing_public_twitter?: boolean
        }
        Update: {
          admin_notes?: string | null
          age_range?: string
          agrees_community_rules?: boolean
          country?: string
          created_at?: string
          current_streak?: number
          email?: string
          followed_accounts?: Json
          full_name?: string
          highest_streak?: number
          hours_per_week?: string
          how_made_money?: string | null
          id?: string
          intro_video_url?: string | null
          last_check_in_date?: string | null
          made_money_online?: string
          main_goal?: string
          preferred_track?: string
          program_id?: string
          rejection_reason?: string | null
          retweet_link?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          scholarship_start_date?: string | null
          status?: Database["public"]["Enums"]["scholarship_status"]
          tag_tweet_link?: string
          telegram_username?: string
          total_xp?: number
          twitter_handle?: string
          understands_credit_unlock?: boolean
          understands_performance_based?: boolean
          updated_at?: string
          user_id?: string
          why_scholarship?: string
          willing_public_ranking?: boolean
          willing_public_twitter?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "scholarship_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_daily_checkins: {
        Row: {
          application_id: string
          bonus_xp: number | null
          check_in_date: string
          created_at: string
          id: string
          streak_day: number
          user_id: string
          xp_awarded: number
        }
        Insert: {
          application_id: string
          bonus_xp?: number | null
          check_in_date: string
          created_at?: string
          id?: string
          streak_day?: number
          user_id: string
          xp_awarded?: number
        }
        Update: {
          application_id?: string
          bonus_xp?: number | null
          check_in_date?: string
          created_at?: string
          id?: string
          streak_day?: number
          user_id?: string
          xp_awarded?: number
        }
        Relationships: []
      }
      scholarship_module_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          status: string
          unlocked_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          status?: string
          unlocked_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          status?: string
          unlocked_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_module_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "scholarship_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_modules: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          order_index: number
          program_id: string | null
          title: string
          unlock_day: number | null
          unlock_task_id: string | null
          unlock_type: string
          updated_at: string
          video_duration: string | null
          video_url: string | null
          xp_value: number | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          program_id?: string | null
          title: string
          unlock_day?: number | null
          unlock_task_id?: string | null
          unlock_type?: string
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
          xp_value?: number | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          program_id?: string | null
          title?: string
          unlock_day?: number | null
          unlock_task_id?: string | null
          unlock_type?: string
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
          xp_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_modules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "scholarship_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scholarship_modules_unlock_task_id_fkey"
            columns: ["unlock_task_id"]
            isOneToOne: false
            referencedRelation: "scholarship_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      scholarship_programs: {
        Row: {
          application_deadline: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_applications: number | null
          requirements: string | null
          telegram_link: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_applications?: number | null
          requirements?: string | null
          telegram_link?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_applications?: number | null
          requirements?: string | null
          telegram_link?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      scholarship_task_assignments: {
        Row: {
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "scholarship_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_task_submissions: {
        Row: {
          created_at: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_text: string | null
          submission_url: string | null
          task_id: string
          updated_at: string
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_text?: string | null
          submission_url?: string | null
          task_id: string
          updated_at?: string
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_text?: string | null
          submission_url?: string | null
          task_id?: string
          updated_at?: string
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_task_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "scholarship_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_tasks: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          external_link: string | null
          id: string
          is_global: boolean
          is_published: boolean
          program_id: string | null
          start_date: string | null
          status: string
          task_type: string
          title: string
          updated_at: string
          xp_value: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          external_link?: string | null
          id?: string
          is_global?: boolean
          is_published?: boolean
          program_id?: string | null
          start_date?: string | null
          status?: string
          task_type: string
          title: string
          updated_at?: string
          xp_value?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          external_link?: string | null
          id?: string
          is_global?: boolean
          is_published?: boolean
          program_id?: string | null
          start_date?: string | null
          status?: string
          task_type?: string
          title?: string
          updated_at?: string
          xp_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_tasks_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "scholarship_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_profiles: {
        Row: {
          availability: string
          bio: string | null
          category: string
          completed_projects: number | null
          created_at: string
          headline: string
          hourly_rate: number | null
          id: string
          is_published: boolean | null
          portfolio_links: string[] | null
          rating: number | null
          skills: string[] | null
          social_github: string | null
          social_linkedin: string | null
          social_twitter: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string
          bio?: string | null
          category: string
          completed_projects?: number | null
          created_at?: string
          headline: string
          hourly_rate?: number | null
          id?: string
          is_published?: boolean | null
          portfolio_links?: string[] | null
          rating?: number | null
          skills?: string[] | null
          social_github?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string
          bio?: string | null
          category?: string
          completed_projects?: number | null
          created_at?: string
          headline?: string
          hourly_rate?: number | null
          id?: string
          is_published?: boolean | null
          portfolio_links?: string[] | null
          rating?: number | null
          skills?: string[] | null
          social_github?: string | null
          social_linkedin?: string | null
          social_twitter?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wji_balances: {
        Row: {
          balance: number
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wji_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_bootcamp_leaderboard: {
        Args: { p_bootcamp_id: string }
        Returns: {
          rank: number
          tasks_completed: number
          total_xp: number
          user_avatar: string
          user_id: string
          user_name: string
        }[]
      }
      get_referred_users: {
        Args: { p_referrer_id: string }
        Returns: {
          approval_date: string
          referred_email: string
          referred_name: string
          referred_user_id: string
          scholarship_status: string
          signup_date: string
          wji_generated: number
        }[]
      }
      get_referrer_stats: {
        Args: never
        Returns: {
          approved_referrals: number
          fraud_count: number
          is_enabled: boolean
          referral_code: string
          referrer_email: string
          referrer_name: string
          referrer_user_id: string
          total_referrals: number
          total_wji_earned: number
        }[]
      }
      get_scholarship_leaderboard: {
        Args: { p_program_id: string }
        Returns: {
          full_name: string
          rank: number
          total_xp: number
          user_id: string
          wji_earned: number
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_bootcamp_participant: {
        Args: { p_bootcamp_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      bootcamp_pricing_model: "fixed_fee" | "revenue_share"
      bootcamp_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "active"
        | "completed"
        | "rejected"
        | "cancelled"
      bootcamp_type: "free" | "paid"
      bug_report_status: "new" | "in_review" | "resolved" | "ignored"
      scholarship_status: "pending" | "approved" | "rejected" | "waitlist"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      bootcamp_pricing_model: ["fixed_fee", "revenue_share"],
      bootcamp_status: [
        "draft",
        "pending_approval",
        "approved",
        "active",
        "completed",
        "rejected",
        "cancelled",
      ],
      bootcamp_type: ["free", "paid"],
      bug_report_status: ["new", "in_review", "resolved", "ignored"],
      scholarship_status: ["pending", "approved", "rejected", "waitlist"],
    },
  },
} as const
