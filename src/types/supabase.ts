Need to install the following packages:
supabase@2.98.0
Ok to proceed? (y) 
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
      accuracy_votes: {
        Row: {
          created_at: string
          fortune_id: string
          id: string
          user_id: string
          vote: boolean
        }
        Insert: {
          created_at?: string
          fortune_id: string
          id?: string
          user_id: string
          vote: boolean
        }
        Update: {
          created_at?: string
          fortune_id?: string
          id?: string
          user_id?: string
          vote?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "accuracy_votes_fortune_id_fkey"
            columns: ["fortune_id"]
            isOneToOne: false
            referencedRelation: "daily_fortunes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accuracy_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      anonymous_trials: {
        Row: {
          created_at: string
          fingerprint_hash: string
          id: string
          ip_address: unknown
          locale: string | null
          reading_data: Json | null
          service_type: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          fingerprint_hash: string
          id?: string
          ip_address?: unknown
          locale?: string | null
          reading_data?: Json | null
          service_type: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          fingerprint_hash?: string
          id?: string
          ip_address?: unknown
          locale?: string | null
          reading_data?: Json | null
          service_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      card_collection: {
        Row: {
          card_id: number
          first_drawn_at: string
          id: string
          last_drawn_at: string
          times_drawn: number
          user_id: string
        }
        Insert: {
          card_id: number
          first_drawn_at?: string
          id?: string
          last_drawn_at?: string
          times_drawn?: number
          user_id: string
        }
        Update: {
          card_id?: number
          first_drawn_at?: string
          id?: string
          last_drawn_at?: string
          times_drawn?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_collection_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      compatibility_readings: {
        Row: {
          created_at: string
          id: string
          interpretation: string
          language: string
          person1_day: number
          person1_gender: string
          person1_hour: number | null
          person1_month: number
          person1_year: number
          person2_day: number
          person2_gender: string
          person2_hour: number | null
          person2_month: number
          person2_year: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interpretation: string
          language?: string
          person1_day: number
          person1_gender: string
          person1_hour?: number | null
          person1_month: number
          person1_year: number
          person2_day: number
          person2_gender: string
          person2_hour?: number | null
          person2_month: number
          person2_year: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interpretation?: string
          language?: string
          person1_day?: number
          person1_gender?: string
          person1_hour?: number | null
          person1_month?: number
          person1_year?: number
          person2_day?: number
          person2_gender?: string
          person2_hour?: number | null
          person2_month?: number
          person2_year?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compatibility_readings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_fortunes: {
        Row: {
          career_score: number | null
          content: string
          created_at: string
          date: string
          health_score: number | null
          id: string
          language: string
          love_score: number | null
          luck_score: number | null
          lucky_color: string | null
          lucky_number: number | null
          user_id: string
          zodiac_sign: Database["public"]["Enums"]["zodiac_sign"]
        }
        Insert: {
          career_score?: number | null
          content: string
          created_at?: string
          date?: string
          health_score?: number | null
          id?: string
          language?: string
          love_score?: number | null
          luck_score?: number | null
          lucky_color?: string | null
          lucky_number?: number | null
          user_id: string
          zodiac_sign: Database["public"]["Enums"]["zodiac_sign"]
        }
        Update: {
          career_score?: number | null
          content?: string
          created_at?: string
          date?: string
          health_score?: number | null
          id?: string
          language?: string
          love_score?: number | null
          luck_score?: number | null
          lucky_color?: string | null
          lucky_number?: number | null
          user_id?: string
          zodiac_sign?: Database["public"]["Enums"]["zodiac_sign"]
        }
        Relationships: [
          {
            foreignKeyName: "daily_fortunes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      image_access_log: {
        Row: {
          created_at: string
          id: number
          ip_address: unknown
          path: string
          referer: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: never
          ip_address?: unknown
          path: string
          referer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: never
          ip_address?: unknown
          path?: string
          referer?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount_cents: number
          created_at: string
          currency: string
          id: string
          ls_order_id: string
          purchase_type: Database["public"]["Enums"]["purchase_type"]
          status: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          currency?: string
          id?: string
          ls_order_id: string
          purchase_type: Database["public"]["Enums"]["purchase_type"]
          status?: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          currency?: string
          id?: string
          ls_order_id?: string
          purchase_type?: Database["public"]["Enums"]["purchase_type"]
          status?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          points_awarded: number
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_awarded?: number
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_awarded?: number
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      saju_readings: {
        Row: {
          birth_day: number
          birth_hour: number | null
          birth_month: number
          birth_year: number
          created_at: string
          gender: string
          id: string
          interpretation: string
          is_lunar: boolean
          language: string
          user_id: string
        }
        Insert: {
          birth_day: number
          birth_hour?: number | null
          birth_month: number
          birth_year: number
          created_at?: string
          gender: string
          id?: string
          interpretation: string
          is_lunar?: boolean
          language?: string
          user_id: string
        }
        Update: {
          birth_day?: number
          birth_hour?: number | null
          birth_month?: number
          birth_year?: number
          created_at?: string
          gender?: string
          id?: string
          interpretation?: string
          is_lunar?: boolean
          language?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saju_readings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          amount: number
          canceled_at: string | null
          created_at: string
          currency: string
          current_period_end: string
          current_period_start: string
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id: string | null
          provider_subscription_id: string | null
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          provider: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          canceled_at?: string | null
          created_at?: string
          currency?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          provider?: Database["public"]["Enums"]["payment_provider"]
          provider_customer_id?: string | null
          provider_subscription_id?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tarot_readings: {
        Row: {
          card_positions: string[]
          cards_drawn: number[]
          created_at: string
          id: string
          interpretation: string
          is_premium: boolean
          language: string
          question: string | null
          spread_type: string
          user_id: string
        }
        Insert: {
          card_positions?: string[]
          cards_drawn: number[]
          created_at?: string
          id?: string
          interpretation: string
          is_premium?: boolean
          language?: string
          question?: string | null
          spread_type?: string
          user_id: string
        }
        Update: {
          card_positions?: string[]
          cards_drawn?: number[]
          created_at?: string
          id?: string
          interpretation?: string
          is_premium?: boolean
          language?: string
          question?: string | null
          spread_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tarot_readings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_log: {
        Row: {
          action: string
          count: number
          created_at: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          count?: number
          created_at?: string
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          count?: number
          created_at?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          birth_date: string | null
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          language: string
          ls_customer_id: string | null
          lucky_points: number
          referral_code: string | null
          streak_current: number
          streak_last_visit: string | null
          streak_max: number
          subscription_expires_at: string | null
          subscription_plan: Database["public"]["Enums"]["subscription_plan"]
          total_readings: number
          updated_at: string
          zodiac_sign: Database["public"]["Enums"]["zodiac_sign"] | null
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          language?: string
          ls_customer_id?: string | null
          lucky_points?: number
          referral_code?: string | null
          streak_current?: number
          streak_last_visit?: string | null
          streak_max?: number
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          total_readings?: number
          updated_at?: string
          zodiac_sign?: Database["public"]["Enums"]["zodiac_sign"] | null
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          language?: string
          ls_customer_id?: string | null
          lucky_points?: number
          referral_code?: string | null
          streak_current?: number
          streak_last_visit?: string | null
          streak_max?: number
          subscription_expires_at?: string | null
          subscription_plan?: Database["public"]["Enums"]["subscription_plan"]
          total_readings?: number
          updated_at?: string
          zodiac_sign?: Database["public"]["Enums"]["zodiac_sign"] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_referral: {
        Args: { p_code: string; p_referred_id: string }
        Returns: Json
      }
      generate_referral_code: { Args: { p_user_id: string }; Returns: string }
      get_zodiac_sign: {
        Args: { p_birth_date: string }
        Returns: Database["public"]["Enums"]["zodiac_sign"]
      }
      increment_usage: {
        Args: { p_action: string; p_user_id: string }
        Returns: number
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      update_streak: { Args: { p_user_id: string }; Returns: Json }
    }
    Enums: {
      payment_provider: "toss" | "stripe"
      purchase_type: "tarot" | "saju" | "compat" | "wealth"
      subscription_plan: "free" | "premium_monthly" | "premium_yearly"
      subscription_status: "active" | "canceled" | "expired" | "past_due"
      zodiac_sign:
        | "aries"
        | "taurus"
        | "gemini"
        | "cancer"
        | "leo"
        | "virgo"
        | "libra"
        | "scorpio"
        | "sagittarius"
        | "capricorn"
        | "aquarius"
        | "pisces"
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
      payment_provider: ["toss", "stripe"],
      purchase_type: ["tarot", "saju", "compat", "wealth"],
      subscription_plan: ["free", "premium_monthly", "premium_yearly"],
      subscription_status: ["active", "canceled", "expired", "past_due"],
      zodiac_sign: [
        "aries",
        "taurus",
        "gemini",
        "cancer",
        "leo",
        "virgo",
        "libra",
        "scorpio",
        "sagittarius",
        "capricorn",
        "aquarius",
        "pisces",
      ],
    },
  },
} as const
