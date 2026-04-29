# Upload direct Supabase — plan & état

> **Doc partagée Cowork ↔ Dispatch** — même format que `AUBIOMIX_PLAN.md`.
> Toute session qui reprend ce ticket doit lire ce fichier en premier et le tenir à jour.

## TL;DR

- Le frontend pointe **temporairement** sur Railway (`decode-api-production.up.railway.app`) parce que la migration Vercel du 2026-04-29 13h31 (commit `10bda82`) a cassé les uploads WAV : Vercel serverless impose ~**4,5 Mo** par body de requête. David a besoin d'envoyer jusqu'à 70 Mo.
- Tant que l'upload direct navigateur → Supabase Storage n'est pas branché, **on ne peut PAS repointer le front sur Vercel**.
- Le commit qui revert l'API URL : `400eede` (2026-04-29 soir). Voir `versions-app/src/constants/api.js`.

## Pourquoi on est dans cette situation

Le 2026-04-29 matin, une session a livré un gros bloc :
- Stripe Checkout + webhook
- Schéma `user_credits` / `credit_events`
- Cap audio 12 min (back + front)
- **Migration Express monolithique → Vercel serverless** (`decode-kappa.vercel.app via api/index.js`, vercel.json rewrite)

Le test E2E de validation utilisait la carte test Stripe `4242…` avec un fichier audio probablement court / léger — donc la régression du body limit n'a pas été vue. Quand David a tenté une vraie analyse en soirée avec un WAV, ça a fait page blanche (le bug React #300 dans LoadingScreen masquait l'erreur 413).

La mémoire `project_versions_storage_plan.md` (12 jours) disait déjà clairement : « upload direct à faire ». Ce qui a été branché côté Supabase Storage = transcodage MP3 + lecture audio via signed URL. **Pas** l'upload direct.

## Ce qu'on perd avec Railway en frontal

Routes qui ne marchent plus côté Railway (existent uniquement sur Vercel) :
- `/api/billing/checkout` → bouton "Acheter" sur PricingScreen 404. **Pas critique** : `MONETIZATION_ENABLED=false`, pas d'utilisateurs payants.
- `/api/billing/webhook` → URL Stripe pointe encore sur Vercel. Inactif tant que MONETIZATION_ENABLED=false.
- Cap 12 min côté serveur (`api/_analyze.js`). **Reste enforced côté front** dans `AddModal.jsx` — solide pour utilisateurs honnêtes.
- Admin dashboard cost tracking — secondaire.

Routes qui marchent côté Railway (code historique avant migration Vercel) :
- `/api/analyze/start`, `/api/analyze/status/:id` — pipeline complet
- `/api/audio/signed-url`
- `/api/listen`, `/api/chat`, `/api/ask`, `/api/compare`, `/api/translate`

## Plan pour brancher l'upload direct (objectif : repointer sur Vercel)

Estimation : **2-3h**, faisable en autonomie côté code. David doit lancer la migration SQL et vérifier la CORS.

### Étape 1 — Backend `decode-api` : nouvel endpoint sign-upload

Fichier à créer : `decode-api/api/_storage.js`

```js
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const router = express.Router();
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// POST /api/storage/sign-upload
// Body : { userId, ext } (ext = 'wav' | 'mp3' | …)
// Resp : { storagePath, uploadUrl, token }
router.post('/sign-upload', async (req, res) => {
  const { userId, ext } = req.body || {};
  if (!userId) return res.status(400).json({ error: 'userId requis' });
  const safeExt = (ext || 'wav').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 4) || 'wav';
  const storagePath = `tmp/${userId}/${Date.now()}-${randomUUID()}.${safeExt}`;
  try {
    const { data, error } = await supabase.storage
      .from('audio')
      .createSignedUploadUrl(storagePath);
    if (error) throw error;
    res.json({ storagePath, uploadUrl: data.signedUrl, token: data.token });
  } catch (err) {
    console.error('[storage] sign-upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
```

Mounter dans `decode-api/server.js` : `app.use('/api/storage', require('./api/_storage'));`

### Étape 2 — Backend : adapter `/api/analyze/start`

Dans `decode-api/api/_analyze.js`, accepter en plus du multipart classique un body JSON `{ storagePath, refStoragePath, …meta }`.

Si `storagePath` fourni :
1. Télécharger le fichier depuis Supabase Storage (`supabase.storage.from('audio').download(storagePath)`).
2. Reconstituer le buffer comme si c'était `req.file.buffer` (ce que multer remplit en multipart).
3. Continuer le pipeline normalement.
4. À la fin de l'analyse : déplacer `tmp/X` → chemin final via le code de transcodage déjà en place.

Backward-compatible : si pas de `storagePath`, garder le path multipart classique (filet de sécurité).

### Étape 3 — Frontend `LoadingScreen.jsx`

Remplacer `versions-app/src/screens/LoadingScreen.jsx` ~ligne 218-270 :

```js
// Au lieu de formData.append("file", config.file) :
// 1. Demander une URL d'upload signée
const ext = (config.file.name.split('.').pop() || 'wav').toLowerCase();
const signRes = await fetch(`${API}/api/storage/sign-upload`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, ext }),
});
if (!signRes.ok) throw new Error(s.loading.errorStart.replace('{status}', String(signRes.status)));
const { storagePath, uploadUrl, token } = await signRes.json();

// 2. Upload direct vers Supabase via PUT signé (bypass complet de Vercel)
const upRes = await fetch(uploadUrl, {
  method: 'PUT',
  headers: { 'Content-Type': config.file.type || 'application/octet-stream' },
  body: config.file,
});
if (!upRes.ok) throw new Error('Upload direct Supabase échoué');

// 3. Démarrer le job avec body JSON minuscule
const startRes = await fetch(`${API}/api/analyze/start`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    storagePath,
    daw: config.daw,
    title: config.title,
    version: config.version,
    vocalType: config.vocalType,
    locale: lang,
    userId,
    durationSeconds,
    skipIntent: !INTENT_ENABLED,
    intent: config.inlineIntent || null,
    declaredGenre: config.declaredGenre || null,
    genreUnknown: !!config.genreUnknown,
    previousFiche, previousAnalysisResult, previousCompletions,
  }),
});
```

Pareil pour `refFile` si fourni : 2e sign-upload + 2e PUT, et passer `refStoragePath` dans le body JSON.

### Étape 4 — Supabase : RLS policy bucket `audio`

Migration SQL à lancer par David dans le SQL Editor Supabase :

```sql
-- Autorise les utilisateurs authentifiés à uploader sur tmp/{leur userId}/*
CREATE POLICY "users can upload tmp audio"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'audio'
  AND (storage.foldername(name))[1] = 'tmp'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Service role peut tout faire (déjà en place via SERVICE_ROLE_KEY,
-- inutile de l'ajouter en policy mais à confirmer)
```

### Étape 5 — Supabase : CORS bucket `audio`

Dashboard Supabase → Storage → bucket `audio` → Configuration → CORS.
Vérifier que `https://versions.studio` est autorisé en `PUT`. Probablement déjà OK puisque la lecture marche, mais à confirmer.

### Étape 6 — Test local

1. Backend : `cd ~/decode-api && npm start` → vérifier que `/api/storage/sign-upload` répond OK avec `userId` factice.
2. Front : test manuel sur `npm run dev` avec un WAV ~50 Mo. Doit passer en quelques secondes.

### Étape 7 — Repoint Vercel

Une fois étapes 1-6 testées localement et pushées :
1. Editer `versions-app/src/constants/api.js` :
   ```js
   const API = "https://decode-kappa.vercel.app";
   ```
2. Push, attendre redeploy Vercel, hard refresh.
3. Test prod avec un gros WAV.
4. Une fois validé : on peut envisager de shutdown Railway (mais pas urgent — laisser tourner en filet de sécurité quelques jours).

## Garde-fous

- **Backward-compatible** : le backend doit garder le path multipart en fallback. Si quelque chose casse côté front, il suffit de revert le commit frontend pour revenir à l'ancien comportement.
- **Cleanup tmp/** : prévoir un job (ou une suppression à la fin de l'analyse) pour ne pas accumuler les `tmp/` orphelins dans Supabase. Le bucket Free est limité à 1 Go.
- **Cap 12 min** : maintenu côté front dans `AddModal.jsx` + ajouter en plus la revalidation côté serveur dans la nouvelle branche JSON de `/analyze/start`.

## Historique
- 2026-04-29 13h31 — commit `10bda82` : migration API URL Railway → Vercel. Casse les uploads > 4,5 Mo.
- 2026-04-29 soir — commit `400eede` : revert API URL → Railway. Restaure les uploads. Plan ci-dessus créé.
