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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      macro_events: {
        Row: {
          description: string | null
          event_date: string
          event_name: string
          event_type: string
          id: string
          importance: string | null
        }
        Insert: {
          description?: string | null
          event_date: string
          event_name: string
          event_type: string
          id?: string
          importance?: string | null
        }
        Update: {
          description?: string | null
          event_date?: string
          event_name?: string
          event_type?: string
          id?: string
          importance?: string | null
        }
        Relationships: []
      }
      market_regime: {
        Row: {
          created_at: string | null
          expires_at: string
          headline: string
          id: string
          indicators: Json
          regime_type: string
          summary: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          headline: string
          id?: string
          indicators: Json
          regime_type: string
          summary: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          headline?: string
          id?: string
          indicators?: Json
          regime_type?: string
          summary?: string
        }
        Relationships: []
      }
      prediction_autopsies: {
        Row: {
          created_at: string
          events: Json
          id: string
          prediction_id: string
          selected_factor: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          events?: Json
          id?: string
          prediction_id: string
          selected_factor?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          events?: Json
          id?: string
          prediction_id?: string
          selected_factor?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prediction_autopsies_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "theme_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          display_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          display_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          display_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_quotes: {
        Row: {
          current_price: number | null
          id: string
          is_positive: boolean | null
          last_updated: string | null
          ticker: string
          ytd_change: number | null
        }
        Insert: {
          current_price?: number | null
          id?: string
          is_positive?: boolean | null
          last_updated?: string | null
          ticker: string
          ytd_change?: number | null
        }
        Update: {
          current_price?: number | null
          id?: string
          is_positive?: boolean | null
          last_updated?: string | null
          ticker?: string
          ytd_change?: number | null
        }
        Relationships: []
      }
      theme_predictions: {
        Row: {
          actual_performance: number | null
          conviction: number
          created_at: string
          edge_earned: number | null
          expires_at: string
          id: string
          is_correct: boolean | null
          is_revealed: boolean
          is_scored: boolean
          playlist_id: string
          prediction: string
          scored_at: string | null
          sp500_performance: number | null
          user_id: string
        }
        Insert: {
          actual_performance?: number | null
          conviction?: number
          created_at?: string
          edge_earned?: number | null
          expires_at?: string
          id?: string
          is_correct?: boolean | null
          is_revealed?: boolean
          is_scored?: boolean
          playlist_id: string
          prediction: string
          scored_at?: string | null
          sp500_performance?: number | null
          user_id: string
        }
        Update: {
          actual_performance?: number | null
          conviction?: number
          created_at?: string
          edge_earned?: number | null
          expires_at?: string
          id?: string
          is_correct?: boolean | null
          is_revealed?: boolean
          is_scored?: boolean
          playlist_id?: string
          prediction?: string
          scored_at?: string | null
          sp500_performance?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_predictions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          playlist_id: string | null
          ticker: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          playlist_id?: string | null
          ticker?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          playlist_id?: string | null
          ticker?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_edge: {
        Row: {
          archetype: string | null
          calibration: number
          calls_made: number
          correct_calls: number
          created_at: string
          id: string
          pattern_recognition: number
          timing: number
          total_edge: number
          updated_at: string
          user_id: string
        }
        Insert: {
          archetype?: string | null
          calibration?: number
          calls_made?: number
          correct_calls?: number
          created_at?: string
          id?: string
          pattern_recognition?: number
          timing?: number
          total_edge?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          archetype?: string | null
          calibration?: number
          calls_made?: number
          correct_calls?: number
          created_at?: string
          id?: string
          pattern_recognition?: number
          timing?: number
          total_edge?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_nudges: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_dismissed: boolean | null
          is_read: boolean | null
          message: string
          nudge_type: string
          related_ticker: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message: string
          nudge_type: string
          related_ticker?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_dismissed?: boolean | null
          is_read?: boolean | null
          message?: string
          nudge_type?: string
          related_ticker?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_nudges_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_research_xp: {
        Row: {
          created_at: string
          id: string
          level: string
          questions_asked: number
          research_time_minutes: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          questions_asked?: number
          research_time_minutes?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          questions_asked?: number
          research_time_minutes?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stock_theories: {
        Row: {
          confidence: number
          created_at: string
          evidence: Json
          id: string
          metrics: Json
          questions_explored: Json
          theory: string
          ticker: string
          updated_at: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          evidence?: Json
          id?: string
          metrics?: Json
          questions_explored?: Json
          theory: string
          ticker: string
          updated_at?: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          evidence?: Json
          id?: string
          metrics?: Json
          questions_explored?: Json
          theory?: string
          ticker?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
