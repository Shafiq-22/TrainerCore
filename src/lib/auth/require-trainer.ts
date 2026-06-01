import { redirect } from 'next/navigation';
import { getTrainer } from './get-trainer';
import type { Trainer } from '@/types';

/**
 * Use in `(app)` server components. Redirects to login if not authenticated,
 * or to onboarding if not yet completed. Returns the trainer otherwise.
 */
export async function requireTrainer(): Promise<Trainer> {
  const trainer = await getTrainer();
  if (!trainer) redirect('/auth/login');
  if (!trainer.onboarding_completed) redirect('/onboarding');
  return trainer;
}

/** Like requireTrainer but does not enforce onboarding (for the onboarding flow itself). */
export async function requireTrainerRaw(): Promise<Trainer> {
  const trainer = await getTrainer();
  if (!trainer) redirect('/auth/login');
  return trainer;
}
