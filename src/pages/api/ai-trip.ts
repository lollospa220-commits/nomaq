import type { NextApiRequest, NextApiResponse } from 'next';
import { planTrip } from '@/utils/aiTrip';
import { createRateLimiter } from '@/utils/rateLimit';

const limiter = createRateLimiter({ max: 10 });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (limiter.isRateLimited(req)) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra poco.' });
  }

  const { query, flights, hotels, lang } = req.body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Missing query' });
  }

  try {
    const result = await planTrip({
      query: query.slice(0, 2000),
      flights: Array.isArray(flights) ? flights.slice(0, 60) : [],
      hotels: Array.isArray(hotels) ? hotels.slice(0, 60) : [],
      lang,
    });
    return res.status(200).json(result);
  } catch (err: any) {
    console.error('[ai-trip] Error:', err.message);
    return res.status(500).json({ error: 'Si è verificato un errore interno.' });
  }
}
