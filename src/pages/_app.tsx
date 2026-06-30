import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AppStateProvider } from '@/context/AppState';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AppStateProvider
      initialTab={pageProps.initialTab}
      initialSavedItems={pageProps.initialSavedItems}
    >
      <Component {...pageProps} />
    </AppStateProvider>
  );
}
