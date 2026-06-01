import { format, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { getUser } from '@/lib/auth/get-trainer';
import { getClientById } from '@/lib/data/clients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgressCharts, type ProgressPoint } from '@/components/clients/progress-charts';
import { MeasurementHistory } from '@/components/clients/measurement-history';
import { MeasurementForm } from '@/components/clients/measurement-form';
import { PhotoUploader, type PhotoItem } from '@/components/clients/photo-uploader';
import type { Measurement } from '@/types';

export default async function ClientProgressPage({ params }: { params: { id: string } }) {
  const client = await getClientById(params.id);
  if (!client) return null;
  const user = await getUser();
  const supabase = createClient();

  const [measurementsRes, photosRes] = await Promise.all([
    supabase
      .from('measurements')
      .select('*')
      .eq('client_id', params.id)
      .order('measured_on', { ascending: true }),
    supabase
      .from('progress_photos')
      .select('*')
      .eq('client_id', params.id)
      .order('taken_on', { ascending: false }),
  ]);

  const measurements = (measurementsRes.data ?? []) as Measurement[];
  const chartData: ProgressPoint[] = measurements.map((m) => ({
    date: format(parseISO(m.measured_on), 'dd MMM'),
    weight: m.weight_kg,
    bodyFat: m.body_fat_pct,
  }));

  const photoItems: PhotoItem[] = [];
  for (const p of photosRes.data ?? []) {
    const { data: signed } = await supabase.storage
      .from('progress-photos')
      .createSignedUrl(p.storage_path, 3600);
    if (signed?.signedUrl) {
      photoItems.push({
        id: p.id,
        url: signed.signedUrl,
        storagePath: p.storage_path,
        takenOn: p.taken_on,
        caption: p.caption,
      });
    }
  }

  const history = [...measurements].reverse();

  return (
    <div className="space-y-6">
      <ProgressCharts data={chartData} />

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Measurement history</CardTitle>
          <MeasurementForm clientId={params.id} />
        </CardHeader>
        <CardContent>
          <MeasurementHistory clientId={params.id} measurements={history} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progress photos</CardTitle>
        </CardHeader>
        <CardContent>
          <PhotoUploader trainerId={user!.id} clientId={params.id} photos={photoItems} />
        </CardContent>
      </Card>
    </div>
  );
}
