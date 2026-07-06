import Head from 'next/head';
import { useRouter } from 'next/router';
import { SITE_URL } from '@/utils/siteUrl';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  type?: string;
  /** Emette <meta robots noindex> (es. deploy di preview, pagine non indicizzabili). */
  noindex?: boolean;
}

export default function SEO({
  title = 'Nomaq — Vola al Prezzo Giusto',
  description = "L'app che monitora le rotte in tempo reale e ti avvisa quando i prezzi di voli e hotel crollano.",
  image = `${SITE_URL}/images/logo.png`,
  imageAlt = 'Nomaq — voli e hotel al prezzo giusto',
  type = 'website',
  noindex = false,
}: SEOProps) {
  const router = useRouter();
  // Strip query string from the canonical: ?saved=…, ?drops=… etc. are UI
  // state, not distinct indexable pages.
  const path = (router.asPath || '/').split('?')[0];
  const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Nomaq" />
      <meta property="og:locale" content="it_IT" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={imageAlt} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={imageAlt} />
    </Head>
  );
}
