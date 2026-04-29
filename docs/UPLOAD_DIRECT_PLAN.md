# Upload direct Supabase — décision et plan

> **Doc partagée Cowork ↔ Dispatch** — même format que `AUBIOMIX_PLAN.md`.
> Toute session qui reprend ce ticket doit lire ce fichier en premier.

## Décision actuelle (2026-04-29 soir) : on n'active PAS l'upload direct

Après deux soirées de tâtonnement, l'architecture retenue est l'historique :

```
Navigateur ──── multipart WAV ────▶ Railway ──── MP3 256k ────▶ Supabase
                                    (transcode RAM)
```

- Le navigateur envoie le WAV brut à Railway (qui n'a pas de limite body).
- Railway tourne Gemini, Fadr, DSP en RAM sur le WAV.
- Railway transcode WAV → MP3 256k et uploade le **MP3** sur Supabase.
- Supabase ne voit que des fichiers de ~10 Mo : OK même sur Free, pas d'egress de transit.

`src/constants/api.js` pointe sur `https://decode-api-production.up.railway.app`.
`src/screens/LoadingScreen.jsx` est en mode multipart classique.

## Pourquoi on n'active PAS l'upload direct

L'upload direct (navigateur → Supabase tmp/ → backend télécharge) résolvait la limite ~4,5 Mo body de Vercel serverless. Mais en pratique :

1. **On veut rester sur Railway** pour le pipeline d'analyse — le passage à Vercel serverless du matin du 2026-04-29 n'a apporté aucun gain fonctionnel pour l'instant (Railway a déjà tout : Stripe, cap 12 min, Fadr, signed-url, billing). Le seul plus de Vercel c'est le scaling auto et le fonction-based pricing — pas urgent à ce stade.
2. **L'upload direct double l'egress Supabase** : 67 Mo entrent dans tmp/, puis sortent vers le backend pour traitement. Avec le pipeline historique, Supabase ne reçoit QUE le MP3 transcodé (10 Mo). C'est 6× moins d'egress.
3. **Sur Free, le cap upload Supabase à 50 Mo cassait l'upload direct** dès que le WAV dépassait 50 Mo (typique pour un titre stéréo 24 bit / 96 kHz de 4-5 min).
4. **Pro Supabase** a été pris pour résoudre le quota egress (12 Go consommés sur 5 Go inclus en avril 2026), pas pour débloquer l'upload size.

## État du code

- **Backend** (`decode-api`) : l'endpoint `POST /api/storage/sign-upload` est en place dans `api/_storage.js`, et `api/_analyze.js` accepte un body JSON avec `storagePath` en plus du multipart historique. **Backward-compatible : le path multipart marche toujours, c'est ce qu'utilise le frontend.**
- **Frontend** (`versions-app`) : `LoadingScreen.jsx` est en multipart pur. La logique upload direct a été écrite, testée, puis annulée (commit reverted).
- **Supabase** : la RLS policy `users can upload tmp audio` est en place pour `audio/tmp/{userId}/*`. Le `file_size_limit` du bucket `audio` est à 500 Mo (push manuel via SQL). Inutile en pratique aujourd'hui.

## Si on veut un jour repasser sur Vercel pour le backend

Reprendre dans cet ordre :

1. **Activer le code frontend dormant** : remettre dans `LoadingScreen.jsx` la branche upload direct (sign-upload → uploadToSignedUrl SDK → POST JSON). L'historique git contient la version exacte (commits du 2026-04-29 soir, à chercher autour de `8e6c8d4` — `400eede`).
2. **Vérifier que Pro Supabase autorise un Global file size limit > 50 Mo** dans `Settings → Storage`.
3. **Tester avec un gros WAV** (~67 Mo). À surveiller : l'egress qui doublera (chaque upload = 1 entrée + 1 sortie sur Supabase).
4. **Repointer `src/constants/api.js`** sur `https://decode-kappa.vercel.app`.
5. **Repointer le webhook Stripe** dans le Dashboard Stripe vers la même URL Vercel.

Le plan détaillé original (endpoint sign-upload, RLS SQL, refactor LoadingScreen) reste valide et exécutable en ~30 min puisque le backend est déjà prêt.

## Architecture cible long-terme

À mesure que l'app grandit, l'upload direct redeviendra pertinent :

- Si un utilisateur uploade un mix qui pousse Railway en OOM (Railway a 512 Mo RAM par défaut sur Hobby).
- Si le pricing Vercel serverless devient économiquement plus intéressant.
- Si on veut éliminer Railway de l'archi pour ne dépendre que de Supabase + Vercel.

À ce moment-là, on suit le plan ci-dessus + on déplace le job state en table Supabase (au lieu d'un `Map` en RAM Railway) pour rendre Vercel/Railway interchangeables.

## Historique des commits liés
- `10bda82` (matin du 2026-04-29) : migration API URL Railway → Vercel. Casse les uploads > 4,5 Mo, non détecté en review.
- `400eede` (soir du 2026-04-29) : revert API URL → Railway. Restaure les uploads.
- `5411cfd` : doc plan upload direct (cette doc, version initiale).
- Commits suivants : tentative d'activer l'upload direct côté backend (`api/_storage.js`) puis frontend, puis revert frontend après découverte du cap 50 Mo Free.
- Commit final : retour multipart pur côté frontend, le code backend dort prêt à servir.
