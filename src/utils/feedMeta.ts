/** Id delle righe seed hardcoded mostrate quando RapidAPI non è configurata. */
const SEED_HOTEL_IDS = new Set(['hotel-santorini', 'hotel-maldive']);

/** True se il feed hotel è solo il fallback demo (nessun prezzo reale TripAdvisor). */
export function isSeedOnlyHotelFeed(hotels: Array<{ id?: string }>): boolean {
  if (!Array.isArray(hotels) || hotels.length === 0) return false;
  return hotels.length <= 2 && hotels.every((h) => SEED_HOTEL_IDS.has(String(h.id || '')));
}