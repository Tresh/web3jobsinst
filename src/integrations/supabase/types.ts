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
      scholarship_applications: {
        Row: {
          admin_notes: string | null
          age_range: string
          agrees_community_rules: boolean
          country: string
          created_at: string
          email: string
          followed_accounts: Json
          full_name: string
          hours_per_week: string
          how_made_money: string | null
          id: string
          intro_video_url: string | null
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
          email: string
          followed_accounts?: Json
          full_name: string
          hours_per_week: string
          how_made_money?: string | null
          id?: string
          intro_video_url?: string | null
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
          email?: string
          followed_accounts?: Json
          full_name?: string
          hours_per_week?: string
          how_made_money?: string | null
          id?: string
          intro_video_url?: string | null
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
        }
        Insert: {
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
        }
        Update: {
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_scholarship_leaderboard: {
        Args: { p_program_id: string }
        Returns: {
          full_name: string
          rank: number
          total_xp: number
          user_id: string
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
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      scholarship_status: ["pending", "approved", "rejected", "waitlist"],
    },
  },
} as const
