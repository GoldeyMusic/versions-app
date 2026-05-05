# Migration sécurité pré-prod — récap des actions

Réalisé le 2026-05-05 dans la foulée de l'audit (`docs/audit_securite_pre_prod.md`).

## Côté code — déjà fait dans cette session

### Backend (`decode-api/`)

- **Middleware d'auth** : `lib/auth.js` créé. `server.js` applique `requireAuth` à tous les endpoints (analyze, chat, mastering-charter, ask, listen, compare, translate, audio, storage). Seul `/api/billing/webhook` (signé Stripe) et `/api/billing/health` (public, mais aseptisé) restent ouverts.
- **Identité dérivée du JWT** : `_analyze.js`, `_chat.js`, `_storage.js` ne lisent plus `req.body.userId` — ils prennent `req.user.id` posé par `requireAuth`. Plus possible de débiter le compte d'un autre utilisateur.
- **Validation Storage path** : `_audio-signed-url.js` et `_analyze.js` (chemin storagePath) refusent désormais tout path qui ne matche pas `tmp/<user.id>/<file>.<ext>`. Plus de path traversal possible.
- **Rate-limit** : `lib/rateLimit.js` créé via `express-rate-limit`. Limites par user.id : chat 30/min, analyze 10/h, ask 30/min, translate 60/min, compare 20/min, mastering-charter 10/min, listen 20/h, storage 60/min, audio 120/min.
- **CORS whitelist** : `server.js` accepte uniquement `versions.studio`, `www.versions.studio`, `localhost:5173`. Configurable via `ALLOWED_ORIGINS` (séparées par virgule) en variable d'env Railway.
- **Stripe** : whitelist `STRIPE_PRICE_WHITELIST` (CSV des `price_…` autorisés). Tant que la variable n'est pas définie, comportement actuel (tout accepté) — à définir en prod.
- **Health endpoint** : `/api/billing/health` ne renvoie plus l'état des env vars (énumération de secrets).
- **Erreurs nettoyées** : `chat`, `ask`, `compare`, `translate`, `mastering-charter`, `audio`, `storage`, `billing/checkout`, `billing/webhook` ne renvoient plus `err.message` au client. Stack traces conservées server-side via `console.error`.
- **Upload cap** : `_analyze.js` 200 Mo → 80 Mo. `_listen.js` 200 Mo → 80 Mo + cap durée 12 min ajouté (aligné sur `/analyze`).
- **`.gitignore`** étoffé : `.env*`, `*.log`, `.DS_Store`, `dist/`, `.vercel/`.
- **Logs de démarrage** : suppression du `OPENAI_API_KEY: present (51 chars)` (canal latéral).

### Frontend (`versions-app/`)

- **Helper `apiClient.js`** : nouveau wrapper `apiFetch` / `apiFetchJson` qui attache automatiquement `Authorization: Bearer ${access_token}` à tous les appels backend.
- **Tous les fetch migrés** : `AskModal`, `BottomPlayer`, `LoadingScreen`, `App.jsx` (status + diagnose), `lib/storage.js` (translate × 3 + compare), `FicheScreen.jsx` (chat + mastering-charter), `PricingScreen.jsx` (billing/checkout). Plus aucun appel direct au backend sans JWT.
- **Headers de sécurité** : `vercel.json` ajoute CSP, HSTS, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, X-Content-Type-Options. Le CSP autorise Supabase, Stripe, Google Fonts, Railway.
- **`jspdf`** bumpé à `^4.2.1` (l'advisory critical path traversal couvre `<=3.0.4`). Re-run `npm install` chez toi pour appliquer (le dossier était locked en sandbox).
- **API URL configurable** : `constants/api.js` lit `VITE_API_URL` avec fallback `decode-api-production.up.railway.app`. Le CSP whiteliste les deux domaines (decode-api + versions-api) pendant la transition.
- **Console.log sensibles** : `LoadingScreen.jsx:254` (userId) gardé seulement en dev (`import.meta.env.DEV`).

### Supabase (`versions-app/supabase/migrations/`)

- **`025_admin_users.sql`** : nouvelle table `admin_users` + fonction `is_admin()` qui check appartenance ET `email_verified`. Seedée avec David. Bascule les RLS admin de `analysis_cost_logs`, `chat_cost_logs`, `feedback`, `revenue_logs` pour utiliser `is_admin()`. Les RPC admin (013/014) ne sont pas modifiées par cette migration — TODO laissé en commentaire pour reprendre les `IF (auth.jwt() ->> 'email') <> '…'` dans le corps des fonctions.
- **`_optional_track_covers_private.sql`** : migration prête à activer (renommer `025_…` → `026_…` après application de 025) qui privatise le bucket `track-covers`. Pas appliquée tant que le frontend n'est pas migré pour utiliser `createSignedUrl()` au lieu de `getPublicUrl()`. Risque actuel jugé faible (UUID v4 indevinables).

---

## Côté toi — à faire AVANT le push prod

### 1. Variables d'env Railway (backend)

Dans Railway → ton service backend → Variables :

| Nouvelle | Valeur | Pourquoi |
|---|---|---|
| `ALLOWED_ORIGINS` | `https://versions.studio,https://www.versions.studio` | Whitelist CORS prod (sans `localhost:5173`). |
| `STRIPE_PRICE_WHITELIST` | (vide pour l'instant) | À remplir avec les 7 `price_…` une fois le catalogue Stripe stable. Sans valeur, comportement actuel inchangé. |
| `NODE_ENV` | `production` | Standard. |

Variables existantes à conserver : `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `FADR_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `MONETIZATION_ENABLED`.

### 2. Rotation des clés API (recommandé par précaution)

Tant que les endpoints backend étaient ouverts (sans auth), n'importe qui qui a vu l'URL Railway a pu consommer Anthropic/Gemini/Fadr/OpenAI. Avant de passer en prod payante :

- Va voir tes consommations sur les dashboards Anthropic / Gemini / Fadr / OpenAI. Si tout est nominal, tu peux laisser les clés actuelles.
- Si tu veux jouer prudent : rotation des 4 clés (générer une nouvelle, mettre à jour Railway, supprimer l'ancienne). 30 min de travail, gros confort mental.
- `SUPABASE_SERVICE_ROLE_KEY` n'a pas fuité dans le code, donc pas besoin de la roue.

### 3. Migration Supabase

Dans le dashboard Supabase → SQL Editor, applique dans l'ordre :

```
025_admin_users.sql
```

Vérifie après exécution que `SELECT public.is_admin()` retourne `true` quand tu es loggé sur David, `false` sinon.

(N'applique PAS encore `_optional_track_covers_private.sql`.)

### 4. Tester en preview Vercel avant le push prod

```bash
cd ~/versions-app
npm install        # rafraîchit jspdf 4.x + dompurify
npm run build      # vérifie qu'aucun import cassé
```

Push sur une branche de test, ouvre la preview Vercel, et vérifie :

- L'export PDF fonctionne toujours (jspdf 4.x peut avoir des breaking changes — si l'export plante, dis-moi, on patche).
- Le chat de fiche, l'analyse, le partage, le checkout Stripe, tous les flows critiques.
- Ouvre la console DevTools : aucun warning CSP ne doit apparaître. Si oui, partage-le-moi, on ajuste le `connect-src` ou `script-src`.

### 5. Rename `decode-api` → `versions-api` (côté infra)

Le backend RESTE sur Railway (la limite ~4,5 Mo body de Vercel serverless est rédhibitoire pour les uploads audio — pas question de bouger). On renomme juste le service Railway et on met à jour les références. Le code interne est déjà à jour ; restent 4 étapes chez toi :

#### 5a. GitHub

1. Sur `github.com/GoldeyMusic/decode-api` → Settings → Rename repository → `versions-api`. GitHub redirige automatiquement les anciennes URLs.
2. Localement :
   ```bash
   cd ~/decode-api
   git remote set-url origin https://github.com/GoldeyMusic/versions-api.git
   ```

#### 5b. Local folder

```bash
cd ~
mv decode-api versions-api
```

⚠️ Cowork va perdre l'accès au dossier après le `mv`. Re-sélectionne `~/versions-api` dans Cowork après pour continuer à travailler.

#### 5c. Railway (rename du service backend, on RESTE sur Railway)

1. Dashboard Railway → ton projet → service `decode-api` → Settings → Service Name → `versions-api`. Le domaine devient `versions-api-production.up.railway.app`.
2. Redéploie le service (Deployments → Redeploy). Railway garde l'ancien domaine actif quelques semaines en transition automatique.

#### 5d. Vercel (frontend versions-app — projet Vercel inchangé, juste une env var)

1. Dashboard Vercel → projet `versions-app` (le frontend) → Settings → Environment Variables → ajoute `VITE_API_URL=https://versions-api-production.up.railway.app` (Production + Preview + Development).
2. Re-deploy le frontend pour que le build prenne la nouvelle URL.
3. Tant que `VITE_API_URL` n'est pas défini, le frontend continue d'appeler l'ancien domaine `decode-api-production.up.railway.app` (fallback codé dans `constants/api.js`) — transition zéro-downtime.

#### 5e. Stripe webhook

Dashboard Stripe → Developers → Webhooks → édite l'endpoint pour pointer vers `https://versions-api-production.up.railway.app/api/billing/webhook`. Important sinon les webhooks 404 en silence.

#### 5f. Nettoyage final (quand tout marche)

Une fois que `VITE_API_URL` est en place et que tout passe par `versions-api-production.up.railway.app` depuis quelques jours, tu peux retirer `decode-api-production.up.railway.app` du CSP `connect-src` dans `versions-app/vercel.json`.

### 6. Supabase Auth — Redirect URLs

Dashboard Supabase → Authentication → URL Configuration → Redirect URLs whitelistées :

```
https://versions.studio/auth/callback
https://www.versions.studio/auth/callback
http://localhost:5173/auth/callback
```

Pas de wildcard, pas de domaines preview Vercel oubliés.

### 7. Désactiver le projet Vercel `decode-kappa` (legacy)

Confirmé non utilisé en prod (Railway est le backend unique). Dashboard Vercel → projet `decode-kappa` → Settings → Delete Project (ou Pause). Réduit la surface d'attaque et évite la confusion future.

---

## Ordre conseillé de déploiement

1. **Maintenant** : `npm install` dans `~/versions-app` (tester localement que ça build).
2. **Push branche de test** → vérification preview Vercel + DevTools console.
3. **Variables d'env Railway** : poser `ALLOWED_ORIGINS` + `NODE_ENV=production`.
4. **Push Railway** : redéploie le backend avec le nouveau code.
5. **Migration Supabase 025** appliquée.
6. **Push frontend prod** → live.
7. **Rotation clés API** (optionnel, conseillé).
8. **Rename decode-api → versions-api** : GitHub puis local puis Railway puis Vercel env. À faire à froid, hors d'un push critique.

---

*Note : si tu veux que je termine le bloc "TODO RPC admin" dans `025_admin_users.sql` (remplacer le hardcoded email dans le corps des fonctions `admin_get_*`), il faut que je lise d'abord le contenu actuel des migrations 013 et 014 dans Supabase pour ne pas casser la signature. À faire en suivant.*
