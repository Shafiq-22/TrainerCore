import type { Tables, Enums } from '@/lib/supabase/database.types';

// Row aliases ----------------------------------------------------------------
export type Trainer = Tables<'trainers'>;
export type Client = Tables<'clients'>;
export type Measurement = Tables<'measurements'>;
export type ProgressPhoto = Tables<'progress_photos'>;
export type Exercise = Tables<'exercises'>;
export type WorkoutPlan = Tables<'workout_plans'>;
export type WorkoutWeek = Tables<'workout_weeks'>;
export type WorkoutDay = Tables<'workout_days'>;
export type DayExercise = Tables<'day_exercises'>;
export type ClientPlan = Tables<'client_plans'>;
export type Session = Tables<'sessions'>;
export type Checkin = Tables<'checkins'>;
export type Invoice = Tables<'invoices'>;
export type NotificationRow = Tables<'notifications'>;

// Enum aliases ---------------------------------------------------------------
export type PlanTier = Enums<'plan_tier'>;
export type SubscriptionStatus = Enums<'subscription_status'>;
export type ClientStatus = Enums<'client_status'>;
export type InvoiceStatus = Enums<'invoice_status'>;
export type SessionStatus = Enums<'session_status'>;
export type NotificationType = Enums<'notification_type'>;
export type NotificationChannel = Enums<'notification_channel'>;
export type MuscleGroup = Enums<'muscle_group'>;

// Domain value objects -------------------------------------------------------
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

/** Discriminated result returned by every Server Action. Never throw across the boundary. */
export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string; code?: string };

export function ok<T>(data?: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(error: string, code?: string): ActionResult<never> {
  return { ok: false, error, code };
}
