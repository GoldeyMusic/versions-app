// ============================================================
// versions-app / constants / onboardingSteps.js
// Étapes des cartes guide affichées par <OnboardingHints>.
// Deux jeux distincts : HOME (sur le dashboard) et FICHE
// (sur l'écran d'analyse).
// ============================================================
//
// Chaque étape a un { n, title, body }. Le composant
// OnboardingHints affiche les cartes en succession et persiste
// le flag de fermeture sous storageKey dans localStorage.
// ============================================================

export const HOME_STEPS = [
  {
    n: 1,
    title: 'Lance ton analyse',
    body: "Importe ton mix et donne ton intention artistique. Versions cale son diagnostic sur ce que tu cherches à faire, pas sur des standards génériques.",
  },
  {
    n: 2,
    title: "Découvre ta fiche d'analyses",
    body: "Recommandations chiffrées et plugins adaptés à ton DAW.",
  },
  {
    n: 3,
    title: 'Perfectionne ton mix',
    body: "Importe une nouvelle version pour suivre ton évolution. Tes corrections sont reconnues — les scores t'aident à te repérer dans ton travail.",
  },
  {
    n: 4,
    title: "Chat avec l'assistant",
    body: "Il connaît ta fiche. Demande des précisions sur un sujet, propose-lui une alternative à une action, ou pose une question ciblée sur ton DAW.",
  },
];

export const FICHE_STEPS = [
  {
    n: 1,
    title: 'Score et verdict',
    body: "En haut, le score global donne l'état actuel du mix. Le verdict résume l'impression d'écoute en quelques mots.",
  },
  {
    n: 2,
    title: 'Mesures objectives',
    body: "Le bandeau affiche les mesures du fichier : BPM, tonalité et loudness.",
  },
  {
    n: 3,
    title: 'Diagnostic par éléments',
    body: "Les 6 catégories couvrent voix, instruments, basses, drums, spatial et master. Chaque point propose une action chiffrée et un plugin adapté à ton DAW. Coche 'Résolu' quand tu l'as appliqué dans ton DAW — tes corrections seront reconnues sur la prochaine version.",
  },
  {
    n: 4,
    title: "Chat avec l'assistant",
    body: "Le panneau à droite te laisse discuter sur ta fiche : développer un point, proposer une alternative, demander un conseil ciblé sur ton DAW.",
  },
];

// Flags localStorage utilisés par chaque jeu d'étapes.
// Centralisés ici pour que ReglagesScreen puisse tous les effacer
// d'un coup quand l'utilisateur clique 'Revoir le guide'.
export const ONBOARDING_STORAGE_KEYS = {
  home: 'versions_onboarding_done_home',
  fiche: 'versions_onboarding_done_fiche',
};

export const ALL_ONBOARDING_KEYS = Object.values(ONBOARDING_STORAGE_KEYS);
