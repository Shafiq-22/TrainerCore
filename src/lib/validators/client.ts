import { z } from 'zod';

export const clientFormSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().default(''),
  gender: z.string().optional().default(''),
  dateOfBirth: z.string().optional().default(''),
  heightCm: z.string().optional().default(''),
  goal: z.string().optional().default(''),
  packageName: z.string().optional().default(''),
  packageSessions: z.string().optional().default(''),
  packagePrice: z.string().optional().default(''),
  medicalNotes: z.string().optional().default(''),
  notes: z.string().optional().default(''),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
  color: z.string().optional().default('#22C55E'),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;

export const measurementFormSchema = z.object({
  measuredOn: z.string().min(1, 'Date is required'),
  weightKg: z.string().optional().default(''),
  bodyFatPct: z.string().optional().default(''),
  chestCm: z.string().optional().default(''),
  waistCm: z.string().optional().default(''),
  hipsCm: z.string().optional().default(''),
  armCm: z.string().optional().default(''),
  thighCm: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export type MeasurementFormValues = z.infer<typeof measurementFormSchema>;
