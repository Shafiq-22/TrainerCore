import { Logo } from '@/components/shared/logo';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex items-center justify-between border-b bg-card px-6 py-4">
        <Logo />
      </header>
      <main className="flex flex-1 items-start justify-center p-4 sm:items-center sm:p-6">
        <div className="w-full max-w-xl">{children}</div>
      </main>
    </div>
  );
}
