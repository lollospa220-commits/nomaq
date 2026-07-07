import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchCustomFlights, resolveCityToIATA } from '@/utils/travelApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { origin, departure, returnDate } = req.query;

  if (!origin || !departure || !returnDate || typeof origin !== 'string' || typeof departure !== 'string' || typeof returnDate !== 'string') {
    return res.status(400).json({ error: 'Mancano i parametri richiesti: origin, departure, returnDate.' });
  }

  // Le date devono essere ISO (YYYY-MM-DD) e coerenti: l'andata non oltre il
  // ritorno. Blocca subito input invalidi senza sprecare una chiamata upstream.
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoDate.test(departure) || !isoDate.test(returnDate)) {
    return res.status(400).json({ error: 'Date non valide (formato atteso YYYY-MM-DD).' });
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
