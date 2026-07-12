import { Html, Head, Main, NextScript, DocumentProps } from 'next/document';

export default function Document({ __NEXT_DATA__ }: DocumentProps) {
  // <html lang> per-locale (Next i18n): coerente SSR per a11y/SEO.
  const lang = __NEXT_DATA__?.locale || 'it';
  return (
    <Html lang={lang} data-scroll-behavior="smooth">
      <Head>
        {/* Font self-hostati via next/font in _app.tsx: niente richieste a Google Fonts */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
        {/* Warm up the TLS/DNS handshake to the image host so feed art (and the
            image optimizer's origin fetch) starts sooner — helps LCP. */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/favicon.png" type="image/png" sizes="276x276" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
