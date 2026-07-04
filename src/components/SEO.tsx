import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

export default function SEO({
  title = 'Nomaq — Vola al Prezzo Giusto',
  description = "L'app che monitora le rotte in tempo reale e ti avvisa quando i prezzi di voli e hotel crollano.",
  image = 'https://nomaq.app/og.png',
  type = 'website',
}: SEOProps) {
  const router = useRouter();
  const canonicalUrl = `https://nomaq.app${router.asPath === '/' ? '' : router.asPath}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Head>
  );
}
