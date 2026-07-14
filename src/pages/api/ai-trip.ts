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
    // Risposta 200 in modalità filter vuota: il client ha già un fallback locale
    // e un 500 qui interrompe la ricerca anche quando Mistral/JSON falliscono.
    const isEn = lang === 'en';
    return res.status(200).json({
      mode: 'filter',
      summary: isEn
        ? 'We could not complete the AI search right now. Try adding dates, budget, or a clearer destination.'
        : 'Non siamo riusciti a completare la ricerca AI. Prova ad aggiungere date, budget o una destinazione più chiara.',
      flightIds: [],
      hotelIds: [],
      package: null,
    });
  }
}
