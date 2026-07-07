/* Aeroporti di PARTENZA per l'autocomplete della sezione "Selezionati per te".
   Lista curata città → IATA (codici metropolitani dove esistono, così Kiwi e
   Travelpayouts coprono tutti gli scali della città). Condivisa tra il client
   (autocomplete) e il server (risoluzione origine → IATA), così il codice che
   finisce nel deep link Kiwi è ESATTAMENTE quello mostrato/scelto dall'utente. */
export type Airport = { city: string; iata: string; country: string };

export const ORIGIN_AIRPORTS: Airport[] = [
  // Italia
  { city: 'Napoli', iata: 'NAP', country: 'Italia' },
  { city: 'Roma', iata: 'ROM', country: 'Italia' },
  { city: 'Milano', iata: 'MIL', country: 'Italia' },
  { city: 'Bergamo', iata: 'BGY', country: 'Italia' },
  { city: 'Venezia', iata: 'VCE', country: 'Italia' },
  { city: 'Bologna', iata: 'BLQ', country: 'Italia' },
  { city: 'Torino', iata: 'TRN', country: 'Italia' },
  { city: 'Pisa', iata: 'PSA', country: 'Italia' },
  { city: 'Firenze', iata: 'FLR', country: 'Italia' },
  { city: 'Bari', iata: 'BRI', country: 'Italia' },
  { city: 'Brindisi', iata: 'BDS', country: 'Italia' },
  { city: 'Catania', iata: 'CTA', country: 'Italia' },
  { city: 'Palermo', iata: 'PMO', country: 'Italia' },
  { city: 'Cagliari', iata: 'CAG', country: 'Italia' },
  { city: 'Verona', iata: 'VRN', country: 'Italia' },
  { city: 'Genova', iata: 'GOA', country: 'Italia' },
  { city: 'Lamezia Terme', iata: 'SUF', country: 'Italia' },
  { city: 'Alghero', iata: 'AHO', country: 'Italia' },
  { city: 'Trieste', iata: 'TRS', country: 'Italia' },
  // Principali origini europee
  { city: 'Londra', iata: 'LON', country: 'Regno Unito' },
  { city: 'Parigi', iata: 'PAR', country: 'Francia' },
  { city: 'Madrid', iata: 'MAD', country: 'Spagna' },
  { city: 'Barcellona', iata: 'BCN', country: 'Spagna' },
  { city: 'Amsterdam', iata: 'AMS', country: 'Paesi Bassi' },
  { city: 'Berlino', iata: 'BER', country: 'Germania' },
  { city: 'Monaco di Baviera', iata: 'MUC', country: 'Germania' },
  { city: 'Francoforte', iata: 'FRA', country: 'Germania' },
  { city: 'Zurigo', iata: 'ZRH', country: 'Svizzera' },
  { city: 'Bruxelles', iata: 'BRU', country: 'Belgio' },
  { city: 'Vienna', iata: 'VIE', country: 'Austria' },
  { city: 'Lisbona', iata: 'LIS', country: 'Portogallo' },
];

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

/* Suggerimenti per l'autocomplete: match accento-insensibile su città o codice,
   priorità a chi INIZIA con la query. Max `limit`. */
export function suggestOrigins(input: string, limit = 6): Airport[] {
  const q = normalize(input);
  if (q.length < 1) return [];
  return ORIGIN_AIRPORTS
    .filter((a) => normalize(a.city).includes(q) || a.iata.toLowerCase().includes(q))
    .sort((a, b) => Number(normalize(b.city).startsWith(q)) - Number(normalize(a.city).startsWith(q)))
    .slice(0, limit);
}

/* Risoluzione locale città/codice → IATA (istantanea, senza chiamate di rete)
   per le città comuni. Ritorna null se non trovata: il chiamante ricade
   sull'autocomplete Travelpayouts. */
export function resolveOriginIataLocal(input: string): string | null {
  const q = normalize(input);
  if (q.length < 2) return null;
  const exact = ORIGIN_AIRPORTS.find((a) => normalize(a.city) === q || a.iata.toLowerCase() === q);
  if (exact) return exact.iata;
  const starts = ORIGIN_AIRPORTS.find((a) => normalize(a.city).startsWith(q));
  return starts ? starts.iata : null;
}

/* IATA → nome città leggibile (per le descrizioni delle card). */
export function originLabelForIata(iata: string): string {
  const hit = ORIGIN_AIRPORTS.find((a) => a.iata === String(iata || '').toUpperCase());
  return hit ? hit.city : String(iata || '').toUpperCase();
}
