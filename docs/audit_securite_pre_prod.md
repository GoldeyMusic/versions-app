# Audit sécurité pré-production — Versions

> Audit réalisé le 2026-05-05, scope complet : frontend (versions-app), backend (decode-api), Supabase (RLS + RPC + Storage), infra/headers/OAuth/dépendances.

---

## TL;DR — Verdict go/no-go

**🛑 NE PAS PASSER EN PRODUCTION EN L'ÉTAT.**

Il y a **un trou critique généralisé** dans le backend `decode-api` : **aucun endpoint sauf `/billing/checkout` et `/billing/webhook` ne vérifie le JWT Supabase**. Combiné avec `CORS: *` et l'usage du `SUPABASE_SERVICE_ROLE_KEY` (qui bypasse les RLS), n'importe qui depuis n'importe quel site peut :

- télécharger l'audio privé de n'importe quel utilisateur (`/api/audio/signed-url`),
- débiter les crédits d'un autre utilisateur (`/api/analyze/start` accepte `userId` du body),
- spammer `/api/chat`, `/api/ask`, `/api/translate`, `/api/compare` → facture Anthropic + Gemini illimitée,
- déposer des fichiers dans le bucket d'un autre user (`/api/storage/sign-upload`).

**À corriger avant le launch.** L'effort réel est ~1 journée de dev (middleware `requireAuth` + verrou `user.id === storagePath.userId` + rate-limit). Tout le reste est secondaire.

Une fois ce trou fermé : les autres bloquants (headers de sécurité absents, jspdf vulnérable, bucket cover public) se règlent en quelques heures.

| Catégorie | Findings |
|---|---|
| 🛑 BLOQUANT (avant prod) | 8 |
| 🟠 IMPORTANT (après prod, vite) | 11 |
| 🟡 NICE-TO-HAVE | 7 |

---

## 🛑 BLOQUANT — à corriger AVANT prod

### B1. Backend : aucune vérification JWT sur les endpoints sensibles

**Fichiers** :
- `decode-api/api/_analyze.js:118` — `/api/analyze/start`
- `decode-api/api/_chat.js:24`
- `decode-api/api/_compare.js:57`
- `decode-api/api/_ask.js:4`
- `decode-api/api/_listen.js:6`
- `decode-api/api/_translate.js:92`
- `decode-api/api/_mastering_charter.js:52`
- `decode-api/api/_audio-signed-url.js:16`
- `decode-api/api/_storage.js:35`

**Impact** : tout le système d'authentification est ignoré côté backend. Le `userId` est lu depuis `req.body.userId` (ou la query) sans aucune vérification que la requête vient effectivement de cet utilisateur. Comme le backend utilise `SUPABASE_SERVICE_ROLE_KEY` (qui bypasse les RLS Postgres), il n'y a **aucun garde-fou** sur les données.

Concrètement, un attaquant qui ouvre la console réseau de `versions.studio` voit l'URL Railway et peut, depuis un script Python ou même un onglet de navigateur :

1. Énumérer les `user_id` (UUIDs, mais une fois leakés via la moindre vue/log) et appeler `/api/audio/signed-url?path=<userId>/track.mp3` pour télécharger toute la bibliothèque audio d'un autre utilisateur.
2. Envoyer `POST /api/analyze/start` avec le `userId` d'un autre user → le compte de ce dernier est débité de 1 crédit.
3. Boucler `/api/chat` à 100 req/s sans authentification → la facture Anthropic explose en quelques heures (les `chat_cost_logs` ne servent à rien si l'auteur n'est pas authentifié).

**Note importante** : le webhook Stripe est correctement protégé (signature + raw body + `stripe_event_id` UNIQUE pour idempotence). Bien fait.

**Fix (priorité absolue)** :

1. Factoriser le middleware déjà présent dans `_billing.js:45-56` :

   ```js
   // decode-api/lib/auth.js
   const { createClient } = require('@supabase/supabase-js');
   async function requireAuth(req, res, next) {
     const auth = req.headers.authorization || '';
     const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
     if (!token) return res.status(401).json({ error: 'unauthorized' });
     const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
       global: { headers: { Authorization: `Bearer ${token}` } },
     });
     const { data, error } = await sb.auth.getUser();
     if (error || !data?.user) return res.status(401).json({ error: 'unauthorized' });
     req.user = data.user;
     next();
   }
   module.exports = { requireAuth };
   ```

2. Appliquer ce middleware à **tous** les routers sauf `/api/billing/webhook` et le health-check public :

   ```js
   // server.js
   const { requireAuth } = require('./lib/auth');
   app.use('/api/analyze', requireAuth, require('./api/_analyze'));
   app.use('/api/chat', requireAuth, require('./api/_chat'));
   // … idem pour ask, listen, compare, translate, mastering-charter, audio, storage
   ```

3. Dans chaque endpoint qui accepte un `userId`, `path` ou `storagePath`, dériver l'identifiant **uniquement du JWT** :

   ```js
   // _analyze.js: remplacer `userIdEarly = req.body.userId || ''` par
   const userIdEarly = req.user.id;
   ```

   Et pour les paths Storage :

   ```js
   // _audio-signed-url.js
   if (!path.startsWith(req.user.id + '/')) {
     return res.status(403).json({ error: 'forbidden' });
   }
   ```

4. Côté frontend, ajouter le Bearer token sur **tous** les `fetch` vers le backend. Aujourd'hui, ces appels n'envoient pas de header `Authorization` :
   - `src/components/BottomPlayer.jsx:55` — `/api/audio/signed-url`
   - `src/components/AskModal.jsx:29-43` — `/api/ask`
   - `src/lib/storage.js:362,634,864` — `/api/translate`
   - `src/lib/storage.js:899` — `/api/compare`
   - `src/screens/LoadingScreen.jsx:369` — `/api/analyze/start`

   Pattern à appliquer partout :

   ```js
   const { data: { session } } = await supabase.auth.getSession();
   const res = await fetch(url, {
     headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
     // …
   });
   ```

---

### B2. Path traversal possible sur `/api/audio/signed-url`

**Fichier** : `decode-api/api/_audio-signed-url.js:17-29`

**Impact** : `path` est passé tel quel à `createSignedUrl`. Sans regex stricte, des chemins comme `audio/../private/keys.json` ou avec caractères encodés peuvent contourner la séparation entre dossiers utilisateurs. Combiné à B1, c'est une exfiltration totale du bucket.

**Fix** :

```js
const SAFE_PATH = /^[a-f0-9-]+\/[\w.-]+\.(mp3|wav|m4a|flac)$/i;
if (!SAFE_PATH.test(path)) return res.status(400).json({ error: 'bad_path' });
if (!path.startsWith(req.user.id + '/')) return res.status(403).json({ error: 'forbidden' });
```

---

### B3. `/api/storage/sign-upload` accepte un `userId` arbitraire

**Fichier** : `decode-api/api/_storage.js:35-44`

**Impact** : avec service role, `createSignedUploadUrl('tmp/<victim_uuid>/...)` renvoie une URL signée valable sans tenir compte des policies RLS Storage. Un attaquant peut polluer le `tmp/` de n'importe quel utilisateur, déclencher des analyses imputées à autrui, ou stocker du contenu arbitraire.

**Fix** : ignorer `req.body.userId`, dériver `userId = req.user.id` du JWT.

---

### B4. Pas de rate-limit sur `/chat`, `/analyze`, `/ask`, `/translate`, `/mastering-charter`, `/compare`

**Impact** : même une fois B1 corrigé, un attaquant authentifié peut boucler à 100 req/s — quelques milliers d'euros de coût LLM par heure. Le memo `chat_cost_logs` mentionne déjà ce risque comme à surveiller, mais sans rate-limit en place c'est une bombe à retardement.

**Fix** : `npm i express-rate-limit` dans `decode-api`, puis :

```js
const rateLimit = require('express-rate-limit');

const chatLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { error: 'rate_limited' },
});
const analyzeLimiter = rateLimit({
  windowMs: 60 * 60_000,
  max: 10,
  keyGenerator: (req) => req.user?.id || req.ip,
});

app.use('/api/chat', requireAuth, chatLimiter, require('./api/_chat'));
app.use('/api/analyze', requireAuth, analyzeLimiter, require('./api/_analyze'));
// idem ask, translate, mastering-charter (limites adaptées)
```

---

### B5. Headers de sécurité absents sur le frontend

**Fichier** : `versions-app/vercel.json` — uniquement le rewrite SPA, aucun header.

**Impact** : pas de CSP, HSTS, X-Frame-Options, Referrer-Policy, Permissions-Policy. Conséquences :
- L'app peut être embarquée en iframe par un site tiers (clickjacking sur `/dashboard`, le bouton "résilier", la modale de suppression de compte).
- Aucune mitigation XSS si jamais une faille apparaissait.
- Le Referer est leaké en clair sur les liens vers fonts.googleapis.com, Stripe, etc., ce qui peut laisser fuiter des tokens publics `/p/{token}` vers des tiers.

**Fix** : remplacer `vercel.json` par :

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [{
    "source": "/(.*)",
    "headers": [
      { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com; media-src 'self' blob: https://*.supabase.co; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://decode-api-production.up.railway.app https://api.stripe.com; frame-src https://js.stripe.com https://hooks.stripe.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'" },
      { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
      { "key": "X-Content-Type-Options", "value": "nosniff" },
      { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
      { "key": "Permissions-Policy", "value": "microphone=(), geolocation=(), camera=()" },
      { "key": "X-Frame-Options", "value": "DENY" }
    ]
  }]
}
```

**À tester** : déployer en preview Vercel, ouvrir DevTools → Console, vérifier qu'aucune ressource n'est bloquée par CSP. Si Vite inline des `<style>` ou `<script>`, garder `'unsafe-inline'` ; sinon le retirer.

---

### B6. CORS `origin: '*'` côté backend

**Fichier** : `decode-api/server.js:13` + `decode-api/vercel.json` (legacy decode-kappa)

**Impact** : tant que B1 n'est pas réglé, tout site web peut spammer le backend depuis le navigateur d'un visiteur. Une fois B1 corrigé, l'attaquant a quand même besoin d'un JWT volé pour faire dégât, mais limiter le CORS au domaine officiel reste un filet supplémentaire.

**Fix** :

```js
// server.js
const ORIGINS = ['https://versions.studio', 'https://www.versions.studio', 'http://localhost:5173'];
app.use(cors({
  origin: (o, cb) => (!o || ORIGINS.includes(o)) ? cb(null, true) : cb(new Error('CORS')),
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));
```

Et désactiver le projet Vercel `decode-kappa.vercel.app` (vestige migration ratée selon la mémoire) ou supprimer le bloc `headers` de `decode-api/vercel.json`.

---

### B7. `jspdf ^2.5.2` — vulnérabilité high (ReDoS + DoS)

**Fichier** : `versions-app/package.json`

**Advisories** : [GHSA-w532-jxjh-hjhj](https://github.com/advisories/GHSA-w532-jxjh-hjhj), [GHSA-8mvj-3j78-4qmw](https://github.com/advisories/GHSA-8mvj-3j78-4qmw)

**Impact** : un input malformé dans l'export PDF peut bloquer le navigateur (boucle infinie). Faible côté serveur, mais expérience cassée pour le user qui exporte une fiche.

**Fix** :

```bash
cd versions-app
npm i jspdf@^3.0.1
npm dedupe
```

Tester : export Score Card PNG (`exportScoreCard.js`) + export PDF (`exportPdf.js`). Breaking change possible sur l'API jspdf 3.x — vérifier `addImage`, `text`, `setFont`.

---

### B8. Bucket Supabase Storage `track-covers` est public en lecture

**Fichier** : `versions-app/supabase/migrations/007_track_cover_image.sql:48-51`

**Impact** : n'importe qui peut lire les pochettes des titres en énumérant les UUIDs (URLs partagées sur Discord, dans le DOM des fiches publiques). Pour un artiste qui upload une pochette **avant** la sortie publique, c'est une fuite d'illustration pré-release.

**Fix** :

```sql
UPDATE storage.buckets SET public = false WHERE id = 'track-covers';
DROP POLICY "track-covers public read" ON storage.objects;
-- Et adapter l'app pour servir les covers via createSignedUrl(24h)
-- comme c'est déjà fait pour l'audio (cf. memory egress optim).
```

Si tu veux que les fiches publiques `/p/{token}` continuent d'afficher la pochette, fais un signed URL côté serveur dans `get_public_fiche` ou laisse le bucket public **uniquement pour les tracks marquées `is_final`** (à coder via une policy conditionnelle).

---

## 🟠 IMPORTANT — à corriger vite (mais pas bloquant)

### I1. Stack traces et messages d'erreur internes renvoyés au client

Endpoints concernés (envoient `err.message` ou pire au client) :
- `decode-api/api/_chat.js:151`
- `decode-api/api/_compare.js:84`
- `decode-api/api/_ask.js:14`
- `decode-api/api/_translate.js:191-193` (renvoie même `raw: raw.slice(0,500)` — fuite de prompt interne)
- `decode-api/api/_billing.js:113`
- `decode-api/api/_audio-signed-url.js:32`
- `decode-api/api/_storage.js:54`
- `decode-api/api/_mastering_charter.js:236`

**Fix** : journaliser server-side, renvoyer `{ error: 'internal_error' }` générique au client. Garder le détail seulement quand `process.env.NODE_ENV !== 'production'`.

### I2. Health endpoint `/api/billing/health` leak la présence d'env vars

**Fichier** : `decode-api/api/_billing.js:35-42`

Renvoie publiquement `{ stripe: true, supabase: true, webhook_secret: true }`. Donne à un attaquant la confirmation que ces secrets sont configurés (et lesquels manquent). **Fix** : ne renvoyer que `{ ok: true }` ou gater derrière un header `X-Admin-Token`.

### I3. `/api/billing/checkout` accepte tout `priceId` qui commence par `price_`

**Fichier** : `decode-api/api/_billing.js:71-72`

Risque faible (l'attaquant ne peut soumettre qu'un `priceId` qui existe dans **votre** compte Stripe), mais autorise des "low-priced sub" non listés dans la page pricing du front si tu en crées par erreur. **Fix** : whitelister en dur les 7 `priceId` autorisés.

### I4. Cap upload 200 Mo trop généreux côté multer

**Fichiers** : `decode-api/api/_analyze.js:36`, `_listen.js:5`

`multer({ limits: { fileSize: 200 * 1024 * 1024 } })` en `memoryStorage`. Avec quelques requêtes parallèles → OOM Railway. **Fix** : descendre à ~80 Mo (cohérent avec le cap 12 min audio mentionné dans la mémoire).

### I5. `/api/listen` n'a aucun cap de durée

**Fichier** : `decode-api/api/_listen.js:6` — `MAX_AUDIO_DURATION_SEC` n'est appliqué que dans `/analyze`. Gemini est facturé à la minute → un fichier de 60 min sans cap = facture salée. **Fix** : appliquer le même garde-fou durée que dans `/analyze`.

### I6. Validation MIME upload uniquement côté client

**Fichiers** : `versions-app/src/components/AddModal.jsx:656`, `versions-app/src/screens/ReglagesScreen.jsx:139-141` (avatar)

`accept="audio/*,..."` est bypassable trivialement (DevTools → Edit attribute). Si le bucket `avatars` est servi avec `Content-Type: text/html`, un user peut uploader un HTML qui exécute du JS et créer une XSS stockée. **Fix** :

1. Côté Supabase Storage policy `avatars` : whitelist MIME images uniquement.
2. Côté client : valider après lecture (`file.type.startsWith('image/')`) et cap taille (500 KB suffit).

### I7. Admin gating par email hardcodé dans les RLS

**Fichiers** : `supabase/migrations/012:83`, `013:80,113,179,223`, `023:91`, `024:96`

`USING (auth.jwt() ->> 'email' = 'berdugo.david@gmail.com')`. Deux problèmes :
1. Si tu changes d'email, **toutes** les RLS admin cassent silencieusement.
2. Pas de check `email_verified`. À vérifier que Supabase enforce bien la vérification email avant de signer le JWT (par défaut oui, mais à confirmer dans le dashboard projet).

**Fix** :

```sql
CREATE TABLE IF NOT EXISTS public.admin_users (user_id uuid PRIMARY KEY REFERENCES auth.users(id));
INSERT INTO public.admin_users (user_id) SELECT id FROM auth.users WHERE email = 'berdugo.david@gmail.com';

-- puis dans chaque policy admin :
USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
```

Et ajouter `AND (auth.jwt() ->> 'email_verified')::boolean = true` partout par sécurité.

### I8. `get_public_fiche` retourne `analysis_result` brut entier

**Fichier** : `supabase/migrations/002_public_shares.sql:51-56`, étendu en `005:30-36`

Le JSONB `analysis_result` est servi à anon sans filtrage. À vérifier qu'il ne contient pas :
- l'intention artistique privée (`version_intent`),
- des notes brutes ou commentaires internes,
- l'email du créateur,
- des métadonnées techniques sensibles.

**Fix** : avant prod, dumper un `analysis_result` réel (`select analysis_result from versions limit 1;`) et confirmer qu'aucun champ privé ne fuite. Si oui, filtrer dans la RPC.

### I9. `mix_note_completions` autorise des `version_id` qui n'appartiennent pas au caller

**Fichier** : `supabase/migrations/008_mix_note_completions.sql`

La policy ne check que `user_id = auth.uid()`, pas que `version_id` appartient au user. Un user peut écrire des completions sur la version d'un autre user (sous son propre `user_id`, donc il salit son propre tableau seulement). Faible impact mais propre à corriger :

```sql
CREATE POLICY mnc_insert_check ON mix_note_completions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM versions v JOIN tracks t ON t.id = v.track_id
      WHERE v.id = version_id AND t.user_id = auth.uid()
    )
  );
```

### I10. `decode-api/.gitignore` minimaliste

**Fichier** : `decode-api/.gitignore` — ne contient que `node_modules/`. Aucun `.env*`, `*.log`, `.DS_Store`. Aujourd'hui rien n'est commité par accident (vérifié), mais le filet manque.

**Fix** :

```
node_modules/
.env
.env.*
!.env.example
.DS_Store
*.log
dist/
.vercel/
```

### I11. `console.log` verbeux côté frontend

**Fichiers** : `LoadingScreen.jsx:85,105,226,254,279,406,416,433`, `App.jsx:3448,3462`, `lib/storage.js:303`, `components/VChip.jsx:89`

`LoadingScreen.jsx:254` log `userId` en clair. `App.jsx:3448` log la structure complète d'une fiche analysée. Pas de leak de JWT, mais les UUIDs internes et la structure JSON sont exposés à toute extension navigateur installée. **Fix** : wrapper dans `if (import.meta.env.DEV) console.log(...)` ou remplacer par un logger qui no-op en prod.

---

## 🟡 NICE-TO-HAVE

### N1. Logs de démarrage backend incluent la longueur des API keys

**Fichier** : `decode-api/server.js:3-8` — `console.log` affiche `present (51 chars)`. La longueur n'est pas un secret mais c'est un canal latéral inutile. Retirer.

### N2. `VITE_ADMIN_EMAIL` exposé dans le bundle JS public

C'est par design (Vite expose tout `VITE_*`), donc l'attaquant connaît l'email à cibler pour phishing. La vraie défense est l'admin gating côté serveur (déjà en place via les RLS). **Mitigation** : passer par une RPC `is_admin()` côté serveur uniquement, et garder le frontend en mode "best effort" pour l'UX.

### N3. URL fonts Google chargée en clair sur les pages publiques

**Fichiers** : `versions-app/src/screens/PublicFicheScreen.jsx:28`, `SampleFicheScreen.jsx:35`

Le Referer leak la page avec le token public `/p/{token}` vers `fonts.googleapis.com`. Token = 128 bits aléatoire donc pas exploitable seul, mais Google voit chaque visite. **Fix** : self-host les polices ou ajouter `referrerpolicy="no-referrer"` sur le `<link>`.

### N4. `localStorage` cache des projets après sign-out

**Fichier** : `versions-app/src/App.jsx:3252` (`versions_projects_cache`)

Si l'utilisateur partage son ordinateur, la session suivante voit la liste des projets/titres avant que la re-fetch n'efface le cache. **Fix** : flush du cache dans `useAuth.signOut()`.

### N5. Pas de rate-limit DB sur `feedback`

**Fichier** : `supabase/migrations/024_feedback.sql`

Un user authentifié peut spammer 1000 feedback. Faible impact. À surveiller via le dashboard admin feedback si nécessaire.

### N6. Pas de validation de schéma sur les bodies (Zod/Joi)

Toutes les routes backend lisent `req.body.X || ''` sans validation stricte. Pas exploitable vu la couche `express.json({limit:'1mb'})`, mais une validation Zod réduit la surface d'attaque et la dette de qualité.

### N7. Pas de `helmet()` côté Express

`decode-api/server.js` n'utilise pas `helmet`. Comme c'est une pure API JSON, l'impact est faible (`X-Frame-Options` n'a pas de sens sur du JSON), mais c'est une bonne hygiène. À ajouter si tu veux la ceinture-bretelles.

---

## ⚠️ Vérifications à faire en plus, hors code

### V1. Schéma Supabase manquant dans le repo

Les tables `tracks`, `versions`, `comparisons`, `profiles` ont été créées **avant** la migration 001 et leur définition n'est PAS dans `supabase/migrations/`. Idem la RPC `delete_my_account` mentionnée dans le `CLAUDE.md` mais introuvable dans les fichiers SQL.

**Action avant prod** : dumper le schéma réel et vérifier les RLS :

```bash
supabase db dump --schema=public > snapshot.sql
# puis grep 'CREATE TABLE' et 'ENABLE ROW LEVEL SECURITY' pour ces 4 tables
# et vérifier que delete_my_account n'accepte AUCUN paramètre user_id
# (doit utiliser uniquement auth.uid())
```

### V2. Supabase Auth — Redirect URLs

Aller dans le dashboard Supabase → Authentication → URL Configuration et confirmer que les Redirect URLs whitelistées sont **uniquement** :
- `https://versions.studio/auth/callback`
- `https://www.versions.studio/auth/callback`
- `http://localhost:5173/auth/callback` (dev local)

Pas de wildcard `*`, pas de domaines preview Vercel oubliés.

### V3. Google Cloud OAuth — passage en Production

App actuellement en mode Test (max 100 testeurs whitelistés). Pour le launch grand public : soumettre la vérification Google (logo, scopes justifiés, domaines vérifiés via Search Console). Délai 1-4 semaines, à anticiper.

### V4. Désactiver le projet Vercel `decode-kappa`

Le déploiement legacy `decode-kappa.vercel.app` n'est plus utilisé (Railway est l'unique backend prod selon la mémoire). Vérifier que :
1. Aucun DNS/CNAME ne pointe encore dessus.
2. Les variables d'env sensibles (Stripe, service role) ont été retirées du projet Vercel.
3. Si possible : supprimer ou pauser le projet Vercel pour réduire la surface.

### V5. Rotation des secrets après le fix B1

Une fois B1 patché, considérer comme **compromise potentielle** :
- `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `FADR_API_KEY`, `OPENAI_API_KEY` — n'importe qui a pu les abuser tant que les endpoints étaient ouverts. Vérifier les logs de consommation. Rotation recommandée par précaution.
- `SUPABASE_SERVICE_ROLE_KEY` — cette clé n'a pas fuité dans le code (vérifié), mais si tu doutes, rotation possible côté dashboard Supabase.

---

## Récap actions immédiates (ordre conseillé)

1. **B1** : middleware `requireAuth` sur tous les endpoints sauf webhook + health (1-2 h).
2. **B1 (suite)** : ajouter `Authorization: Bearer ${access_token}` sur tous les `fetch` du frontend (1 h).
3. **B2 + B3** : verrou `path.startsWith(req.user.id + '/')` partout où un path Storage est passé (30 min).
4. **B4** : `express-rate-limit` sur `/chat` et `/analyze` (30 min).
5. **B6** : whitelist CORS sur le backend, désactiver decode-kappa (15 min).
6. **B5** : headers de sécurité dans `vercel.json` du frontend, déployer en preview, vérifier qu'aucune ressource n'est cassée par CSP (1 h).
7. **B7** : `npm i jspdf@^3.0.1`, tester l'export PDF + Score Card (30 min — surveiller breaking changes).
8. **B8** : passer `track-covers` en privé + signed URLs côté serveur (1 h).

→ Avec ce parcours, **tu peux passer en prod sereinement en une journée de boulot**.

Tout le reste (`I1` à `I11`, `N1` à `N7`) peut attendre la première semaine post-launch. Mais I1 (stack traces) et I7 (admin RLS hardcodée) sont à faire dans les 7 jours.

---

*Rapport généré par audit automatisé — relire chaque finding avant d'appliquer le fix proposé.*
