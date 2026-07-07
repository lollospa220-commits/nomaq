import type { FeedItem } from '@/types/domain';

/**
 * Normalizzazione UNICA di una riga volo/hotel (dal DB o dalle API) alla forma
 * FeedItem usata dalle card. Sostituisce le 4 copie divergenti (2 in SSR, 2 nel
 * refetch client) che causavano piccoli mismatch di hydration.
 * `num` restituisce null su valori non finiti → niente più "€NaN".
 */
const num = (v: unknown): number | null => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function base(raw: any) {
  const original = raw.original_price ?? raw.originalPrice;
  const dropAmount = raw.drop_amount ?? raw.dropAmount;
  const priorPrice = raw.prior_price ?? raw.priorPrice;
  const observedAt = raw.observed_at ?? raw.observedAt;
  return {
    ...raw,
    price: num(raw.price),
    originalPrice: original != null && original !== '' ? num(original) : null,
    rating: raw.rating != null && raw.rating !== '' ? num(raw.rating) : null,
    stars: raw.stars != null && raw.stars !== '' ? num(raw.stars) : null,
    date: raw.date_info || raw.date || '',
    // Drop reale osservato dal backend (vedi computeRealFlights). Assente per
    // le righe servite dalla sola cache Supabase (nessun fetch avvenuto ora).
    dropAmount: dropAmount != null ? num(dropAmount) : null,
    priorPrice: priorPrice != null ? num(priorPrice) : null,
    observedAt: observedAt != null ? num(observedAt) : null,
  };
}

export function formatFlight(raw: any): FeedItem {
  return { ...base(raw), type: raw.type || 'flight' };
}

export function formatHotel(raw: any): FeedItem {
  return {
    ...base(raw),
    type: raw.type || 'hotel',
    hotelName: raw.hotel_name || raw.hotelName || null,
  };
}
