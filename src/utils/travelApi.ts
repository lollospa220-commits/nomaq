import { supabase } from './supabaseClient';
import { getDestinationImage, ensureVariedImages } from './destinationImages';

const DUFFEL_OFFERS_URL = 'https://api.duffel.com/air/offer_requests';
const TRAVELPAYOUTS_PRICES_URL = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
const RAPIDAPI_HOTELS_URL = 'https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchHotels';

// ── In-memory result cache ──────────────────────────────────────────────
// Both getServerSideProps and the /api/{flights,hotels} routes call the
// fetchers, and each fetcher seeds Supabase + hits external APIs (Duffel /
// Travelpayouts / RapidAPI, up to 10s each). Without caching, every page view
// repeats all of that. A serverless isolate lives long enough that a short TTL
// collapses bursts of requests into a single upstream round-trip. Prices for a
// deals feed don't need sub-10-minute freshness. A non-empty result is cached
// for 10 min; an empty one (transient upstream failure) only for 30s so the
// feed recovers quickly.
const FULL_TTL_MS = 10 * 60 * 1000;
const EMPTY_TTL_MS = 30 * 1000;
type CacheEntry = { expiresAt: number; data: any[] };
const resultCache = new Map<string, CacheEntry>();

async function withCache(key: string, produce: () => Promise<any[]>): Promise<any[]> {
  const now = Date.now();
  const hit = resultCache.get(key);
  if (hit && now < hit.expiresAt) return hit.data;
  const data = await produce();
  const ttl = Array.isArray(data) && data.length > 0 ? FULL_TTL_MS : EMPTY_TTL_MS;
  resultCache.set(key, { expiresAt: now + ttl, data });
  return data;
}

// Mix of European LCC routes (easyJet is on Duffel via Direct Connect;
// Ryanair is not distributed by Duffel) and long-haul picks. Shared by the
// Travelpayouts and Duffel fetchers.
const FLIGHT_DESTINATIONS = [
  { code: 'BCN', name: 'Barcellona', country: 'Spagna', color: '#e05b7b', tag: 'WEEKEND' },
  { code: 'LGW', name: 'Londra', country: 'Regno Unito', color: '#3a6fbf', tag: 'BEST PRICE' },
  { code: 'LIS', name: 'Lisbona', country: 'Portogallo', color: '#e08030', tag: 'HOT DEAL' },
  { code: 'NRT', name: 'Tokyo', country: 'Giappone', color: '#e05b7b', tag: 'TOP PICK' },
  { code: 'JFK', name: 'New York', country: 'Stati Uniti', color: '#3a6fbf', tag: 'BEST PRICE' },
];

// IATA → nome compagnia per le tariffe Travelpayouts (che espongono solo il codice).
const IATA_AIRLINE_NAMES: Record<string, string> = {
  FR: 'Ryanair', U2: 'easyJet', W6: 'Wizz Air', W4: 'Wizz Air Malta', VY: 'Vueling',
  V7: 'Volotea', LS: 'Jet2', HV: 'Transavia', PC: 'Pegasus', EW: 'Eurowings',
  IB: 'Iberia', BA: 'British Airways', LH: 'Lufthansa', AF: 'Air France', KL: 'KLM',
  AZ: 'ITA Airways', TP: 'TAP Air Portugal', LX: 'Swiss', A3: 'Aegean', FI: 'Icelandair',
  EK: 'Emirates', QR: 'Qatar Airways', TK: 'Turkish Airlines',
  NH: 'ANA', JL: 'Japan Airlines', DL: 'Delta', AA: 'American Airlines', UA: 'United',
};

function resolveDestCode(item: any): string | null {
  if (item.dest_code) return item.dest_code;
  const key = `${item.destination || ''} ${item.id || ''}`.toLowerCase();
  const map: Array<[string, string]> = [
    ['bali', 'DPS'], ['dps', 'DPS'],
    ['new york', 'JFK'], ['jfk', 'JFK'], ['-ny', 'JFK'],
    ['lisbona', 'LIS'], ['lis', 'LIS'],
    ['dubai', 'DXB'], ['dxb', 'DXB'],
    ['barcellona', 'BCN'], ['barcelona', 'BCN'], ['bcn', 'BCN'],
    ['londra', 'LGW'], ['london', 'LGW'], ['lgw', 'LGW'],
    ['tokyo', 'NRT'], ['nrt', 'NRT'],
    ['sicilia', 'PMO'], ['parigi', 'CDG'], ['paris', 'CDG'],
  ];
  const hit = map.find(([k]) => key.includes(k));
  // Nessun match → null: il chiamante costruisce una ricerca generica da MXP
  // invece di linkare silenziosamente Tokyo (il vecchio fallback 'NRT').
  return hit ? hit[1] : null;
}

// Helper to get affiliate link
function getAffiliateLink(item: any, type: 'flight' | 'hotel'): string {
  const marker = process.env.AFFILIATE_MARKER || 'demo_marker_12345';

  if (type === 'flight') {
    // Kiwi.com per tutti i voli — nessun network russo (Aviasales/Jetradar).
    // KIWI_AFFILIATE_ID è l'`affilid` del programma Kiwi.com su Travelpayouts
    // (Programs > Kiwi.com > Links > "IT: Main page" > Copy link, poi leggi
    // `affilid` nell'URL di destinazione): se assente il link resta un
    // normale link di ricerca Kiwi.com, solo senza commissione tracciata.
    const destCode = resolveDestCode(item);
    // Le righe Travelpayouts codificano la data reale di partenza nell'id
    // (flight-tp-XXX-YYYY-MM-DD): usala, così il link apre la stessa data
    // mostrata sulla card anche quando la riga arriva dalla cache Supabase.
    // Per le altre righe resta la finestra today+60.
    const tpMatch = typeof item.id === 'string'
      ? item.id.match(/^flight-tp-[A-Z]{3}-(\d{4}-\d{2}-\d{2})$/)
      : null;
    const fallbackDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    // Righe cache con data ormai passata (es. TP token rimosso da settimane):
    // meglio la finestra standard che un deep link su una data non prenotabile.
    const departureDate = tpMatch && tpMatch[1] > today ? tpMatch[1] : fallbackDate;
    const [y, m, d] = departureDate.split('-');
    const params = new URLSearchParams({ from: 'MXP', departure: `${d}-${m}-${y}`, lang: 'it' });
    if (destCode) params.set('to', destCode);
    const kiwiAffilId = process.env.KIWI_AFFILIATE_ID;
    if (kiwiAffilId) params.set('affilid', kiwiAffilId);
    return `https://www.kiwi.com/deep?${params.toString()}`;
  } else {
    // Booking.com affiliate search link, con date allineate alla stessa
    // finestra today+60 → today+67 mostrata sulle card hotel.
    const name = item.hotel_name || item.destination || 'Hotel';
    const checkin = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkout = new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name)}&aid=${marker}&checkin=${checkin}&checkout=${checkout}&group_adults=2`;
  }
}

// Fallback seed data.
// original_price è NOT NULL a schema: si imposta uguale a price (sconto 0%),
// così l'UI non mostra mai un prezzo barrato inventato.
const DEFAULT_FLIGHTS = [
  {
    id: 'flight-barcelona',
    destination: 'Weekend a Barcellona',
    country: 'Spagna',
    price: 89,
    original_price: 89,
    description: 'Da Napoli · 2 notti · da 89€',
    image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
    airline: 'EasyJet',
    duration: '2h 10m',
    date_info: 'Qualsiasi weekend',
    rating: 4.8,
    tag: 'BEST PRICE',
    color: '#e05b7b',
  },
  {
    id: 'flight-sicily',
    destination: 'Mare in Sicilia',
    country: 'Italia',
    price: 129,
    original_price: 129,
    description: 'Partenza venerdì · hotel + volo · da 129€',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
    airline: 'Ryanair',
    duration: '1h 15m',
    date_info: 'Partenza venerdì',
    rating: 4.9,
    tag: 'TOP CHOICES',
    color: '#1a8a6b',
  },
  {
    id: 'flight-bali',
    destination: 'Bali',
    country: 'Indonesia',
    price: 389,
    original_price: 389,
    description: 'Spiagge di sabbia bianca, templi antichi e tramonti mozzafiato. Il paradiso esiste.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    airline: 'Qatar Airways',
    duration: '14h 30m',
    date_info: 'Date flessibili',
    rating: 4.9,
    tag: 'HOT DEAL',
    color: '#1a8a6b',
  },
  {
    id: 'flight-tokyo',
    destination: 'Tokyo',
    country: 'Giappone',
    price: 541,
    original_price: 541,
    description: 'Metropoli futuristica incontra tradizione millenaria. Ramen, sakura e neon ovunque.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    airline: 'ANA Airlines',
    duration: '12h 45m',
    date_info: 'Date flessibili',
    rating: 4.8,
    tag: 'TOP PICK',
    color: '#e05b7b',
  },
  {
    id: 'flight-ny',
    destination: 'New York',
    country: 'Stati Uniti',
    price: 312,
    original_price: 312,
    description: "The city that never sleeps. Brooklyn Bridge, Central Park e una pizza che vale il viaggio.",
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
    airline: 'Delta Airlines',
    duration: '10h 20m',
    date_info: 'Date flessibili',
    rating: 4.7,
    tag: 'BEST PRICE',
    color: '#3a6fbf',
  },
];

const DEFAULT_HOTELS = [
  {
    id: 'hotel-santorini',
    destination: 'Santorini',
    country: 'Grecia',
    price: 180,
    original_price: 180,
    description: 'Suite con piscina a sfioro e vista panoramica sul calderone. Il tramonto più famoso del mondo.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    hotel_name: 'Canaves Oia Suites',
    stars: 5,
    rating: 4.9,
    nights: '7 notti',
    date_info: 'Date flessibili',
    tag: 'SUNSET VIEW',
    color: '#4a90d9',
  },
  {
    id: 'hotel-maldive',
    destination: 'Maldive',
    country: 'Maldive',
    price: 450,
    original_price: 450,
    description: 'Bungalow sull\'acqua cristallina. Coralli, mante e silenzi. La vacanza della vita.',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    hotel_name: 'Baros Maldives',
    stars: 5,
    rating: 5.0,
    nights: '10 notti',
    date_info: 'Date flessibili',
    tag: 'PARADISE',
    color: '#00b4d8',
  },
];

// Upsert idempotente dei dati seed: oltre a popolare un DB vuoto, riallinea a
// ogni richiesta le righe seed legacy — quelle scritte dal vecchio codice con
// original_price gonfiato (es. 135 su price 89) — ai valori onesti correnti.
// Un insert-solo-se-vuoto non migrerebbe mai i DB già seminati.
export async function seedDefaultRows() {
  try {
    const { error: flightsError } = await supabase.from('flights').upsert(DEFAULT_FLIGHTS);
    if (flightsError) console.warn('Seeding flights failed:', flightsError.message);

    const { error: hotelsError } = await supabase.from('hotels').upsert(DEFAULT_HOTELS);
    if (hotelsError) console.warn('Seeding hotels failed:', hotelsError.message);
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// Best-effort: rimuove le righe generate dalle fetch precedenti, così il
// fallback SELECT * non serve per sempre prezzi stantii accumulati. Se RLS
// blocca la delete si prosegue comunque (gli id stabili vengono sovrascritti
// dall'upsert successivo). I pattern sono espliciti perché non tutte le righe
// generate sono junk in ogni contesto: nel fallback senza token si spazzano
// solo le flight-duffel-% (sandbox), preservando la cache flight-tp-% reale.
async function cleanupGeneratedRows(table: 'flights' | 'hotels', patterns: string[]) {
  try {
    for (const pattern of patterns) {
      await supabase.from(table).delete().like('id', pattern);
    }
  } catch (err) {
    console.warn(`Best-effort cleanup of generated ${table} rows failed:`, err);
  }
}

// Durata Travelpayouts: minuti → '2h 10m'
function formatDurationMinutes(minutes: any): string | null {
  const total = Number(minutes);
  if (!Number.isFinite(total) || total <= 0) return null;
  const h = Math.floor(total / 60);
  const m = Math.round(total % 60);
  return h === 0 ? `${m}m` : `${h}h ${m}m`;
}

// Travelpayouts Data API: prezzi reali di mercato (cache Aviasales) per le
// stesse destinazioni della griglia. Una sola card per destinazione: la più
// economica. Nessun original_price e nessun rating: non sono dati reali e la
// UI nasconde barrato/stelle quando i campi sono assenti.
async function fetchTravelpayoutsFlights(token: string): Promise<any[]> {
  // YYYY-MM del mese prossimo: la cache dei prezzi è più densa qualche settimana avanti.
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const departureMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

  const perDestination = await Promise.all(FLIGHT_DESTINATIONS.map(async (dest) => {
    try {
      const params = new URLSearchParams({
        origin: 'MXP',
        destination: dest.code,
        departure_at: departureMonth,
        one_way: 'true',
        direct: 'false',
        currency: 'eur',
        sorting: 'price',
        limit: '3',
        token,
      });
      const res = await fetch(`${TRAVELPAYOUTS_PRICES_URL}?${params.toString()}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json?.success) return null;

      // Solo offerte con prezzo e data di partenza reali e parsabili.
      const offers = (Array.isArray(json?.data) ? json.data : []).filter((o: any) =>
        Number.isFinite(Number(o?.price)) && Number(o?.price) > 0 &&
        typeof o?.departure_at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(o.departure_at));
      if (offers.length === 0) return null;

      // sorting=price dovrebbe già ordinare, ma scegli il minimo per sicurezza.
      const cheapest = offers.reduce((min: any, o: any) => (Number(o.price) < Number(min.price) ? o : min), offers[0]);

      const price = Math.round(Number(cheapest.price));
      const airlineCode = typeof cheapest?.airline === 'string' ? cheapest.airline.toUpperCase() : '';
      const airlineName = IATA_AIRLINE_NAMES[airlineCode] || airlineCode || 'Compagnia n/d';
      const departureDay = cheapest.departure_at.slice(0, 10); // YYYY-MM-DD
      const dateStr = new Date(departureDay).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' });
      const duration = formatDurationMinutes(cheapest?.duration);

      // La data reale di partenza è codificata nell'id (flight-tp-XXX-YYYY-MM-DD)
      // perché la tabella flights non ha altre colonne dove salvarla: così
      // getAffiliateLink costruisce il deep link Kiwi sulla stessa data anche
      // per le righe rilette dalla cache Supabase.
      const row: any = {
        id: `flight-tp-${dest.code}-${departureDay}`,
        destination: dest.name,
        country: dest.country,
        dest_code: dest.code,
        price,
        original_price: price, // colonna NOT NULL: = price ⇒ sconto 0 ⇒ barrato nascosto
        description: `Tariffa reale di mercato (cache Travelpayouts) MXP → ${dest.code} con ${airlineName}. Prezzo osservato di recente, soggetto a disponibilità.`,
        image: getDestinationImage(dest.name, `${dest.code}-${departureDay}`),
        airline: airlineName,
        date_info: `${dateStr} (Solo andata)`,
        tag: dest.tag,
        color: dest.color,
      };
      if (duration) row.duration = duration;
      return row;
    } catch (err) {
      console.warn(`Failed fetching Travelpayouts prices for ${dest.code}:`, err);
      return null;
    }
  }));

  return perDestination.filter(Boolean) as any[];
}

// Una tariffa reale di mercato per una singola rotta arbitraria (non solo il
// catalogo fisso): è ciò che alimenta la ricerca live per qualsiasi
// destinazione. Restituisce fino a `limit` offerte distinte ordinate per
// prezzo, oppure [] se manca il token / codici non validi / nessun dato /
// qualsiasi errore upstream — così il chiamante ricade in modo pulito sulle
// stime AI. Cache per-rotta (stessa mappa dei feed).
export type LiveFare = {
  price: number;
  airline: string;       // nome compagnia risolto
  airlineCode: string;   // IATA compagnia (per id stabili)
  departureDay: string;  // YYYY-MM-DD reale
  duration: string | null;
  origin: string;        // IATA
  destination: string;   // IATA
};

export async function fetchLiveFares(originIata: string, destIata: string, limit = 6): Promise<LiveFare[]> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token || token.startsWith('YOUR_')) return [];
  const origin = String(originIata || '').toUpperCase();
  const dest = String(destIata || '').toUpperCase();
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(dest) || origin === dest) return [];

  const data = await withCache(`live-${origin}-${dest}`, async () => {
    try {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const departureMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
      const params = new URLSearchParams({
        origin,
        destination: dest,
        departure_at: departureMonth,
        one_way: 'true',
        direct: 'false',
        currency: 'eur',
        sorting: 'price',
        limit: String(Math.min(Math.max(Math.round(limit), 1), 30)),
        token,
      });
      const res = await fetch(`${TRAVELPAYOUTS_PRICES_URL}?${params.toString()}`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const json = await res.json();
      if (!json?.success) return [];

      const offers = (Array.isArray(json?.data) ? json.data : []).filter((o: any) =>
        Number.isFinite(Number(o?.price)) && Number(o?.price) > 0 &&
        typeof o?.departure_at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(o.departure_at));

      const today = new Date().toISOString().slice(0, 10);
      const seen = new Set<string>();
      const fares: LiveFare[] = [];
      for (const o of offers.sort((a: any, b: any) => Number(a.price) - Number(b.price))) {
        const departureDay = o.departure_at.slice(0, 10);
        if (departureDay <= today) continue; // niente date già passate nella cache
        const airlineCode = typeof o?.airline === 'string' ? o.airline.toUpperCase() : '';
        // Una card per coppia (compagnia, data): evita righe quasi identiche.
        const key = `${airlineCode}-${departureDay}`;
        if (seen.has(key)) continue;
        seen.add(key);
        fares.push({
          price: Math.round(Number(o.price)),
          airline: IATA_AIRLINE_NAMES[airlineCode] || airlineCode || 'Compagnia n/d',
          airlineCode,
          departureDay,
          duration: formatDurationMinutes(o?.duration),
          origin,
          destination: dest,
        });
        if (fares.length >= limit) break;
      }
      return fares;
    } catch (err) {
      console.warn(`Live fares fetch failed for ${origin}-${dest}:`, err);
      return [];
    }
  });

  return data as LiveFare[];
}

// Fetch Flights: Travelpayouts (prezzi reali) → Duffel (solo token live) → cache Supabase
export function fetchRealFlights() {
  return withCache('flights', computeRealFlights);
}

async function computeRealFlights() {
  await seedDefaultRows();

  // 1) Travelpayouts prima di Duffel: sono prezzi di mercato reali.
  const tpToken = process.env.TRAVELPAYOUTS_TOKEN;
  if (tpToken && !tpToken.startsWith('YOUR_')) {
    try {
      const tpFlights = await fetchTravelpayoutsFlights(tpToken);
      if (tpFlights.length > 0) {
        await cleanupGeneratedRows('flights', ['flight-duffel-%', 'flight-tp-%']);
        for (const flight of tpFlights) {
          // dest_code is not a column of the flights table — keep it in-memory only
          const { dest_code, ...row } = flight;
          const { error } = await supabase.from('flights').upsert(row);
          if (error) console.warn(`Upsert of TP flight ${row.id} failed:`, error.message);
        }
        return ensureVariedImages(tpFlights).map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'flight') }));
      }
    } catch (err) {
      console.error('Error fetching from Travelpayouts API:', err);
    }
  }

  // 2) Duffel SOLO con un token live: i token sandbox ("duffel_test_...")
  // restituiscono compagnie e tariffe fittizie ("Duffel Airways") che non
  // devono mai essere mostrate come offerte reali → si salta al fallback.
  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token || token.startsWith('duffel_test_') || token.startsWith('YOUR_')) {
    // In questa configurazione qualsiasi riga flight-duffel-% nel DB è junk
    // sandbox (scritto dal vecchio codice o da un altro ambiente in test):
    // best-effort delete + filtro in-memory, così non arriva mai in pagina
    // nemmeno se la delete è bloccata o il DB viene ri-sporcato da un
    // deployment che gira ancora col vecchio codice.
    await cleanupGeneratedRows('flights', ['flight-duffel-%']);
    const { data } = await supabase.from('flights').select('*');
    const rows = (data || []).filter((r: any) => !String(r.id).startsWith('flight-duffel-'));
    const list = ensureVariedImages(rows);
    return list.map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'flight') }));
  }

  try {
    const origin = 'MXP';
    const departureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Query all destinations in parallel: each offer_request takes seconds and
    // this runs during SSR, so a sequential loop multiplies the TTFB.
    const perDestination = await Promise.all(FLIGHT_DESTINATIONS.map(async (dest) => {
      try {
        const res = await fetch(DUFFEL_OFFERS_URL, {
          method: 'POST',
          // Node fetch non ha timeout di default: senza, un Duffel lento
          // appenderebbe il worker SSR (Travelpayouts già usa lo stesso budget).
          signal: AbortSignal.timeout(8000),
          headers: {
            'Content-Type': 'application/json',
            'Duffel-Version': 'v2',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            data: {
              slices: [
                {
                  origin: origin,
                  destination: dest.code,
                  departure_date: departureDate
                }
              ],
              passengers: [
                {
                  type: 'adult'
                }
              ],
              cabin_class: 'economy'
            }
          })
        });

        if (!res.ok) return [];
        const json = await res.json();
        const offers = (json.data?.offers || []).filter((o: any) => Number.isFinite(Number(o?.total_amount)));
        if (offers.length === 0) return [];

        // Una sola card per destinazione: l'offerta più economica (niente
        // duplicati che si accumulano riga dopo riga in Supabase).
        const offer = offers.reduce((min: any, o: any) => (Number(o.total_amount) < Number(min.total_amount) ? o : min), offers[0]);

        const price = Math.round(Number(offer.total_amount));
        const airlineName = offer.owner?.name || 'Airline';
        const durationRaw = offer.slices?.[0]?.duration;
        const duration = typeof durationRaw === 'string' ? durationRaw.replace('PT', '').toLowerCase() : null;
        const dateStr = new Date(departureDate).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' });

        // Niente original_price (il markup *1.35 era inventato) e niente
        // rating (era random): la UI nasconde i campi assenti.
        const row: any = {
          id: `flight-duffel-${dest.code}-${offer.id}`,
          destination: dest.name,
          country: dest.country,
          dest_code: dest.code,
          price,
          original_price: price, // colonna NOT NULL: = price ⇒ sconto 0 ⇒ barrato nascosto
          description: duration
            ? `Volo reale MXP → ${dest.code} trovato via Duffel. Compagnia: ${airlineName}. Durata: ${duration}.`
            : `Volo reale MXP → ${dest.code} trovato via Duffel. Compagnia: ${airlineName}.`,
          image: getDestinationImage(dest.name, `${dest.code}-${offer.id}`),
          airline: airlineName,
          date_info: `${dateStr} (Solo andata)`,
          tag: dest.tag,
          color: dest.color,
        };
        if (duration) row.duration = duration;
        return [row];
      } catch (err) {
        console.warn(`Failed fetching flights from Duffel for ${dest.code}:`, err);
        return [];
      }
    }));

    const allFetchedFlights: any[] = perDestination.flat();

    if (allFetchedFlights.length > 0) {
      await cleanupGeneratedRows('flights', ['flight-duffel-%', 'flight-tp-%']);
      for (const flight of allFetchedFlights) {
        // dest_code is not a column of the flights table — keep it in-memory only
        const { dest_code, ...row } = flight;
        const { error } = await supabase.from('flights').upsert(row);
        if (error) console.warn(`Upsert of Duffel flight ${row.id} failed:`, error.message);
      }
      return ensureVariedImages(allFetchedFlights).map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'flight') }));
    }

    const { data } = await supabase.from('flights').select('*');
    const list = ensureVariedImages(data || []);
    return list.map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'flight') }));
  } catch (err) {
    console.error('Error fetching from Duffel API:', err);
    const { data } = await supabase.from('flights').select('*');
    const list = ensureVariedImages(data || []);
    return list.map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'flight') }));
  }
}

// Prezzo hotel reale da stringhe tipo "€123", "$1,234" o "€89.99". Si usa SOLO
// il primo gruppo numerico (uno strip globale dei non-numerici concatenerebbe
// numeri distinti: "$176 x 7 nights" → 1767) e si tratta un separatore finale
// seguito da 1-2 cifre come decimali. Non parsabile → null (mai inventare).
function parseHotelPrice(raw: any): number | null {
  if (typeof raw === 'number') return Number.isFinite(raw) && raw > 0 ? Math.round(raw) : null;
  if (typeof raw !== 'string') return null;
  const group = raw.match(/\d[\d.,]*/);
  if (!group) return null;
  let s = group[0];
  const decimals = s.match(/[.,]\d{1,2}$/);
  if (decimals) s = s.slice(0, -decimals[0].length);
  const value = parseInt(s.replace(/[.,]/g, ''), 10);
  return Number.isFinite(value) && value > 0 ? value : null;
}

// Fetch Hotels via RapidAPI (TripAdvisor/Booking)
export function fetchRealHotels() {
  return withCache('hotels', computeRealHotels);
}

async function computeRealHotels() {
  await seedDefaultRows();

  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey || rapidApiKey.startsWith('YOUR_')) {
    const { data } = await supabase.from('hotels').select('*');
    const list = ensureVariedImages(data || []);
    return list.map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'hotel') }));
  }

  try {
    const destinations = [
      { geoId: '189413', name: 'Santorini', country: 'Grecia', image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80', color: '#4a90d9', tag: 'SUNSET VIEW' },
      { geoId: '293922', name: 'Maldive', country: 'Maldive', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80', color: '#00b4d8', tag: 'PARADISE' },
    ];

    const allFetchedHotels: any[] = [];
    const checkInDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOutDate = new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    for (const dest of destinations) {
      try {
        const url = `${RAPIDAPI_HOTELS_URL}?geoId=${dest.geoId}&checkIn=${checkInDate}&checkOut=${checkOutDate}&pageNumber=1&currency=EUR`;
        const res = await fetch(url, {
          signal: AbortSignal.timeout(8000),
          headers: {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com'
          }
        });

        if (!res.ok) continue;
        const json = await res.json();
        const hotelData = Array.isArray(json?.data?.data) ? json.data.data : [];

        // Una sola card per destinazione: l'hotel più economico tra quelli con
        // un prezzo REALE nella risposta. Se il prezzo non è parsabile l'hotel
        // viene saltato: mai inventare prezzi.
        let best: { hotel: any; price: number } | null = null;
        for (const hotel of hotelData) {
          const price = parseHotelPrice(hotel?.priceForDisplay)
            ?? parseHotelPrice(hotel?.priceDetails)
            ?? parseHotelPrice(hotel?.priceSummary);
          if (price == null) continue;
          if (!best || price < best.price) best = { hotel, price };
        }
        if (!best) continue;

        const hotelName = best.hotel?.title || best.hotel?.name || 'Hotel';
        const dateStr = new Date(checkInDate).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' });
        const dateEndStr = new Date(checkOutDate).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' });

        // Niente original_price (il markup *1.45 era inventato), niente
        // stars: 5 hardcoded e niente rating di fallback: si usano solo i
        // dati reali presenti nella risposta.
        const row: any = {
          id: `hotel-rapid-${best.hotel?.hotelId || dest.geoId}`,
          destination: dest.name,
          country: dest.country,
          price: best.price,
          original_price: best.price, // colonna NOT NULL: = price ⇒ sconto 0 ⇒ barrato nascosto
          description: `Soggiorno presso ${hotelName} a ${dest.name}. Prezzo reale rilevato su TripAdvisor per le date indicate.`,
          image: getDestinationImage(dest.name, `${dest.geoId}-${best.hotel?.hotelId || '0'}`),
          hotel_name: hotelName,
          nights: '7 notti',
          date_info: `${dateStr} → ${dateEndStr}`,
          tag: dest.tag,
          color: dest.color,
        };
        const rawRating = Number(best.hotel?.bubbleRating?.rating);
        if (Number.isFinite(rawRating) && rawRating > 0) row.rating = Number(rawRating.toFixed(1));
        const rawStars = Number(best.hotel?.hotelClass ?? best.hotel?.starRating);
        if (Number.isFinite(rawStars) && rawStars > 0) row.stars = Math.round(rawStars);

        allFetchedHotels.push(row);
      } catch (err) {
        console.warn(`Failed fetching hotels for ${dest.name} via RapidAPI:`, err);
      }
    }

    if (allFetchedHotels.length > 0) {
      await cleanupGeneratedRows('hotels', ['hotel-rapid-%']);
      for (const hotel of allFetchedHotels) {
        const { error } = await supabase.from('hotels').upsert(hotel);
        if (error) console.warn(`Upsert of hotel ${hotel.id} failed:`, error.message);
      }
      return ensureVariedImages(allFetchedHotels).map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'hotel') }));
    }

    const { data } = await supabase.from('hotels').select('*');
    const list = ensureVariedImages(data || []);
    return list.map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'hotel') }));
  } catch (err) {
    console.error('Error fetching hotels via RapidAPI:', err);
    const { data } = await supabase.from('hotels').select('*');
    const list = ensureVariedImages(data || []);
    return list.map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'hotel') }));
  }
}
