import { GetServerSideProps } from 'next';
import { SITE_URL } from '@/utils/siteUrl';

// Dominio centralizzato (vedi utils/siteUrl.ts): prima era hardcoded nomaq.app
// mentre il deploy girava su un sottodominio Vercel → sitemap incoerente.
const DOMAIN = SITE_URL;

type Entry = { path: string; changefreq: string; priority: string };

const ENTRIES: Entry[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/soggiorna', changefreq: 'daily', priority: '0.9' },
  { path: '/waitlist', changefreq: 'weekly', priority: '0.8' },
  { path: '/note-legali', changefreq: 'monthly', priority: '0.3' },
  { path: '/privacy', changefreq: 'monthly', priority: '0.3' },
  { path: '/termini', changefreq: 'monthly', priority: '0.3' },
  { path: '/cookie-policy', changefreq: 'monthly', priority: '0.3' },
];

function generateSiteMap(lastmod: string) {
  const urls = ENTRIES.map(
    (e) => `  <url>
    <loc>${DOMAIN}${e.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export default function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const lastmod = new Date().toISOString().split('T')[0];
  const sitemap = generateSiteMap(lastmod);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/xml; charset=utf-8');
  // La sitemap cambia di rado: lasciala cachare al CDN per un giorno.
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.write(sitemap);
  res.end();

  return { props: {} };
};
