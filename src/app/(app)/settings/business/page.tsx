import { requireTrainer } from '@/lib/auth/require-trainer';
import { BusinessForm } from '@/components/settings/business-form';

export default async function BusinessSettingsPage() {
  const trainer = await requireTrainer();
  return (
    <BusinessForm
      businessName={trainer.business_name ?? ''}
      vatNumber={trainer.vat_number ?? ''}
      vatRegistered={trainer.vat_registered}
      address={trainer.address ?? ''}
    />
  );
}
