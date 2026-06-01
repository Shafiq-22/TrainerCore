import { z } from 'zod';

export const sessionFormSchema = z.object({
  clientId: z.string().min(1, 'Select a client'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  durationMin: z.string().default('60'),
  title: z.string().optional().default(''),
  location: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>;
