import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Custom404() {
  return (
    <>
      <Head>
        <title>Pagina non trovata — Nomaq</title>
      </Head>
      <main className="min-h-screen bg-off-white flex flex-col items-center justify-center p-6 text-center" data-testid="app-root">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl animate-fade-in" data-testid="not-found">
          <div className="w-16 h-16 bg-electric-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-electric-orange text-2xl font-black">
            404
          </div>
          <h2 className="text-xl font-bold text-anthracite-grey mb-2">
            Pagina non trovata
          </h2>
          <p className="text-anthracite-grey/60 text-sm mb-6">
            Non siamo riusciti a trovare la rotta o la pagina che stai cercando.
          </p>
          <Link href="/" className="btn-primary inline-block text-sm py-3 px-6 rounded-xl font-bold text-white bg-electric-orange">
            Torna alla Home
          </Link>
        </div>
      </main>
    </>
  );
}
