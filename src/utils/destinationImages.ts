/**
 * Destination image resolver.
 * Guarantees that feed cards get varied, destination-appropriate images:
 * every image pool has multiple photos and a deterministic seed-based pick,
 * and ensureVariedImages() removes duplicate images from a result list.
 * Tutti gli ID Unsplash verificati (200) al 3 luglio 2026 — Unsplash può
 * comunque rimuovere foto nel tempo (successo una volta su Lisbona: 404).
 */

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const POOLS: Array<{ keywords: string[]; images: string[] }> = [
  {
    keywords: ['barcellona', 'barcelona', 'spagna', 'spain'],
    images: [
      u('1539037116277-4db20889f2d4'),
      u('1511527661048-7fe73d85e9a4'),
      u('1464790719320-516ecd75af6c'),
    ],
  },
  {
    keywords: ['sicilia', 'sicily', 'mare', 'beach', 'spiaggia'],
    images: [
      u('1507525428034-b723cf961d3e'),
      u('1516483638261-f4dbaf036963'),
      u('1523906834658-6e24ef2386f9'),
      u('1505118380757-91f5f5632de0'),
    ],
  },
  {
    keywords: ['bali', 'indonesia'],
    images: [
      u('1537996194471-e657df975ab4'),
      u('1518548419970-58e3b4079ab2'),
    ],
  },
  {
    keywords: ['tokyo', 'giappone', 'japan'],
    images: [
      u('1540959733332-eab4deabeeaf'),
      u('1503899036084-c55cdd92da26'),
      u('1542051841857-5f90071e7989'),
      u('1513407030348-c983a97b98d8'),
    ],
  },
  {
    keywords: ['new york', 'nyc', 'stati uniti'],
    images: [
      u('1534430480872-3498386e7856'),
      u('1496442226666-8d4d0e62e6e9'),
      u('1522083165195-3424ed129620'),
      u('1546436836-07a91091f160'),
    ],
  },
  {
    keywords: ['dubai', 'emirati'],
    images: [
      u('1512453979798-5ea266f8880c'),
      u('1518684079-3c830dcef090'),
      u('1526495124232-a04e1849168c'),
    ],
  },
  {
    keywords: ['lisbona', 'lisbon', 'portogallo', 'portugal'],
    images: [
      u('1555881400-74d7acaacd8b'),
      u('1501415201023-2f45fbcefac0'), // tram 28, sostituisce un ID rimosso da Unsplash (404)
    ],
  },
  {
    keywords: ['parigi', 'paris', 'francia', 'france'],
    images: [
      u('1502602898657-3e91760cbb34'),
      u('1499856871958-5b9627545d1a'),
      u('1431274172761-fca41d930114'),
    ],
  },
  {
    keywords: ['londra', 'london'],
    images: [
      u('1513635269975-59663e0ac1ad'),
      u('1533929736458-ca588d08c8be'),
      u('1505761671935-60b3a7427bad'),
    ],
  },
  {
    keywords: ['roma', 'rome'],
    images: [
      u('1552832230-c0197dd311b5'),
      u('1531572753322-ad063cecc140'),
    ],
  },
  {
    keywords: ['amsterdam', 'olanda'],
    images: [
      u('1534351590666-13e3e96b5017'),
      u('1512470876302-972faa2aa9a4'),
    ],
  },
  {
    keywords: ['santorini', 'grecia', 'greece'],
    images: [
      u('1570077188670-e3a8d69ac5ff'),
      u('1613395877344-13d4a8e0d49e'),
      u('1533105079780-92b9be482077'),
    ],
  },
  {
    keywords: ['maldive', 'maldives'],
    images: [
      u('1514282401047-d79a71a590e8'),
      u('1573843981267-be1999ff37cd'),
      u('1540202404-a2f29016b523'),
    ],
  },
];

const GENERIC: string[] = [
  u('1436491865332-7a61a109cc05'),
  u('1488646953014-85cb44e25828'),
  u('1476514525535-07fb3b4ae5f1'),
  u('1500835556837-99ac94a94552'),
  u('1530521954074-e64f6810b32d'),
  u('1507608616759-54f48f0af0ee'),
  u('1469854523086-cc02fe5d8800'),
];

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function poolFor(destination?: string): string[] {
  const dest = (destination || '').toLowerCase();
  const pool = POOLS.find((p) => p.keywords.some((k) => dest.includes(k)));
  return pool ? pool.images : GENERIC;
}

/** Deterministic destination image: same seed → same photo, different seeds vary. */
export function getDestinationImage(destination: string | undefined, seed: string): string {
  const pool = poolFor(destination);
  return pool[hashString(seed) % pool.length];
}

/**
 * Post-processes a feed list so no two items share the same image:
 * missing images are filled and duplicates are re-assigned from the
 * destination pool (falling back to the generic pool).
 */
export function ensureVariedImages<T extends { id?: string; destination?: string; image?: string | null }>(
  items: T[]
): T[] {
  const used = new Set<string>();
  return items.map((item, idx) => {
    let img = item.image || undefined;
    if (!img || used.has(img)) {
      const seed = hashString(`${item.id || item.destination || 'item'}-${idx}`);
      const candidates = [...poolFor(item.destination), ...GENERIC];
      img = candidates[seed % candidates.length];
      for (let i = 0; i < candidates.length; i++) {
        const c = candidates[(seed + i) % candidates.length];
        if (!used.has(c)) {
          img = c;
          break;
        }
      }
    }
    used.add(img);
    return img === item.image ? item : { ...item, image: img };
  });
}
