import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter, DM_Serif_Display } from 'next/font/google';
import { AppStateProvider } from '@/context/AppState';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';
import CookieBanner from '@/components/CookieBanner';
import { Analytics } from '@vercel/analytics/react';

// Font self-hostati via next/font: nessuna richiesta a fonts.googleapis.com a
// runtime (rilevante per la privacy policy) e un solo caricamento per l'app.
const inter = Inter({ subsets: ['latin'], display: 'swap' });
const dmSerif = DM_Serif_Display({
  weight: '400',
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppStateProvider
          initialTab={pageProps.initialTab}
          initialSavedItems={pageProps.initialSavedItems}
        >
          {/* Espone i font come CSS var globali: globals.css e tailwind
              (font-sans / .font-display) le usano al posto dei nomi Google. */}
          <style jsx global>{`
            html {
              --font-inter: ${inter.style.fontFamily};
              --font-dm-serif: ${dmSerif.style.fontFamily};
            }
          `}</style>
          <Component {...pageProps} />
          <CookieBanner />
          <Analytics />
        </AppStateProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
