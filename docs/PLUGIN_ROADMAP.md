# Versions Plugin DAW — Roadmap

> **ÉTAT AU 2026-06-25 — quasiment tout est LIVRÉ, EN PROD et LIÉ au site.**
> Source de vérité détaillée : `~/versions-plugin/CLAUDE.md` (état, pièges
> Logic, conventions UI) + `~/versions-plugin/docs/PLUGIN_QUOTA_BACKEND.md`
> (quotas + monétisation).
>
> **IL NE RESTE QU'UNE CHOSE** pour que la boucle soit complète :
> **annoncer le plugin sur la landing page `versions.studio`** (section
> dédiée + lien de téléchargement du `.pkg`/`.dmg`). Tout le reste ci-dessous
> est fait.

---

## Ce qui est LIVRÉ (et en prod)

### Plugin (AU + VST3, macOS)
- **Metering temps réel** complet : LUFS BS.1770 (M/S/I), True Peak 4×, RMS,
  Crest, **vrai LRA EBU Tech 3342**. Gratuit, illimité, 100 % local.
- **Spectre** niveau FabFilter (tilt +3 dB/oct, lissage 1/6 oct, balistique
  asymétrique, ombre rémanente) + **Stereo Image** (vectorscope à particules,
  corrélation, width — mesure intouchable).
- **Chat IA contextuelle** via versions-api : Haiku par défaut, **Sonnet auto**
  dès qu'il y a des spectres inter-pistes. Anti-hallucination plugins, langue
  FR/EN/auto, alimenté par l'arsenal curé de l'utilisateur.
- **Session View multi-instance** (LE différenciateur) : hub same-process, chat
  IA inter-pistes (LUFS/crest/spectres), bandeau, panneau spectral façon Pro-Q,
  détection de masquage calibrée. « Neutron mixe à ta place. Versions t'apprend
  à mixer. »
- **Écoute express** : capture ~30 s → écoute Gemini courte → verdict dans le
  chat (mode stem hors bus de somme).
- **Curation des plugins** par fabricant (registre AU + VST3 + Waves réels +
  stock Logic), persistée, injectée dans le chat.
- **Auth JWT** : login email/mdp + Google PKCE, refresh GoTrue, session partagée
  et persistée, **tokens en Keychain macOS** (hardening livré).
- **Identité** : logo onde + wordmark DM Sans bicolore embarqués, 3 tailles
  (Small/Medium/Large), saisie clavier fiabilisée dans Logic (overlay invisible).
- **Notification de mise à jour** : le plugin lit `versions.studio/plugin-version.json`
  au lancement et signale une version plus récente dans le chat.

### Quotas + monétisation (LIVRÉ 2026-06-25)
- **Bug corrigé** : le quota express était cassé en prod (fonctions SQL pointant
  des colonnes inexistantes → non enforcé). Réécrit et actif.
- **Modèle** : gratuit = 15 écoutes express/mois + **10 messages chat/jour** ;
  **abonné Indie/Pro = illimité** (fair-use 300 express + 1000 chat/mois).
- **Détection d'abonné** = `user_credits.monthly_grant > 0` (helper SQL
  `plugin_is_subscriber`, garde-fou renouvellement).
- **Backend** : `/api/plugin/feedback` consomme `plugin_chat_consume` via le JWT
  user (le plugin envoie désormais `Authorization: Bearer`).
- **Site** : ligne « Et dans le plugin : écoute express + chat IA en illimité »
  sur `/pricing` (incluse aux abos, prix inchangés). Migrations Supabase
  appliquées (035/036).

### Distribution (LIVRÉ)
- **Installeur signé Developer ID + notarisé Apple + stapled** : `.pkg` et `.dmg`
  charte Versions, s'ouvrent sans alerte Gatekeeper. `./scripts/release.sh`
  enchaîne bump de version + build Release **universal (arm64 + x86_64)** +
  signature + notarisation. Cible macOS 11+.
- **AU + VST3** : ouvre Logic ET les DAW VST3 (Ableton, Cubase, Studio One,
  Reaper, Bitwig…).
- **Version courante : 0.1.8** (2026-06-25), en ligne via `plugin-version.json`.

---

## RESTE À FAIRE

1. **Annoncer le plugin sur la landing `versions.studio`** ← dernier maillon :
   section dédiée (pitch, captures, « Neutron mixe à ta place, Versions
   t'apprend à mixer ») + bouton de téléchargement du `.pkg`/`.dmg` 0.1.8.
   Une fois fait, la boucle site ↔ plugin est complète et publique.
2. Mineurs (confort, non bloquants) :
   - Bascule du CTA « Passer en illimité → /pricing » quand le quota chat est
     atteint (choix de layout, à faire en session live).
   - Enrichissements curation : déplier WaveShell (Waves), recherche dans la
     modal de curation.
   - Windows : rangé pour plus tard (chantier lourd, pas de blocage moteur JUCE).

---

## Historique — plan de phases initial (2026-06-04, pour mémoire)

> Conservé tel quel : toutes ces phases sont aujourd'hui dépassées par la
> livraison réelle ci-dessus.

- **Phase 1** — Plugin minimal : setup JUCE, metering, UI, signature. ✅
- **Phase 2** — Connexion compte : auth JWT, `/api/plugin/feedback`, chat. ✅
- **Phase 3** — Analyse depuis le plugin : express (✅) ; drag & drop bounce →
  fiche complète CODÉ puis RETIRÉ (bascule express-only, l'analyse complète
  vit sur le site).
- **Phase 4** — Avancé : détection canal ✅, spectre cible, A/B référence
  (ABANDONNÉ — hors moat), snapshots. Session View livrée à la place.
- **Phase 5** — Polish + distribution : UI premium ✅, installeurs signés ✅,
  auto-update (notif fichier statique) ✅, onboarding.

## Stack : JUCE 7+ C++17, CMake, Xcode, JWT, backend Railway, Supabase.
## Coût fixe : Apple Developer 99 €/an (compte individuel David, Team YRZ487P3P5).
