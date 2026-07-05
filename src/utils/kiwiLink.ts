/* City → IATA (metro codes where available) for building real Kiwi deep links
   from Radar's curated routes. Covers every city used in the RADAR_* lists. */
export const CITY_IATA: Record<string, string> = {
  parigi: 'PAR', paris: 'PAR',
  'new york': 'NYC', newyork: 'NYC',
  bali: 'DPS',
  milano: 'MIL', milan: 'MIL',
  tokyo: 'TYO',
  roma: 'ROM', rome: 'ROM',
  napoli: 'NAP', naples: 'NAP',
  lisbona: 'LIS', lisbon: 'LIS',
  santorini: 'JTR',
  berlino: 'BER', berlin: 'BER',
  reykjavik: 'REK',
  amsterdam: 'AMS',
  barcellona: 'BCN', barcelona: 'BCN',
  marrakech: 'RAK',
  atene: 'ATH', athens: 'ATH',
};

/* Real Kiwi.com affiliate deep link for a city→city route, replacing the old
   generic google.com/flights dead-ends. When affilId (server KIWI_AFFILIATE_ID)
   is present the click is tracked for commission; when absent it is still a
   working Kiwi route search — never a dead end. */
export function buildKiwiDeepLink(from: string, to: string, affilId?: string): string {
  const params = new URLSearchParams({ lang: 'it' });
  const f = CITY_IATA[(from || '').trim().toLowerCase()];
  const t = CITY_IATA[(to || '').trim().toLowerCase()];
  if (f) params.set('from', f);
  if (t) params.set('to', t);
  if (affilId) params.set('affilid', affilId);
  return `https://www.kiwi.com/deep?${params.toString()}`;
}
