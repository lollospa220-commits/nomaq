import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { count, error } = await supabase
        .from('waitlist')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json({ count: count || 0 });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email è richiesta' });
    }

    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      return res.status(400).json({ error: 'Formato email non valido' });
    }

    try {
      const { error } = await supabase
        .from('waitlist')
        .insert([{ email: trimmed }]);

      if (error) {
        if (error.code === '23505') {
          return res.status(409).json({ error: 'Questa email è già registrata alla nostra waitlist!' });
        }
        return res.status(500).json({ error: error.message });
      }

      return res.status(201).json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
