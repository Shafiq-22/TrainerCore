'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/shared/logo';
import { NavLinks } from './nav-links';
import { UserMenu } from './user-menu';
import type { NavTrainer } from './nav-items';

export function TopBar({ trainer }: { trainer: NavTrainer }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-4 backdrop-blur lg:px-8">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex h-16 items-center border-b px-6">
              <Logo />
            </div>
            <div className="p-4">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <Logo className="lg:hidden" showText={false} />
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <UserMenu trainer={trainer} />
      </div>
    </header>
  );
}
