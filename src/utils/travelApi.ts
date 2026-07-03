import { supabase } from './supabaseClient';
import { getDestinationImage, ensureVariedImages } from './destinationImages';

const DUFFEL_OFFERS_URL = 'https://api.duffel.com/air/offer_requests';
const RAPIDAPI_HOTELS_URL = 'https://tripadvisor16.p.rapidapi.com/api/v1/hotels/searchHotels';

// Airlines that pay no metasearch commission: route their offers to Kiwi.com
// (Ryanair "Approved OTA" with easyJet direct integration, ~3% per booking
// via the Travelpayouts Kiwi.com program) instead of Aviasales.
const LCC_AIRLINES = ['ryanair', 'easyjet', 'wizz', 'vueling', 'volotea'];

function resolveDestCode(item: any): string {
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
  return hit ? hit[1] : 'NRT';
}

// Helper to get affiliate link
function getAffiliateLink(item: any, type: 'flight' | 'hotel'): string {
  const marker = process.env.AFFILIATE_MARKER || 'demo_marker_12345';

  if (type === 'flight') {
    const destCode = resolveDestCode(item);
    const departureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Low-cost carriers (Ryanair/easyJet/…) pay ~0% on metasearch redirects:
    // send those clicks to Kiwi.com (sells both at real prices) when a Kiwi
    // affiliate id is configured. KIWI_AFFILIATE_ID is the opaque `affilid`
    // value from Travelpayouts' Kiwi.com "ready-made link" for this project
    // (Programs > Kiwi.com > Links > "IT: Main page" > Copy link, then follow
    // the redirect to read the `affilid` query param) — Kiwi has no deep-link
    // generator UI, but its /deep endpoint still honors from/to/departure
    // alongside that affilid.
    const kiwiAffilId = process.env.KIWI_AFFILIATE_ID;
    const airline = String(item.airline || '').toLowerCase();
    if (kiwiAffilId && LCC_AIRLINES.some((a) => airline.includes(a))) {
      const [y, m, d] = departureDate.split('-');
      const kiwiDate = `${d}-${m}-${y}`; // Kiwi's /deep endpoint expects DD-MM-YYYY
      return `https://www.kiwi.com/deep?from=MXP&to=${destCode}&departure=${kiwiDate}&affilid=${kiwiAffilId}&lang=it`;
    }

    // Aviasales affiliate search link (Travelpayouts). jetradar.com is a dead
    // brand (301 → aviasales.com) — link the current domain directly so the
    // marker is never lost in the cross-domain redirect.
    return `https://search.aviasales.com/flights/?origin_iata=MXP&destination_iata=${destCode}&depart_date=${departureDate}&adults=1&marker=${marker}`;
  } else {
    // Booking.com affiliate search link
    const name = item.hotel_name || item.destination || 'Hotel';
    return `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(name)}&aid=${marker}`;
  }
}

// Fallback seed data
const DEFAULT_FLIGHTS = [
  {
    id: 'flight-barcelona',
    destination: 'Weekend a Barcellona',
    country: 'Spagna',
    price: 89,
    original_price: 135,
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
    original_price: 195,
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
    original_price: 620,
    description: 'Spiagge di sabbia bianca, templi antichi e tramonti mozzafiato. Il paradiso esiste.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
    airline: 'Qatar Airways',
    duration: '14h 30m',
    date_info: 'Lug 12 → Lug 19',
    rating: 4.9,
    tag: 'HOT DEAL',
    color: '#1a8a6b',
  },
  {
    id: 'flight-tokyo',
    destination: 'Tokyo',
    country: 'Giappone',
    price: 541,
    original_price: 890,
    description: 'Metropoli futuristica incontra tradizione millenaria. Ramen, sakura e neon ovunque.',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
    airline: 'ANA Airlines',
    duration: '12h 45m',
    date_info: 'Ago 5 → Ago 15',
    rating: 4.8,
    tag: 'TOP PICK',
    color: '#e05b7b',
  },
  {
    id: 'flight-ny',
    destination: 'New York',
    country: 'Stati Uniti',
    price: 312,
    original_price: 480,
    description: "The city that never sleeps. Brooklyn Bridge, Central Park e una pizza che vale il viaggio.",
    image: 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800&q=80',
    airline: 'Delta Airlines',
    duration: '10h 20m',
    date_info: 'Set 1 → Set 8',
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
    original_price: 320,
    description: 'Suite con piscina a sfioro e vista panoramica sul calderone. Il tramonto più famoso del mondo.',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',
    hotel_name: 'Canaves Oia Suites',
    stars: 5,
    rating: 4.9,
    nights: '7 notti',
    date_info: 'Ago 20 → Ago 27',
    tag: 'SUNSET VIEW',
    color: '#4a90d9',
  },
  {
    id: 'hotel-maldive',
    destination: 'Maldive',
    country: 'Maldive',
    price: 450,
    original_price: 780,
    description: 'Bungalow sull\'acqua cristallina. Coralli, mante e silenzi. La vacanza della vita.',
    image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
    hotel_name: 'Baros Maldives',
    stars: 5,
    rating: 5.0,
    nights: '10 notti',
    date_info: 'Nov 1 → Nov 10',
    tag: 'PARADISE',
    color: '#00b4d8',
  },
];

// Seed fallback data into Supabase if empty
export async function seedDatabaseIfEmpty() {
  try {
    const { count: flightCount } = await supabase
      .from('flights')
      .select('*', { count: 'exact', head: true });

    if (flightCount === 0) {
      await supabase.from('flights').insert(DEFAULT_FLIGHTS);
    }

    const { count: hotelCount } = await supabase
      .from('hotels')
      .select('*', { count: 'exact', head: true });

    if (hotelCount === 0) {
      await supabase.from('hotels').insert(DEFAULT_HOTELS);
    }
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

// Fetch Flights via Duffel API
export async function fetchRealFlights() {
  await seedDatabaseIfEmpty();

  const token = process.env.DUFFEL_ACCESS_TOKEN;
  if (!token || token.startsWith('YOUR_')) {
    const { data } = await supabase.from('flights').select('*');
    const list = ensureVariedImages(data || []);
    return list.map((item: any) => ({ ...item, booking_url: getAffiliateLink(item, 'flight') }));
  }

  try {
    const origin = 'MXP';
    // Mix of European LCC routes (easyJet is on Duffel via Direct Connect;
    // Ryanair is not distributed by Duffel) and long-haul picks.
    const destinations = [
      { code: 'BCN', name: 'Barcellona', country: 'Spagna', color: '#e05b7b', tag: 'WEEKEND' },
      { code: 'LGW', name: 'Londra', country: 'Regno Unito', color: '#3a6fbf', tag: 'BEST PRICE' },
      { code: 'LIS', name: 'Lisbona', country: 'Portogallo', color: '#e08030', tag: 'HOT DEAL' },
      { code: 'NRT', name: 'Tokyo', country: 'Giappone', color: '#e05b7b', tag: 'TOP PICK' },
      { code: 'JFK', name: 'New York', country: 'Stati Uniti', color: '#3a6fbf', tag: 'BEST PRICE' },
    ];

    const departureDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Query all destinations in parallel: each offer_request takes seconds and
    // this runs during SSR, so a sequential loop multiplies the TTFB.
    const perDestination = await Promise.all(destinations.map(async (dest) => {
      try {
        const res = await fetch(DUFFEL_OFFERS_URL, {
          method: 'POST',
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
        const offers = json.data?.offers || [];

        return offers.slice(0, 2).map((offer: any, idx: number) => {
          const price = Math.round(Number(offer.total_amount));
          const originalPrice = Math.round(price * 1.35);
          const airlineName = offer.owner?.name || 'Airline';
          const durationRaw = offer.slices?.[0]?.duration || '12h';
          const duration = durationRaw.replace('PT', '').toLowerCase();
          const dateStr = new Date(departureDate).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' });

          return {
            id: `flight-duffel-${dest.code}-${offer.id}`,
            destination: dest.name,
            country: dest.country,
            dest_code: dest.code,
            price,
            original_price: originalPrice,
            description: `Volo reale MXP → ${dest.code} trovato via Duffel. Compagnia: ${airlineName}. Durata: ${duration}.`,
            image: getDestinationImage(dest.name, `${dest.code}-${offer.id}-${idx}`),
            airline: airlineName,
            duration: duration,
            date_info: `${dateStr} (Solo andata)`,
            rating: Number((4.6 + Math.random() * 0.4).toFixed(1)),
            tag: idx === 0 ? 'BEST RATE' : dest.tag,
            color: dest.color,
          };
        });
      } catch (err) {
        console.warn(`Failed fetching flights from Duffel for ${dest.code}:`, err);
        return [];
      }
    }));

    const allFetchedFlights: any[] = perDestination.flat();

    if (allFetchedFlights.length > 0) {
      for (const flight of allFetchedFlights) {
        // dest_code is not a column of the flights table — keep it in-memory only
        const { dest_code, ...row } = flight;
        await supabase.from('flights').upsert(row);
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

// Fetch Hotels via RapidAPI (TripAdvisor/Booking)
export async function fetchRealHotels() {
  await seedDatabaseIfEmpty();

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
          headers: {
            'x-rapidapi-key': rapidApiKey,
            'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com'
          }
        });

        if (res.ok) {
          const json = await res.json();
          const hotelData = json.data?.data || [];
          
          hotelData.slice(0, 2).forEach((hotel: any, idx: number) => {
            const hotelName = hotel.title || hotel.name || 'Luxury Hotel';
            const rawRating = hotel.bubbleRating?.rating || 4.5;
            const rating = Number(rawRating.toFixed(1));
            
            const basePrice = dest.geoId === '293922' ? 450 : 180;
            const price = basePrice + Math.floor(Math.random() * 80) - 20;
            const originalPrice = Math.round(price * 1.45);
            
            const dateStr = new Date(checkInDate).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' });
            const dateEndStr = new Date(checkOutDate).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' });

            allFetchedHotels.push({
              id: `hotel-rapid-${hotel.hotelId || Math.random().toString(36).substr(2, 9)}`,
              destination: dest.name,
              country: dest.country,
              price,
              original_price: originalPrice,
              description: `Soggiorno eccezionale presso ${hotelName} situato in una delle aree più ambite di ${dest.name}.`,
              image: getDestinationImage(dest.name, `${dest.geoId}-${hotel.hotelId || idx}`),
              hotel_name: hotelName,
              stars: 5,
              rating: rating,
              nights: '7 notti',
              date_info: `${dateStr} → ${dateEndStr}`,
              tag: idx === 0 ? dest.tag : 'TOP CHOICE',
              color: dest.color,
            });
          });
        }
      } catch (err) {
        console.warn(`Failed fetching hotels for ${dest.name} via RapidAPI:`, err);
      }
    }

    if (allFetchedHotels.length > 0) {
      for (const hotel of allFetchedHotels) {
        await supabase.from('hotels').upsert(hotel);
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
