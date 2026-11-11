/**
 * plans.js — catalogue des offres Versions.
 *
 * Source de vérité pour la page /pricing et le mapping vers Stripe :
 *   - 2 packs one-shot à vie (Pack Projet 6, Pack 1)
 *   - 3 abonnements Solo / Indie / Pro, au mois ou à l'année (crédits
 *     cumulables tant que l'abo est actif ; à la résiliation, solde converti
 *     en crédits de grâce valables 90 jours ; pause possible en mensuel).
 *     Annuel (2026-11-11) : 2 mois offerts, un paiement par an, mais les
 *     analyses restent livrées CHAQUE MOIS (webhook pour le 1er mois, tâche
 *     pg_cron grant_annual_monthly_credits pour les 11 suivants, migration 059).
 *     Le plan_key envoyé à Stripe est le même qu'en mensuel ; seul le Price ID
 *     change (champ `annual`).
 *   - 1 formule École "sur devis" (pas de Stripe, mailto)
 *
 * Les Price IDs Stripe ne sont PAS hardcodés ici : ils arrivent via les
 * variables d'env Vite, créées par le script `versions-api/scripts/init_stripe_catalog.js`.
 * Tant qu'elles ne sont pas définies, les boutons d'achat sont désactivés
 * avec un message "configuration en cours" — utile pendant la phase test.
 *
 * Le `key` est aussi utilisé côté backend pour identifier le plan dans les
 * webhooks Stripe (metadata.plan_key) → permet de créditer le bon nombre
 * d'analyses sans faire confiance à un montant côté client.
 */

// Grille révisée 2026-04-29 (Piste A) : élagage des packs 10/25/50.
// Les abos (Indie 12/mois, Pro 30/mois) cannibalisaient ces gros packs —
// personne de rationnel n'achetait 10 analyses à 34,99 € quand 1 mois Pro
// donne 30 analyses à 29,99 €. Les Price IDs Stripe correspondants sont
// archivés (mode test) et ne seront pas créés en live.
//
// Positionnement : Pack 1 = essai. Pack 5 = occasionnel sans engagement.
// Au-delà → l'abo est la formule. Cf. project_versions_stripe.md.
export const PACKS = [
  // Grille 2026-11-06 (audit) : le Pack Projet remplace le Pack 5 (19,99 €).
  // 6 analyses = un EP ou un titre poussé jusqu'au master, sans abonnement.
  // Crédits à vie, cumulables avec un abo (débit abo → grâce → pack).
  {
    key: 'pack_6',
    label: 'Pack Projet',
    price_eur: 14.99,
    credits: 6,
    perUnit: 2.5,
    priceIdEnv: 'VITE_STRIPE_PRICE_PACK_6',
    highlightKey: 'mostChosen',
  },
  // Pack 1 : « une analyse de plus », pas une offre principale.
  {
    key: 'pack_1',
    label: '1 analyse',
    price_eur: 4.99,
    credits: 1,
    perUnit: 4.99,
    priceIdEnv: 'VITE_STRIPE_PRICE_PACK_1',
    highlightKey: null,
  },
];

export const SUBSCRIPTIONS = [
  // Solo (2026-11-06) : palier d'entrée sous 10 €, pour le producteur qui
  // sort un titre par mois. Plugin express + chat illimités inclus comme
  // pour Indie/Pro (monthly_grant > 0).
  {
    key: 'sub_solo',
    label: 'Solo',
    price_eur: 6.99,
    credits: 4,         // monthly_grant
    perUnit: 1.75,
    priceIdEnv: 'VITE_STRIPE_PRICE_SUB_SOLO',
    annual: { price_eur: 69, priceIdEnv: 'VITE_STRIPE_PRICE_SUB_SOLO_YEAR' },
    description: '4 analyses par mois, cumulables tant que ton abonnement est actif. Pour sortir un titre par mois.',
  },
  {
    key: 'sub_indie',
    label: 'Indie',
    price_eur: 14.99,
    credits: 12,        // monthly_grant
    perUnit: 1.24,
    priceIdEnv: 'VITE_STRIPE_PRICE_SUB_INDIE',
    annual: { price_eur: 149, priceIdEnv: 'VITE_STRIPE_PRICE_SUB_INDIE_YEAR' },
    description: '12 analyses par mois, cumulables tant que ton abonnement est actif. Pause possible entre deux projets.',
  },
  {
    key: 'sub_pro',
    label: 'Pro',
    price_eur: 29.99,
    credits: 30,
    perUnit: 0.99,
    priceIdEnv: 'VITE_STRIPE_PRICE_SUB_PRO',
    annual: { price_eur: 299, priceIdEnv: 'VITE_STRIPE_PRICE_SUB_PRO_YEAR' },
    description: '30 analyses par mois, cumulables. Pour ceux qui mixent pour d\'autres : fiches partagées, commentaires, liens publics.',
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

// Price ID Stripe ANNUEL d'un abonnement (null si non configuré).
export function getAnnualPriceIdForPlan(plan) {
  const envName = plan?.annual?.priceIdEnv;
  if (!envName) return null;
  const id = import.meta.env[envName];
  return id && typeof id === 'string' && id.trim() ? id.trim() : null;
}

// L'offre annuelle n'est proposée que si les TROIS prix annuels sont
// configurés : tant que les variables d'env manquent, la page tarifs reste
// strictement mensuelle (pas de sélecteur).
export function isAnnualBillingAvailable() {
  return SUBSCRIPTIONS.every((sub) => !!getAnnualPriceIdForPlan(sub));
}
