import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { requireTrainerRaw } from '@/lib/auth/require-trainer';
import { OnboardingWizard } from './wizard';

export const metadata: Metadata = { title: 'Get started' };

export default async function OnboardingPage() {
  const trainer = await requireTrainerRaw();
  if (trainer.onboarding_completed) redirect('/dashboard');

  return (
    <OnboardingWizard
      initial={{
        fullName: trainer.full_name ?? '',
        phone: trainer.phone ?? '',
        avatarUrl: trainer.avatar_url ?? '',
        businessName: trainer.business_name ?? '',
        vatNumber: trainer.vat_number ?? '',
        vatRegistered: trainer.vat_registered,
        plan: trainer.plan,
      }}
      userId={trainer.id}
    />
  );
}
