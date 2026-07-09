import { GetServerSideProps } from 'next';
import { SITE_URL } from '@/utils/siteUrl';

// robots.txt generato dinamicamente da SITE_URL (come la sitemap): prima era un
// file statico col dominio hardcoded → alla migrazione di dominio (via
// NEXT_PUBLIC_SITE_URL) canonical/sitemap puntavano al nuovo dominio mentre
// robots dichiarava ancora il vecchio.
//
// NB: NON blocchiamo /_next/ — lì stanno CSS, chunk JS e /_next/image
// (optimizer). Bloccarli impedirebbe a Googlebot di renderizzare la pagina con
// gli stili e di indicizzare le immagini del feed. Le pagine private (profilo,
// concierge) sono escluse dall'indice via <meta robots noindex> a livello di
// pagina, così restano crawlabili ma non indicizzate (pattern corretto).
function generateRobots(): string {
  return `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
}

export default function Robots() {
  // getServerSideProps genera la risposta.
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
  res.write(generateRobots());
  res.end();

  return { props: {} };
};
