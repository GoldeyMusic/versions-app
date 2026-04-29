# Versions — Roadmap

Source de vérité pour les prochains jalons. Mise à jour 2026-04-28.

Pour le détail de chaque item : voir les fichiers liés (`AUBIOMIX_PLAN.md`, `ADMIN_DASHBOARD.md`) et les notes mémoire (`project_versions_*.md` côté Cowork).

---

## Fait aujourd'hui (2026-04-28)

- Page tarifs publique `#/pricing` avec 4 packs (1 / 3 / 5 / 10) et 2 abonnements (Indé / Pro), grille "safe" avec plancher ×3 sur un coût hypothétique de 1 €
- Lien "Tarifs" en topbar de la landing
- Backend `decode-api` instrumenté pour capturer les usage tokens Gemini + Claude à chaque analyse
- Module `lib/costTracker.js` qui calcule le coût total (Gemini + Claude + Fadr forfait + infra forfait) et l'insère dans `analysis_cost_logs`
- Migration SQL 012 (`analysis_cost_logs`) + 013 (`revenue_logs` + 3 RPC `admin_get_*`) + 014 (fix jointure versions↔tracks)
- Dashboard admin `#/admin` avec : KPIs business (recettes, coûts, balance, signups), KPIs coûts (moyen, P95, total, marge), bar chart 30 jours, table exhaustive des users avec expand cliquable, top consommateurs, section recettes (placeholder Stripe), 20 dernières analyses
- Lien "Admin" doré dans la sidebar (gaté par `VITE_ADMIN_EMAIL`)
- Page admin intégrée dans le layout normal avec sidebar (pas plein écran)
- Tarifs unitaires Gemini / Claude / forfaits Fadr / infra ajustables dans `decode-api/lib/costTracker.js`

---

## Bloc 1 — Bouclage technique avant ouverture publique

Tout doit être fait avant d'envoyer le moindre paiement Stripe en production.

- [ ] **Hard cap durée audio à 12 min** (~1h)
  - Front : refus à l'upload + message clair sur la limite
  - Back : double validation (au cas où le front est bypassé)
  - Garde-fou non négociable : sans ça, un upload d'1h coûte 5× le prix d'un titre normal

- [ ] **Brancher Stripe** (~3-4h)
  - Stripe Account + créer 5 products/prices pour les packs (1 / 3 / 5 / 10) + 2 prix récurrents pour les abos (Indé / Pro)
  - Stripe Checkout pour les CTAs "Acheter" des packs (one-shot)
  - Stripe Subscription pour les CTAs "Choisir" des abos
  - Webhook `charge.succeeded` / `invoice.paid` → alimente `revenue_logs` (table déjà prête, migration 013)
  - Nouvelle table `user_credits` (id, user_id, balance, expires_at) qui se débite à chaque analyse et se crédite à chaque achat

- [ ] **Bloquer une analyse si pas de credit dispo** (~1h)
  - Au POST `/analyze/start` : vérifier `user_credits.balance > 0`
  - Sinon : renvoyer 402 Payment Required + redirect front vers `/pricing`

À la fin de ce bloc, le modèle économique est techniquement opérationnel.

---

## Bloc 2 — Mise en production publique

- [ ] **Pages légales** `/privacy` et `/terms` (~1h, template SaaS musique français à adapter). Prérequis Google.

- [ ] **Google OAuth en Production** (~30 min + review Google). Branding "Versions" + logo, vérification domaine dans Search Console (DNS TXT), passage Testing → Production. Vire le warning "application non vérifiée".

- [ ] **URLs propres (suppression du `#`)** (~45 min). Refactor `parseHash`/`buildHash` → `parsePath`/`buildPath`, listeners `hashchange` → `popstate`, `vercel.json` avec rewrite vers `index.html`. Vérifier que l'OAuth Google continue de marcher après le changement. À faire avant de partager les premiers liens publics.

---

## Bloc 3 — Décisions data-driven (à partir de ~50 analyses loggées)

- [ ] **Ajuster la grille de prix** en fonction des vrais coûts mesurés sur `#/admin`
  - Coût moyen < 0,50 € → on peut baisser le pack 10 vers 2,50 €/u et ouvrir un pack 25 ou 50
  - Coût moyen > 1,00 € → remonter pack 10 et abo Pro
  - Toujours regarder le P95 (worst case) plus que la moyenne

- [ ] **Annuel −2 mois sur les abos** (~30 min)
  - Créer un Price récurrent annuel côté Stripe
  - Toggle Mensuel / Annuel dans `PricingScreen.jsx`

---

## Bloc 4 — Roadmap produit (post-monétisation)

Voir `project_versions_pending.md` côté mémoire pour le détail. Les axes principaux :

- [ ] Détection "autre titre" à l'upload (compare BPM / tonalité / durée vs version précédente)
- [ ] Système de progression entre versions (courbe trajectoire globale)
- [ ] Upload direct navigateur → Supabase (contourne limite Vercel ~4,5 Mo pour les WAV lourds)
- [ ] Drag-and-drop mobile (porter les touch events sur la nouvelle archi)
- [ ] Audit pédagogie globale de la copy (toute la copy user-facing au crible de la double cible : musicien isolé + pro non-snob)
- [ ] Densifier la Home desktop (trop d'espace vide pour un compte neuf)

---

## Conseil de séquence

Si 2-3 h dispos : Bloc 1 entier en une fois. Tu sors avec un produit prêt à encaisser.

Si moins de temps : juste le **cap audio 12 min** — indépendant, te protège tout de suite.

Si tu veux d'abord valider l'admin : lance 2-3 analyses, va sur `#/admin`, vérifie que tout est cohérent (lignes qui apparaissent, ton compte dans la table users, expand qui marche). On attaque Stripe le surlendemain.
