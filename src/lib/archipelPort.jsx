// Liens et glyphes partagés d'Archipel Port (carte ArchipelPortCard +
// rangée de la modale Réglages). Fichier séparé du composant pour que le
// fast refresh de Vite reste actif (react-refresh/only-export-components).
/**
 * Archipel Port — app de bureau GRATUITE d'Archipel Audio (Mac + Windows) :
 * toutes les apps et outils en ligne d'Archipel au même endroit, installés
 * et tenus à jour, avec le compte partagé VERSiONS (abonnement, crédits).
 *
 * Carte compacte (components/ArchipelPortCard) montée sur la landing et sur
 * /plugin ; la modale Réglages a sa propre rangée (.rg-port-*) qui lit les
 * mêmes liens via getArchipelPortLinks().
 *
 * RÈGLES DE CONTENU : ne jamais parler des plugins Archipel (pas encore
 * publics) et ne pas laisser entendre que Port installe le plugin VERSiONS.
 *
 * Liens : les boutons Mac / Windows mènent à la page de présentation
 * (archipelaudio.com/port/, /en/port/) et non directement aux
 * installateurs. Les noms de fichiers changent à chaque version et se lisent
 * dans https://archipelaudio.com/port/latest.json (Mac) et
 * latest-windows.json (Windows), mais un fetch depuis versions.studio est
 * bloqué : la CSP (vercel.json, connect-src) n'autorise pas
 * archipelaudio.com et ces JSON ne renvoient pas d'en-tête
 * Access-Control-Allow-Origin. Pour des liens directs : soit CORS sur ces
 * deux fichiers (nginx archipelaudio) + archipelaudio.com dans connect-src,
 * soit un rewrite proxy same-origin dans vercel.json.
 */
const PORT_LANDING = {
  fr: 'https://archipelaudio.com/port/',
  en: 'https://archipelaudio.com/en/port/',
};

export function getArchipelPortLinks(lang) {
  const landing = lang === 'en' ? PORT_LANDING.en : PORT_LANDING.fr;
  return { landing, mac: landing, windows: landing };
}

export const PortAppleIcon = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);
export const PortWindowsIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M3 5.55l7.6-1.05v7h-7.6v-5.95zM3 18.45l7.6 1.05v-6.95h-7.6v5.9zM11.6 4.35L21 3v8.5h-9.4V4.35zM11.6 19.65L21 21v-8.45h-9.4v7.1z" />
  </svg>
);
