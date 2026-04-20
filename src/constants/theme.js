// Palette refresh — identité sombre v2 (alignée sur versions-dark-identity-mockup-v2.html)
// IMPORTANT : ces valeurs doivent rester cohérentes avec les variables CSS
// --bg/--s1/--amber/… de components/MockupStyles.jsx.
const T = {
  // Fond + surfaces — un cran plus sombres et plus cool qu'avant
  black: "#0a0a0c",
  s1: "#111115",
  s2: "#16161b",
  s3: "#1d1d23",
  border: "rgba(255,255,255,0.06)",
  borderStrong: "rgba(255,255,255,0.12)",

  // Textes
  text: "#ededed",
  textSoft: "#c5c5c7",
  muted: "#8a8a90",
  muted2: "#5a5a5e",

  // Accent ambre — couleur principale des CTAs et accents éditoriaux
  amber: "#F5A623",
  amberDim: "#F5A623",  // alias conservé pour compat
  amberGlow: "rgba(245,166,35,0.16)",
  amberLine: "rgba(245,166,35,0.35)",

  // États + cool tones (céruléen remplace le violet comme couleur froide principale,
  // violet conservé en touche d'accent seulement)
  cerulean: "#5cb8cc",
  violet: "#a67ef5",
  mint: "#8ee07a",
  orange: "#E07B39",
  teal: "#1ECFB0",
  green: "#8ee07a",   // aligné sur --mint
  cyan: "#5cb8cc",    // aligné sur --cerulean
  red: "#ff5d5d",

  // Typographies — DM Sans body, Bebas Neue logo, Fraunces sérif italique
  // pour les touches éditoriales, JetBrains Mono labels capitales.
  mono: "'JetBrains Mono', ui-monospace, monospace",
  display: "'Bebas Neue', sans-serif",
  body: "'DM Sans', sans-serif",
  serif: "'Fraunces', 'DM Sans', serif",
};

export default T;
