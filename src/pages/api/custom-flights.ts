import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCustomFlights, resolveCityToIATA } from '@/utils/travelApi';
import { createRateLimiter } from '@/utils/rateLimit';

// Endpoint a massima amplificazione: una richiesta innesca fino a ~40 chiamate
// upstream (resolveCityToIATA + fetchCustomFlights su 10 destinazioni × più
// tentativi). La cache non copre perché la chiave include le date → limitare è
// indispensabile per non esaurire quota/costi Travelpayouts.
const limiter = createRateLimiter({ max: 10 });

// Valida che una stringa sia una data di calendario REALE (non solo il formato):
// il solo regex accetterebbe 2026-02-31 / 2026-13-40, che poi generano
// "Invalid Date" nelle card e query senza senso agli upstream.
const isRealISODate = (s: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  if (limiter.isRateLimited(req)) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra poco.' });
  }

  const { origin, departure, returnDate } = req.query;

  if (!origin || !departure || !returnDate || typeof origin !== 'string' || typeof departure !== 'string' || typeof returnDate !== 'string') {
    return res.status(400).json({ error: 'Mancano i parametri richiesti: origin, departure, returnDate.' });
  }

  // Le date devono essere ISO (YYYY-MM-DD) REALI e coerenti: l'andata non oltre
  // il ritorno né nel passato. Blocca subito input invalidi senza sprecare una
  // chiamata upstream.
  if (!isRealISODate(departure) || !isRealISODate(returnDate)) {
    return res.status(400).json({ error: 'Date non valide (formato atteso YYYY-MM-DD).' });
  }
  // Floor = ieri UTC: tollera lo sfasamento di fuso senza accettare date chiaramente passate.
  const minDate = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
  if (departure < minDate) {
    return res.status(400).json({ error: 'La data di andata non può essere nel passato.' });
  }
  if (returnDate < departure) {
    return res.status(400).json({ error: 'La data di ritorno deve essere successiva o uguale a quella di andata.' });
  }

  try {
    const originIata = await resolveCityToIATA(origin);
    if (!originIata) {
      return res.status(400).json({ error: `Non riesco a trovare l'aeroporto per: ${origin}` });
    }

    const flights = await fetchCustomFlights(originIata, departure, returnDate);
    // Don't cache custom flights aggressively like generic flights
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(flights);
  } catch (err: any) {
    console.error('[custom-flights] Error:', err.message);
    return res.status(500).json({ error: 'Si è verificato un errore interno.' });
  }
}
