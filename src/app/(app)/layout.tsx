import { requireTrainer } from '@/lib/auth/require-trainer';
import { AppShell } from '@/components/layout/app-shell';
import type { NavTrainer } from '@/components/layout/nav-items';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const trainer = await requireTrainer();

  const navTrainer: NavTrainer = {
    id: trainer.id,
    fullName: trainer.full_name,
    email: trainer.email,
    avatarUrl: trainer.avatar_url,
    plan: trainer.plan,
    businessName: trainer.business_name,
  };

  return <AppShell trainer={navTrainer}>{children}</AppShell>;
}
