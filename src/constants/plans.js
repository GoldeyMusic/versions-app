/**
 * plans.js — catalogue des offres Versions.
 *
 * Source de vérité pour la page /pricing et le mapping vers Stripe :
 *   - 5 packs one-shot (sans expiration)
 *   - 2 abonnements mensuels (reset chaque mois)
 *   - 1 formule École "sur devis" (pas de Stripe, mailto)
 *
 * Les Price IDs Stripe ne sont PAS hardcodés ici : ils arrivent via les
 * variables d'env Vite, créées par le script `decode-api/scripts/init_stripe_catalog.js`.
 * Tant qu'elles ne sont pas définies, les boutons d'achat sont désactivés
 * avec un message "configuration en cours" — utile pendant la phase test.
 *
 * Le `key` est aussi utilisé côté backend pour identifier le plan dans les
 * webhooks Stripe (metadata.plan_key) → permet de créditer le bon nombre
 * d'analyses sans faire confiance à un montant côté client.
 */

export const PACKS = [
  {
    key: 'pack_1',
    label: '1 analyse',
    price_eur: 4.99,
    credits: 1,
    perUnit: 4.99,
    priceIdEnv: 'VITE_STRIPE_PRICE_PACK_1',
    highlight: null,
  },
  {
    key: 'pack_5',
    label: '5 analyses',
    price_eur: 19.99,
    credits: 5,
    perUnit: 3.99,
    priceIdEnv: 'VITE_STRIPE_PRICE_PACK_5',
    highlight: null,
  },
  {
    key: 'pack_10',
    label: '10 analyses',
    price_eur: 34.99,
    credits: 10,
    perUnit: 3.49,
    priceIdEnv: 'VITE_STRIPE_PRICE_PACK_10',
    highlight: 'Le plus choisi',
  },
  {
    key: 'pack_25',
    label: '25 analyses',
    price_eur: 79.99,
    credits: 25,
    perUnit: 3.19,
    priceIdEnv: 'VITE_STRIPE_PRICE_PACK_25',
    highlight: null,
  },
  {
    key: 'pack_50',
    label: '50 analyses',
    price_eur: 139.99,
    credits: 50,
    perUnit: 2.79,
    priceIdEnv: 'VITE_STRIPE_PRICE_PACK_50',
    highlight: 'Le moins cher /unité',
  },
];

export const SUBSCRIPTIONS = [
  {
    key: 'sub_indie',
    label: 'Indie',
    price_eur: 14.99,
    credits: 12,        // monthly_grant
    perUnit: 1.24,
    priceIdEnv: 'VITE_STRIPE_PRICE_SUB_INDIE',
    description: '12 analyses par mois, reset chaque mois.',
  },
  {
    key: 'sub_pro',
    label: 'Pro',
    price_eur: 29.99,
    credits: 30,
    perUnit: 0.99,
    priceIdEnv: 'VITE_STRIPE_PRICE_SUB_PRO',
    description: '30 analyses par mois, reset chaque mois. Pour artistes en cycle de production.',
  },
];

// Email de contact pour la formule École (partenariats centres de formation,
// négociation de tarifs sur volume). Adresse à créer côté DNS quand le
// branchement email du domaine versions.studio sera fait.
export const SCHOOL_CONTACT_EMAIL = 'contact@versions.studio';

// Lookup helper : récupère un plan par sa key (toutes catégories confondues).
export function findPlanByKey(key) {
  return [...PACKS, ...SUBSCRIPTIONS].find((p) => p.key === key) || null;
}

// Récupère le Price ID Stripe d'un plan via la variable d'env. Renvoie null
// si non configuré → permet de désactiver le bouton avec un message clair.
export function getPriceIdForPlan(plan) {
  if (!plan?.priceIdEnv) return null;
  const id = import.meta.env[plan.priceIdEnv];
  return id && typeof id === 'string' && id.trim() ? id.trim() : null;
}
