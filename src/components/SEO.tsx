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
  const locale = router.locale === 'en' ? 'en' : 'it';
  // asPath è senza prefisso locale (Next i18n): lo stripiamo dalla query per il
  // canonical e costruiamo le varianti per-locale.
  const path = (router.asPath || '/').split('?')[0];
  const suffix = path === '/' ? '' : path;
  const urlFor = (l: string) => `${SITE_URL}${l === 'it' ? '' : `/${l}`}${suffix}`;
  const canonicalUrl = urlFor(locale);

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* hreflang: dice a Google che it/en sono la stessa pagina in lingue diverse */}
      <link rel="alternate" hrefLang="it" href={urlFor('it')} />
      <link rel="alternate" hrefLang="en" href={urlFor('en')} />
      <link rel="alternate" hrefLang="x-default" href={urlFor('it')} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Nomaq" />
      <meta property="og:locale" content={locale === 'en' ? 'en_US' : 'it_IT'} />
      <meta property="og:locale:alternate" content={locale === 'en' ? 'it_IT' : 'en_US'} />
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
