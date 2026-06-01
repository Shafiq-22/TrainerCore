import { env } from '@/lib/env';

/**
 * Authorise a cron request. Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`
 * when CRON_SECRET is set. Also supports `?secret=` for manual triggering.
 */
export function isAuthorizedCron(req: Request): boolean {
  const secret = env.cronSecret;
  if (!secret || secret.includes('change-me')) return false;
  if (req.headers.get('authorization') === `Bearer ${secret}`) return true;
  const url = new URL(req.url);
  return url.searchParams.get('secret') === secret;
}

export function pickOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}
