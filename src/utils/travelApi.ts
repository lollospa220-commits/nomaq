// Solo server (chiamato da API routes + getServerSideProps): usa il client
// service_role (bypassa la RLS) così le scritture su flights/hotels non
// dipendono dai permessi del ruolo anon pubblico. Fallback anon se la key manca.
import { supabaseAdmin as supabase } from './supabaseAdmin';
import { getDestinationImage, ensureVariedImages } from './destinationImages';
import { resolveOriginIataLocal, originLabelForIata } from './airports';

const DUFFEL_OFFERS_URL = 'https://api.duffel.com/air/offer_requests';
const TRAVELPAYOUTS_PRICES_URL = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
const RAPIDAPI_HOTELS_URL = 'https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchHotels';
const RAPIDAPI_SEARCH_LOCATION_URL = 'https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchLocation';

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
// Si memorizza la PROMISE, non il valore risolto: N richieste concorrenti sulla
// stessa chiave condividono un solo round-trip upstream (coalescing) invece di
// chiamare produce() ciascuna — proprio lo scenario di picco che moltiplicava
// le chiamate. Su errore la voce viene sfrattata (mai cache dei fallimenti).
type CacheEntry = { expiresAt: number; data: Promise<any[]> };
const resultCache = new Map<string, CacheEntry>();

// Le chiavi live (origin-dest-date) sono guidate dall'input utente: senza
// pruning la Map crescerebbe finché l'isolato non viene riciclato (memory DoS).
let lastPrune = Date.now();
function prune(now: number) {
  if (now - lastPrune < FULL_TTL_MS) return;
  lastPrune = now;
  for (const [key, entry] of resultCache) {
    if (now >= entry.expiresAt) resultCache.delete(key);
  }
}

async function withCache(key: string, produce: () => Promise<any[]>): Promise<any[]> {
  const now = Date.now();
  prune(now);
  const hit = resultCache.get(key);
  if (hit && now < hit.expiresAt) return hit.data;

  const promise = produce();
  // Inserimento ottimistico con TTL pieno: i chiamanti concorrenti agganciano
  // subito questa promise. Al termine si riallinea il TTL (breve se vuoto) o si
  // sfratta la voce se la produce ha fallito, così il prossimo tentativo riprova.
  resultCache.set(key, { expiresAt: now + FULL_TTL_MS, data: promise });
  try {
    const data = await promise;
    const ttl = Array.isArray(data) && data.length > 0 ? FULL_TTL_MS : EMPTY_TTL_MS;
    resultCache.set(key, { expiresAt: Date.now() + ttl, data: Promise.resolve(data) });
    return data;
  } catch (err) {
    if (resultCache.get(key)?.data === promise) resultCache.delete(key);
    throw err;
  }
}

// Mix of European LCC routes (easyJet is on Duffel via Direct Connect;
// Ryanair is not distributed by Duffel) and long-haul picks. Shared by the
// Travelpayouts and Duffel fetchers.
const FLIGHT_DESTINATIONS = [
  { code: 'BCN', name: 'Barcellona', country: 'Spagna', color: '#e05b7b', tag: 'WEEKEND' },
  { code: 'STN', name: 'Londra', country: 'Regno Unito', color: '#3a6fbf', tag: 'LOW COST' },
  { code: 'LIS', name: 'Lisbona', country: 'Portogallo', color: '#e08030', tag: 'HOT DEAL' },
  { code: 'NRT', name: 'Tokyo', country: 'Giappone', color: '#e05b7b', tag: 'TOP PICK' },
  { code: 'JFK', name: 'New York', country: 'Stati Uniti', color: '#3a6fbf', tag: 'BEST PRICE' },
  { code: 'CDG', name: 'Parigi', country: 'Francia', color: '#7c5cbf', tag: 'CITY BREAK' },
  // Ampliamento catalogo (tutte con pool immagini dedicato in
  // destinationImages.ts; se la cache tariffe è vuota la meta degrada con
  // grazia: assente dal feed home, "Cerca" in Selezionati per te).
  { code: 'AMS', name: 'Amsterdam', country: 'Paesi Bassi', color: '#7c5cbf', tag: 'CITY BREAK' },
  { code: 'DXB', name: 'Dubai', country: 'Emirati Arabi', color: '#e08030', tag: 'TOP PICK' },
  { code: 'JTR', name: 'Santorini', country: 'Grecia', color: '#3a6fbf', tag: 'SUMMER' },
  { code: 'MLE', name: 'Maldive', country: 'Maldive', color: '#e05b7b', tag: 'RELAX' },
];

// IATA → nome compagnia per le tariffe Travelpayouts (che espongono solo il codice).
const IATA_AIRLINE_NAMES: Record<string, string> = {
  FR: 'Ryanair', U2: 'easyJet', W6: 'Wizz Air', W4: 'Wizz Air Malta', VY: 'Vueling',
  V7: 'Volotea', LS: 'Jet2', HV: 'Transavia', PC: 'Pegasus', EW: 'Eurowings',
  IB: 'Iberia', BA: 'British Airways', LH: 'Lufthansa', AF: 'Air France', KL: 'KLM',
  AZ: 'ITA Airways', TP: 'TAP Air Portugal', LX: 'Swiss', A3: 'Aegean', FI: 'Icelandair',
  EK: 'Emirates', QR: 'Qatar Airways', TK: 'Turkish Airlines',
  NH: 'ANA', JL: 'Japan Airlines', DL: 'Delta', AA: 'American Airlines', UA: 'United',
  // Rotte del catalogo ampliato (Dubai, Santorini, Maldive)
  FZ: 'flydubai', EY: 'Etihad Airways', NO: 'Neos', OA: 'Olympic Air',
};

// Low-cost carriers da evidenziare esplicitamente nel feed (Travelpayouts le
// espone, ma con "solo la più economica" spesso finivano fuori se un legacy
// carrier era di pochi euro più basso o assente dalla cache del mese).
const LCC_AIRLINE_CODES = new Set([
  'FR', 'U2', 'W6', 'W4', 'VY', 'V7', 'HV', 'PC', 'EW', 'LS', 'XQ', 'XC',
]);

// Origine predefinita del feed home/Radar: Napoli (coerente con la UI) offre
// più rotte Ryanair/easyJet rispetto al vecchio default MXP.
export const DEFAULT_FLIGHT_ORIGIN = 'NAP';

function airlineLabel(code: string): string {
  return IATA_AIRLINE_NAMES[code] || code || 'Compagnia n/d';
}

function isLccAirline(code: string): boolean {
  return LCC_AIRLINE_CODES.has(String(code || '').toUpperCase());
}

function selectBestAndLccFares<T extends { price: number; airlineCode: string }>(
  fares: T[],
): { best: T | null; lcc: T | null } {
  if (fares.length === 0) return { best: null, lcc: null };
  const best = fares.reduce((min, f) => (f.price < min.price ? f : min), fares[0]);
  const lccPool = fares.filter((f) => isLccAirline(f.airlineCode));
  if (lccPool.length === 0) return { best, lcc: null };
  const lcc = lccPool.reduce((min, f) => (f.price < min.price ? f : min), lccPool[0]);
  if (lcc.airlineCode === best.airlineCode) return { best, lcc: null };
  return { best, lcc };
}

function resolveDestCode(item: any): string | null {
  if (item.dest_code) return item.dest_code;
  const key = `${item.destination || ''} ${item.id || ''}`.toLowerCase();
  const map: Array<[string, string]> = [
    ['bali', 'DPS'], ['dps', 'DPS'],
    ['new york', 'JFK'], ['jfk', 'JFK'], ['-ny', 'JFK'],
    ['lisbona', 'LIS'], ['lis', 'LIS'],
    ['dubai', 'DXB'], ['dxb', 'DXB'],
    ['barcellona', 'BCN'], ['barcelona', 'BCN'], ['bcn', 'BCN'],
    ['londra', 'STN'], ['london', 'STN'], ['stn', 'STN'], ['lgw', 'LGW'],
    ['tokyo', 'NRT'], ['nrt', 'NRT'],
    ['sicilia', 'PMO'], ['parigi', 'CDG'], ['paris', 'CDG'],
    ['amsterdam', 'AMS'], ['ams', 'AMS'],
    ['santorini', 'JTR'], ['jtr', 'JTR'],
    ['maldive', 'MLE'], ['maldives', 'MLE'], ['mle', 'MLE'],
  ];
  const hit = map.find(([k]) => key.includes(k));
  // Nessun match → null: il chiamante costruisce una ricerca generica dall'origine
  // predefinita invece di linkare silenziosamente Tokyo (il vecchio fallback 'NRT').
  return hit ? hit[1] : null;
}

// Helper to resolve origin airport code from item details
function resolveOriginCode(item: any): string {
  if (item.from_code) return item.from_code;
  if (item.origin_code) return item.origin_code;
  if (item.fromCode) return item.fromCode;
  const desc = String(item.description || '').toLowerCase();
  const dest = String(item.destination || '').toLowerCase();
  if (desc.includes('napoli') || dest.includes('napoli')) return 'NAP';
  if (desc.includes('roma') || dest.includes('roma')) return 'ROM';
  if (desc.includes('milano') || dest.includes('milano')) return 'MIL';
  if (desc.includes('venezia') || dest.includes('venezia')) return 'VCE';
  return DEFAULT_FLIGHT_ORIGIN;
}

// Helper to get affiliate link
function getAffiliateLink(item: any, type: 'flight' | 'hotel'): string {
  const marker = process.env.AFFILIATE_MARKER; // fail-closed: niente placeholder

  if (type === 'flight') {
    // Se la riga passa esplicitamente codici e date, usali. Altrimenti ricava.
    const destCode = item.dest_code || resolveDestCode(item);
    const originCode = item.origin_code || resolveOriginCode(item);

    // Accetta una data solo se è un ISO REALE: item.departure_date/return_date
    // potrebbero arrivare malformati da righe cache Supabase → new Date()/
    // toISOString() lancerebbe RangeError e, siccome getAffiliateLink è chiamato
    // in .map senza try/catch per-item, un singolo record avvelenato farebbe 500
    // l'intera risposta.
    const okISO = (s: any): s is string =>
      typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(new Date(`${s}T00:00:00Z`).getTime());

    // La data reale di partenza vive nella colonna departure_date, persistita
    // sia sulle righe Travelpayouts del feed sia sulle "flight-custom" live (non
    // più codificata nell'id: così l'id delle card tp è stabile e i preferiti
    // sopravvivono ai cicli di fetch). Le righe custom sono live e possono avere
    // una partenza odierna (ricerca same-day) → si usa la data così com'è; per
    // le righe tp rilette dalla cache una data ormai passata (volo già partito)
    // va scartata a favore di una data futura di default, come il vecchio guard.
    const fallbackDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const isCustomRow = typeof item.id === 'string' && item.id.startsWith('flight-custom-');
    const departureDate = okISO(item.departure_date) && (isCustomRow || item.departure_date > today)
      ? item.departure_date
      : fallbackDate;
    
    // Rileva se è una riga live (tariffa reale con date/tipo espliciti) o un deal
    // statico/pacchetto (senza date → si deriva un ritorno dalle "notti"). Le
    // righe "flight-custom-" di "Selezionati per te" sono live: se non hanno
    // return_date sono davvero solo andata e il link NON deve inventare un ritorno.
    const isLive = typeof item.id === 'string' && (item.id.startsWith('flight-tp-') || item.id.startsWith('live-flight-') || item.id.startsWith('flight-custom-'));

    let returnDate = okISO(item.return_date) ? item.return_date : '';
    if (!isLive && !returnDate) {
      // Per i deal statici del catalogo (es. Weekend a Barcellona), calcola la data di ritorno
      const text = `${item.description || ''} ${item.date_info || ''} ${item.nights || ''}`;
      const nightsMatch = text.match(/(\d+)\s*nott/i);
      let nights = 7; // default per lungo raggio
      if (nightsMatch) {
        nights = parseInt(nightsMatch[1], 10);
      } else if (text.toLowerCase().includes('weekend')) {
        nights = 2;
      }
      
      const depDateObj = new Date(departureDate);
      depDateObj.setDate(depDateObj.getDate() + nights);
      returnDate = depDateObj.toISOString().split('T')[0];
    }

    const [depY, depM, depD] = departureDate.split('-');
    const params = new URLSearchParams({ from: originCode, departure: `${depD}-${depM}-${depY}`, lang: 'it' });
    if (destCode) params.set('to', destCode);
    
    if (returnDate) {
      const [retY, retM, retD] = returnDate.split('-');
      params.set('return', `${retD}-${retM}-${retY}`);
    }

    const kiwiAffilId = process.env.KIWI_AFFILIATE_ID;
    if (kiwiAffilId) params.set('affilid', kiwiAffilId);
    return `https://www.kiwi.com/deep?${params.toString()}`;
  } else {
    // Booking.com affiliate search link, con date allineate alla stessa
    // finestra today+60 → today+67 mostrata sulle card hotel.
    const name = item.hotel_name || item.destination || 'Hotel';
    const checkin = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkout = new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const q = new URLSearchParams({ ss: name, checkin, checkout, group_adults: '2' });
    if (marker) q.set('aid', marker);
    return `https://www.booking.com/searchresults.html?${q.toString()}`;
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
    airline: '',
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
    airline: '',
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
    airline: '',
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
    airline: '',
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
    airline: '',
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

function buildTravelpayoutsFlightRow(
  dest: (typeof FLIGHT_DESTINATIONS)[number],
  offer: any,
  origin: string,
  idSuffix: string,
  tagOverride?: string,
): any {
  const price = Math.round(Number(offer.price));
  const airlineCode = typeof offer?.airline === 'string' ? offer.airline.toUpperCase() : '';
  const airlineName = airlineLabel(airlineCode);
  const departureDay = offer.departure_at.slice(0, 10);
  const dateStr = new Date(departureDay).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' });
  const duration = formatDurationMinutes(offer?.duration);
  const originCity = originLabelForIata(origin) || origin;

  const row: any = {
    id: `flight-tp-${dest.code}${idSuffix}`,
    destination: dest.name,
    country: dest.country,
    dest_code: dest.code,
    origin_code: origin,
    price,
    original_price: price,
    description: `Tariffa indicativa di mercato ${originCity} → ${dest.code} con ${airlineName}. Prezzo osservato di recente, soggetto a disponibilità; il prezzo finale è sul sito del partner.`,
    image: getDestinationImage(dest.name, `${dest.code}-${departureDay}-${airlineCode || 'any'}`),
    airline: airlineName,
    date_info: `${dateStr} (Solo andata)`,
    departure_date: departureDay,
    tag: tagOverride || dest.tag,
    color: dest.color,
  };
  if (duration) row.duration = duration;
  return row;
}

// Travelpayouts Data API: prezzi reali di mercato (cache Aviasales) per le
// stesse destinazioni della griglia. Per ogni rotta: la tariffa più economica
// +, se diversa, la migliore tra le low-cost (Ryanair, easyJet, Wizz, …).
async function fetchTravelpayoutsFlights(token: string): Promise<any[]> {
  const origin = DEFAULT_FLIGHT_ORIGIN;
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const departureMonth = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

  const perDestination = await Promise.all(FLIGHT_DESTINATIONS.map(async (dest) => {
    try {
      const params = new URLSearchParams({
        origin,
        destination: dest.code,
        departure_at: departureMonth,
        one_way: 'true',
        direct: 'false',
        currency: 'eur',
        sorting: 'price',
        limit: '15',
        token,
      });
      const res = await fetch(`${TRAVELPAYOUTS_PRICES_URL}?${params.toString()}`, {
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return [];
      const json = await res.json();
      if (!json?.success) return [];

      const offers = (Array.isArray(json?.data) ? json.data : []).filter((o: any) =>
        Number.isFinite(Number(o?.price)) && Number(o?.price) > 0 &&
        typeof o?.departure_at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(o.departure_at));
      if (offers.length === 0) return [];

      type TpPick = { offer: any; price: number; airlineCode: string };
      const normalized: TpPick[] = offers.map((o: any) => ({
        offer: o,
        price: Math.round(Number(o.price)),
        airlineCode: typeof o?.airline === 'string' ? o.airline.toUpperCase() : '',
      }));
      const { best, lcc } = selectBestAndLccFares<TpPick>(normalized);
      if (!best) return [];

      const rows: any[] = [buildTravelpayoutsFlightRow(dest, best.offer, origin, '')];
      if (lcc) {
        rows.push(buildTravelpayoutsFlightRow(dest, lcc.offer, origin, '-lcc', 'LOW COST'));
      }
      return rows;
    } catch (err) {
      console.warn(`Failed fetching Travelpayouts prices for ${dest.code}:`, err);
      return [];
    }
  }));

  return perDestination.flat();
}

// Risolve una stringa di testo libero in un codice IATA tramite l'API di Travelpayouts
export async function resolveCityToIATA(cityName: string): Promise<string | null> {
  if (!cityName || cityName.trim().length < 2) return null;
  const q = cityName.trim();
  // 1) Città comuni: risoluzione locale istantanea (stessi codici usati
  // dall'autocomplete del client), così l'origine nel deep link Kiwi coincide
  // esattamente con quella scelta e non dipende da una chiamata di rete.
  const local = resolveOriginIataLocal(q);
  if (local) return local;
  // 2) Altrimenti autocomplete Travelpayouts (testo libero → primo IATA valido).
  try {
    const url = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(q)}&locale=it&types[]=city,airport`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const json = await res.json();
    if (Array.isArray(json) && json.length > 0) {
      // Prende il primo risultato valido (città o aeroporto)
      return json[0].code?.toUpperCase() || null;
    }
    return null;
  } catch (err) {
    console.warn(`Failed to resolve city to IATA for "${q}":`, err);
    return null;
  }
}

type FarePrecision = 'exact' | 'month';

type CustomFarePick = {
  best: LiveFare | null;
  lcc: LiveFare | null;
  precision: FarePrecision | null;
};

// Rilassamento onesto che PRESERVA il tipo di viaggio scelto per alzare l'hit-rate
// di tariffe REALI senza inventare prezzi. Restituisce la migliore assoluta e,
// se diversa, la migliore low-cost (Ryanair/easyJet/…) sulla stessa rotta.
async function fetchBestCustomFares(
  origin: string,
  dest: string,
  departureDate: string,
  returnDate: string,
): Promise<CustomFarePick> {
  const depMonth = departureDate.slice(0, 7);
  const pick = (fares: LiveFare[]): CustomFarePick => {
    const { best, lcc } = selectBestAndLccFares(fares);
    return { best, lcc, precision: best ? 'exact' : null };
  };
  const pickMonth = (fares: LiveFare[]): CustomFarePick => {
    const { best, lcc } = selectBestAndLccFares(fares);
    return { best, lcc, precision: best ? 'month' : null };
  };

  if (returnDate) {
    const rtExact = await fetchLiveFares(origin, dest, 15, departureDate, returnDate);
    if (rtExact.length > 0) return pick(rtExact);
    const rtMonth = await fetchLiveFares(origin, dest, 15, depMonth, returnDate.slice(0, 7));
    if (rtMonth.length > 0) return pickMonth(rtMonth);
  }
  const owExact = await fetchLiveFares(origin, dest, 15, departureDate, undefined);
  if (owExact.length > 0) return pick(owExact);
  const owMonth = await fetchLiveFares(origin, dest, 15, depMonth, undefined);
  if (owMonth.length > 0) return pickMonth(owMonth);
  return { best: null, lcc: null, precision: null };
}

// "Selezionati per te" LIVE: per l'origine e le date ESATTE scelte dall'utente,
// una card per destinazione del catalogo con il prezzo reale di mercato
// (Travelpayouts, lo stesso motore che alimenta il feed reale) e un booking_url
// Kiwi costruito dagli STESSI origine/dest/andata/ritorno → ciò che l'utente
// vede sulla card è ciò che ritrova su Kiwi (rotta, date; prezzo nello stesso
// ordine di grandezza). Nessun prezzo inventato: se per quella rotta+data non
// c'è tariffa in cache, la card resta senza prezzo (la UI mostra "Cerca") ma il
// link Kiwi porta comunque la rotta e le date corrette.
export async function fetchCustomFlights(originIata: string, departureDate: string, returnDate: string): Promise<any[]> {
  const origin = String(originIata || '').toUpperCase();
  if (!/^[A-Z]{3}$/.test(origin) || !/^\d{4}-\d{2}-\d{2}$/.test(departureDate)) return [];
  const ret = /^\d{4}-\d{2}-\d{2}$/.test(returnDate) ? returnDate : '';
  const originCity = originLabelForIata(origin);

  const dateStr = new Date(departureDate).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' });
  const returnStr = ret ? new Date(ret).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' }) : '';

  const buildCustomRow = (
    dest: (typeof FLIGHT_DESTINATIONS)[number],
    fare: LiveFare | null,
    precision: FarePrecision | null,
    idSuffix: string,
    tagOverride?: string,
  ) => {
    const price = fare ? fare.price : null;
    const airlineName = fare ? fare.airline : 'Compagnia n/d';
    const isRT = !!fare?.returnDay;
    const monthLabel = new Date(departureDate).toLocaleDateString('it-IT', { month: 'long' });

    let description: string;
    let dateInfo: string;
    if (!fare) {
      description = `${originCity} → ${dest.name} · ${ret ? `A/R ${dateStr} – ${returnStr}` : dateStr}. Apri il partner per le migliori tariffe su queste date.`;
      dateInfo = ret ? `${dateStr} – ${returnStr}` : `${dateStr} (Solo andata)`;
    } else if (precision === 'month') {
      description = `${originCity} → ${dest.name} · da ${price}€ ${isRT ? 'A/R' : 'solo andata'} con ${airlineName} — tariffa più bassa reale di ${monthLabel}. Scegli le tue date sul sito del partner.`;
      dateInfo = `${monthLabel} · ${isRT ? 'A/R' : 'solo andata'}`;
    } else if (isRT) {
      description = `${originCity} → ${dest.name} · A/R ${dateStr} – ${returnStr} · da ${price}€ con ${airlineName}. Prezzo reale di mercato, soggetto a disponibilità.`;
      dateInfo = `${dateStr} – ${returnStr}`;
    } else {
      description = `${originCity} → ${dest.name} · ${dateStr} solo andata · da ${price}€ con ${airlineName}. Prezzo reale di mercato, soggetto a disponibilità.`;
      dateInfo = `${dateStr} · solo andata`;
    }

    const row: any = {
      id: `flight-custom-${origin}-${dest.code}-${departureDate}-${ret || 'ow'}${idSuffix}`,
      type: 'flight',
      destination: dest.name,
      country: dest.country,
      price,
      original_price: price,
      description,
      image: getDestinationImage(dest.name, `${dest.code}-${departureDate}-${fare?.airlineCode || 'any'}`),
      airline: airlineName,
      date_info: dateInfo,
      tag: tagOverride || dest.tag,
      color: dest.color,
      origin_code: origin,
      dest_code: dest.code,
      departure_date: departureDate,
      return_date: fare && !isRT ? '' : ret,
    };
    if (fare?.duration) row.duration = fare.duration;
    row.booking_url = getAffiliateLink(row, 'flight');
    return row;
  };

  const perDestination = await Promise.all(FLIGHT_DESTINATIONS.map(async (dest) => {
    if (dest.code === origin) return [];
    try {
      const picks = await fetchBestCustomFares(origin, dest.code, departureDate, ret);
      const rows: any[] = [];

      if (picks.best || !picks.lcc) {
        rows.push(buildCustomRow(dest, picks.best, picks.precision, ''));
      }
      if (picks.lcc) {
        rows.push(buildCustomRow(dest, picks.lcc, picks.precision, '-lcc', 'LOW COST'));
      }
      if (rows.length === 0) {
        rows.push(buildCustomRow(dest, null, null, ''));
      }
      return rows;
    } catch (err) {
      console.warn(`Failed fetching custom flights for ${dest.code}:`, err);
      return [buildCustomRow(dest, null, null, '')];
    }
  }));

  return perDestination.flat().sort((a, b) => {
    if (a.price == null && b.price == null) return 0;
    if (a.price == null) return 1;
    if (b.price == null) return -1;
    return a.price - b.price;
  });
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
  returnDay?: string;    // YYYY-MM-DD reale se a/r
  duration: string | null;
  origin: string;        // IATA
  destination: string;   // IATA
};

export async function fetchLiveFares(originIata: string, destIata: string, limit = 6, departureDate?: string, returnDate?: string): Promise<LiveFare[]> {
  const token = process.env.TRAVELPAYOUTS_TOKEN;
  if (!token || token.startsWith('YOUR_')) return [];
  const origin = String(originIata || '').toUpperCase();
  const dest = String(destIata || '').toUpperCase();
  if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(dest) || origin === dest) return [];

  const data = await withCache(`live-${origin}-${dest}-${departureDate || 'any'}-${returnDate || 'any'}`, async () => {
    try {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      const depParam = departureDate || `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;
      const params = new URLSearchParams({
        origin,
        destination: dest,
        departure_at: depParam,
        one_way: returnDate ? 'false' : 'true',
        direct: 'false',
        currency: 'eur',
        sorting: 'price',
        limit: String(Math.min(Math.max(Math.round(limit), 1), 30)),
        token,
      });
      if (returnDate) {
        params.set('return_at', returnDate);
      }

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
        if (!departureDate && departureDay <= today) continue; // niente date già passate nella cache se non è richiesta una data specifica
        const returnDay = typeof o?.return_at === 'string' && /^\d{4}-\d{2}-\d{2}/.test(o.return_at) ? o.return_at.slice(0, 10) : undefined;
        const airlineCode = typeof o?.airline === 'string' ? o.airline.toUpperCase() : '';
        // Una card per coppia (compagnia, data): evita righe quasi identiche.
        const key = `${airlineCode}-${departureDay}-${returnDay || ''}`;
        if (seen.has(key)) continue;
        seen.add(key);
        fares.push({
          price: Math.round(Number(o.price)),
          airline: IATA_AIRLINE_NAMES[airlineCode] || airlineCode || 'Compagnia n/d',
          airlineCode,
          departureDay,
          returnDay,
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

// Hotel reali per una destinazione ARBITRARIA (non solo i due geoId fissi del
// feed): risolve prima nome → geoId con searchLocation, poi interroga
// searchHotels per prezzi reali. È ciò che rende la ricerca hotel live per
// qualsiasi luogo. Restituisce fino a `limit` hotel con prezzo reale ordinati
// per prezzo, oppure [] se manca la chiave / geoId non risolto / nessun dato /
// qualsiasi errore — così il chiamante ricade sulle stime AI. Cache per-query.
export type LiveHotel = {
  name: string;
  price: number;          // prezzo a notte reale rilevato
  rating: number | null;
  stars: number | null;
};

export async function fetchLiveHotels(destinationName: string, limit = 6): Promise<LiveHotel[]> {
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  if (!rapidApiKey || rapidApiKey.startsWith('YOUR_')) return [];
  const query = String(destinationName || '').trim();
  if (!query) return [];

  const data = await withCache(`livehotel-${query.toLowerCase()}`, async () => {
    try {
      const headers = {
        'x-rapidapi-key': rapidApiKey,
        'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com',
      };

      // 1) nome destinazione → geoId (TripAdvisor). Il geoId è numerico; lo si
      // estrae in modo difensivo da più campi possibili della risposta.
      const locRes = await fetch(`${RAPIDAPI_SEARCH_LOCATION_URL}?query=${encodeURIComponent(query)}`, {
        signal: AbortSignal.timeout(8000),
        headers,
      });
      if (!locRes.ok) return [];
      const locJson = await locRes.json();
      const locList = Array.isArray(locJson?.data) ? locJson.data : [];
      let geoId: string | null = null;
      for (const loc of locList) {
        for (const c of [loc?.geoId, loc?.documentId, loc?.locationId, loc?.geo_id]) {
          if (c == null) continue;
          const digits = String(c).match(/\d{3,}/)?.[0]; // i geoId sono ≥3 cifre
          if (digits) { geoId = digits; break; }
        }
        if (geoId) break;
      }
      if (!geoId) return [];

      // 2) geoId → hotel reali per una finestra vicina (3 notti).
      const checkIn = new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const checkOut = new Date(Date.now() + 48 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      const url = `${RAPIDAPI_HOTELS_URL}?geoId=${encodeURIComponent(geoId)}&checkIn=${checkIn}&checkOut=${checkOut}&pageNumber=1&currency=EUR`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers });
      if (!res.ok) return [];
      const json = await res.json();
      const hotelData = Array.isArray(json?.data?.data) ? json.data.data : [];

      const hotels: LiveHotel[] = [];
      const seen = new Set<string>();
      for (const hotel of hotelData) {
        const price = parseHotelPrice(hotel?.priceForDisplay)
          ?? parseHotelPrice(hotel?.priceDetails)
          ?? parseHotelPrice(hotel?.priceSummary);
        if (price == null) continue;
        // I titoli TripAdvisor arrivano spesso con un rank "1. Hotel …": rimuovilo.
        const name = String(hotel?.title || hotel?.name || '').replace(/^\d+\.\s*/, '').trim();
        if (!name) continue;
        const key = name.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        const rawRating = Number(hotel?.bubbleRating?.rating);
        const rawStars = Number(hotel?.hotelClass ?? hotel?.starRating);
        hotels.push({
          name,
          price,
          rating: Number.isFinite(rawRating) && rawRating > 0 ? Number(rawRating.toFixed(1)) : null,
          stars: Number.isFinite(rawStars) && rawStars > 0 ? Math.round(rawStars) : null,
        });
      }
      hotels.sort((a, b) => a.price - b.price);
      return hotels.slice(0, Math.min(Math.max(Math.round(limit), 1), 20));
    } catch (err) {
      console.warn(`Live hotels fetch failed for ${query}:`, err);
      return [];
    }
  });

  return data as LiveHotel[];
}

// Fetch Flights: Travelpayouts (prezzi reali) → Duffel (solo token live) → cache Supabase
export function fetchRealFlights() {
  return withCache('flights', computeRealFlights);
}

async function computeRealFlights() {
  await seedDefaultRows();

  // Prezzo dell'ultima osservazione per destinazione, letto PRIMA di qualsiasi
  // upsert di questo ciclo: confrontarlo col prezzo appena fetchato rende
  // "Drop €X / -X%" un fatto osservato (prezzo reale precedente vs reale
  // attuale), non un numero inventato come il vecchio original_price*1.35.
  // drop_amount/prior_price/observed_at vivono SOLO nell'oggetto in-memory
  // restituito al chiamante: mai scritti su Supabase (schema flights intatto,
  // nessuna colonna nuova). Se la lettura fallisce, nessun drop viene
  // mostrato questo ciclo (fail safe verso "niente drop", mai verso un drop finto).
  let priorPriceById = new Map<string, number>();
  try {
    const { data: priorRows } = await supabase.from('flights').select('id,destination,price');
    (priorRows || []).forEach((r: any) => {
      // SOLO osservazioni reali precedenti (righe TP/Duffel/live), MAI le righe
      // seed hardcoded (flight-tokyo/flight-ny…): condividono il nome-destinazione
      // con le rotte reali (Tokyo/New York) e il loro prezzo inventato falserebbe
      // il drop (prior seed 541 vs prezzo reale 500 → "Drop €41" fittizio).
      const id = String(r?.id || '');
      const isRealObservation = id.startsWith('flight-tp-') || id.startsWith('flight-duffel-') || id.startsWith('live-flight-');
      const p = Number(r?.price);
      if (isRealObservation && Number.isFinite(p)) priorPriceById.set(id, p);
    });
  } catch (err) {
    console.warn('Could not read prior flight prices for drop-tracking:', err);
  }

  const withDropInfo = (rows: any[]) => {
    const observedAt = Date.now();
    return rows.map((r) => {
      const prior = priorPriceById.get(r.id);
      const hasDrop = typeof prior === 'number' && prior > r.price;
      return {
        ...r,
        prior_price: typeof prior === 'number' ? prior : null,
        drop_amount: hasDrop ? Math.round(prior! - r.price) : 0,
        observed_at: observedAt,
      };
    });
  };

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
        return ensureVariedImages(withDropInfo(tpFlights)).map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'flight') }));
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
    const origin = DEFAULT_FLIGHT_ORIGIN;
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
            ? `Volo reale ${origin} → ${dest.code} trovato via Duffel. Compagnia: ${airlineName}. Durata: ${duration}.`
            : `Volo reale ${origin} → ${dest.code} trovato via Duffel. Compagnia: ${airlineName}.`,
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
      return ensureVariedImages(withDropInfo(allFetchedFlights)).map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'flight') }));
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

    const checkInDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const checkOutDate = new Date(Date.now() + 67 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Destinazioni in PARALLELO (prima era un for…await sequenziale: worst case
    // ~8s × N). Ogni fetch è indipendente → il tempo totale = la più lenta, non
    // la somma. Ogni destinazione risolve in una card o null (poi filtrata).
    const rows = await Promise.all(destinations.map(async (dest) => {
      try {
        const url = `${RAPIDAPI_HOTELS_URL}?geoId=${dest.geoId}&checkIn=${checkInDate}&checkOut=${checkOutDate}&pageNumber=1&currency=EUR`;
        const res = await fetch(url, {
          signal: AbortSignal.timeout(8000),
          headers: {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com'
          }
        });

        if (!res.ok) return null;
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
        if (!best) return null;

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

        return row;
      } catch (err) {
        console.warn(`Failed fetching hotels for ${dest.name} via RapidAPI:`, err);
        return null;
      }
    }));
    const allFetchedHotels: any[] = rows.filter(Boolean);

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
