import 'server-only';
import { randomBytes } from 'crypto';

/**
 * Generate a URL-safe, single-use check-in token (~32 chars from 24 bytes).
 * The database also has a default, but generating app-side lets us build the
 * public link immediately on insert.
 */
export function generateCheckinToken(): string {
  return randomBytes(24).toString('base64url');
}
