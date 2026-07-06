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
    // x-real-ip è impostato dal proxy Vercel e NON è falsificabile dal client:
    // usarlo come sorgente primaria. In fallback l'ULTIMO segmento di
    // x-forwarded-for (l'hop aggiunto dal proxy fidato), non il PRIMO — che è
    // interamente controllato dal client e quindi spoofabile per aggirare il limite.
    const realIp = req.headers['x-real-ip'];
    if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();

    const forwarded = req.headers['x-forwarded-for'];
    const xff = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    if (typeof xff === 'string' && xff.trim()) {
      const parts = xff.split(',').map((s) => s.trim()).filter(Boolean);
      if (parts.length > 0) return parts[parts.length - 1];
    }
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

      // Rifiuta PRIMA di incrementare quando l'allowance è esaurito: così il
      // contatore non cresce all'infinito sotto flood e resta = max.
      if (entry.count >= max) return true;
      entry.count++;
      return false;
    },
  };
}
