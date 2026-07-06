// Content-Security-Policy calibrata sullo stack: Next (inline hydration +
// styled-jsx → 'unsafe-inline'), next/image + globo canvas (data:/blob:),
// Unsplash, Supabase, Vercel Analytics. Applicata SOLO in produzione: in dev
// romperebbe l'HMR di Next (eval + websocket). 'unsafe-inline' su script è il
// compromesso necessario col pages-router senza nonce.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Non esporre la versione di Next (info-disclosure).
  poweredByHeader: false,
  // i18n routing nativo (pages router): / = italiano, /en = inglese, entrambi
  // renderizzati server-side → indicizzabili da Google. localeDetection:false
  // per non redirigere in base all'Accept-Language (URL espliciti e stabili).
  i18n: {
    locales: ['it', 'en'],
    defaultLocale: 'it',
    localeDetection: false,
  },
  images: {
    // AVIF prima di WebP: ~20-30% di byte in meno sul payload dominante (il feed
    // di foto Unsplash). L'optimizer serve il formato migliore accettato dal browser.
    formats: ['image/avif', 'image/webp'],
    // Cache lunga delle immagini ottimizzate (31 giorni): deterministiche per URL.
    minimumCacheTTL: 2678400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // X-XSS-Protection rimosso: deprecato e potenzialmente dannoso; la CSP
          // è la protezione moderna contro l'XSS.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          // CSP solo in produzione (in dev romperebbe l'HMR eval/websocket di Next).
          ...(process.env.NODE_ENV === 'production'
            ? [{ key: 'Content-Security-Policy', value: CSP }]
            : []),
        ],
      },
      {
        // Asset statici versionati per contenuto (texture globo, logo, favicon):
        // cache immutabile lunga. Se aggiorni un asset, cambia il nome del file.
        source: '/:dir(textures|images)/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/favicon.svg',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

