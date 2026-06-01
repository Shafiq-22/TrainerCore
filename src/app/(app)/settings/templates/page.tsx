import { requireTrainer } from '@/lib/auth/require-trainer';
import { TemplatesForm } from '@/components/settings/templates-form';

export default async function TemplatesSettingsPage() {
  const trainer = await requireTrainer();
  return <TemplatesForm initial={trainer.message_templates} />;
}
