// Palette refresh — sombre respirant (validée sur mockup fiche-mockup-v2.html)
const T = {
  // Fond + surfaces (gris bleuté très foncé, repose les yeux vs noir pur)
  black: "#0F1115",
  s1: "#161A20",
  s2: "#1D2229",
  s3: "#262C35",
  border: "#2A3038",
  borderStrong: "#3A424D",

  // Textes
  text: "#E4E6EB",      // texte principal — un cran sous le blanc pur
  textSoft: "#B8BDC7",  // texte secondaire (lisible)
  muted: "#7A828F",     // labels, métadonnées
  muted2: "#4A5260",    // décoratif

  // Accent ambre — vif partout, pas de variante désaturée
  amber: "#F5A623",
  amberDim: "#F5A623",  // alias conservé pour compat (même couleur, plus de désaturé)
  amberGlow: "rgba(245,166,35,0.10)",
  amberLine: "rgba(245,166,35,0.25)",

  // États
  orange: "#E07B39",
  teal: "#1ECFB0",
  green: "#5FB37C",
  cyan: "#48CAE4",
  red: "#D85666",

  // Typographies — Plex Mono partout pour le caractère "studio"
  mono: "'IBM Plex Mono', ui-monospace, monospace",
  display: "'Bebas Neue', sans-serif",
  body: "'IBM Plex Mono', ui-monospace, monospace",
};

export default T;
