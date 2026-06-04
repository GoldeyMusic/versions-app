# Versions Plugin DAW — Roadmap

> **ÉTAT AU 2026-06-04 — lire d'abord `~/versions-plugin/CLAUDE.md`**
> (source de vérité détaillée : état, pièges Logic, conventions UI).
> Résumé : Phases 0, 1 et 2.A LIVRÉES + bien plus — metering complet
> (LUFS/TP/RMS/Crest + vrai LRA EBU), spectre niveau FabFilter, panneau
> arcs + dôme stéréo à particules, chat IA contextuelle (anti-hallucination
> plugins, langue FR/EN/auto), curation des plugins par fabricant (registre
> AU + Waves réels + stock Logic), Settings complète (profil, DAWs
> multi-sélection), tailles discrètes XS→Max, saisie clavier fiabilisée
> dans Logic (overlay invisible).
>
> **PRIORITÉS DÉCIDÉES (2026-06-04)** :
> 1. **Multi-instance "Console View"** — une instance par piste + master qui
>    communiquent (hub partagé même process, façon Neutron/Pro-Q), l'IA voit
>    toute la console et conseille inter-pistes. Sans ARA. LE différenciateur.
> 2. Phase 3 en 3 niveaux : chat chiffres (fait) / feedback express sur
>    extrait 30-60 s via buffer circulaire + écoute Gemini courte / fiche
>    complète par drag & drop du bounce (pas de capture temps réel 4 min).
> 3. S6 Compare (A/B), signature Apple Developer ID, Phase 2.B auth JWT.

## Vision

Un plugin VST3/AU/AAX qui apporte Versions directement dans le DAW. Metering temps réel gratuit + feedback IA à la demande + lien vers la fiche complète sur le site. Même compte, mêmes crédits.

## Plateformes

Mac + Windows dès le départ. JUCE compile les deux depuis le même code source. Formats : VST3 + AU + AAX. DAWs prioritaires : Ableton, Logic, FL Studio, Pro Tools, Reaper, Studio One, Cubase.

## Modèle économique

Plugin gratuit (outil d'acquisition). Metering temps réel = gratuit illimité (local). Feedback rapide IA (basé sur chiffres) = 1 message par question (inclus dans abo Versions, ~0.01-0.03$/msg). Analyse complète (envoi audio Gemini) = 1 crédit Versions (~0.10-0.25$).

## Phase 1 — Plugin minimal (sem 1-3)
- Setup projet JUCE + build Mac/Windows
- Metering : LUFS intégré/short-term/momentary, True Peak 4x, RMS, Crest, LRA, Stéréo (correlation, width, mid/side)
- UI minimale 400x600 : affichage temps réel, spectre 8 bandes, design Versions (dark, amber)
- Signature Mac (Apple Developer ID) + installeur Windows

## Phase 2 — Connexion compte Versions (sem 3-4)
- Auth dans le plugin (login/OAuth, JWT en Keychain/CredentialManager)
- Endpoint POST /api/plugin/feedback (chiffres metering + question → Claude → feedback texte)
- Chat dans le plugin (question → chiffres actuels envoyés → réponse IA en 2s)

## Phase 3 — Analyse complète depuis le plugin (sem 5-6)
- Capture audio (buffer circulaire ou drag & drop fichier)
- Upload vers backend Versions → analyse Gemini + Claude
- Notification + bouton "Voir la fiche" → ouvre navigateur
- Intention artistique dans le plugin

## Phase 4 — Features avancées (sem 7-10)
- Détection type de canal (master/bus/individuel)
- Spectre EQ courbe smooth + overlay cible par genre
- Comparaison référence (A/B temps réel, overlay spectral, AI Compare)
- Snapshots metering (avant/après, synchro avec suivi versions webapp)

## Phase 5 — Polish et distribution (sem 10-12)
- UI premium (halos, DM Sans, animations, mode compact/étendu, redimensionnable)
- Installeurs signés (.dmg + .exe), page téléchargement, auto-update
- Onboarding premier lancement

## Stack : JUCE 7+ C++17, CMake, Xcode + Visual Studio, JWT, même backend Railway.
## Coûts fixes : Apple Developer $99/an, code signing Windows ~$70-200/an.

## Prochaine action : installer JUCE + Xcode, créer projet vide, confirmer que le plugin charge dans un DAW.
