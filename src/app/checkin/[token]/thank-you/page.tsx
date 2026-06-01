import { CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/shared/logo';
import { Card, CardContent } from '@/components/ui/card';

export default function CheckinThankYouPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-md px-4 py-10">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <CheckCircle2 className="h-7 w-7 text-accent" />
            </div>
            <h1 className="text-xl font-bold">Thank you!</h1>
            <p className="text-sm text-muted-foreground">
              Your check-in has been recorded. Keep up the great work!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
