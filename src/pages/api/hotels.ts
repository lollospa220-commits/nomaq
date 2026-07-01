import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchRealHotels } from '@/utils/travelApi';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const hotels = await fetchRealHotels();
    return res.status(200).json(hotels);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
