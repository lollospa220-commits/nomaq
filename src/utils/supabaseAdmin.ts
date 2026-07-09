import { createClient } from '@supabase/supabase-js';
import { supabase, supabaseUrl, isConfigured } from './supabaseClient';

/**
 * Client Supabase con la SERVICE ROLE key — bypassa la RLS.
 *
 * Va usato ESCLUSIVAMENTE lato server (API routes, getServerSideProps): la
 * chiave `SUPABASE_SERVICE_ROLE_KEY` NON ha il prefisso NEXT_PUBLIC_, quindi
 * Next.js non la include mai nel bundle client (lì `process.env` la vede come
 * undefined). La guardia `typeof window === 'undefined'` impedisce comunque di
 * creare il client privilegiato in un contesto browser.
 *
 * Fallback SICURO: se la env manca (o siamo lato client) si ricade sul client
 * anon/mock esistente. Così questa Fase 1 può essere deployata SENZA rompere
 * nulla; le scritture continuano con la anon key finché:
 *   1) si imposta SUPABASE_SERVICE_ROLE_KEY su Vercel, e
 *   2) si blindano le policy RLS del ruolo anon su Supabase.
 * Dopo quei due passi le scritture privilegiate passano da qui (service_role)
 * mentre il ruolo anon può essere ristretto al minimo.
 */
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin =
  typeof window === 'undefined' && isConfigured && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : supabase;
