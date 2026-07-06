/**
 * URL canonico del sito, centralizzato in un solo punto.
 *
 * Il default è il dominio realmente servito (il sottodominio Vercel), così
 * canonical/OG/sitemap/JSON-LD sono coerenti col sito online senza dover
 * possedere un dominio custom. Quando si collegherà un dominio proprio
 * (es. nomaq.app), basterà impostare NEXT_PUBLIC_SITE_URL su Vercel: ha la
 * precedenza e non serviranno modifiche al codice.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nomaq-chi.vercel.app').replace(/\/+$/, '');
