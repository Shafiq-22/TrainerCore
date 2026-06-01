import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Check,
  Dumbbell,
  FileText,
  Languages,
  MessageCircle,
  Users,
} from 'lucide-react';

import { Logo } from '@/components/shared/logo';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PLANS, PLAN_ORDER } from '@/lib/plans/limits';
import { formatAED } from '@/lib/utils/money';
import { cn } from '@/lib/utils/cn';

export const metadata = {
  title: 'TrainerCore — Personal Trainer Business Platform',
};

const FEATURES = [
  {
    icon: Users,
    title: 'Client management & progress',
    description:
      'Keep every client in one place — profiles, goals, measurements and progress photos with visual charts over time.',
  },
  {
    icon: Dumbbell,
    title: 'Drag-and-drop workout plans',
    description:
      'Build multi-week programs from an exercise library, reorder days and exercises by dragging, and reuse templates.',
  },
  {
    icon: CalendarDays,
    title: 'Scheduling & sessions',
    description:
      'Plan sessions, track attendance and keep a clear calendar so you never double-book a slot again.',
  },
  {
    icon: FileText,
    title: 'Tax invoicing in AED',
    description:
      'Generate UAE-compliant tax invoices with 5% VAT, export polished PDFs and get paid faster.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp check-ins',
    description:
      'Automate weekly check-ins and reminders over WhatsApp so clients stay accountable between sessions.',
  },
  {
    icon: Languages,
    title: 'Bilingual EN / AR with RTL',
    description:
      'A fully bilingual interface in English and Arabic, with proper right-to-left layout for your region.',
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="container flex h-16 items-center justify-between">
          <Link href="/" aria-label="TrainerCore home">
            <Logo />
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signup">Start free trial</Link>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(34,197,94,0.18),transparent_70%)]"
          />
          <div className="container relative flex flex-col items-center py-20 text-center sm:py-28">
            <Badge
              variant="outline"
              className="mb-6 border-primary-foreground/20 bg-primary-foreground/5 text-primary-foreground"
            >
              Built for trainers in the UAE &amp; GCC
            </Badge>
            <h1 className="max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Run your personal training business, all in one place
            </h1>
            <p className="mt-6 max-w-2xl text-balance text-lg text-primary-foreground/80 sm:text-xl">
              TrainerCore helps freelance personal trainers across the UAE and
              GCC manage clients, build workout plans, schedule sessions and
              send tax invoices in AED — without juggling spreadsheets.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" variant="accent">
                <Link href="/auth/signup">
                  Start free trial
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                <Link href="#pricing">See pricing</Link>
              </Button>
            </div>
            <p className="mt-6 text-sm text-primary-foreground/70">
              14-day free trial · No credit card required
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 sm:py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to grow
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                One platform that replaces the spreadsheets, chat threads and
                invoicing tools you use today.
              </p>
            </div>
            <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <Card key={feature.title} className="h-full">
                    <CardHeader>
                      <span className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        <Icon className="h-6 w-6" aria-hidden />
                      </span>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-16 bg-muted/40 py-20 sm:py-24">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Pick a plan that fits your roster. Every plan starts with a
                14-day free trial.
              </p>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl items-stretch gap-6 lg:grid-cols-3">
              {PLAN_ORDER.map((tier) => {
                const plan = PLANS[tier];
                const isPopular = tier === 'pro';
                const clientText = Number.isFinite(plan.clientLimit)
                  ? `Up to ${plan.clientLimit} clients`
                  : 'Unlimited clients';
                return (
                  <Card
                    key={tier}
                    className={cn(
                      'relative flex h-full flex-col',
                      isPopular && 'border-accent shadow-lg ring-2 ring-accent'
                    )}
                  >
                    {isPopular && (
                      <Badge
                        variant="success"
                        className="absolute -top-3 left-1/2 -translate-x-1/2"
                      >
                        Popular
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight">
                          {formatAED(plan.priceAed)}
                        </span>
                        <span className="text-muted-foreground">/mo</span>
                      </div>
                      <CardDescription className="text-base">
                        {clientText}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col">
                      <ul className="space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-2">
                            <Check
                              className="mt-0.5 h-5 w-5 shrink-0 text-accent"
                              aria-hidden
                            />
                            <span className="text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        asChild
                        size="lg"
                        variant={isPopular ? 'accent' : 'default'}
                        className="mt-8 w-full"
                      >
                        <Link href="/auth/signup">Get started</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground">
              All prices in AED and exclude 5% VAT where applicable.
            </p>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="py-20 sm:py-24">
          <div className="container">
            <div className="mx-auto flex max-w-4xl flex-col items-center rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground sm:px-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to streamline your training business?
              </h2>
              <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
                Join trainers across the UAE and GCC who run their entire
                business on TrainerCore.
              </p>
              <Button asChild size="lg" variant="accent" className="mt-8">
                <Link href="/auth/signup">
                  Start your free trial
                  <ArrowRight className="ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
          <Logo />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TrainerCore. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built for trainers in the UAE &amp; GCC
          </p>
        </div>
      </footer>
    </div>
  );
}
