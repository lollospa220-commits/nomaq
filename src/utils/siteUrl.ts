/**
 * URL canonico del sito, centralizzato in un solo punto.
 *
 * Prima era hardcoded 'https://nomaq.app' in più file (SEO.tsx, sitemap,
 * JSON-LD) mentre il deploy gira su un sottodominio Vercel → canonical/OG/
 * sitemap puntavano a un dominio non servito. Ora è configurabile via
 * NEXT_PUBLIC_SITE_URL (impostala su Vercel al dominio di produzione).
 * Default: il dominio di produzione atteso.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nomaq.app').replace(/\/+$/, '');
