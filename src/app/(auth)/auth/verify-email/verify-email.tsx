'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { toast } from 'sonner';
import { resendVerificationAction, logoutAction } from '../actions';
import { Button } from '@/components/ui/button';

export function VerifyEmail() {
  const params = useSearchParams();
  const email = params.get('email') ?? '';
  const [loading, setLoading] = useState(false);

  async function resend() {
    if (!email) {
      toast.error('No email address to resend to. Please sign up again.');
      return;
    }
    setLoading(true);
    const res = await resendVerificationAction(email);
    setLoading(false);
    if (res.ok) toast.success('Verification email sent.');
    else toast.error(res.error);
  }

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
        <MailCheck className="h-7 w-7 text-accent" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
        <p className="text-sm text-muted-foreground">
          We sent a confirmation link{email ? ' to ' : ''}
          {email && <span className="font-medium text-foreground">{email}</span>}.
          Click it to verify your account and continue.
        </p>
      </div>

      <div className="space-y-3">
        <Button onClick={resend} variant="outline" className="w-full" disabled={loading}>
          {loading ? 'Sending…' : 'Resend email'}
        </Button>
        <form action={logoutAction}>
          <Button type="submit" variant="ghost" className="w-full">
            Use a different account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Already verified?{' '}
        <Link href="/auth/login" className="font-medium text-accent hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
