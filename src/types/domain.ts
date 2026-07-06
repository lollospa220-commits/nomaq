/** Modello dominio condiviso di una card del feed (volo o hotel). Prima le card
 *  erano `any` ovunque e la normalizzazione era duplicata in 4 punti con
 *  divergenze (stars null vs undefined, originalPrice, date || ''). */
export interface FeedItem {
  id: string;
  type: 'flight' | 'hotel';
  destination: string;
  country?: string;
  description?: string;
  price: number | null;
  originalPrice: number | null;
  rating?: number | null;
  stars?: number | null;
  image?: string | null;
  booking_url?: string;
  airline?: string;
  hotelName?: string | null;
  date?: string;
  tag?: string;
  estimate?: boolean;
}
