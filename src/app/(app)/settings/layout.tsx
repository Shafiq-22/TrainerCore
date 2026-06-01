import { PageHeader } from '@/components/shared/page-header';
import { SettingsNav } from '@/components/settings/settings-nav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your account and business preferences." />
      <SettingsNav />
      <div>{children}</div>
    </div>
  );
}
