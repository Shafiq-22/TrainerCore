import { requireTrainer } from '@/lib/auth/require-trainer';
import { isTwilioConfigured } from '@/lib/env';
import { WhatsappForm } from '@/components/settings/whatsapp-form';

export default async function WhatsappSettingsPage() {
  const trainer = await requireTrainer();
  return <WhatsappForm enabled={trainer.whatsapp_enabled} configured={isTwilioConfigured} />;
}
