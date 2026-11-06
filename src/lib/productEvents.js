// lib/productEvents.js — événements produit (instrumentation 2026-11-06).
//
// Fire-and-forget vers la RPC `log_product_event` (migration 058). La RPC
// ignore silencieusement les visiteurs non connectés et les événements
// hors liste ; côté front on ne bloque jamais l'UI et on n'affiche rien.
//
// Événements : add_modal_open · add_modal_file · add_modal_launch ·
//              add_modal_close · pricing_view · checkout_click · sample_view
import { supabase } from './supabase';

export function logProductEvent(event, props = null) {
  try {
    supabase
      .rpc('log_product_event', { p_event: event, p_props: props || null })
      .then(({ error }) => {
        if (error && import.meta.env.DEV) console.warn('[productEvents]', event, error.message);
      });
  } catch { /* noop */ }
}
