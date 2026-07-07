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
  /** Calo di prezzo REALE osservato tra due fetch consecutivi dello stesso
   *  ciclo cache (vs. il prezzo precedente della stessa destinazione). 0 o
   *  assente = nessun drop rilevato questo ciclo — mai un numero inventato. */
  dropAmount?: number | null;
  /** Prezzo osservato nel fetch precedente per la stessa destinazione. */
  priorPrice?: number | null;
  /** Timestamp (ms) del momento in cui questo prezzo è stato fetchato dal
   *  provider a monte — alimenta il badge "aggiornato X min fa". */
  observedAt?: number | null;
}
