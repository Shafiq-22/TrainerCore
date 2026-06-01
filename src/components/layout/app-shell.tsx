import { Sidebar } from './sidebar';
import { TopBar } from './top-bar';
import { BottomNav } from './bottom-nav';
import type { NavTrainer } from './nav-items';

export function AppShell({
  trainer,
  children,
}: {
  trainer: NavTrainer;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar plan={trainer.plan} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar trainer={trainer} />
        <main className="flex-1 p-4 pb-24 lg:p-8 lg:pb-8">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
