import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { I18nProvider } from '@/components/providers/i18n-provider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TrainerCore — Personal Trainer Business Platform',
    template: '%s · TrainerCore',
  },
  description:
    'TrainerCore is the all-in-one business platform for freelance personal trainers in the UAE & GCC — clients, workout plans, scheduling, invoicing with VAT, and WhatsApp check-ins.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
};

export const viewport: Viewport = {
  themeColor: '#0F172A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <I18nProvider>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
