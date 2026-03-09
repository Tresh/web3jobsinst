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
      analytics_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          page_path: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          page_path?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
          phone_number: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          skill_level: string
          status: string
          telegram_username: string | null
          twitter_handle: string | null
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
          phone_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_level?: string
          status?: string
          telegram_username?: string | null
          twitter_handle?: string | null
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
          phone_number?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          skill_level?: string
          status?: string
          telegram_username?: string | null
          twitter_handle?: string | null
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
          application_questions: Json | null
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
          required_post_links: Json | null
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
          application_questions?: Json | null
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
          required_post_links?: Json | null
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
          application_questions?: Json | null
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
          required_post_links?: Json | null
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
      campaign_participants: {
        Row: {
          admin_notes: string | null
          campaign_id: string
          created_at: string
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_proof_url: string | null
          submission_text: string | null
          submission_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          campaign_id: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_proof_url?: string | null
          submission_text?: string | null
          submission_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          campaign_id?: string
          created_at?: string
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_proof_url?: string | null
          submission_text?: string | null
          submission_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_participants_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "platform_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      changelog_entries: {
        Row: {
          created_at: string
          date: string
          id: string
          is_published: boolean
          items: Json
          order_index: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          is_published?: boolean
          items?: Json
          order_index?: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_published?: boolean
          items?: Json
          order_index?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          auto_reply_sent_by: Json | null
          created_at: string
          id: string
          last_message_at: string
          participant_one: string
          participant_two: string
        }
        Insert: {
          auto_reply_sent_by?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string
          participant_one: string
          participant_two: string
        }
        Update: {
          auto_reply_sent_by?: Json | null
          created_at?: string
          id?: string
          last_message_at?: string
          participant_one?: string
          participant_two?: string
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
      institution_applications: {
        Row: {
          admin_notes: string | null
          community_size: string
          contact_person: string
          created_at: string
          ecosystem_category: string
          has_certifications: boolean
          hiring_needs: string | null
          id: string
          logo_url: string | null
          official_email: string
          organization_name: string
          planned_courses: string
          reviewed_at: string | null
          reviewed_by: string | null
          role_in_org: string
          status: string
          updated_at: string
          user_id: string | null
          website: string
          what_to_teach: string
          why_portal: string
        }
        Insert: {
          admin_notes?: string | null
          community_size: string
          contact_person: string
          created_at?: string
          ecosystem_category: string
          has_certifications?: boolean
          hiring_needs?: string | null
          id?: string
          logo_url?: string | null
          official_email: string
          organization_name: string
          planned_courses: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_in_org: string
          status?: string
          updated_at?: string
          user_id?: string | null
          website: string
          what_to_teach: string
          why_portal: string
        }
        Update: {
          admin_notes?: string | null
          community_size?: string
          contact_person?: string
          created_at?: string
          ecosystem_category?: string
          has_certifications?: boolean
          hiring_needs?: string | null
          id?: string
          logo_url?: string | null
          official_email?: string
          organization_name?: string
          planned_courses?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          role_in_org?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string
          what_to_teach?: string
          why_portal?: string
        }
        Relationships: []
      }
      internship_profiles: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          experience_description: string | null
          full_name: string
          hours_per_week: string
          id: string
          internship_status: string
          is_approved: boolean
          is_public: boolean
          open_to_immediate: boolean
          paid_preference: string
          portfolio_link: string | null
          primary_skill_category: string
          profile_photo_url: string | null
          skill_level: string
          telegram_username: string | null
          tools_known: string[] | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
          work_mode: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          experience_description?: string | null
          full_name: string
          hours_per_week?: string
          id?: string
          internship_status?: string
          is_approved?: boolean
          is_public?: boolean
          open_to_immediate?: boolean
          paid_preference?: string
          portfolio_link?: string | null
          primary_skill_category?: string
          profile_photo_url?: string | null
          skill_level?: string
          telegram_username?: string | null
          tools_known?: string[] | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
          work_mode?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          experience_description?: string | null
          full_name?: string
          hours_per_week?: string
          id?: string
          internship_status?: string
          is_approved?: boolean
          is_public?: boolean
          open_to_immediate?: boolean
          paid_preference?: string
          portfolio_link?: string | null
          primary_skill_category?: string
          profile_photo_url?: string | null
          skill_level?: string
          telegram_username?: string | null
          tools_known?: string[] | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
          work_mode?: string
        }
        Relationships: []
      }
      internship_waitlist: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          retweet_link: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          tag_proof_link: string | null
          telegram_username: string | null
          twitter_handle: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          retweet_link?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tag_proof_link?: string | null
          telegram_username?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          retweet_link?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          tag_proof_link?: string | null
          telegram_username?: string | null
          twitter_handle?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learnfi_edit_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          program_id: string
          reason: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          program_id: string
          reason: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          program_id?: string
          reason?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learnfi_edit_requests_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "learnfi_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      learnfi_mission_submissions: {
        Row: {
          created_at: string
          id: string
          mission_id: string
          program_id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_text: string | null
          submission_url: string | null
          updated_at: string
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          mission_id: string
          program_id: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_text?: string | null
          submission_url?: string | null
          updated_at?: string
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          mission_id?: string
          program_id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_text?: string | null
          submission_url?: string | null
          updated_at?: string
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "learnfi_mission_submissions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "learnfi_missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learnfi_mission_submissions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "learnfi_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      learnfi_missions: {
        Row: {
          created_at: string
          description: string | null
          external_link: string | null
          id: string
          is_published: boolean
          mission_type: string
          module_id: string | null
          order_index: number
          program_id: string
          title: string
          updated_at: string
          xp_value: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_link?: string | null
          id?: string
          is_published?: boolean
          mission_type?: string
          module_id?: string | null
          order_index?: number
          program_id: string
          title: string
          updated_at?: string
          xp_value?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          external_link?: string | null
          id?: string
          is_published?: boolean
          mission_type?: string
          module_id?: string | null
          order_index?: number
          program_id?: string
          title?: string
          updated_at?: string
          xp_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "learnfi_missions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "learnfi_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learnfi_missions_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "learnfi_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      learnfi_modules: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          order_index: number
          program_id: string
          title: string
          updated_at: string
          video_duration: string | null
          video_url: string | null
          xp_value: number
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          program_id: string
          title: string
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
          xp_value?: number
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          order_index?: number
          program_id?: string
          title?: string
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
          xp_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "learnfi_modules_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "learnfi_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      learnfi_participants: {
        Row: {
          id: string
          joined_at: string
          last_active_at: string | null
          missions_completed: number
          program_id: string
          status: string
          total_xp: number
          user_id: string
          wallet_address: string | null
        }
        Insert: {
          id?: string
          joined_at?: string
          last_active_at?: string | null
          missions_completed?: number
          program_id: string
          status?: string
          total_xp?: number
          user_id: string
          wallet_address?: string | null
        }
        Update: {
          id?: string
          joined_at?: string
          last_active_at?: string | null
          missions_completed?: number
          program_id?: string
          status?: string
          total_xp?: number
          user_id?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learnfi_participants_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "learnfi_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      learnfi_programs: {
        Row: {
          admin_notes: string | null
          category: string
          chain_network: string | null
          created_at: string
          created_by: string | null
          description: string | null
          difficulty: string
          duration_days: number
          edit_allowed: boolean | null
          id: string
          internship_details: string | null
          leaderboard_tiers: Json | null
          linked_course_id: string | null
          max_participants: number | null
          participants_count: number
          partner_email: string | null
          partner_name: string | null
          project_logo_url: string | null
          project_name: string
          project_website: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          reward_amount: number | null
          reward_amount_type: string | null
          reward_distribution_method: string | null
          reward_pool_size: number | null
          reward_token_symbol: string | null
          reward_type: string
          status: string
          title: string
          token_contract_address: string | null
          token_is_stable: boolean | null
          token_name: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          category?: string
          chain_network?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration_days?: number
          edit_allowed?: boolean | null
          id?: string
          internship_details?: string | null
          leaderboard_tiers?: Json | null
          linked_course_id?: string | null
          max_participants?: number | null
          participants_count?: number
          partner_email?: string | null
          partner_name?: string | null
          project_logo_url?: string | null
          project_name: string
          project_website?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_amount?: number | null
          reward_amount_type?: string | null
          reward_distribution_method?: string | null
          reward_pool_size?: number | null
          reward_token_symbol?: string | null
          reward_type?: string
          status?: string
          title: string
          token_contract_address?: string | null
          token_is_stable?: boolean | null
          token_name?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          category?: string
          chain_network?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          difficulty?: string
          duration_days?: number
          edit_allowed?: boolean | null
          id?: string
          internship_details?: string | null
          leaderboard_tiers?: Json | null
          linked_course_id?: string | null
          max_participants?: number | null
          participants_count?: number
          partner_email?: string | null
          partner_name?: string | null
          project_logo_url?: string | null
          project_name?: string
          project_website?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          reward_amount?: number | null
          reward_amount_type?: string | null
          reward_distribution_method?: string | null
          reward_pool_size?: number | null
          reward_token_symbol?: string | null
          reward_type?: string
          status?: string
          title?: string
          token_contract_address?: string | null
          token_is_stable?: boolean | null
          token_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      message_settings: {
        Row: {
          allow_messages_from: string
          auto_reply_message: string | null
          created_at: string
          disclaimer_text: string | null
          id: string
          show_read_receipts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_messages_from?: string
          auto_reply_message?: string | null
          created_at?: string
          disclaimer_text?: string | null
          id?: string
          show_read_receipts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_messages_from?: string
          auto_reply_message?: string | null
          created_at?: string
          disclaimer_text?: string | null
          id?: string
          show_read_receipts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
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
      payment_methods: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          method_label: string
          method_type: string
          method_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          method_label: string
          method_type: string
          method_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          method_label?: string
          method_type?: string
          method_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_preferences: {
        Row: {
          accepts_bank_transfer: boolean
          accepts_crypto: boolean
          accepts_paypal: boolean
          created_at: string
          id: string
          preferred_method_id: string | null
          region: string
          updated_at: string
          user_id: string
        }
        Insert: {
          accepts_bank_transfer?: boolean
          accepts_crypto?: boolean
          accepts_paypal?: boolean
          created_at?: string
          id?: string
          preferred_method_id?: string | null
          region?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          accepts_bank_transfer?: boolean
          accepts_crypto?: boolean
          accepts_paypal?: boolean
          created_at?: string
          id?: string
          preferred_method_id?: string | null
          region?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_campaigns: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          is_published: boolean
          max_participants: number
          project: string | null
          requirements: Json | null
          reward: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          max_participants?: number
          project?: string | null
          requirements?: Json | null
          reward?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_published?: boolean
          max_participants?: number
          project?: string | null
          requirements?: Json | null
          reward?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      platform_course_lessons: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_free_preview: boolean
          is_published: boolean
          module_id: string
          order_index: number
          resources: Json | null
          title: string
          updated_at: string
          video_duration: string | null
          video_url: string | null
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free_preview?: boolean
          is_published?: boolean
          module_id: string
          order_index?: number
          resources?: Json | null
          title: string
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free_preview?: boolean
          is_published?: boolean
          module_id?: string
          order_index?: number
          resources?: Json | null
          title?: string
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_course_lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "platform_course_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_course_modules: {
        Row: {
          course_id: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_free_preview: boolean
          is_published: boolean
          order_index: number
          title: string
          updated_at: string
          video_duration: string | null
          video_url: string | null
        }
        Insert: {
          course_id: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free_preview?: boolean
          is_published?: boolean
          order_index?: number
          title: string
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
        }
        Update: {
          course_id?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free_preview?: boolean
          is_published?: boolean
          order_index?: number
          title?: string
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_course_modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "platform_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_courses: {
        Row: {
          category: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          duration: string | null
          id: string
          instructor: string | null
          is_coming_soon: boolean
          is_published: boolean
          level: string
          order_index: number
          resources: Json | null
          skill_outcome: string | null
          slug: string | null
          title: string
          total_duration: string | null
          updated_at: string
          video_duration: string | null
          video_url: string | null
        }
        Insert: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          instructor?: string | null
          is_coming_soon?: boolean
          is_published?: boolean
          level?: string
          order_index?: number
          resources?: Json | null
          skill_outcome?: string | null
          slug?: string | null
          title: string
          total_duration?: string | null
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
        }
        Update: {
          category?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          instructor?: string | null
          is_coming_soon?: boolean
          is_published?: boolean
          level?: string
          order_index?: number
          resources?: Json | null
          skill_outcome?: string | null
          slug?: string | null
          title?: string
          total_duration?: string | null
          updated_at?: string
          video_duration?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      product_orders: {
        Row: {
          amount: number
          created_at: string
          currency: string
          email: string
          id: string
          paystack_reference: string | null
          paystack_transaction_id: string | null
          product_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          email: string
          id?: string
          paystack_reference?: string | null
          paystack_transaction_id?: string | null
          product_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          email?: string
          id?: string
          paystack_reference?: string | null
          paystack_transaction_id?: string | null
          product_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          coming_soon: boolean
          created_at: string
          creator_name: string
          creator_user_id: string | null
          currency: string
          description: string | null
          download_url: string | null
          downloads_count: number
          id: string
          image_url: string | null
          is_published: boolean
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          coming_soon?: boolean
          created_at?: string
          creator_name?: string
          creator_user_id?: string | null
          currency?: string
          description?: string | null
          download_url?: string | null
          downloads_count?: number
          id?: string
          image_url?: string | null
          is_published?: boolean
          price?: number
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          coming_soon?: boolean
          created_at?: string
          creator_name?: string
          creator_user_id?: string | null
          currency?: string
          description?: string | null
          download_url?: string | null
          downloads_count?: number
          id?: string
          image_url?: string | null
          is_published?: boolean
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_visibility: {
        Row: {
          created_at: string
          id: string
          show_bootcamp_activity: boolean
          show_internship_info: boolean
          show_learnfi_progress: boolean
          show_scholarship_status: boolean
          show_talent_profile: boolean
          show_xp_stats: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          show_bootcamp_activity?: boolean
          show_internship_info?: boolean
          show_learnfi_progress?: boolean
          show_scholarship_status?: boolean
          show_talent_profile?: boolean
          show_xp_stats?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          show_bootcamp_activity?: boolean
          show_internship_info?: boolean
          show_learnfi_progress?: boolean
          show_scholarship_status?: boolean
          show_talent_profile?: boolean
          show_xp_stats?: boolean
          updated_at?: string
          user_id?: string
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
          xp_threshold: number
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
          xp_threshold?: number
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
          xp_threshold?: number
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
      scholarship_offers: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          external_link: string | null
          id: string
          program_id: string | null
          reward_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          program_id?: string | null
          reward_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          external_link?: string | null
          id?: string
          program_id?: string | null
          reward_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_offers_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "scholarship_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_pow_assignments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          instructions: string | null
          is_published: boolean
          program_id: string | null
          title: string
          updated_at: string
          xp_reward: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean
          program_id?: string | null
          title: string
          updated_at?: string
          xp_reward?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          instructions?: string | null
          is_published?: boolean
          program_id?: string | null
          title?: string
          updated_at?: string
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_pow_assignments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "scholarship_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarship_pow_submissions: {
        Row: {
          assignment_id: string
          created_at: string
          feedback: string | null
          file_url: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          submission_file_url: string | null
          submission_text: string | null
          submission_url: string | null
          updated_at: string
          user_id: string
          xp_awarded: number | null
        }
        Insert: {
          assignment_id: string
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_file_url?: string | null
          submission_text?: string | null
          submission_url?: string | null
          updated_at?: string
          user_id: string
          xp_awarded?: number | null
        }
        Update: {
          assignment_id?: string
          created_at?: string
          feedback?: string | null
          file_url?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          submission_file_url?: string | null
          submission_text?: string | null
          submission_url?: string | null
          updated_at?: string
          user_id?: string
          xp_awarded?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "scholarship_pow_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "scholarship_pow_assignments"
            referencedColumns: ["id"]
          },
        ]
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
          admin_notes: string | null
          availability: string
          bio: string | null
          category: string
          completed_projects: number | null
          created_at: string
          headline: string
          hourly_rate: number | null
          id: string
          is_approved: boolean
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
          admin_notes?: string | null
          availability?: string
          bio?: string | null
          category: string
          completed_projects?: number | null
          created_at?: string
          headline: string
          hourly_rate?: number | null
          id?: string
          is_approved?: boolean
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
          admin_notes?: string | null
          availability?: string
          bio?: string | null
          category?: string
          completed_projects?: number | null
          created_at?: string
          headline?: string
          hourly_rate?: number | null
          id?: string
          is_approved?: boolean
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
      tutor_applications: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          experience: string
          expertise: string
          full_name: string
          id: string
          pitch: string
          portfolio_url: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          experience: string
          expertise: string
          full_name: string
          id?: string
          pitch: string
          portfolio_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          experience?: string
          expertise?: string
          full_name?: string
          id?: string
          pitch?: string
          portfolio_url?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
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
      xp_audit_log: {
        Row: {
          adjustment: number
          audit_source: string
          checkin_xp: number | null
          correct_xp: number
          created_at: string
          full_name: string | null
          id: string
          module_xp: number | null
          old_xp: number
          task_xp: number | null
          user_id: string
        }
        Insert: {
          adjustment: number
          audit_source?: string
          checkin_xp?: number | null
          correct_xp: number
          created_at?: string
          full_name?: string | null
          id?: string
          module_xp?: number | null
          old_xp: number
          task_xp?: number | null
          user_id: string
        }
        Update: {
          adjustment?: number
          audit_source?: string
          checkin_xp?: number | null
          correct_xp?: number
          created_at?: string
          full_name?: string | null
          id?: string
          module_xp?: number | null
          old_xp?: number
          task_xp?: number | null
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
      get_learnfi_leaderboard: {
        Args: { p_program_id: string }
        Returns: {
          missions_completed: number
          rank: number
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
      reconcile_scholarship_xp: {
        Args: { dry_run?: boolean }
        Returns: {
          adjustment: number
          expected_xp: number
          full_name: string
          old_xp: number
          user_id: string
        }[]
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
