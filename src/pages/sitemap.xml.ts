import { GetServerSideProps } from 'next';

const DOMAIN = 'https://nomaq.app';

function generateSiteMap() {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${DOMAIN}/</loc>
       <changefreq>daily</changefreq>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>${DOMAIN}/waitlist</loc>
       <changefreq>weekly</changefreq>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>${DOMAIN}/privacy</loc>
       <changefreq>monthly</changefreq>
       <priority>0.3</priority>
     </url>
     <url>
       <loc>${DOMAIN}/termini</loc>
       <changefreq>monthly</changefreq>
       <priority>0.3</priority>
     </url>
     <url>
       <loc>${DOMAIN}/cookie-policy</loc>
       <changefreq>monthly</changefreq>
       <priority>0.3</priority>
     </url>
   </urlset>
 `;
}

export default function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const sitemap = generateSiteMap();

  res.setHeader('Content-Type', 'text/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};
