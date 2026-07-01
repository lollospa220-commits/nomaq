import { supabase } from './supabaseClient';

const AMADEUS_OAUTH_URL = 'https://test.api.amadeus.com/v1/security/oauth2/token';
const AMADEUS_FLIGHTS_URL = 'https://test.api.amadeus.com/v2/shopping/flight-offers';

interface AmadeusTokenResponse {
  access_token: string;
  expires_in: number;
}

// In-memory token caching
let cachedToken: string | null = null;
let tokenExpiryTime = 0;

async function getAmadeusToken(): Promise<string | null> {
  const clientId = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

  if (!clientId || !clientSecret || clientId.startsWith('YOUR_') || clientSecret.startsWith('YOUR_')) {
    return null; // Fallback to mock seeder
  }

  // Check if token is still valid (with 10-second buffer)
  if (cachedToken && Date.now() < tokenExpiryTime - 10000) {
    return cachedToken;
  }

  try {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    const res = await fetch(AMADEUS_OAUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!res.ok) {
      console.warn('Failed to fetch Amadeus OAuth token:', res.statusText);
      return null;
    }

    const data = (await res.json()) as AmadeusTokenResponse;
    cachedToken = data.access_token;
    tokenExpiryTime = Date.now() + data.expires_in * 1000;
    return cachedToken;
  } catch (err) {
    console.error('Error fetching Amadeus token:', err);
    return null;
  }
}

// Fallback seed data
const DEFAULT_FLIGHTS = [
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

// Fetch Flights (checks Amadeus API or falls back to DB cache / seeder)
export async function fetchRealFlights() {
  await seedDatabaseIfEmpty();

  const token = await getAmadeusToken();
  if (!token) {
    // If no token, return cached flights from Supabase
    const { data } = await supabase.from('flights').select('*');
    return data || [];
  }

  try {
    // Let's search flights (e.g. Milan MIL to Tokyo TYO for demo purposes)
    const url = `${AMADEUS_FLIGHTS_URL}?originLocationCode=MXP&destinationLocationCode=NRT&departureDate=2026-09-10&adults=1&max=3`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.warn('Amadeus API Flight search failed:', res.statusText);
      const { data } = await supabase.from('flights').select('*');
      return data || [];
    }

    const json = await res.json();
    const flightOffers = json.data || [];

    if (flightOffers.length === 0) {
      const { data } = await supabase.from('flights').select('*');
      return data || [];
    }

    // Map Amadeus Flight Offers to our DB schema
    const mappedFlights = flightOffers.map((offer: any, idx: number) => {
      const price = Math.round(Number(offer.price.grandTotal));
      const originalPrice = Math.round(price * 1.4); // Mock original price for discount comparison
      const segment = offer.itineraries[0].segments[0];
      const duration = offer.itineraries[0].duration.replace('PT', '').toLowerCase();

      return {
        id: `flight-amadeus-${offer.id}`,
        destination: 'Tokyo',
        country: 'Giappone',
        price,
        original_price: originalPrice,
        description: `Volo reale trovato in tempo reale. Compagnia operatrice: ${segment.carrierCode}. Durata totale: ${duration}.`,
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
        airline: segment.carrierCode,
        duration: duration,
        date_info: 'Set 10 (Sola andata)',
        rating: 4.8,
        tag: idx === 0 ? 'BEST RATE' : 'FLIGHT DEAL',
        color: '#e05b7b',
      };
    });

    // Update / cache in Supabase table
    for (const flight of mappedFlights) {
      await supabase.from('flights').upsert(flight);
    }

    return mappedFlights;
  } catch (err) {
    console.error('Error fetching from Amadeus Flight Offers API:', err);
    const { data } = await supabase.from('flights').select('*');
    return data || [];
  }
}

// Fetch Hotels
export async function fetchRealHotels() {
  await seedDatabaseIfEmpty();
  
  // Return cached hotel deals from database
  const { data } = await supabase.from('hotels').select('*');
  return data || [];
}
