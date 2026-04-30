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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          result_id: string
          test_slug: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          result_id: string
          test_slug: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          result_id?: string
          test_slug?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          id: string
          reason: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          id?: string
          reason?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          id?: string
          reason?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      credits: {
        Row: {
          balance: number
          cap: number
          created_at: string
          frozen_at: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          cap?: number
          created_at?: string
          frozen_at?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          cap?: number
          created_at?: string
          frozen_at?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      feedback: {
        Row: {
          created_at: string
          emoji: string
          id: string
          result_id: string
          test_slug: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          result_id: string
          test_slug: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          result_id?: string
          test_slug?: string
        }
        Relationships: []
      }
      lemonsqueezy_events: {
        Row: {
          event_id: string
          event_type: string
          id: string
          processed_at: string
        }
        Insert: {
          event_id: string
          event_type: string
          id?: string
          processed_at?: string
        }
        Update: {
          event_id?: string
          event_type?: string
          id?: string
          processed_at?: string
        }
        Relationships: []
      }
      milestones: {
        Row: {
          credits_awarded: boolean
          id: string
          milestone_type: string
          owner_id: string
          reached_at: string
          test_id: string
        }
        Insert: {
          credits_awarded?: boolean
          id?: string
          milestone_type: string
          owner_id: string
          reached_at?: string
          test_id: string
        }
        Update: {
          credits_awarded?: boolean
          id?: string
          milestone_type?: string
          owner_id?: string
          reached_at?: string
          test_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_usd: number
          created_at: string
          id: string
          lemonsqueezy_order_id: string | null
          payment_type: string
          status: string
          user_id: string
          variant_id: string | null
        }
        Insert: {
          amount_usd: number
          created_at?: string
          id?: string
          lemonsqueezy_order_id?: string | null
          payment_type: string
          status?: string
          user_id: string
          variant_id?: string | null
        }
        Update: {
          amount_usd?: number
          created_at?: string
          id?: string
          lemonsqueezy_order_id?: string | null
          payment_type?: string
          status?: string
          user_id?: string
          variant_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          lemonsqueezy_customer_id: string | null
          referral_code: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          lemonsqueezy_customer_id?: string | null
          referral_code?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          lemonsqueezy_customer_id?: string | null
          referral_code?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          credits_awarded: boolean
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          credits_awarded?: boolean
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          credits_awarded?: boolean
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          billing_interval: string | null
          created_at: string
          current_period_end: string | null
          customer_portal_url: string | null
          id: string
          lemonsqueezy_subscription_id: string
          plan: string
          status: string
          updated_at: string
          user_id: string
          variant_id: string
        }
        Insert: {
          billing_interval?: string | null
          created_at?: string
          current_period_end?: string | null
          customer_portal_url?: string | null
          id?: string
          lemonsqueezy_subscription_id: string
          plan: string
          status?: string
          updated_at?: string
          user_id: string
          variant_id: string
        }
        Update: {
          billing_interval?: string | null
          created_at?: string
          current_period_end?: string | null
          customer_portal_url?: string | null
          id?: string
          lemonsqueezy_subscription_id?: string
          plan?: string
          status?: string
          updated_at?: string
          user_id?: string
          variant_id?: string
        }
        Relationships: []
      }
      test_interactions: {
        Row: {
          choice_changed: boolean
          choice_made: string
          created_at: string
          id: string
          question_index: number
          question_type: string
          test_slug: string
          time_spent_ms: number
          user_id: string
        }
        Insert: {
          choice_changed?: boolean
          choice_made: string
          created_at?: string
          id?: string
          question_index: number
          question_type: string
          test_slug: string
          time_spent_ms: number
          user_id: string
        }
        Update: {
          choice_changed?: boolean
          choice_made?: string
          created_at?: string
          id?: string
          question_index?: number
          question_type?: string
          test_slug?: string
          time_spent_ms?: number
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_test_date: string | null
          level: number
          longest_streak: number
          total_tests_taken: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_test_date?: string | null
          level?: number
          longest_streak?: number
          total_tests_taken?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_test_date?: string | null
          level?: number
          longest_streak?: number
          total_tests_taken?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          condition_type: string
          condition_value: number
          credit_reward: number
          description_en: string | null
          description_ko: string | null
          icon_emoji: string
          id: string
          name_en: string
          name_ko: string
          slug: string
          sort_order: number
          xp_reward: number
        }
        Insert: {
          category: string
          condition_type: string
          condition_value: number
          credit_reward?: number
          description_en?: string | null
          description_ko?: string | null
          icon_emoji: string
          id?: string
          name_en: string
          name_ko: string
          slug: string
          sort_order?: number
          xp_reward?: number
        }
        Update: {
          category?: string
          condition_type?: string
          condition_value?: number
          credit_reward?: number
          description_en?: string | null
          description_ko?: string | null
          icon_emoji?: string
          id?: string
          name_en?: string
          name_ko?: string
          slug?: string
          sort_order?: number
          xp_reward?: number
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          }
        ]
      }
      personality_dna: {
        Row: {
          category: string
          id: string
          result_label_en: string | null
          result_label_ko: string | null
          result_type_id: string
          taken_at: string
          test_slug: string
          trait_scores: Json
          user_id: string
        }
        Insert: {
          category: string
          id?: string
          result_label_en?: string | null
          result_label_ko?: string | null
          result_type_id: string
          taken_at?: string
          test_slug: string
          trait_scores?: Json
          user_id: string
        }
        Update: {
          category?: string
          id?: string
          result_label_en?: string | null
          result_label_ko?: string | null
          result_type_id?: string
          taken_at?: string
          test_slug?: string
          trait_scores?: Json
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: {
          p_amount: number
          p_desc?: string
          p_type?: string
          p_user_id: string
        }
        Returns: Json
      }
      deduct_credits: {
        Args: { p_amount: number; p_reason?: string; p_user_id: string }
        Returns: Json
      }
      get_credit_balance: { Args: { p_user_id: string }; Returns: number }
      update_user_progress: {
        Args: {
          p_user_id: string
          p_xp_gained: number
          p_action_type: string
          p_test_slug?: string
          p_test_category?: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
