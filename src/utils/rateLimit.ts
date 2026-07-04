/**
 * In-memory rate limiter for Vercel serverless API routes.
 *
 * Uses a sliding-window counter per IP address. Because Vercel spins up
 * multiple isolates, each isolate keeps its own Map — this is "best effort"
 * rate limiting (an attacker hitting different isolates gets N × limit), but
 * it still caps the damage from a single source in the common case and is
 * zero-dependency / zero-cost.
 *
 * Usage:
 *   const limiter = createRateLimiter({ windowMs: 60_000, max: 20 });
 *   // inside handler:
 *   if (limiter.isRateLimited(req)) {
 *     return res.status(429).json({ error: 'Troppe richieste. Riprova tra poco.' });
 *   }
 */

import type { NextApiRequest } from 'next';

interface RateLimiterOptions {
  /** Time window in milliseconds (default: 60 000 = 1 minute). */
  windowMs?: number;
  /** Max requests per IP within the window. */
  max: number;
}

interface Entry {
  count: number;
  resetAt: number;
}

export function createRateLimiter({ windowMs = 60_000, max }: RateLimiterOptions) {
  const store = new Map<string, Entry>();

  // Periodically prune expired entries so the Map doesn't grow forever
  // in a long-lived isolate. Runs at most once per window.
  let lastPrune = Date.now();
  function maybePrune() {
    const now = Date.now();
    if (now - lastPrune < windowMs) return;
    lastPrune = now;
    for (const [key, entry] of store) {
      if (now >= entry.resetAt) store.delete(key);
    }
  }

  function getIp(req: NextApiRequest): string {
    // Vercel sets x-forwarded-for; fall back to socket address.
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
    if (Array.isArray(forwarded) && forwarded.length > 0) return forwarded[0].split(',')[0].trim();
    return req.socket?.remoteAddress || 'unknown';
  }

  return {
    /**
     * Returns `true` if the request should be rejected (rate limited).
     */
    isRateLimited(req: NextApiRequest): boolean {
      maybePrune();
      const ip = getIp(req);
      const now = Date.now();
      const entry = store.get(ip);

      if (!entry || now >= entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return false;
      }

      entry.count++;
      if (entry.count > max) return true;
      return false;
    },
  };
}
