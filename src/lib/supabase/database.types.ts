export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      checkins: {
        Row: {
          arm_cm: number | null
          body_fat_pct: number | null
          chest_cm: number | null
          client_id: string
          completed_at: string | null
          created_at: string
          energy: number | null
          expires_at: string
          hips_cm: number | null
          id: string
          notes: string | null
          nutrition: number | null
          requested_for: string
          sent_at: string | null
          sleep: number | null
          status: string
          stress: number | null
          token: string
          trainer_id: string
          updated_at: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          client_id: string
          completed_at?: string | null
          created_at?: string
          energy?: number | null
          expires_at?: string
          hips_cm?: number | null
          id?: string
          notes?: string | null
          nutrition?: number | null
          requested_for?: string
          sent_at?: string | null
          sleep?: number | null
          status?: string
          stress?: number | null
          token?: string
          trainer_id: string
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          client_id?: string
          completed_at?: string | null
          created_at?: string
          energy?: number | null
          expires_at?: string
          hips_cm?: number | null
          id?: string
          notes?: string | null
          nutrition?: number | null
          requested_for?: string
          sent_at?: string | null
          sleep?: number | null
          status?: string
          stress?: number | null
          token?: string
          trainer_id?: string
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkins_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      client_plans: {
        Row: {
          assigned_on: string
          client_id: string
          created_at: string
          id: string
          is_active: boolean
          plan_id: string
          start_date: string | null
          trainer_id: string
        }
        Insert: {
          assigned_on?: string
          client_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          plan_id: string
          start_date?: string | null
          trainer_id: string
        }
        Update: {
          assigned_on?: string
          client_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          plan_id?: string
          start_date?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_plans_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_plans_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          avatar_url: string | null
          color: string
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          goal: string | null
          height_cm: number | null
          id: string
          medical_notes: string | null
          notes: string | null
          package_name: string | null
          package_price: number | null
          package_sessions: number | null
          phone: string | null
          start_date: string
          status: Database["public"]["Enums"]["client_status"]
          trainer_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          color?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          medical_notes?: string | null
          notes?: string | null
          package_name?: string | null
          package_price?: number | null
          package_sessions?: number | null
          phone?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["client_status"]
          trainer_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          color?: string
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          goal?: string | null
          height_cm?: number | null
          id?: string
          medical_notes?: string | null
          notes?: string | null
          package_name?: string | null
          package_price?: number | null
          package_sessions?: number | null
          phone?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["client_status"]
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      day_exercises: {
        Row: {
          day_id: string
          exercise_id: string
          id: string
          notes: string | null
          position: number
          reps: string | null
          rest_seconds: number | null
          sets: number | null
          tempo: string | null
          trainer_id: string
        }
        Insert: {
          day_id: string
          exercise_id: string
          id?: string
          notes?: string | null
          position?: number
          reps?: string | null
          rest_seconds?: number | null
          sets?: number | null
          tempo?: string | null
          trainer_id: string
        }
        Update: {
          day_id?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          position?: number
          reps?: string | null
          rest_seconds?: number | null
          sets?: number | null
          tempo?: string | null
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "day_exercises_day_id_fkey"
            columns: ["day_id"]
            isOneToOne: false
            referencedRelation: "workout_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_exercises_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "day_exercises_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          created_at: string
          equipment: string | null
          id: string
          instructions: string | null
          is_global: boolean
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
          trainer_id: string | null
        }
        Insert: {
          created_at?: string
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_global?: boolean
          muscle_group: Database["public"]["Enums"]["muscle_group"]
          name: string
          trainer_id?: string | null
        }
        Update: {
          created_at?: string
          equipment?: string | null
          id?: string
          instructions?: string | null
          is_global?: boolean
          muscle_group?: Database["public"]["Enums"]["muscle_group"]
          name?: string
          trainer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_counters: {
        Row: {
          last_seq: number
          trainer_id: string
          year: number
        }
        Insert: {
          last_seq?: number
          trainer_id: string
          year: number
        }
        Update: {
          last_seq?: number
          trainer_id?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_counters_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_id: string
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          line_items: Json
          notes: string | null
          paid_at: string | null
          pdf_path: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          stripe_payment_intent_id: string | null
          stripe_payment_link: string | null
          subtotal: number
          total: number
          trainer_id: string
          updated_at: string
          vat_amount: number
          vat_rate: number
        }
        Insert: {
          client_id: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          pdf_path?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_payment_intent_id?: string | null
          stripe_payment_link?: string | null
          subtotal?: number
          total?: number
          trainer_id: string
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          line_items?: Json
          notes?: string | null
          paid_at?: string | null
          pdf_path?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          stripe_payment_intent_id?: string | null
          stripe_payment_link?: string | null
          subtotal?: number
          total?: number
          trainer_id?: string
          updated_at?: string
          vat_amount?: number
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      measurements: {
        Row: {
          arm_cm: number | null
          body_fat_pct: number | null
          chest_cm: number | null
          client_id: string
          created_at: string
          hips_cm: number | null
          id: string
          measured_on: string
          notes: string | null
          source: string
          thigh_cm: number | null
          trainer_id: string
          updated_at: string
          waist_cm: number | null
          weight_kg: number | null
        }
        Insert: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          client_id: string
          created_at?: string
          hips_cm?: number | null
          id?: string
          measured_on?: string
          notes?: string | null
          source?: string
          thigh_cm?: number | null
          trainer_id: string
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Update: {
          arm_cm?: number | null
          body_fat_pct?: number | null
          chest_cm?: number | null
          client_id?: string
          created_at?: string
          hips_cm?: number | null
          id?: string
          measured_on?: string
          notes?: string | null
          source?: string
          thigh_cm?: number | null
          trainer_id?: string
          updated_at?: string
          waist_cm?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "measurements_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "measurements_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          channel: Database["public"]["Enums"]["notification_channel"]
          client_id: string | null
          created_at: string
          error: string | null
          id: string
          payload: Json | null
          provider_sid: string | null
          related_id: string | null
          sent_at: string | null
          status: string
          title: string | null
          trainer_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          client_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json | null
          provider_sid?: string | null
          related_id?: string | null
          sent_at?: string | null
          status?: string
          title?: string | null
          trainer_id: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          body?: string | null
          channel?: Database["public"]["Enums"]["notification_channel"]
          client_id?: string | null
          created_at?: string
          error?: string | null
          id?: string
          payload?: Json | null
          provider_sid?: string | null
          related_id?: string | null
          sent_at?: string | null
          status?: string
          title?: string | null
          trainer_id?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      progress_photos: {
        Row: {
          caption: string | null
          client_id: string
          created_at: string
          id: string
          pose: string | null
          storage_path: string
          taken_on: string
          trainer_id: string
        }
        Insert: {
          caption?: string | null
          client_id: string
          created_at?: string
          id?: string
          pose?: string | null
          storage_path: string
          taken_on?: string
          trainer_id: string
        }
        Update: {
          caption?: string | null
          client_id?: string
          created_at?: string
          id?: string
          pose?: string | null
          storage_path?: string
          taken_on?: string
          trainer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progress_photos_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progress_photos_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          client_id: string
          color: string | null
          completed_at: string | null
          created_at: string
          ends_at: string
          id: string
          location: string | null
          notes: string | null
          reminder_sent_at: string | null
          starts_at: string
          status: Database["public"]["Enums"]["session_status"]
          title: string | null
          trainer_id: string
          updated_at: string
        }
        Insert: {
          client_id: string
          color?: string | null
          completed_at?: string | null
          created_at?: string
          ends_at: string
          id?: string
          location?: string | null
          notes?: string | null
          reminder_sent_at?: string | null
          starts_at: string
          status?: Database["public"]["Enums"]["session_status"]
          title?: string | null
          trainer_id: string
          updated_at?: string
        }
        Update: {
          client_id?: string
          color?: string | null
          completed_at?: string | null
          created_at?: string
          ends_at?: string
          id?: string
          location?: string | null
          notes?: string | null
          reminder_sent_at?: string | null
          starts_at?: string
          status?: Database["public"]["Enums"]["session_status"]
          title?: string | null
          trainer_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      trainers: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          business_name: string | null
          checkin_day_of_week: number
          checkin_enabled: boolean
          created_at: string
          email: string
          full_name: string | null
          id: string
          locale: string
          message_templates: Json | null
          onboarding_completed: boolean
          onboarding_step: number
          phone: string | null
          plan: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at: string | null
          updated_at: string
          vat_number: string | null
          vat_registered: boolean
          whatsapp_enabled: boolean
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          checkin_day_of_week?: number
          checkin_enabled?: boolean
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          locale?: string
          message_templates?: Json | null
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          vat_number?: string | null
          vat_registered?: boolean
          whatsapp_enabled?: boolean
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_name?: string | null
          checkin_day_of_week?: number
          checkin_enabled?: boolean
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          locale?: string
          message_templates?: Json | null
          onboarding_completed?: boolean
          onboarding_step?: number
          phone?: string | null
          plan?: Database["public"]["Enums"]["plan_tier"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: Database["public"]["Enums"]["subscription_status"]
          trial_ends_at?: string | null
          updated_at?: string
          vat_number?: string | null
          vat_registered?: boolean
          whatsapp_enabled?: boolean
        }
        Relationships: []
      }
      workout_days: {
        Row: {
          day_of_week: number
          id: string
          is_rest: boolean
          label: string | null
          trainer_id: string
          week_id: string
        }
        Insert: {
          day_of_week: number
          id?: string
          is_rest?: boolean
          label?: string | null
          trainer_id: string
          week_id: string
        }
        Update: {
          day_of_week?: number
          id?: string
          is_rest?: boolean
          label?: string | null
          trainer_id?: string
          week_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_days_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_days_week_id_fkey"
            columns: ["week_id"]
            isOneToOne: false
            referencedRelation: "workout_weeks"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          created_at: string
          description: string | null
          goal: string | null
          id: string
          is_template: boolean
          name: string
          trainer_id: string
          updated_at: string
          weeks_count: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          goal?: string | null
          id?: string
          is_template?: boolean
          name: string
          trainer_id: string
          updated_at?: string
          weeks_count?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          goal?: string | null
          id?: string
          is_template?: boolean
          name?: string
          trainer_id?: string
          updated_at?: string
          weeks_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_weeks: {
        Row: {
          id: string
          plan_id: string
          trainer_id: string
          week_number: number
        }
        Insert: {
          id?: string
          plan_id: string
          trainer_id: string
          week_number: number
        }
        Update: {
          id?: string
          plan_id?: string
          trainer_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "workout_weeks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_weeks_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "trainers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_checkin: { Args: { p_token: string }; Returns: Json }
      submit_checkin: {
        Args: {
          p_arm?: number
          p_body_fat?: number
          p_chest?: number
          p_energy: number
          p_hips?: number
          p_notes: string
          p_nutrition: number
          p_sleep: number
          p_stress: number
          p_token: string
          p_waist?: number
          p_weight: number
        }
        Returns: Json
      }
    }
    Enums: {
      client_status: "active" | "inactive" | "archived"
      invoice_status: "draft" | "sent" | "paid" | "overdue"
      muscle_group:
        | "chest"
        | "back"
        | "legs"
        | "shoulders"
        | "arms"
        | "core"
        | "cardio"
      notification_channel: "whatsapp" | "email" | "in_app"
      notification_type:
        | "checkin"
        | "session_reminder"
        | "invoice_sent"
        | "invoice_reminder"
        | "system"
      plan_tier: "starter" | "pro" | "studio"
      session_status: "scheduled" | "completed" | "canceled"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "incomplete"
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
      client_status: ["active", "inactive", "archived"],
      invoice_status: ["draft", "sent", "paid", "overdue"],
      muscle_group: [
        "chest",
        "back",
        "legs",
        "shoulders",
        "arms",
        "core",
        "cardio",
      ],
      notification_channel: ["whatsapp", "email", "in_app"],
      notification_type: [
        "checkin",
        "session_reminder",
        "invoice_sent",
        "invoice_reminder",
        "system",
      ],
      plan_tier: ["starter", "pro", "studio"],
      session_status: ["scheduled", "completed", "canceled"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "incomplete",
      ],
    },
  },
} as const
