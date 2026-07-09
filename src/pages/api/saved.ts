import type { NextApiRequest, NextApiResponse } from 'next';
// API route (server): usa il client service_role (bypassa la RLS) così i
// preferiti si leggono/scrivono senza esporre saved_items al ruolo anon.
import { supabaseAdmin as supabase } from '@/utils/supabaseAdmin';
import { createRateLimiter } from '@/utils/rateLimit';

const limiter = createRateLimiter({ max: 30 });

// Validate session ID format to prevent enumeration and injection.
// Accepts both the old format (session-<base36>-<base36>) and the new
// crypto.randomUUID format (session-<uuid>) and hex fallback (session-<32hex>).
const SESSION_ID_RE = /^session-[a-z0-9-]{8,50}$/;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (limiter.isRateLimited(req)) {
    return res.status(429).json({ error: 'Troppe richieste. Riprova tra poco.' });
  }

  if (method === 'GET') {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID richiesto' });
    }

    if (!SESSION_ID_RE.test(sessionId)) {
      return res.status(400).json({ error: 'Formato Session ID non valido' });
    }

    try {
      const { data: savedItems, error: savedError } = await supabase
        .from('saved_items')
        .select('*')
        .eq('session_id', sessionId);

      if (savedError) {
        console.error('[saved] GET error:', savedError.message);
        return res.status(500).json({ error: 'Si è verificato un errore interno.' });
      }

      return res.status(200).json(savedItems || []);
    } catch (err: any) {
      console.error('[saved] GET error:', err.message);
      return res.status(500).json({ error: 'Si è verificato un errore interno.' });
    }
  }

  if (method === 'POST') {
    const { itemId, itemType, sessionId } = req.body;

    if (!itemId || !itemType || !sessionId) {
      return res.status(400).json({ error: 'Dati mancanti (itemId, itemType, sessionId)' });
    }

    if (typeof sessionId !== 'string' || !SESSION_ID_RE.test(sessionId)) {
      return res.status(400).json({ error: 'Formato Session ID non valido' });
    }

    if (typeof itemId !== 'string' || itemId.length > 200) {
      return res.status(400).json({ error: 'Formato itemId non valido' });
    }

    if (typeof itemType !== 'string' || !['flight', 'hotel'].includes(itemType)) {
      return res.status(400).json({ error: 'itemType deve essere "flight" o "hotel"' });
    }

    try {
      const { data: existing } = await supabase
        .from('saved_items')
        .select('*')
        .eq('session_id', sessionId)
        .eq('item_id', itemId)
        .maybeSingle();

      if (existing) {
        const { error: deleteError } = await supabase
          .from('saved_items')
          .delete()
          .eq('session_id', sessionId)
          .eq('item_id', itemId);

        if (deleteError) {
          console.error('[saved] DELETE error:', deleteError.message);
          return res.status(500).json({ error: 'Si è verificato un errore interno.' });
        }

        return res.status(200).json({ action: 'removed', itemId });
      } else {
        const { error: insertError } = await supabase
          .from('saved_items')
          .insert([
            {
              session_id: sessionId,
              item_id: itemId,
              item_type: itemType,
            },
          ]);

        if (insertError) {
          console.error('[saved] INSERT error:', insertError.message);
          return res.status(500).json({ error: 'Si è verificato un errore interno.' });
        }

        return res.status(201).json({ action: 'added', itemId });
      }
    } catch (err: any) {
      console.error('[saved] Error:', err.message);
      return res.status(500).json({ error: 'Si è verificato un errore interno.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
