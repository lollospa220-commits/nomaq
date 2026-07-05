import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchRealFlights } from '@/utils/travelApi';
import { createRateLimiter } from '@/utils/rateLimit';

const limiter = createRateLimiter({ max: 20 });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (limiter.isRateLimited(req)) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra poco.' });
  }

  try {
    const flights = await fetchRealFlights();
    // Deals feed tolerates minutes of staleness; let the CDN serve it.
    res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800');
    return res.status(200).json(flights);
  } catch (err: any) {
    console.error('[flights] Error:', err.message);
    return res.status(500).json({ error: 'Si è verificato un errore interno.' });
  }
}
