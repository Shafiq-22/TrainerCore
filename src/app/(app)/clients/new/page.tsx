import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { requireTrainer } from '@/lib/auth/require-trainer';
import { checkClientLimit } from '@/lib/plans/client-limit-guard';
import { PageHeader } from '@/components/shared/page-header';
import { ClientForm } from '@/components/clients/client-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'New client' };

export default async function NewClientPage() {
  await requireTrainer();
  const limit = await checkClientLimit();

  if (!limit.allowed) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <PageHeader title="New client" />
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Client limit reached</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                You&apos;re using {limit.current} of {limit.limit} clients on your current
                plan. Upgrade to add more.
              </p>
            </div>
            <Button asChild>
              <Link href="/subscription">View plans</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="New client" description="Add a client to your roster." />
      <ClientForm />
    </div>
  );
}
