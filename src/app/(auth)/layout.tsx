import Link from 'next/link';
import { Logo } from '@/components/shared/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Link href="/">
          <Logo />
        </Link>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight">
            Run your personal training business from one place.
          </h1>
          <p className="max-w-md text-primary-foreground/70">
            Clients, workout plans, scheduling, invoicing with UAE VAT, and
            automated WhatsApp check-ins — built for trainers in the UAE & GCC.
          </p>
          <ul className="space-y-2 pt-4 text-sm text-primary-foreground/80">
            <li>✓ Client progress tracking & photos</li>
            <li>✓ Drag-and-drop workout plan builder</li>
            <li>✓ Tax invoices in AED with PDF export</li>
            <li>✓ Weekly check-ins over WhatsApp</li>
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/50">
          © {new Date().getFullYear()} TrainerCore. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <header className="flex items-center justify-between p-6 lg:justify-end">
          <Link href="/" className="lg:hidden">
            <Logo />
          </Link>
        </header>
        <main className="flex flex-1 items-center justify-center p-6">
          <div className="w-full max-w-sm">{children}</div>
        </main>
      </div>
    </div>
  );
}
