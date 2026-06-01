import { requireTrainer } from '@/lib/auth/require-trainer';
import { ProfileForm } from '@/components/settings/profile-form';

export default async function ProfileSettingsPage() {
  const trainer = await requireTrainer();
  return (
    <ProfileForm
      userId={trainer.id}
      fullName={trainer.full_name ?? ''}
      phone={trainer.phone ?? ''}
      bio={trainer.bio ?? ''}
      avatarUrl={trainer.avatar_url ?? ''}
      locale={trainer.locale}
    />
  );
}
