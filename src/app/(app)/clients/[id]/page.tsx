import { differenceInYears, parseISO } from 'date-fns';
import { Dumbbell, ReceiptText, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getClientById } from '@/lib/data/clients';
import { formatDate } from '@/lib/utils/dates';
import { formatAED } from '@/lib/utils/money';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Measurement } from '@/types';

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value || '—'}</span>
    </div>
  );
}

export default async function ClientOverviewPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const client = await getClientById(id);
  if (!client) return null;

  const supabase = createClient();
  const [latestMRes, sessionsRes, invoicesRes, planRes] = await Promise.all([
    supabase
      .from('measurements')
      .select('*')
      .eq('client_id', id)
      .order('measured_on', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('sessions')
      .select('id', { count: 'exact', head: true })
      .eq('client_id', id)
      .eq('status', 'completed'),
    supabase.from('invoices').select('total,status').eq('client_id', id),
    supabase
      .from('client_plans')
      .select('workout_plans(name)')
      .eq('client_id', id)
      .eq('is_active', true)
      .maybeSingle(),
  ]);

  const latest = latestMRes.data as Measurement | null;
  const invoices = invoicesRes.data ?? [];
  const outstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + Number(i.total), 0);
  const wp = planRes.data?.workout_plans as { name: string } | { name: string }[] | null;
  const planName = Array.isArray(wp) ? wp[0]?.name ?? null : wp?.name ?? null;
  const age = client.date_of_birth
    ? differenceInYears(new Date(), parseISO(client.date_of_birth))
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
            <Detail label="Email" value={client.email} />
            <Detail label="Phone" value={client.phone} />
            <Detail label="Gender" value={client.gender} />
            <Detail label="Age" value={age ? `${age} years` : null} />
            <Detail label="Height" value={client.height_cm ? `${client.height_cm} cm` : null} />
            <Detail label="Client since" value={formatDate(client.start_date)} />
          </CardContent>
        </Card>

        {client.medical_notes && (
          <Card>
            <CardHeader>
              <CardTitle>Medical notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {client.medical_notes}
              </p>
            </CardContent>
          </Card>
        )}

        {client.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{client.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>At a glance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <div>
                <p className="text-sm font-medium">{sessionsRes.count ?? 0} sessions</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ReceiptText className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">{formatAED(outstanding)}</p>
                <p className="text-xs text-muted-foreground">Outstanding balance</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Dumbbell className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{planName ?? 'No active plan'}</p>
                <p className="text-xs text-muted-foreground">Workout plan</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Detail label="Package" value={client.package_name} />
            <Detail label="Sessions" value={client.package_sessions} />
            <Detail
              label="Price"
              value={client.package_price ? formatAED(client.package_price) : null}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest measurement</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {latest ? (
              <>
                <Detail label="Date" value={formatDate(latest.measured_on)} />
                <Detail label="Weight" value={latest.weight_kg ? `${latest.weight_kg} kg` : null} />
                <Detail
                  label="Body fat"
                  value={latest.body_fat_pct ? `${latest.body_fat_pct}%` : null}
                />
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No measurements recorded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
