import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    const { sessionId } = req.query;

    if (!sessionId || typeof sessionId !== 'string') {
      return res.status(400).json({ error: 'Session ID richiesto' });
    }

    try {
      const { data: savedItems, error: savedError } = await supabase
        .from('saved_items')
        .select('*')
        .eq('session_id', sessionId);

      if (savedError) {
        return res.status(500).json({ error: savedError.message });
      }

      return res.status(200).json(savedItems || []);
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (method === 'POST') {
    const { itemId, itemType, sessionId } = req.body;

    if (!itemId || !itemType || !sessionId) {
      return res.status(400).json({ error: 'Dati mancanti (itemId, itemType, sessionId)' });
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
          return res.status(500).json({ error: deleteError.message });
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
          return res.status(500).json({ error: insertError.message });
        }

        return res.status(201).json({ action: 'added', itemId });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
