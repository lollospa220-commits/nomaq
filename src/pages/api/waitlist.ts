import type { NextApiRequest, NextApiResponse } from 'next';
// API route (server): usa il client service_role (bypassa la RLS) così il
// conteggio e l'inserimento waitlist non richiedono permessi al ruolo anon
// (che quindi NON potrà più fare SELECT sulle email → niente enumerazione/dump).
import { supabaseAdmin as supabase } from '@/utils/supabaseAdmin';
import { createRateLimiter } from '@/utils/rateLimit';

const getLimiter = createRateLimiter({ max: 30 });
const postLimiter = createRateLimiter({ max: 5 });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    if (getLimiter.isRateLimited(req)) {
      return res.status(429).json({ error: 'Troppe richieste. Riprova tra poco.' });
    }

    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('[waitlist] GET error:', error.message);
        return res.status(500).json({ error: 'Si è verificato un errore interno.' });
      }

      return res.status(200).json({ count: count || 0 });
    } catch (err: any) {
      console.error('[waitlist] GET error:', err.message);
      return res.status(500).json({ error: 'Si è verificato un errore interno.' });
    }
  }

  if (req.method === 'POST') {
    if (postLimiter.isRateLimited(req)) {
      return res.status(429).json({ error: 'Troppe richieste. Riprova tra poco.' });
    }

    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email è richiesta' });
    }

    const trimmed = email.trim().slice(0, 320);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return res.status(400).json({ error: 'Formato email non valido' });
    }

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email: trimmed }]);

      if (error) {
        // Duplicato (unique violation): NON rivelarlo. Rispondere 409 "già
        // registrata" trasforma l'endpoint in un oracolo di enumerazione
        // (chiunque può sapere se un indirizzo è iscritto → membership
        // disclosure). Rispondiamo come per un inserimento riuscito: idempotente
        // e privacy-preserving.
        if (error.code === '23505') {
          return res.status(201).json({ success: true });
        }
        console.error('[waitlist] POST error:', error.message);
        return res.status(500).json({ error: 'Si è verificato un errore interno.' });
      }

      return res.status(201).json({ success: true });
    } catch (err: any) {
      console.error('[waitlist] POST error:', err.message);
      return res.status(500).json({ error: 'Si è verificato un errore interno.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
