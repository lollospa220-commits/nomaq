/**
 * DeepSeek-powered travel search: interprets a natural-language query against
 * the current flights/hotels catalog and returns matched ids, an optional
 * flight+hotel package suggestion, and a short natural-language summary.
 */

const DEEPSEEK_URL = 'https://api.deepseek.com/chat/completions';

export type AiSearchResult = {
  summary: string;
  flightIds: string[];
  hotelIds: string[];
  package: { flightId: string; hotelId: string; reasoning: string } | null;
};

function compact(items: any[]) {
  return items.map((i) => ({
    id: i.id,
    destination: i.destination,
    country: i.country,
    price: i.price,
    description: i.description,
    airline: i.airline,
    hotel_name: i.hotelName || i.hotel_name,
    rating: i.rating,
  }));
}

export async function interpretTravelQuery({
  query,
  flights,
  hotels,
  lang,
}: {
  query: string;
  flights: any[];
  hotels: any[];
  lang?: string;
}): Promise<AiSearchResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey.startsWith('YOUR_')) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const systemPrompt = `Sei il motore di ricerca AI di Nomaq, un'app di viaggi. Ricevi la richiesta in linguaggio naturale di un cliente (lingua preferita: ${lang === 'en' ? 'inglese' : 'italiano'}) e un catalogo JSON di voli e hotel disponibili.
Compiti:
1. Seleziona SOLO gli id (devono esistere nel catalogo fornito) di voli e hotel pertinenti alla richiesta: budget, destinazione, mood, date, stile di viaggio.
2. Se la richiesta implica un soggiorno completo (es. "trovami un pacchetto", "voglio andare in vacanza a..."), suggerisci UNA combinazione volo+hotel coerente tra quelli disponibili nel catalogo.
3. Scrivi "summary": una risposta breve (1-2 frasi), nella stessa lingua della richiesta del cliente, che spieghi la scelta fatta.
Se nessun elemento del catalogo è pertinente, restituisci array vuoti e spiegalo in "summary".
Rispondi SOLO con un oggetto JSON, esattamente in questo schema:
{"summary": string, "flightIds": string[], "hotelIds": string[], "package": {"flightId": string, "hotelId": string, "reasoning": string} | null}`;

  const userPrompt = JSON.stringify({
    query,
    flights: compact(flights),
    hotels: compact(hotels),
  });

  const res = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    signal: AbortSignal.timeout(60_000),
    body: JSON.stringify({
      model: 'deepseek-chat',
      response_format: { type: 'json_object' },
      temperature: 0.3,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`DeepSeek API error ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const raw = json.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Empty DeepSeek response');

  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON from DeepSeek');
  }

  // Never trust ids the model didn't actually see: clamp to the real catalog
  // so a hallucinated id can't crash the UI or point at the wrong item.
  const validFlightIds = new Set(flights.map((f) => f.id));
  const validHotelIds = new Set(hotels.map((h) => h.id));

  const flightIds: string[] = Array.isArray(parsed.flightIds)
    ? parsed.flightIds.filter((id: string) => validFlightIds.has(id))
    : [];
  const hotelIds: string[] = Array.isArray(parsed.hotelIds)
    ? parsed.hotelIds.filter((id: string) => validHotelIds.has(id))
    : [];

  let pkg: AiSearchResult['package'] = null;
  if (
    parsed.package &&
    validFlightIds.has(parsed.package.flightId) &&
    validHotelIds.has(parsed.package.hotelId)
  ) {
    pkg = {
      flightId: parsed.package.flightId,
      hotelId: parsed.package.hotelId,
      reasoning: String(parsed.package.reasoning || ''),
    };
  }

  return {
    summary: String(parsed.summary || ''),
    flightIds,
    hotelIds,
    package: pkg,
  };
}
