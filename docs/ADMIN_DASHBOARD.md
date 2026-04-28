# Admin Dashboard — Tracking de coût par analyse

Mise en service du dashboard admin (#/admin) qui mesure le coût réel de chaque analyse (Gemini + Claude + Fadr + infra) et l'affiche en agrégé.

## 1. Appliquer la migration SQL

Une seule fois. Dans Supabase Studio → SQL Editor → Run :

```
versions-app/supabase/migrations/012_analysis_cost_logs.sql
```

Crée la table `public.analysis_cost_logs` + RLS (admin SELECT, service_role INSERT).

⚠️ La policy SELECT contient l'email admin **hardcodé** (`berdugo.david@gmail.com`). Si tu veux changer d'admin, fais une nouvelle migration `013_change_admin_email.sql` qui DROP/RECREATE la policy avec le nouvel email.

## 2. Configurer la variable d'env frontend

Dans `versions-app/.env.local` (en dev) :

```
VITE_ADMIN_EMAIL=berdugo.david@gmail.com
```

Et sur **Vercel → versions-app → Settings → Environment Variables** (Production + Preview) :

```
VITE_ADMIN_EMAIL = berdugo.david@gmail.com
```

Puis redéploie le frontend (un push sur main suffit).

Sans cette variable, le lien "Admin" n'apparaît pas dans la sidebar et `#/admin` affiche "Accès refusé".

## 3. Redéployer le backend

Le backend `decode-api` a été modifié (capture des usage tokens + insertion). Push sur main pour déclencher le redeploy Vercel. Aucune var d'env nouvelle côté backend (`SUPABASE_SERVICE_ROLE_KEY` est déjà présente).

## 4. Vérifier que ça marche

1. Lance une analyse depuis l'app
2. Attends qu'elle se termine ("Terminé · 100 %")
3. Va sur `/#/admin` (lien "Admin" dans la sidebar)
4. Tu dois voir 1 ligne dans "Dernières analyses" avec le breakdown `Gemini / Claude / Fadr / Total`

Si la ligne n'apparaît pas, regarde les logs Vercel du backend : tu dois voir `[costTracker] logged: X.XXXX €`. Si tu vois `[costTracker] insert error`, c'est que la migration n'a pas tourné ou que la service_role_key est mal configurée.

## 5. Ajuster les tarifs

Les tarifs unitaires (€ par 1M tokens) et les forfaits Fadr/infra sont des constantes dans :

```
decode-api/lib/costTracker.js
```

Modifie les valeurs en haut du fichier quand tu auras tes vrais chiffres de facturation, push, redéploie. Les analyses futures seront calculées au nouveau tarif (les anciennes lignes restent à l'ancien tarif — c'est ok, c'est de l'historique).

## 6. Décider des nouveaux prix avec les vraies données

Une fois que tu as 30-50 analyses loggées, ouvre `#/admin` et regarde :

- **Coût moyen** vs ton plus bas prix unitaire (3,00 €). Si la marge est < 50 %, remonte les prix bas.
- **P95** : 5 % des analyses coûtent plus que ça. Si le P95 dépasse 1,50 €, augmente les abos (ou baisse le hard cap audio à 8 min au lieu de 12 min).
- **Top consommateurs** : si un user représente > 20 % du coût total à lui seul, c'est un signal qu'il faut des hard caps plus serrés ou un palier supérieur.

À ce moment-là, on rouvre la grille de prix dans `PricingScreen.jsx` et on ajuste avec les chiffres en main.
