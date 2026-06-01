import type { Metadata, Viewport } from 'next';
import { Inter, IBM_Plex_Sans_Arabic } from 'next/font/google';
import { cookies } from 'next/headers';
import { I18nProvider } from '@/components/providers/i18n-provider';
import { Toaster } from '@/components/ui/sonner';
import { LOCALE_COOKIE, isLocale, dir, DEFAULT_LOCALE } from '@/lib/i18n/config';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
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
  const cookieLocale = cookies().get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  return (
    <html lang={locale} dir={dir(locale)} className={`${inter.variable} ${plexArabic.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <I18nProvider initialLocale={locale}>
          {children}
          <Toaster />
        </I18nProvider>
      </body>
    </html>
  );
}
