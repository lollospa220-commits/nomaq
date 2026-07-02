import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AppStateProvider } from '@/context/AppState';
import { LanguageProvider } from '@/context/LanguageContext';
import { AuthProvider } from '@/context/AuthContext';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppStateProvider
          initialTab={pageProps.initialTab}
          initialSavedItems={pageProps.initialSavedItems}
        >
          <Component {...pageProps} />
        </AppStateProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
