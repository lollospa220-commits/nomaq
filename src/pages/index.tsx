import Head from 'next/head';
import SEO from '@/components/SEO';
import Link from 'next/link';
import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Clock, ChevronDown, Search, Plane, Hotel, Globe, Sparkles, ArrowRight, Snowflake, Tag, Palmtree, Wand2, Map, Landmark } from 'lucide-react';
import { useRouter } from 'next/router';
import { useAppState, TabId } from '@/context/AppState';
import { TranslationKey } from '@/i18n/translations';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';
import { supabase } from '@/utils/supabaseClient';
import { fetchRealFlights, fetchRealHotels } from '@/utils/travelApi';
import { getDestinationImage } from '@/utils/destinationImages';
import { buildKiwiDeepLink } from '@/utils/kiwiLink';
import { suggestOrigins, resolveOriginIataLocal, Airport } from '@/utils/airports';
import { SITE_URL } from '@/utils/siteUrl';
import { formatFlight, formatHotel } from '@/utils/normalizeItem';
import ThreeSparklesIcon from '@/components/ThreeSparklesIcon';
import ProfiloView from '@/components/views/ProfiloView';
import ConciergeView from '@/components/views/ConciergeView';
import DetailSheet from '@/components/DetailSheet';
import NomaqLogo from '@/components/NomaqLogo';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import DesktopNav from '@/components/DesktopNav';
import FaqSection from '@/components/FaqSection';
import FeedCard, { FeedCardSkeleton } from '@/components/FeedCard';
import ToastNotification from '@/components/ToastNotification';
import DateRangePicker from '@/components/DateRangePicker';

// Globo WebGL (Globe.gl/three.js): code-split e solo lato client (ssr:false),
// caricato dopo il first paint così non pesa sul bundle iniziale.
const GlobeGL = dynamic(() => import('@/components/GlobeGL'), { ssr: false });

// RadarView (tab Drops in produzione): estratto in un chunk separato → non pesa
// sul bundle iniziale della home.
const RadarView = dynamic(() => import('@/components/views/RadarView'));

// TripPlanView (piano AI): appare solo dopo una ricerca "trip" → chunk separato.
const TripPlanView = dynamic(() => import('@/components/views/TripPlanView'));

// StaysView (tab Soggiorna): chunk separato ma SSR attivo (ssr default) → la
// pagina /soggiorna resta renderizzata server-side per la SEO.
const StaysView = dynamic(() => import('@/components/views/StaysView'));

// DropsView legacy: renderizzata SOLO nel ramo E2E (in prod il tab Drops usa
// RadarView) → chunk separato, così non pesa mai sul bundle degli utenti reali.
const DropsView = dynamic(() => import('@/components/views/DropsViewLegacy'));




/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
// Destinazioni popolari per l'autocomplete della ricerca (gap #1 vs i leader:
// prima il campo era testo libero senza suggerimenti). city = ciò che si cerca.
const POPULAR_DESTINATIONS: { city: string; country: string }[] = [
  { city: 'Parigi', country: 'Francia' }, { city: 'Londra', country: 'Regno Unito' },
  { city: 'New York', country: 'Stati Uniti' }, { city: 'Tokyo', country: 'Giappone' },
  { city: 'Barcellona', country: 'Spagna' }, { city: 'Roma', country: 'Italia' },
  { city: 'Amsterdam', country: 'Paesi Bassi' }, { city: 'Lisbona', country: 'Portogallo' },
  { city: 'Berlino', country: 'Germania' }, { city: 'Praga', country: 'Rep. Ceca' },
  { city: 'Vienna', country: 'Austria' }, { city: 'Madrid', country: 'Spagna' },
  { city: 'Dubai', country: 'Emirati Arabi' }, { city: 'Bali', country: 'Indonesia' },
  { city: 'Santorini', country: 'Grecia' }, { city: 'Atene', country: 'Grecia' },
  { city: 'Istanbul', country: 'Turchia' }, { city: 'Marrakech', country: 'Marocco' },
  { city: 'Bangkok', country: 'Thailandia' }, { city: 'Maldive', country: 'Maldive' },
  { city: 'Reykjavik', country: 'Islanda' }, { city: 'Copenaghen', country: 'Danimarca' },
  { city: 'Budapest', country: 'Ungheria' }, { city: 'Dublino', country: 'Irlanda' },
  { city: 'Porto', country: 'Portogallo' }, { city: 'Siviglia', country: 'Spagna' },
  { city: 'Napoli', country: 'Italia' }, { city: 'Milano', country: 'Italia' },
  { city: 'Venezia', country: 'Italia' }, { city: 'Firenze', country: 'Italia' },
  { city: 'Nizza', country: 'Francia' }, { city: 'Ibiza', country: 'Spagna' },
  { city: 'Malta', country: 'Malta' }, { city: 'Zanzibar', country: 'Tanzania' },
  { city: 'Sharm el-Sheikh', country: 'Egitto' }, { city: 'Cancún', country: 'Messico' },
  { city: 'Miami', country: 'Stati Uniti' }, { city: 'Singapore', country: 'Singapore' },
];

const normalizeSearch = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

// Titolo + description per tab: ogni tab è una route SSR distinta (initialTab
// impostato in getServerSideProps) → l'HTML iniziale che Google indicizza porta
// meta corretti, non identici su tutti i tab.
type SeoEntry = { title: string; description: string };
const SEO_META: Record<string, Record<'it' | 'en', SeoEntry>> = {
  'vola-vola': {
    it: {
      title: "Nomaq — Voli e hotel al prezzo giusto, scelti dall'AI",
      description: "Nomaq confronta tariffe indicative di voli e hotel dai partner selezionati e compone il viaggio con l'AI. Il prezzo finale è sul sito del partner.",
    },
    en: {
      title: 'Nomaq — Flights & hotels at the right price, AI-picked',
      description: "Nomaq compares indicative flight and hotel fares from selected partners and builds your trip with AI. The final price is on the partner's site.",
    },
  },
  soggiorna: {
    it: {
      title: 'Soggiorni e hotel al prezzo giusto — Nomaq',
      description: "Hotel e soggiorni selezionati dall'AI al miglior rapporto qualità/prezzo. Cerca qualsiasi destinazione e prenota senza pensieri.",
    },
    en: {
      title: 'Stays & hotels at the right price — Nomaq',
      description: 'AI-curated hotels and stays at the best value. Search any destination and book with zero hassle.',
    },
  },
  drops: {
    it: {
      title: 'Radar prezzi voli — Nomaq',
      description: "Il Radar di Nomaq confronta le tariffe dei partner ed evidenzia i cali di prezzo che rileva. Prezzi indicativi; il prezzo finale è sul sito del partner.",
    },
    en: {
      title: 'Flight price radar — Nomaq',
      description: "The Nomaq Radar compares partner fares and highlights the price drops it detects. Indicative prices; the final price is on the partner's site.",
    },
  },
  salvati: {
    it: {
      title: 'Concierge AI di viaggio — Nomaq',
      description: 'Il Concierge AI di Nomaq pianifica il viaggio perfetto: ristoranti, itinerari, trasporti, su misura per te.',
    },
    en: {
      title: 'AI travel Concierge — Nomaq',
      description: "Nomaq's AI Concierge plans your perfect trip: restaurants, itineraries, transport, tailored to you.",
    },
  },
  profilo: {
    it: {
      title: 'Il tuo profilo — Nomaq',
      description: 'Gestisci il tuo profilo Nomaq, i viaggi salvati e le preferenze.',
    },
    en: {
      title: 'Your profile — Nomaq',
      description: 'Manage your Nomaq profile, saved trips and preferences.',
    },
  },
};

export default function Home({
  query,
  resolvedUrl,
  isE2E,
  noindex,
  initialFlights,
  initialHotels,
  initialSimulatedDrops,
  initialNotifications,
  initialWaitlistCount,
  initialWaitlistError,
  initialWaitlistSubmitted,
  initialWaitlistEmail,
  kiwiAffiliateId,
}: any) {
  const { activeTab, setActiveTab, savedItems, toggleSaveItem } = useAppState();
  const { t, lang } = useLanguage();
  const { user, profile } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);
  const [aiQuery, setAiQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  const [showAllDeals, setShowAllDeals] = React.useState(false);
  const [sortBy, setSortBy] = React.useState<'relevance' | 'price-asc' | 'price-desc'>('relevance');
  const [priceFilter, setPriceFilter] = React.useState<'all' | 'lt100' | 'mid' | 'high' | 'gt600'>('all');
  const [detailItem, setDetailItem] = React.useState<any | null>(null);
  const [activeSearch, setActiveSearch] = React.useState('');
  const [aiSummary, setAiSummary] = React.useState('');
  const [aiPackage, setAiPackage] = React.useState<{ flight: any; hotel: any; reasoning: string } | null>(null);
  const [tripPlan, setTripPlan] = React.useState<any>(null);
  // Monotonic id per search: a stale response must never overwrite the
  // result of a newer search fired while it was still in flight.
  const searchSeqRef = React.useRef(0);

  const handleNavigate = (id: TabId) => {
    setActiveTab(id);
    router.push(id === 'vola-vola' ? '/' : `/${id}`, undefined, { shallow: true });
  };

  // Parole troppo generiche per contare come match: da sole farebbero
  // "corrispondere" quasi ogni voce del catalogo senza dire nulla di utile.
  const SEARCH_STOPWORDS = new Set([
    'a', 'ai', 'al', 'alla', 'con', 'da', 'dei', 'del', 'di', 'e', 'i', 'il',
    'in', 'la', 'le', 'lo', 'per', 'sotto', 'un', 'una', 'vacanza', 'vacanze',
    'volo', 'voli', 'weekend', 'the', 'to', 'for',
  ]);

  // Fallback deep-link: usato quando manca MISTRAL_API_KEY / l'AI fallisce E
  // nessuna voce del catalogo corrisponde. Invece di rimostrare i preset
  // (irrilevanti per la meta cercata) generiamo due card azionabili "Cerca
  // voli/hotel a {q}" con deep-link reali Kiwi.com / Booking.com. Nessun prezzo
  // inventato: price è null → FeedCard mostra "Cerca" al posto di "€".
  const buildFallbackCards = (destQuery: string) => {
    const q = destQuery.trim();
    const img = getDestinationImage(q, q);
    return {
      flights: [{
        id: `fallback-flight-${q}`, type: 'flight',
        destination: `Cerca voli per ${q}`,
        description: `Apri la ricerca voli per ${q} su Kiwi.com e trova le date migliori.`,
        price: null, originalPrice: null, airline: 'Kiwi.com',
        image: img, booking_url: buildKiwiDeepLink('napoli', q), tag: 'CERCA',
      }],
      hotels: [{
        id: `fallback-hotel-${q}`, type: 'hotel',
        destination: `Cerca hotel a ${q}`,
        description: `Apri la ricerca hotel a ${q} su Booking.com per le tue date.`,
        price: null, originalPrice: null, hotelName: q,
        image: img,
        booking_url: `https://www.booking.com/searchresults.html?${new URLSearchParams({ ss: q, group_adults: '2' }).toString()}`,
        tag: 'CERCA',
      }],
    };
  };

  // Fallback locale AI-less: confronta singole parole significative (non l'intera
  // frase) contro il catalogo reale; su zero match usa le card deep-link sopra.
  const localFilter = (searchQuery: string) => {
    const tokens = searchQuery
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length >= 3 && !SEARCH_STOPWORDS.has(w));

    const matches = (item: any) => {
      if (tokens.length === 0) return true;
      const haystack = `${item.destination} ${item.description} ${item.country || ''}`.toLowerCase();
      return tokens.some((tok) => haystack.includes(tok));
    };

    const filteredFlights = allFlights.filter(matches);
    const filteredHotels = allHotels.filter(matches);

    if (filteredFlights.length === 0 && filteredHotels.length === 0) {
      const fb = buildFallbackCards(searchQuery);
      setFlights(fb.flights);
      setHotels(fb.hotels);
      setAiSummary(t('noExactMatch'));
    } else {
      setFlights(filteredFlights);
      setHotels(filteredHotels);
    }
  };

  const handleSearch = async (searchQuery: string) => {
    const seq = ++searchSeqRef.current;
    setIsSearching(true);
    const trimmed = searchQuery.trim();

    if (!trimmed) {
      setAiSummary('');
      setAiPackage(null);
      setTripPlan(null);
      setSearchFlights([]);
      setSearchHotels([]);
      // La barra di ricerca NON tocca "Selezionati per te" (deals). In E2E il
      // feed filtrabile va comunque ripristinato.
      if (isE2E) { setFlights(allFlights); setHotels(allHotels); }
      setActiveSearch('');
      setIsSearching(false);
      return;
    }

    // Deterministic path for E2E: no external AI calls in tests
    if (isE2E) {
      setTripPlan(null);
      localFilter(trimmed);
      setActiveSearch(trimmed);
      setIsSearching(false);
      return;
    }

    try {
      const res = await fetch('/api/ai-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: trimmed,
          flights: allFlights.slice(0, 60),
          hotels: allHotels.slice(0, 60),
          lang,
        }),
      });
      if (!res.ok) throw new Error('ai-trip unavailable');
      const data = await res.json();
      if (seq !== searchSeqRef.current) return; // a newer search took over

      // NB: nessun ramo tocca `deals` ("Selezionati per te"): la barra di
      // ricerca è completamente separata e scrive solo su tripPlan / area
      // risultati ricerca (searchFlights/searchHotels) / riepilogo AI.
      if (data.mode === 'trip' && data.plan) {
        // Itinerario AI a 360°: overlay che sostituisce la home.
        setTripPlan({ ...data.plan, __seq: seq });
        setAiSummary('');
        setAiPackage(null);
        setSearchFlights([]);
        setSearchHotels([]);
      } else if (data.mode === 'destination' && ((data.flights?.length || 0) > 0 || (data.hotels?.length || 0) > 0)) {
        // Ricerca destinazione: card reali per un luogo cercato, mostrate in
        // un'area DEDICATA sopra "Selezionati per te" (già in forma FeedCard).
        setTripPlan(null);
        setAiPackage(null);
        setSearchFlights(data.flights || []);
        setSearchHotels(data.hotels || []);
        setAiSummary(data.summary || '');
      } else {
        // Ricerca semplice: riepilogo AI + eventuale pacchetto suggerito.
        setTripPlan(null);
        setSearchFlights([]);
        setSearchHotels([]);
        setAiSummary(data.summary || '');

        if (data.package) {
          const pf = allFlights.find((f) => f.id === data.package.flightId);
          const ph = allHotels.find((h) => h.id === data.package.hotelId);
          setAiPackage(pf && ph ? { flight: pf, hotel: ph, reasoning: data.package.reasoning || '' } : null);
        } else {
          setAiPackage(null);
        }
      }
    } catch (e) {
      if (seq !== searchSeqRef.current) return;
      setTripPlan(null);
      setAiPackage(null);
      if (isE2E) {
        // In E2E il fallback filtra il feed (comportamento atteso dai test).
        setAiSummary('');
        localFilter(trimmed);
      } else {
        // Reale: mai toccare "Selezionati per te". Card deep-link Kiwi/Booking
        // per il luogo cercato nell'area risultati dedicata.
        const fb = buildFallbackCards(trimmed);
        setSearchFlights(fb.flights);
        setSearchHotels(fb.hotels);
        setAiSummary(t('noExactMatch'));
      }
    }

    if (seq !== searchSeqRef.current) return;
    setActiveSearch(trimmed);
    setIsSearching(false);
  };

  const [notifications, setNotifications] = React.useState<any[]>(initialNotifications || []);
  const [simulatedDrops, setSimulatedDrops] = React.useState<any[]>(initialSimulatedDrops || []);

  // allFlights/allHotels hold the full catalog; flights/hotels hold the
  // (possibly search-filtered) displayed subset. Keeping them separate means
  // a second search filters the real catalog again instead of an
  // already-shrunk result set.
  const [allFlights, setAllFlights] = React.useState<any[]>(initialFlights || []);
  const [allHotels, setAllHotels] = React.useState<any[]>(initialHotels || []);
  const [flights, setFlights] = React.useState<any[]>(initialFlights || []);
  const [hotels, setHotels] = React.useState<any[]>(initialHotels || []);

  // "Selezionati per te" (griglia home reale). Stato DEDICATO e indipendente
  // dalla barra di ricerca: lo aggiornano SOLO i selettori Origine + Date qui
  // sotto, mai handleSearch. Init = feed SSR; poi sostituito dalle tariffe reali
  // per l'origine/date scelte (ogni card porta già il booking_url Kiwi coerente).
  const [deals, setDeals] = React.useState<any[]>(initialFlights || []);

  // Risultati della BARRA DI RICERCA in modalità "destinazione" (card reali per
  // un luogo cercato). Vivono in un'area separata: non toccano mai `deals`.
  const [searchFlights, setSearchFlights] = React.useState<any[]>([]);
  const [searchHotels, setSearchHotels] = React.useState<any[]>([]);

  // Selettori Origine + Date della sezione "Selezionati per te".
  const [customOrigin, setCustomOrigin] = React.useState('Napoli');
  const [customOriginIata, setCustomOriginIata] = React.useState('NAP');
  const [showOriginSug, setShowOriginSug] = React.useState(false);
  const [customDeparture, setCustomDeparture] = React.useState('');
  const [customReturn, setCustomReturn] = React.useState('');
  const [todayIso, setTodayIso] = React.useState('');
  const [isRefreshingDeals, setIsRefreshingDeals] = React.useState(false);

  const originSuggestions = React.useMemo(() => suggestOrigins(customOrigin, 6), [customOrigin]);

  const onOriginChange = (v: string) => {
    setCustomOrigin(v);
    setShowOriginSug(true);
    const iata = resolveOriginIataLocal(v);
    if (iata) setCustomOriginIata(iata);
  };

  const selectOrigin = (a: Airport) => {
    setCustomOrigin(a.city);
    setCustomOriginIata(a.iata);
    setShowOriginSug(false);
    if (customDeparture && customReturn) loadDeals(a.iata, customDeparture, customReturn);
  };

  // Carica le tariffe reali per (origine, andata, ritorno) e SOSTITUISCE la
  // griglia "Selezionati per te". Le card arrivano già con booking_url Kiwi
  // coerente (stessa rotta/date). Normalizzate con formatFlight per la UI.
  const loadDeals = async (originIata: string, dep: string, ret: string) => {
    if (!originIata || !dep || !ret) return;
    setIsRefreshingDeals(true);
    try {
      const res = await fetch(`/api/custom-flights?origin=${encodeURIComponent(originIata)}&departure=${dep}&returnDate=${ret}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) setDeals(data.map(formatFlight));
      }
    } catch (err) {
      console.error('Failed to fetch custom deals', err);
    } finally {
      setIsRefreshingDeals(false);
    }
  };

  // Invia il TESTO digitato (l'handler API risolve città/codice → IATA), così
  // funziona anche per città fuori dalla lista curata dell'autocomplete.
  const refreshDeals = () => loadDeals(customOrigin.trim() || customOriginIata, customDeparture, customReturn);
  // feedItems è derivato da deals+flights+hotels (dedup per id): copre i lookup
  // di salvataggio/Concierge anche per le card live di "Selezionati per te".
  const feedItems = React.useMemo(() => {
    // NB: `Map` qui è l'icona lucide-react (import in cima), non il costruttore:
    // dedup con Set + array per non collidere con quell'import.
    const seen = new Set<string>();
    const out: any[] = [];
    for (const it of [...deals, ...flights, ...hotels]) {
      if (it && it.id && !seen.has(it.id)) { seen.add(it.id); out.push(it); }
    }
    return out;
  }, [deals, flights, hotels]);

  const queryObj = query || {};

  React.useEffect(() => {
    setIsMounted(true);

    // I dati arrivano già via initialFlights/initialHotels (props SSR): rifetch
    // solo se le props sono vuote (upstream fallito in SSR), evitando 2 fetch +
    // 2 render ridondanti a ogni caricamento.
    if ((initialFlights?.length ?? 0) === 0) fetch('/api/flights')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map(formatFlight);
          setAllFlights(formatted);
          setFlights(formatted);
        }
      })
      .catch((err) => console.error('Error loading flights:', err));

    if ((initialHotels?.length ?? 0) === 0) fetch('/api/hotels')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const formatted = data.map(formatHotel);
          setAllHotels(formatted);
          setHotels(formatted);
        }
      })
      .catch((err) => console.error('Error loading hotels:', err));

    // Parse initial tab from URL
    const pathname = resolvedUrl ? resolvedUrl.split('?')[0] : '';
    if (pathname === '/soggiorna') setActiveTab('soggiorna');
    else if (pathname === '/drops') setActiveTab('drops');
    else if (pathname === '/salvati') setActiveTab('salvati');
    else if (pathname === '/profilo' || pathname === '/waitlist') setActiveTab('profilo');
  }, []);

  // Default Origine/Date + auto-caricamento dei deal reali (solo prod, una volta).
  // Imposta il prossimo weekend (ven → dom) e carica le tariffe reali da Napoli,
  // così "Selezionati per te" mostra da subito card coerenti con Kiwi
  // (rotta/date/prezzo). Le date si calcolano nel client (niente mismatch SSR).
  React.useEffect(() => {
    if (isE2E) return;
    const today = new Date();
    setTodayIso(today.toISOString().slice(0, 10));
    let daysToFri = (5 - today.getDay() + 7) % 7;
    if (daysToFri === 0) daysToFri = 7; // sempre un venerdì futuro
    const fri = new Date(today); fri.setDate(today.getDate() + daysToFri);
    const sun = new Date(fri); sun.setDate(fri.getDate() + 2);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    const dep = iso(fri), ret = iso(sun);
    setCustomDeparture(dep);
    setCustomReturn(ret);
    loadDeals('NAP', dep, ret);
  }, []);

  React.useEffect(() => {
    if (!isMounted || feedItems.length === 0) return;

    // Parse query state for E2E tests
    if (queryObj.saved) {
      queryObj.saved.split(',').forEach((id: string) => toggleSaveItem(id));
    }
    if (queryObj.drops) {
      const drops: any[] = [];
      queryObj.drops.split(',').forEach((d: string) => {
        const [itemId, priceStr] = d.split(':');
        const item = feedItems.find((i) => i.id === itemId);
        if (item) {
          const newPrice = Number(priceStr);
          drops.push({
            id: `drop-${itemId}-test`,
            destination: `${item.destination} → Milano`,
            oldPrice: item.price,
            newPrice,
            dropPercent: Math.round(((item.price - newPrice) / item.price) * 100),
            airline: 'Test Airline',
            date: 'Test',
            timeAgo: 'just now',
            isNew: true,
          });
        }
      });
      setSimulatedDrops(drops);
    }
    if (queryObj.notifications) {
      queryObj.notifications.split(',').forEach((n: string) => {
        const [id, itemId, priceStr] = n.split(':');
        const item = feedItems.find((i) => i.id === itemId);
        if (item) {
          const newPrice = Number(priceStr);
          const dp = Math.round(((item.price - newPrice) / item.price) * 100);
          setNotifications((prev) => [
            ...prev,
            { id, itemId, oldPrice: item.price, newPrice, dropPercentage: dp, message: `Price drop! ${item.destination} ora €${newPrice} (-${dp}%)` },
          ]);
        }
      });
    }
    if (queryObj.email) {
      setActiveTab('profilo');
    }
  }, [isMounted, feedItems]);

  const currentTab = activeTab;
  const currentSaved = savedItems;
  // Home (vola-vola, non in modalità piano) mostra il globo scuro dietro:
  // lo sheet è trasparente e i testi "nudi" (titolo FAQ, footer) diventano chiari.
  const isDarkBackground = true;

  const handleSimulateDrop = () => {
    const allFeed = currentTab === 'vola-vola' ? deals : currentTab === 'soggiorna' ? hotels : feedItems;
    // Escludi le card senza prezzo numerico (es. card di fallback "Cerca …"):
    // il calcolo del drop simulato produrrebbe altrimenti NaN.
    const pool = (allFeed.length > 0 ? allFeed : feedItems).filter((i: any) => typeof i.price === 'number');
    if (pool.length === 0) return;
    const item = pool[Math.floor(Math.random() * pool.length)];
    const dropAmount = Math.floor(Math.random() * 60) + 20;
    const newPrice = Math.max(1, item.price - dropAmount);
    const dp = Math.round(((item.price - newPrice) / item.price) * 100);
    const notifId = `notif-${Date.now()}`;

    setSimulatedDrops((prev) => [
      {
        id: `drop-${Date.now()}`,
        destination: `${item.destination} → Milano`,
        oldPrice: item.price,
        newPrice,
        dropPercent: dp,
        airline: 'Nomaq Radar',
        date: 'Prossimi mesi',
        timeAgo: 'ora',
        isNew: true,
      },
      ...prev,
    ]);

    setNotifications((prev) => [
      ...prev,
      {
        id: notifId,
        message: `Drop: ${item.destination} ora solo €${newPrice}! Era €${item.price} (-${dp}%)`,
      },
    ]);
  };

  const dismissNotif = (id: string) => setNotifications((prev) => prev.filter((n) => n.id !== id));

  // Feed = only rows coming from the API layer. Mock deals must never be
  // mixed into the live feed: they carry invented prices indistinguishable
  // from real offers (the padding this replaced was the primary source of
  // "prices don't match" complaints).
  // "Selezionati per te" (vola-vola) legge dallo stato dedicato `deals`
  // (indipendente dalla ricerca). Fallback al feed SSR/refetch se i deal live
  // non sono ancora pronti/vuoti. In E2E resta sul feed filtrabile `flights`.
  const feedByTab = currentTab === 'vola-vola'
    ? (isE2E ? flights : (deals.length > 0 ? deals : flights))
    : hotels;

  // Vista del feed = filtro prezzo + ordinamento. Non muta feedByTab.
  // Filtro attivo → esclude le card senza prezzo (es. "Cerca…"). Ordinamento
  // "Consigliati" = ordine originale; i prezzi null vanno sempre in fondo.
  const displayedFeed = React.useMemo(() => {
    const inBucket = (p: number) => {
      switch (priceFilter) {
        case 'lt100': return p < 100;
        case 'mid': return p >= 100 && p < 300;
        case 'high': return p >= 300 && p < 600;
        case 'gt600': return p >= 600;
        default: return true;
      }
    };
    let list = priceFilter === 'all'
      ? feedByTab
      : feedByTab.filter((i: any) => typeof i?.price === 'number' && inBucket(i.price));
    if (sortBy !== 'relevance') {
      const dir = sortBy === 'price-asc' ? 1 : -1;
      list = [...list].sort((a: any, b: any) => {
        const pa = typeof a?.price === 'number' ? a.price : null;
        const pb = typeof b?.price === 'number' ? b.price : null;
        if (pa === null && pb === null) return 0;
        if (pa === null) return 1;
        if (pb === null) return -1;
        return (pa - pb) * dir;
      });
    }
    return list;
  }, [feedByTab, sortBy, priceFilter]);

  // Dynamic greeting: personalized when logged in, generic otherwise
  const firstName = (
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? String(user.email).split('@')[0] : '')
  )
    .trim()
    .split(/\s+/)[0];
  const greeting = user && firstName
    ? `${t('welcomeBack')}, ${firstName}`
    : t('welcome');

  // Quick suggestion data for home view.
  // Icone monocrome a tratto sottile (1.5): un solo accento (Sorprendimi),
  // il resto neutro — niente arcobaleno di pallini colorati.
  const quickSuggestions = [
    {
      icon: <Wand2 className="w-4 h-4 text-nomaq-indigo" strokeWidth={1.5} />,
      text: t('surpriseMe'),
      isSurprise: true,
    },
    {
      icon: <Plane className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('flightsUnder100'),
    },
    {
      icon: <MapPin className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('oneWayJapan'),
    },
    {
      icon: <Landmark className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('weekendParis'),
    },
    {
      icon: <Palmtree className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('beachHolidays'),
    },
    {
      icon: <Snowflake className="w-4 h-4 text-slate-400" strokeWidth={1.5} />,
      text: t('skiTrips'),
    },
  ];

  // Seconda riga del marquee (scorre in senso opposto): sole label, tono
  // destinazione/vibe, nessuna icona — così le due righe non sembrano gemelle.
  const marqueeRowB = [
    t('chipCityBreak'), t('chipLastMinute'), t('chipRomantic'),
    t('chipTropical'), t('chipUnder300'), t('chipAurora'),
  ];
  const surpriseQueries = [
    'Weekend a Parigi sotto i 150€',
    'Spiaggia tropicale a Dicembre',
    'Gita in montagna low cost',
    'Volo diretto last minute',
    'Migliori hotel a Tokyo',
  ];
  // Autocomplete: destinazioni che matchano ciò che l'utente digita (accento-
  // insensibile), priorità a chi inizia con la query. Max 6.
  const destSuggestions = React.useMemo(() => {
    const q = normalizeSearch(aiQuery);
    if (q.length < 1) return [] as typeof POPULAR_DESTINATIONS;
    return POPULAR_DESTINATIONS
      .filter((d) => normalizeSearch(d.city).includes(q) || normalizeSearch(d.country).includes(q))
      .sort((a, b) => Number(normalizeSearch(b.city).startsWith(q)) - Number(normalizeSearch(a.city).startsWith(q)))
      .slice(0, 6);
  }, [aiQuery]);

  const runQuick = (text: string) => { setAiQuery(text); handleSearch(text); };
  const runSurprise = () => runQuick(surpriseQueries[Math.floor(Math.random() * surpriseQueries.length)]);

  // ── Structured data (JSON-LD) for rich results. FAQPage is emitted only on
  // the home tab, where the FAQ is actually rendered on the page. ──
  const jsonLdGraph: any[] = [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Nomaq',
      url: SITE_URL,
      logo: `${SITE_URL}/images/logo.png`,
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Nomaq',
      inLanguage: lang === 'en' ? 'en' : 'it',
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ];
  if (currentTab === 'vola-vola') {
    jsonLdGraph.push({
      '@type': 'FAQPage',
      mainEntity: [1, 2, 3, 4, 5, 6].map((n) => ({
        '@type': 'Question',
        name: t(`faq${n}q` as TranslationKey),
        acceptedAnswer: { '@type': 'Answer', text: t(`faq${n}a` as TranslationKey) },
      })),
    });
  }
  const jsonLd = { '@context': 'https://schema.org', '@graph': jsonLdGraph };
  const seoMeta = (SEO_META[currentTab] || SEO_META['vola-vola'])[lang];

  return (
    <>
      <SEO title={seoMeta.title} description={seoMeta.description} noindex={noindex} />
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#4F46E5" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026') }}
        />
      </Head>

      {/* WCAG 2.4.1 — skip link: first focusable element, jumps past the nav. */}
      <a href="#main-content" className="skip-link">
        Salta al contenuto
      </a>

      <main id="main-content" className="min-h-screen relative z-0" data-testid="app-root">
        {/* ── Desktop top navbar ── */}
        <DesktopNav activeTab={currentTab} onNavigate={handleNavigate} isDarkBackground={currentTab === 'vola-vola' && !tripPlan} />

        <div className={`mx-auto ${queryObj.desktop === 'true' ? 'max-w-4xl' : 'max-w-md lg:max-w-6xl'}`}>
          {/* Sfondo fisso globale (Globo + dark gradient). Rendendolo fuori dalle
              condizioni, il mondo gira ed è visibile in trasparenza da tutte le view. */}
          <div
            className="fixed inset-0 -z-[60]"
            aria-hidden="true"
            style={{ background: 'radial-gradient(ellipse 85% 60% at 50% -5%, #1b1540 0%, #0a0a1a 62%)' }}
          />
          <GlobeGL />

          {/* Hidden active view for tests */}
          <div data-testid="active-view" className="hidden">{currentTab}</div>

          {/* ── Logo Header (with language switcher) — mobile only ── */}
          <div className="relative lg:hidden">
            <NomaqLogo isDarkBackground={currentTab === 'vola-vola' && !tripPlan} />
            <div className="absolute right-5 top-1/2 -translate-y-1/2">
              <LanguageSwitcher isDarkBackground={currentTab === 'vola-vola' && !tripPlan} />
            </div>
          </div>

          {/* ── Stays view (soggiorna) — reference design ── */}
          {currentTab === 'soggiorna' && !isE2E && (
            <StaysView
              hotels={activeSearch && searchHotels.length > 0 ? searchHotels : feedByTab}
              activeSearch={activeSearch}
              isSearching={isSearching}
              onSearch={(q) => {
                setAiQuery(q);
                handleSearch(q);
              }}
              savedIds={currentSaved}
              onToggleSave={toggleSaveItem}
            />
          )}

          {/* ── AI-generated trip plan (replaces the home feed) ── */}
          {currentTab === 'vola-vola' && tripPlan && !isE2E && (
            <TripPlanView
              key={tripPlan.__seq || 0}
              plan={tripPlan}
              onClose={() => {
                setTripPlan(null);
                setAiQuery('');
                setActiveSearch('');
                setSearchFlights([]);
                setSearchHotels([]);
                setFlights(allFlights);
                setHotels(allHotels);
              }}
            />
          )}

          {/* ── Home view header (vola-vola; soggiorna only in E2E) ── */}
          {((currentTab === 'vola-vola' && (!tripPlan || isE2E)) || (currentTab === 'soggiorna' && isE2E)) && (
            <div className="px-5 lg:px-6 mb-5">
              {/* Hero: ora trasparente, fa vedere il GlobeGL fisso sul retro. */}
              <div className="relative mb-8 lg:mb-14 px-5 py-12 lg:px-10 lg:py-20">
                {/* Velo per staccare il testo dal globo e dare profondità */}


                {/* Foreground */}
                <div className="relative z-10 flex flex-col items-center text-center">
                  {/* Eyebrow */}
                  <p className="text-violet-300/70 text-[11px] font-medium uppercase tracking-[0.2em] mb-3 select-none" data-testid="home-greeting">
                    {greeting}
                  </p>
                  {/* Titolo */}
                  <h1 className="font-display text-display-md lg:text-display-lg text-white leading-tight mb-3 [text-shadow:0_4px_32px_rgba(10,8,30,0.8)]">
                    {t('headline')}<span className="italic text-violet-400">?</span>
                  </h1>
                  {/* Tagline */}
                  <p className="text-slate-300 text-sm lg:text-base leading-relaxed max-w-md mb-7">
                    {t('heroTagline')}
                  </p>

                  {/* AI Search bar */}
                  <div className={`relative w-full max-w-2xl rounded-full search-bar-glow ${isFocused ? 'active' : ''}`}>
                    <div className="bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_12px_40px_rgba(15,23,42,0.25)] relative rounded-full flex items-center h-16 pl-6 pr-2 text-left">
                        <div className="flex-1 flex flex-col justify-center min-w-0 pr-2">
                          <input
                            type="text"
                            value={aiQuery}
                            onChange={(e) => setAiQuery(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleSearch(aiQuery);
                              }
                            }}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                            placeholder={t('searchPlaceholder')}
                            className="w-full bg-transparent border-none outline-none text-slate-800 text-base leading-snug font-normal placeholder-slate-400 focus:ring-0 focus:outline-none"
                          />
                        </div>

                        {/* Separator */}
                        <div className="h-6 w-px bg-slate-100 mx-3" />

                        {/* Right Sparkles Button */}
                        <button
                          onClick={() => handleSearch(aiQuery)}
                          disabled={isSearching}
                          aria-label={t('searchNow')}
                          className="w-12 h-12 flex items-center justify-center flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200 focus:outline-none"
                        >
                          {isSearching ? (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-nomaq-violet to-nomaq-indigo flex items-center justify-center shadow-soft">
                              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-white border border-slate-100 shadow-soft flex items-center justify-center">
                              <ThreeSparklesIcon className="w-7 h-7 text-nomaq-navy" />
                            </div>
                          )}
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-400 text-center mt-2 px-2">{t('aiPrivacyNotice')}</p>

                      {/* Dropdown ricerche recenti */}
                    {isFocused && (
                      <div className="liquid-glass-light backdrop-blur-xl backdrop-saturate-150 absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl p-4 text-left animate-fade-in">
                        {destSuggestions.length > 0 ? (
                          <>
                            <h3 className="text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">{t('destinationsLabel')}</h3>
                            <div className="flex flex-col gap-1" data-testid="dest-suggestions">
                              {destSuggestions.map((d) => (
                                <button
                                  key={d.city}
                                  onMouseDown={() => runQuick(d.city)}
                                  className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-2 text-sm transition-colors w-full text-left"
                                >
                                  <MapPin className="w-4 h-4 text-nomaq-indigo flex-shrink-0" strokeWidth={1.5} />
                                  <span className="truncate"><span className="font-semibold text-nomaq-navy">{d.city}</span><span className="text-slate-400"> · {d.country}</span></span>
                                </button>
                              ))}
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="text-xs font-semibold text-slate-400 mb-2.5 uppercase tracking-wider">{t('continueWhere')}</h3>
                            <div className="flex flex-col gap-2">
                              <button
                                onMouseDown={() => runQuick(t('recentSearch1'))}
                                className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-2 text-xs text-slate-600 transition-colors w-full text-left"
                              >
                                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="truncate">{t('recentSearch1')}</span>
                              </button>
                              <button
                                onMouseDown={() => runQuick(t('recentSearch2'))}
                                className="flex items-center gap-2.5 hover:bg-slate-50 rounded-lg p-2 text-xs text-slate-600 transition-colors w-full text-left"
                              >
                                <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" strokeWidth={1.5} />
                                <span className="truncate">{t('recentSearch2')}</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* AI trip generation status */}
                  {isSearching && (
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs font-semibold text-nomaq-violet animate-pulse" data-testid="trip-loading">
                      <ThreeSparklesIcon className="w-4 h-4" />
                      {t('tripLoading')}
                    </div>
                  )}

                  {/* Due righe di tag in marquee, direzioni opposte.
                      Riga A → verso destra · Riga B → verso sinistra.
                      Pausa su hover/focus per rendere i chip cliccabili. */}
                  <div className="w-full mt-8 space-y-3">
                    <div className="marquee">
                      <div className="marquee__track marquee__track--right">
                        {[...quickSuggestions, ...quickSuggestions].map((s, i) => {
                          const dup = i >= quickSuggestions.length;
                          return (
                            <button
                              key={`a-${i}`}
                              aria-hidden={dup ? 'true' : undefined}
                              tabIndex={dup ? -1 : 0}
                              onClick={() => (s.isSurprise ? runSurprise() : runQuick(s.text))}
                              className={`mr-3 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap ${
                                s.isSurprise
                                  ? 'liquid-glass liquid-glass-violet'
                                  : 'liquid-glass'
                              }`}
                            >
                              {s.icon}
                              <span className={`text-xs font-medium ${s.isSurprise ? 'text-violet-200' : 'text-slate-100'}`}>{s.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="marquee">
                      <div className="marquee__track marquee__track--left">
                        {[...marqueeRowB, ...marqueeRowB].map((label, i) => {
                          const dup = i >= marqueeRowB.length;
                          return (
                            <button
                              key={`b-${i}`}
                              aria-hidden={dup ? 'true' : undefined}
                              tabIndex={dup ? -1 : 0}
                              onClick={() => runQuick(label)}
                              className="liquid-glass mr-3 px-4 py-2.5 rounded-full text-xs font-medium text-slate-100 transition-all whitespace-nowrap"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section label row — titolo serif + conteggio + ordinamento.
                  Su mobile impila (titolo sopra, controlli sotto a piena
                  larghezza che vanno a capo) per non traboccare. */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-3 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-violet-300 flex-shrink-0" strokeWidth={1.5} />
                  <h2 className="font-display text-xl lg:text-2xl text-white truncate">{t('pickedForYou')}</h2>
                  {feedByTab.length > 0 && (
                    <span className="text-xs font-medium text-white/50 flex-shrink-0" data-testid="feed-count">
                      {displayedFeed.length} {displayedFeed.length === 1 ? t('dealWordOne') : t('dealsWord')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto lg:flex-shrink-0 lg:justify-end">
                  {/* Selettori Origine + Date di "Selezionati per te".
                      Indipendenti dalla barra di ricerca AI in alto: guidano
                      SOLO questa griglia e determinano rotta/date del link Kiwi. */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Da dove parti?"
                      value={customOrigin}
                      onChange={(e) => onOriginChange(e.target.value)}
                      onFocus={() => setShowOriginSug(true)}
                      onBlur={() => setTimeout(() => setShowOriginSug(false), 150)}
                      aria-label="Aeroporto di partenza"
                      data-testid="origin-input"
                      className="bg-white/10 hover:bg-white/20 focus:bg-white/20 text-white text-xs font-medium rounded-full px-4 py-1.5 border border-white/20 backdrop-blur-md outline-none transition-colors w-32 md:w-44 placeholder-white/50"
                    />
                    {showOriginSug && originSuggestions.length > 0 && (
                      <div
                        className="absolute left-0 top-full mt-1.5 z-50 w-60 max-h-64 overflow-y-auto rounded-2xl bg-white shadow-xl border border-slate-100 p-1.5"
                        data-testid="origin-suggestions"
                      >
                        {originSuggestions.map((a) => (
                          <button
                            key={a.iata}
                            onMouseDown={(e) => { e.preventDefault(); selectOrigin(a); }}
                            className="flex items-center gap-2 w-full text-left rounded-lg px-2.5 py-2 hover:bg-slate-50 transition-colors"
                          >
                            <Plane className="w-3.5 h-3.5 text-nomaq-indigo flex-shrink-0" strokeWidth={1.5} />
                            <span className="text-sm text-nomaq-navy font-medium truncate">{a.city}</span>
                            <span className="text-[11px] text-slate-400 ml-auto flex-shrink-0">{a.iata} · {a.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <DateRangePicker
                    departure={customDeparture}
                    returnDate={customReturn}
                    minDate={todayIso}
                    onChange={(dep, ret) => {
                      setCustomDeparture(dep);
                      setCustomReturn(ret);
                      loadDeals(customOrigin.trim() || customOriginIata, dep, ret);
                    }}
                  />
                  <button
                    onClick={refreshDeals}
                    disabled={!customOrigin.trim() || !customDeparture || !customReturn || isRefreshingDeals}
                    data-testid="refresh-deals"
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-full px-4 py-1.5 transition-colors flex items-center gap-2"
                  >
                    {isRefreshingDeals ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Cerco...
                      </>
                    ) : (
                      'Aggiorna'
                    )}
                  </button>

                  {/* Filtro fascia di prezzo */}
                  <div className="relative ml-2">
                    <select
                      aria-label={t('filterPriceLabel')}
                      data-testid="feed-filter-price"
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value as typeof priceFilter)}
                      className="appearance-none bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full pl-3 pr-7 py-1.5 border border-white/20 backdrop-blur-md outline-none cursor-pointer transition-colors"
                    >
                      <option value="all">{t('filterAllPrices')}</option>
                      <option value="lt100">&lt; €100</option>
                      <option value="mid">€100–300</option>
                      <option value="high">€300–600</option>
                      <option value="gt600">&gt; €600</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-white/70 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
                  </div>
                  {/* Ordina i risultati (Consigliati / Prezzo ↑ / Prezzo ↓) */}
                  <div className="relative">
                    <select
                      aria-label={t('sortLabel')}
                      data-testid="feed-sort"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="appearance-none bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full pl-3 pr-7 py-1.5 border border-white/20 backdrop-blur-md outline-none cursor-pointer transition-colors"
                    >
                      <option value="relevance">{t('sortRecommended')}</option>
                      <option value="price-asc">{t('sortPriceLow')}</option>
                      <option value="price-desc">{t('sortPriceHigh')}</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-white/70 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
                  </div>
                  <button
                    onClick={() => setShowAllDeals(!showAllDeals)}
                    className="hidden lg:flex items-center gap-1 text-sm font-medium text-violet-300 hover:text-white transition-colors"
                  >
                    {t('seeAllDeals')} <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Wrapper con sfondo solido per il contenuto sotto la Hero section.
              Questo garantisce che il testo scuro sia leggibile allo scroll, coprendo il globo. */}
          <div className={`relative z-10 rounded-t-[32px] pt-8 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] pb-24 lg:pb-16 ${isDarkBackground ? 'bg-transparent' : 'bg-gradient-to-b from-white/40 to-white/80 backdrop-blur-[60px] backdrop-saturate-[200]'}`}>
            {!isDarkBackground && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-t-[32px] z-[-1]">
                <div className="orb orb-1"></div>
                <div className="orb orb-2"></div>
              </div>
            )}

          {/* ── AI search summary + suggested package + destination results ──
              Area DEDICATA alla barra di ricerca: separata da "Selezionati per
              te" (griglia deals), non la altera mai. ── */}
          {!isE2E && currentTab === 'vola-vola' && !tripPlan && activeSearch && (aiSummary || aiPackage || searchFlights.length > 0 || searchHotels.length > 0) && (
            <div className="px-5 lg:px-6 mb-4" data-testid="ai-search-result">
              {aiSummary && (
                <div className="nomaq-card bg-nomaq-lavender/90 backdrop-blur-md border-nomaq-indigo/15 p-4 flex items-start gap-3 mb-3">
                  <ThreeSparklesIcon className="w-4 h-4 text-nomaq-indigo flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-nomaq-navy leading-snug">{aiSummary}</p>
                </div>
              )}
              {(searchFlights.length > 0 || searchHotels.length > 0) && (
                <div className="mb-3" data-testid="search-results">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Search className="w-4 h-4 text-nomaq-violet" strokeWidth={1.5} />
                    <span className="text-sm font-semibold text-nomaq-navy">Risultati per “{activeSearch}”</span>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...searchFlights, ...searchHotels].map((item) => (
                      <FeedCard
                        key={item.id}
                        item={item}
                        isSaved={currentSaved.includes(item.id)}
                        onToggleSave={toggleSaveItem}
                        onOpenDetail={setDetailItem}
                      />
                    ))}
                  </div>
                </div>
              )}
              {aiPackage && (
                <div data-testid="ai-package">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Wand2 className="w-4 h-4 text-nomaq-violet" />
                    <span className="text-sm font-semibold text-nomaq-navy">{t('aiPackageTitle')}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <FeedCard item={aiPackage.flight} isSaved={currentSaved.includes(aiPackage.flight.id)} onToggleSave={toggleSaveItem} onOpenDetail={setDetailItem} />
                    <FeedCard item={aiPackage.hotel} isSaved={currentSaved.includes(aiPackage.hotel.id)} onToggleSave={toggleSaveItem} onOpenDetail={setDetailItem} />
                  </div>
                  {aiPackage.reasoning && <p className="text-xs text-slate-500 leading-snug">{aiPackage.reasoning}</p>}
                </div>
              )}
            </div>
          )}

          {/* ── Feed (vola-vola; soggiorna only in E2E) ── */}
          {((currentTab === 'vola-vola' && (!tripPlan || isE2E)) || (currentTab === 'soggiorna' && isE2E)) && (
            <>
              {/* Grid collage 2x2 container */}
              <div
                className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 px-5 lg:px-6 pb-5 scrollable"
                data-testid="feed-container"
              >
                {isSearching ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <div key={`sk-${i}`} className="h-full slide-up" style={{ animationDelay: `${i * 100}ms` }} data-testid="feed-skeleton">
                      <FeedCardSkeleton />
                    </div>
                  ))
                ) : displayedFeed.length === 0 ? (
                  <div className="text-center py-16 px-5 col-span-2" data-testid="feed-empty">
                    <div className="w-16 h-16 bg-nomaq-lavender rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Plane className="w-8 h-8 text-nomaq-indigo/40" />
                    </div>
                    <p className="text-slate-500 font-semibold">{t('noOffers')}</p>
                  </div>
                ) : (
                  displayedFeed.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`h-full slide-up ${!showAllDeals && idx >= 6 ? 'lg:hidden' : ''}`}
                      style={{ animationDelay: `${(idx % 6) * 100}ms` }}
                    >
                      <FeedCard
                        item={item}
                        isSaved={currentSaved.includes(item.id)}
                        onToggleSave={toggleSaveItem}
                        onOpenDetail={setDetailItem}
                      />
                    </div>
                  ))
                )}
              </div>

              {/* FAQ */}
              <FaqSection isDarkBackground={isDarkBackground} />
            </>
          )}

          {/* ── Radar (Drops) — reference design; legacy view kept for E2E ── */}
          {currentTab === 'drops' && (
            isE2E ? (
              <div className="mx-auto w-full max-w-md lg:max-w-2xl lg:pt-8">
                <DropsView simulatedDrops={simulatedDrops} isE2E={isE2E} onSimulateDrop={handleSimulateDrop} />
              </div>
            ) : (
              <RadarView flights={allFlights} simulatedDrops={simulatedDrops} />
            )
          )}

          {/* ── Concierge (Salvati slot — E2E compatible) ── */}
          {currentTab === 'salvati' && (
            <div className="mx-auto w-full max-w-md lg:max-w-2xl lg:pt-8">
              <ConciergeView
                savedIds={currentSaved}
                allItems={feedItems}
                onUnsave={toggleSaveItem}
              />
            </div>
          )}

          {/* ── Profilo ── */}
          {currentTab === 'profilo' && (
            <div className="mx-auto w-full max-w-md lg:max-w-2xl lg:pt-8">
              <ProfiloView
                initialCount={initialWaitlistCount}
                initialError={initialWaitlistError}
                initialSubmitted={initialWaitlistSubmitted}
                initialEmail={initialWaitlistEmail}
                isE2E={isE2E}
              />
            </div>
          )}

          {/* ── Toast notifications ── */}
          {notifications.length > 0 && (
            <div
              className="fixed top-4 left-4 right-4 z-50 space-y-2 max-w-sm mx-auto"
              data-testid="toast-container"
            >
              {notifications.map((notif) => (
                <ToastNotification key={notif.id} notif={notif} onDismiss={dismissNotif} />
              ))}
            </div>
          )}

          {/* ── Footer legale (tutti i tab) — dentro il foglio chiaro così resta
              leggibile anche sopra il globo scuro della home ── */}
          <footer className="mt-10 pb-4 px-5 text-center" data-testid="legal-footer">
            <nav className={`flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs ${isDarkBackground ? 'text-white/85 text-on-globe' : 'text-slate-500'}`} aria-label="Link legali">
              <Link href="/note-legali" className="hover:text-nomaq-indigo transition-colors">{t('footerLegal')}</Link>
              <span aria-hidden="true">·</span>
              <Link href="/termini" className="hover:text-nomaq-indigo transition-colors">{t('footerTerms')}</Link>
              <span aria-hidden="true">·</span>
              <Link href="/privacy" className="hover:text-nomaq-indigo transition-colors">{t('footerPrivacy')}</Link>
              <span aria-hidden="true">·</span>
              <Link href="/cookie-policy" className="hover:text-nomaq-indigo transition-colors">{t('footerCookies')}</Link>
            </nav>
            <p className={`text-2xs mt-2 ${isDarkBackground ? 'text-white/75 text-on-globe' : 'text-slate-500'}`}>© 2026 Nomaq · nomaq061@gmail.com</p>
          </footer>
          </div>

          {/* ── Bottom Nav ── */}
          <BottomNav
            activeTab={currentTab}
            notificationsCount={notifications.length}
          />
        </div>

        {/* ── Detail sheet (dettaglio in-app al tap su una card) ── */}
        <DetailSheet item={detailItem} onClose={() => setDetailItem(null)} />
      </main>
    </>
  );
}

export async function getServerSideProps(context: any) {
  const query = context.query || {};
  const resolvedUrl = context.resolvedUrl || '';

  // Get active tab
  const pathname = resolvedUrl.split('?')[0];
  let initialTab: TabId = 'vola-vola';
  if (pathname === '/soggiorna') initialTab = 'soggiorna';
  else if (pathname === '/drops') initialTab = 'drops';
  else if (pathname === '/salvati') initialTab = 'salvati';
  else if (pathname === '/profilo' || pathname === '/waitlist') initialTab = 'profilo';

  // Parse saved items from query
  let initialSavedItems: string[] = [];
  if (query.saved) {
    initialSavedItems = query.saved.split(',').filter(Boolean);
  }

  // Load flights and hotels
  let flights: any[] = [];
  let hotels: any[] = [];

  const userAgent = context.req.headers['user-agent'] || '';
  const isE2E = Object.keys(query).some((key) =>
    ['feed', 'feed_mod', 'saved', 'drops', 'notifications', 'email', 'error', 'desktop'].includes(key)
  ) || userAgent.toLowerCase().includes('node') || userAgent.toLowerCase().includes('undici');

  if (isE2E) {
    const testFeed = [
      { id: 'flight-roma', type: 'flight', destination: 'Roma', price: 120, description: 'Direct flight to the historic capital of Italy, Roma.', image: 'roma.jpg' },
      { id: 'flight-paris', type: 'flight', destination: 'Paris', price: 150, description: 'Fly to Paris and explore the City of Light.', image: 'paris.jpg' },
      { id: 'hotel-london', type: 'hotel', destination: 'London Cozy Inn', price: 200, description: 'A cozy boutique hotel in the heart of London.', image: 'london.jpg' },
      { id: 'hotel-tokyo', type: 'hotel', destination: 'Tokyo Suite', price: 350, description: 'Luxury suite with stunning Tokyo skyline views.', image: 'tokyo.jpg' },
      { id: 'flight-ny', type: 'flight', destination: 'New York City', price: 400, description: 'Non-stop flight to JFK NYC. Experience the Big Apple!', image: 'nyc.jpg' }
    ];
    flights = testFeed.filter((item) => item.type === 'flight');
    hotels = testFeed.filter((item) => item.type === 'hotel');
  } else {
    try {
      // Parallelo: il TTFB della home = max(voli, hotel) invece della somma.
      [flights, hotels] = await Promise.all([fetchRealFlights(), fetchRealHotels()]);
    } catch (e) {
      console.error('Failed to load flights/hotels in getServerSideProps', e);
    }
  }

  // Map to common formats for server-side render. originalPrice and rating
  // pass through only when a real value exists: inventing a markup or a
  // rating here would show fake discounts/stars on every card.
  let formattedFlights = flights.map(formatFlight);
  let formattedHotels = hotels.map(formatHotel);

  // Handle empty feed override for tests
  if (query.feed === 'empty') {
    formattedFlights = [];
    formattedHotels = [];
  }

  // Parse and apply feed modifications from E2E driver
  // Clone del feed originale prima delle modifiche E2E. Calcolato SOLO quando un
  // parametro di query E2E lo richiede: prima il deep-clone dell'intero feed
  // girava a OGNI richiesta di produzione.
  const originalFeedItems = (query.feed_mod || query.drops || query.notifications)
    ? JSON.parse(JSON.stringify([...formattedFlights, ...formattedHotels]))
    : [];

  if (query.feed_mod) {
    query.feed_mod.split(';').forEach((mod: string) => {
      const [id, field, value] = mod.split(':');
      const flight = formattedFlights.find((f: any) => f.id === id);
      if (flight) {
        if (field === 'price') flight.price = Number(value);
        else if (field === 'destination') flight.destination = value;
        else if (field === 'description') flight.description = value;
        else if (field === 'image') {
          flight.image = (value === 'null' || value === 'undefined') ? null : value;
        }
      }
      const hotel = formattedHotels.find((h: any) => h.id === id);
      if (hotel) {
        if (field === 'price') hotel.price = Number(value);
        else if (field === 'destination') hotel.destination = value;
        else if (field === 'description') hotel.description = value;
        else if (field === 'image') {
          hotel.image = (value === 'null' || value === 'undefined') ? null : value;
        }
      }
    });
  }

  // Parse drops query state
  const feedItems = [...formattedFlights, ...formattedHotels];
  let initialSimulatedDrops: any[] = [];
  if (query.drops) {
    query.drops.split(',').forEach((d: string) => {
      const [itemId, priceStr] = d.split(':');
      const item = originalFeedItems.find((i: any) => i.id === itemId);
      if (item) {
        const newPrice = Number(priceStr);
        initialSimulatedDrops.push({
          id: `drop-${itemId}-test`,
          destination: `${item.destination} → Milano`,
          oldPrice: item.price,
          newPrice,
          dropPercent: Math.round(((item.price - newPrice) / item.price) * 100),
          airline: 'Test Airline',
          date: 'Test',
          timeAgo: 'just now',
          isNew: true,
        });
      }
    });
  }

  // Parse notifications query state
  let initialNotifications: any[] = [];
  if (query.notifications) {
    query.notifications.split(',').forEach((n: string) => {
      const [id, itemId, priceStr] = n.split(':');
      const item = originalFeedItems.find((i: any) => i.id === itemId);
      if (item) {
        const newPrice = Number(priceStr);
        const dp = Math.round(((item.price - newPrice) / item.price) * 100);
        initialNotifications.push({
          id,
          itemId,
          oldPrice: item.price,
          newPrice,
          dropPercentage: dp,
          message: `Price drop! ${item.destination} is now €${newPrice} (${dp}% off)`,
        });
      }
    });
  }

  // Load waitlist count from Supabase — SOLO il conteggio reale, nessuna base
  // fittizia (mostrare "reali + 2847" era falso social proof, art. 21 Cod. Consumo).
  let waitlistCount = 0;
  try {
    const { count } = await supabase
      .from('waitlist')
      .select('*', { count: 'exact', head: true });
    if (count !== null) {
      waitlistCount += count;
    }
  } catch (e) {
    console.error('Failed to load waitlist count in getServerSideProps', e);
  }

  // Handle email submission from E2E waitlist test
  let initialWaitlistError: string | null = null;
  let initialWaitlistSubmitted = false;
  let initialWaitlistEmail = '';
  if (query.email) {
    initialWaitlistSubmitted = true;
    initialWaitlistEmail = String(query.email);
  }
  if (query.error) {
    initialWaitlistError = String(query.error);
  }

  // Let the CDN cache the anonymous shell — greeting, saved items and auth are
  // all resolved client-side, so the server HTML is identical for every
  // anonymous visitor. Never cache E2E / query-param-driven variants.
  if (!isE2E && Object.keys(query).length === 0 && context.res) {
    context.res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900');
  }

  return {
    props: {
      query,
      resolvedUrl,
      isE2E,
      // noindex sui deploy di PREVIEW Vercel (mai in produzione): evita che gli
      // URL *.vercel.app di anteprima creino contenuti duplicati su Google.
      noindex: process.env.VERCEL_ENV === 'preview',
      initialTab,
      initialSavedItems,
      initialFlights: formattedFlights,
      initialHotels: formattedHotels,
      initialSimulatedDrops,
      initialNotifications,
      initialWaitlistCount: waitlistCount,
      initialWaitlistError,
      initialWaitlistSubmitted,
      initialWaitlistEmail,
      // Affiliate marker is inherently public (it ends up in outbound URLs);
      // exposing it lets the client build tracked Kiwi deep links for Radar.
      kiwiAffiliateId: process.env.KIWI_AFFILIATE_ID || '',
    },
  };
}
