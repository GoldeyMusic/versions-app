import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * useIsAdmin — source de vérité unique pour le gating admin.
 *
 * Avant (jusqu'à juillet 2026) le front comparait l'email du user à la
 * variable d'env VITE_ADMIN_EMAIL. Deux problèmes : un seul admin
 * possible, et l'info « qui est admin » vivait à deux endroits (Vercel
 * + la table public.admin_users côté Supabase).
 *
 * Désormais le front interroge la RPC `is_admin()` (migration 049), qui
 * répond true si le user connecté est dans `public.admin_users` et que
 * son email est confirmé. Ajouter un admin = une ligne SQL, aucun
 * redéploiement.
 *
 * Le résultat est mis en cache par user_id au niveau module : les
 * composants qui appellent ce hook (DashboardRail, DashboardTopbar,
 * Sidebar, Landing/Pricing/Plugin, AdminScreen) ne déclenchent qu'un
 * seul aller-retour réseau par session.
 *
 * NOTE SÉCURITÉ : ce hook ne sert qu'au gating UX (afficher ou non le
 * bouton étoile / l'écran admin). La vraie barrière reste côté
 * Postgres — RLS `is_admin()` sur analysis_cost_logs, chat_cost_logs,
 * revenue_logs, feedback + check `is_admin()` dans le corps des RPC
 * admin_get_*.
 */

// Cache module-level : { userId -> boolean } + promesses en vol pour
// dédupliquer les appels concurrents au premier rendu.
const resultCache = new Map();
const inflight = new Map();

/**
 * Version impérative (hors React) — même cache que le hook.
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export async function fetchIsAdmin(userId) {
  if (resultCache.has(userId)) return resultCache.get(userId);
  if (inflight.has(userId)) return inflight.get(userId);

  const p = (async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      // Erreur réseau / RPC indisponible → on refuse (fail closed).
      const value = !error && data === true;
      resultCache.set(userId, value);
      return value;
    } catch {
      resultCache.set(userId, false);
      return false;
    } finally {
      inflight.delete(userId);
    }
  })();

  inflight.set(userId, p);
  return p;
}

/** Invalide le cache — à appeler à la déconnexion. */
export function clearIsAdminCache() {
  resultCache.clear();
  inflight.clear();
}

/**
 * @param {{ id?: string } | null | undefined} user  user Supabase (ou null)
 * @returns {boolean} true si le user connecté est admin
 */
export default function useIsAdmin(user) {
  const userId = user?.id || null;
  // Valeur dérivée du cache au rendu (pas de state miroir) : null tant
  // que la réponse n'est pas connue, true/false ensuite.
  const cached = userId && resultCache.has(userId) ? resultCache.get(userId) : null;
  // Compteur uniquement là pour re-rendre quand la promesse retombe.
  const [, bump] = useState(0);

  useEffect(() => {
    if (!userId || cached !== null) return undefined;
    let cancelled = false;
    fetchIsAdmin(userId).then(() => {
      if (!cancelled) bump((n) => n + 1);
    });
    return () => {
      cancelled = true;
    };
  }, [userId, cached]);

  return cached === true;
}
