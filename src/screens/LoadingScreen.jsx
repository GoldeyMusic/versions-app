import { useState, useEffect, useRef } from 'react';
import API from '../constants/api';
import { confirmDialog } from '../lib/confirm.jsx';
import { hashAudioFile, findDuplicateAudio, loadTracks, getInheritedIntentByTitle, loadNoteCompletions } from "../lib/storage";
import { supabase } from "../lib/supabase";
import useLang from '../hooks/useLang';

// ── Feature flag intention artistique ──
// Quand VITE_INTENT_ENABLED !== 'true', on force skipIntent=true côté backend
// pour que le pipeline tourne exactement comme avant (non-regression garantie).
const INTENT_ENABLED = import.meta.env.VITE_INTENT_ENABLED === 'true';

const LoadingScreen = ({ config, onDone, onAwaitingIntent, onBackToInput }) => {
  const { s, lang } = useLang();
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState(null);
  const jobIdRef = useRef(null);
  const sentFadr = useRef(false);
  // canceledRef : quand l'utilisateur clique "Annuler l'analyse", on lève ce
  // flag pour que la boucle de polling sorte proprement au prochain tick (au
  // lieu d'appeler onDone sur un composant démonté).
  const canceledRef = useRef(false);

  const hasRef = !!config?.refFile;

  const steps = hasRef
    ? [s.loading.stepUploadMulti, s.loading.stepListening, s.loading.stepWriting, s.loading.stepDone]
    : [s.loading.stepUploadOne, s.loading.stepListening, s.loading.stepWriting, s.loading.stepDone];

  const tipsSource = Array.isArray(s.loading.tips) ? s.loading.tips : [];
  const [shuffledTips] = useState(() => {
    const arr = [...tipsSource];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
    if (!shuffledTips.length) return;
    const id = setInterval(() => setTipIdx(i => (i + 1) % shuffledTips.length), 12000);
    return () => clearInterval(id);
  }, [shuffledTips.length]);

  useEffect(() => {
    const run = async () => {
      try {
        setPhase(0);
        sentFadr.current = false;

        // Nom de la version précédente (utilisé pour libeller le bandeau
        // d'évolution côté front). Déclaré AVANT le bloc resume pour
        // éviter une TDZ — sinon le mode resume crashe en référençant
        // cette variable qui ne serait définie que plus bas.
        let previousVersionName = null;

        // ── Mode RESUME : on reprend un job existant (retour depuis
        // IntentionScreen après submit/skip). On SKIP tout le setup
        // (hash, dup check, POST /start) et on saute direct au polling
        // du même jobId. Évite de relancer une analyse complète.
        if (config?.resumeJobId) {
          jobIdRef.current = config.resumeJobId;
          console.log("↩️ VERSIONS Resume polling existing job:", config.resumeJobId);
          setPhase(2);
          // Best-effort : récupère le nom de la dernière version du même
          // titre pour libeller correctement le bandeau "Depuis V_n" si
          // une évolution a bien été générée côté backend. Pas bloquant.
          try {
            const allTracks = await loadTracks();
            const sameTitle = allTracks.find((t) => t.title === config.title);
            if (sameTitle?.versions?.length) {
              previousVersionName = sameTitle.versions[sameTitle.versions.length - 1]?.name || null;
            }
          } catch { /* noop : fallback "Depuis la dernière" */ }
          const jobId = config.resumeJobId;
          let attempts = 0;
          let noFicheRetries = 0;
          while (attempts < 120) {
            await new Promise((r) => setTimeout(r, 3000));
            if (canceledRef.current) return;
            const pollRes = await fetch(`${API}/api/analyze/status/${jobId}`);
            const job = await pollRes.json();
            console.log("🔄 Poll (resume)", attempts, "— status:", job.status, "stage:", job.stage, "pct:", job.pct, "hasFiche:", !!job.fiche, "keys:", Object.keys(job).join(","));
            if (canceledRef.current) return;
            if (job.status === "error") {
              throw new Error(job.error || s.loading.errorFailed);
            }
            // En mode resume on ne repasse plus par awaiting_intent
            // (l'utilisateur a déjà soumis ou skippé son intention).
            // On n'accepte PLUS listening_done ici : c'est un état transitoire,
            // on attend all_done (fiche présente) ou status=complete.
            const isTerminal = job.stage === "all_done" || job.status === "complete";
            if (isTerminal && !sentFadr.current) {
              // Cas pathologique : stage all_done mais fiche absente — on retente
              // quelques fois au cas où c'est un race transitoire côté backend.
              if (!job.fiche && noFicheRetries < 4) {
                console.warn("⚠️ VERSIONS Resume all_done mais fiche manquante — retry", noFicheRetries + 1, "/ 4");
                noFicheRetries++;
                attempts++;
                continue;
              }
              if (!job.fiche) {
                throw new Error(s.loading.errorFailed + " (fiche manquante au terminal)");
              }
              sentFadr.current = true;
              setPhase(3);
              onDone({
                fiche: job.fiche,
                listening: job.listening || null,
                evolution: job.evolution || null,
                fadrMetrics: job.fadrMetrics || null,
                dspMetrics: job.dspMetrics || null,
                // DSP_PLAN B.6 — Phase 3 (stems + stereo). Bugfix 2026-04-28 :
                // ce callsite avait été oublié par le replace_all initial à
                // cause d'un indent différent → la nouvelle analyse persistait
                // bien dspMetrics mais pas stemsMetrics/stereoMetrics, donc les
                // visuels C.1/C.2 ne se rendaient pas malgré une donnée Phase 3
                // valide côté backend.
                stemsMetrics: job.stemsMetrics || null,
                stereoMetrics: job.stereoMetrics || null,
                _previousVersionName: previousVersionName,
                meta: job.meta,
                audioHash: config.audioHash,
                storagePath: job.storagePath || null,
                _jobId: jobId,
                _stage: "all_done",
                intent_used: job.intent_used || null,
              });
              return;
            }
            if (job.pct > 40) setPhase(2);
            else if (job.pct > 10) setPhase(1);
            attempts++;
          }
          throw new Error(s.loading.errorTimeout);
        }

        // Hash + check doublon (évite une analyse Gemini inutile)
        if (config.file) {
          const audioHash = await hashAudioFile(config.file);
          config.audioHash = audioHash;
          const dup = await findDuplicateAudio(config.title || '', audioHash);
          if (dup) {
            throw new Error(s.loading.errorDuplicate.replace('{name}', dup.name));
          }
        }

        // Durée du fichier (pour détecter "autre titre" vs "version")
        let durationSeconds = null;
        if (config.file) {
          durationSeconds = await new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = "metadata";
            audio.onloadedmetadata = () => resolve(audio.duration);
            audio.onerror = () => resolve(null);
            audio.src = URL.createObjectURL(config.file);
          });
        }

        // Récupérer la fiche de la version précédente du même titre (calibrage)
        // + l'écoute associée pour pouvoir générer le bandeau d'évolution
        // (suivi inter-versions). Si la dernière version n'a pas d'écoute
        // (vieille analyse), on bascule sur previousFiche seul, comme avant.
        // (previousVersionName est déclaré en haut du run pour le mode resume.)
        let previousFiche = null;
        let previousAnalysisResult = null;
        let previousCompletions = null;
        try {
          const allTracks = await loadTracks();
          const sameTitle = allTracks.find((t) => t.title === config.title);
          if (sameTitle?.versions?.length) {
            const last = sameTitle.versions[sameTitle.versions.length - 1];
            previousFiche = last?.analysisResult?.fiche || null;
            previousVersionName = last?.name || null;
            if (last?.analysisResult?.fiche && last?.analysisResult?.listening) {
              previousAnalysisResult = {
                fiche: last.analysisResult.fiche,
                listening: last.analysisResult.listening,
                intent_used: last.analysisResult.intent_used || null,
              };
            }
            // Ticket 4.2 — items cochés "implémentés" sur V_(n-1). Le backend
            // verrouille les sub-scores concernés à la baisse en V_n.
            if (last?.id) {
              try {
                const set = await loadNoteCompletions(last.id);
                if (set && set.size) previousCompletions = Array.from(set);
              } catch {}
            }
          }
        } catch {}

        // Check durée vs précédente — alerte si autre titre probable
        console.log("[DBG-DUR] dur=", durationSeconds, "prev.duration_seconds=", previousFiche?.duration_seconds);
        if (durationSeconds && previousFiche?.duration_seconds) {
          const prev = previousFiche.duration_seconds;
          const diff = Math.abs(durationSeconds - prev) / prev;
          if (diff > 0.10) {
            const fmt = (sec) => Math.floor(sec/60) + ":" + String(Math.round(sec%60)).padStart(2,"0");
            const message = s.loading.dupCheckMessage
              .replace('{thisDur}', fmt(durationSeconds))
              .replace('{prevDur}', fmt(prev))
              .replace('{pct}', String(Math.round(diff*100)));
            const action = await confirmDialog({
              title: s.loading.dupCheckTitle,
              message,
              confirmLabel: s.loading.dupCheckContinue,
              cancelLabel: s.loading.dupCheckCancel,
              tertiaryLabel: s.loading.dupCheckNewTitle,
            });
            if (action === "tertiary") { onBackToInput?.(); return; }
            if (action !== "confirm") throw new Error(s.loading.errorCancelled);
          }
        }

        // Récupère l'utilisateur courant pour décider du flow d'upload.
        // Si userId présent : upload direct navigateur → Supabase Storage
        // (bypass complet de la limite ~4,5 Mo body Vercel serverless).
        // Sinon : fallback multipart historique (cas rares, ex. anonymous).
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        console.log('[analyze] userId:', userId);

        setPhase(1);
        let startRes;

        // Workaround 2026-04-30 : upload direct Supabase pend
        // indéfiniment (signed URL → requête PUT/POST stuck en (pending)
        // dans Network tab, jamais résolue). On force le chemin multipart
        // (browser → Railway → MP3 → Supabase) qui marche déjà, en
        // attendant un fix côté Supabase Storage / policy. Cf. mémoire
        // project_versions_upload_direct_pending.md.
        const USE_DIRECT_UPLOAD = false;
        if (USE_DIRECT_UPLOAD && userId && config.file) {
          // ─── UPLOAD DIRECT NAVIGATEUR → SUPABASE ─────────────────────
          // 1. Demander une URL signée d'upload au backend
          const fileExt = (config.file.name?.split('.').pop() || 'wav').toLowerCase();
          const signRes = await fetch(`${API}/api/storage/sign-upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, ext: fileExt }),
          });
          if (!signRes.ok) {
            throw new Error(s.loading.errorStart.replace('{status}', `sign-upload ${signRes.status}`));
          }
          const { storagePath, token } = await signRes.json();
          console.log('[analyze] direct upload to', storagePath);

          // 2. Upload direct vers Supabase Storage via le SDK officiel.
          //    `uploadToSignedUrl` gère tout seul les bons headers (auth,
          //    content-type, x-upsert). C'est ICI que le gros fichier
          //    voyage, sans repasser par Vercel ou Railway — bypass complet
          //    de la limite ~4,5 Mo body de Vercel serverless.
          const { error: upErr } = await supabase.storage
            .from('audio')
            .uploadToSignedUrl(storagePath, token, config.file, {
              contentType: config.file.type || 'application/octet-stream',
              upsert: true,
            });
          if (upErr) {
            throw new Error(`Supabase upload failed: ${upErr.message}`);
          }

          // 3. Démarrer le job avec un body JSON minuscule (quelques centaines
          //    d'octets max), donc plus aucune chance de cogner la limite
          //    body Vercel. Les champs structurés (previousFiche, etc.) sont
          //    stringifiés pour rester compatibles avec le backend qui fait
          //    `JSON.parse(req.body.previousFiche)` côté FormData historique.
          const startBody = {
            storagePath,
            daw: config.daw || 'Logic Pro',
            title: config.title || 'Titre inconnu',
            version: config.version || 'v1',
            vocalType: config.vocalType || 'vocal',
            // Mix / Master (refonte 2026-04-30). Default 'mix' côté backend
            // si absent, donc on n'envoie que si le toggle a une valeur
            // explicite (pas de surprise pour les anciens flows qui ne
            // remplissent pas config.uploadType).
            uploadType: config.uploadType || 'mix',
            locale: lang || 'fr',
            userId,
          };
          if (durationSeconds) startBody.durationSeconds = durationSeconds;
          if (previousFiche) startBody.previousFiche = JSON.stringify(previousFiche);
          if (previousAnalysisResult) startBody.previousAnalysisResult = JSON.stringify(previousAnalysisResult);
          if (previousCompletions && previousCompletions.length) {
            startBody.previousCompletions = JSON.stringify(previousCompletions);
          }
          // Intention : refonte 2026-04-30 — collectée en amont dans
          // AddModal (toggle "+ Ajouter une intention artistique").
          // Si fournie → passée au backend dès le start. Si non →
          // skipIntent=true silencieux. Plus jamais d'IntentionScreen
          // mid-analyse, peu importe l'état de INTENT_ENABLED.
          if (config.inlineIntent) startBody.intent = config.inlineIntent;
          else startBody.skipIntent = 'true';
          if (config.declaredGenre) startBody.declaredGenre = config.declaredGenre;
          if (config.genreUnknown) startBody.genreUnknown = 'true';

          startRes = await fetch(`${API}/api/analyze/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(startBody),
          });
        } else {
          // ─── FALLBACK MULTIPART HISTORIQUE ─────────────────────────────
          // Utilisé si pas de userId (cas edge anonymes) ou si pas de
          // fichier (cas resume gérés ailleurs). Reste sujet à la limite
          // body Vercel ~4,5 Mo — mais ces cas n'envoient pas de gros WAV.
          const formData = new FormData();
          if (config.file) formData.append("file", config.file);
          if (config.refFile) formData.append("refFile", config.refFile);
          formData.append("daw", config.daw || "Logic Pro");
          formData.append("title", config.title || "Titre inconnu");
          formData.append("version", config.version || "v1");
          formData.append("vocalType", config.vocalType || "vocal");
          formData.append("uploadType", config.uploadType || "mix");
          formData.append("locale", lang || 'fr');
          if (userId) formData.append("userId", userId);
          if (previousFiche) formData.append("previousFiche", JSON.stringify(previousFiche));
          if (previousAnalysisResult) {
            formData.append("previousAnalysisResult", JSON.stringify(previousAnalysisResult));
          }
          if (previousCompletions && previousCompletions.length) {
            formData.append("previousCompletions", JSON.stringify(previousCompletions));
          }
          if (durationSeconds) formData.append("durationSeconds", String(durationSeconds));
          // Intention : refonte 2026-04-30 — voir commentaire chemin
          // JSON ci-dessus. Si non fournie en amont → skipIntent=true.
          if (config.inlineIntent) {
            formData.append("intent", config.inlineIntent);
          } else {
            formData.append("skipIntent", "true");
          }
          if (config.declaredGenre) formData.append("declaredGenre", config.declaredGenre);
          if (config.genreUnknown) formData.append("genreUnknown", "true");

          startRes = await fetch(`${API}/api/analyze/start`, {
            method: "POST",
            body: formData,
          });
        }
        if (!startRes.ok) {
          // 413 a deux origines très différentes :
          //  - notre backend renvoie 413 + JSON { receivedSeconds } quand
          //    l'audio dépasse le cap de 12 min (cf. decode-api/lib/audioCap).
          //  - la plateforme Vercel renvoie 413 SANS payload utile quand le
          //    body de la requête multipart dépasse ~4,5 MB (limite serverless).
          // → on distingue via la présence d'un `receivedSeconds > 0`.
          if (startRes.status === 413) {
            let payload = {};
            try { payload = await startRes.json(); } catch {}
            const recv = Math.round(Number(payload?.receivedSeconds || 0));
            if (recv > 0) {
              const recvLabel = ` (${Math.floor(recv / 60)} min ${String(recv % 60).padStart(2, '0')} s)`;
              throw new Error(s.loading.errorTooLongAudio.replace('{recv}', recvLabel));
            }
            // Pas de durée dans la réponse → c'est la limite plateforme
            // (body trop gros). Message orienté "exporte en MP3/AAC".
            throw new Error(s.loading.errorFileTooLarge);
          }
          // 402 = solde de crédits insuffisant. On notifie l'App pour qu'elle
          // ouvre la modale "Plus de crédits" (CTA → /pricing). L'utilisateur
          // décide quand naviguer plutôt que de subir une redirection auto.
          if (startRes.status === 402) {
            try {
              window.dispatchEvent(new CustomEvent('versions:no-credits'));
            } catch { /* noop */ }
            throw new Error(s.loading.errorNoCredits);
          }
          throw new Error(s.loading.errorStart.replace('{status}', String(startRes.status)));
        }
        const { jobId } = await startRes.json();
        jobIdRef.current = jobId;
        console.log("✅ VERSIONS Job started:", jobId);

        // Poll for results — progressive
        setPhase(2);
        let attempts = 0;
        while (attempts < 120) {
          await new Promise((r) => setTimeout(r, 3000));
          if (canceledRef.current) return; // bouton "Annuler l'analyse"
          const pollRes = await fetch(`${API}/api/analyze/status/${jobId}`);
          const job = await pollRes.json();
          console.log("🔄 Poll", attempts, "— status:", job.status, "stage:", job.stage, "pct:", job.pct);

          if (canceledRef.current) return;

          if (job.status === "error") {
            throw new Error(job.error || s.loading.errorFailed);
          }

          // ── NOUVEAU : intention attendue → on sort pour IntentionScreen ──
          // On ne fait ce chemin QUE si le flag est ON et qu'on n'a pas déjà
          // envoyé d'intention inline. Sinon le backend ne renvoie jamais
          // awaiting_intent et on passe comme avant.
          if (job.status === "awaiting_intent" && !sentFadr.current) {
            console.log("🎯 VERSIONS awaiting_intent → IntentionScreen", { jobId });
            sentFadr.current = true;
            // Resolve l'intention héritée du titre (si V2+)
            let inherited = null;
            try {
              inherited = await getInheritedIntentByTitle(config.title, config.projectId || null);
            } catch { /* noop */ }
            onAwaitingIntent?.({
              jobId,
              perception: job.perception || null,
              audioHash: config.audioHash,
              inheritedIntent: inherited,
            });
            return;
          }

          // Stage: listening done → immediately go to FicheScreen with partial data.
          // Gardes :
          //  1) Si le backend est déjà en `awaiting_intent`, on ne claim pas
          //     (la branche au-dessus gère ce cas).
          //  2) Si INTENT_ENABLED est ON et qu'on n'a pas envoyé d'inlineIntent,
          //     on NE bifurque PAS sur `listening_done` — on ATTEND `awaiting_intent`
          //     (qui arrive quelques polls plus tard). Sinon on bascule trop tôt
          //     sur FicheScreen et l'écran Intention ne s'affiche jamais, le
          //     backend attend une intention qui ne viendra jamais.
          //     On autorise seulement `all_done` (analyse complète) dans ce mode.
          const intentPendingMode = INTENT_ENABLED && !config?.inlineIntent;
          const stageAllowed = intentPendingMode
            ? (job.stage === "all_done")
            : (job.stage === "listening_done" || job.stage === "all_done");
          if (stageAllowed
              && job.status !== "awaiting_intent"
              && !sentFadr.current) {
            sentFadr.current = true;
            setPhase(3);
            onDone({
              fiche: job.fiche || null,
              listening: job.listening || null,
              evolution: job.evolution || null,
              fadrMetrics: job.fadrMetrics || null,
              dspMetrics: job.dspMetrics || null,
              // DSP_PLAN B.6 — mesures Phase 3 (stems + stereo) propagees
              // jusqu a saveAnalysis pour persistance dans dsp_stems / dsp_stereo.
              stemsMetrics: job.stemsMetrics || null,
              stereoMetrics: job.stereoMetrics || null,
              _previousVersionName: previousVersionName,
              meta: job.meta,
              audioHash: config.audioHash,
              storagePath: job.storagePath || null,
              _jobId: jobId,
              _stage: job.stage,
            });
            return; // stop le polling une fois la fiche partielle livrée
          }

          if (job.status === "complete") {
            onDone({
              fiche: job.fiche,
              listening: job.listening || null,
              evolution: job.evolution || null,
              fadrMetrics: job.fadrMetrics || null,
              dspMetrics: job.dspMetrics || null,
              // DSP_PLAN B.6 — mesures Phase 3 (stems + stereo) propagees
              // jusqu a saveAnalysis pour persistance dans dsp_stems / dsp_stereo.
              stemsMetrics: job.stemsMetrics || null,
              stereoMetrics: job.stereoMetrics || null,
              _previousVersionName: previousVersionName,
              meta: job.meta,
              audioHash: config.audioHash,
              storagePath: job.storagePath || null,
              _jobId: jobId,
              _stage: "all_done",
            });
            return;
          }

          // Update phase based on pct
          if (job.pct > 40) setPhase(2);
          else if (job.pct > 10) setPhase(1);

          attempts++;
        }

        throw new Error(s.loading.errorTimeout);
      } catch (err) {
        console.error("❌ VERSIONS LoadingScreen error:", err.message);
        setError(err.message);
      }
    };

    run();
  }, [config]);

  // ⚠️ TOUS les hooks doivent être déclarés AVANT l'early-return du bloc
  // d'erreur. Sinon le nombre de hooks change entre 2 renders (path normal
  // vs path erreur) → React jette l'erreur #300 (page blanche). Même
  // classe de bug que le mode resume vu en avril 2026.

  // Ramp continu sur TOUTES les phases (et plus seulement la 2). Avant ce
  // patch l'anneau restait figé à 38 % pendant toute l'écoute Gemini, puis
  // sautait brutalement à 68 % avant de ralentir asymptotiquement vers
  // 90 % — ces plateaux + le freinage final donnaient l'impression que
  // l'analyse avait planté. On modélise désormais chaque phase comme une
  // courbe régulière 1-e^(-t/τ) avec un τ calé sur la durée observée en
  // prod, et on interpole continûment entre les bornes de chaque phase.
  // Cap 0.95 pour ne jamais "remplir" la phase tant que le backend n'a pas
  // confirmé la fin réelle (sinon on bondirait à 100 % puis on rebasculerait).
  // Tick 120 ms → l'anneau se met à jour ~8 fois/s, mouvement visible en
  // permanence même quand le backend ne polle qu'une fois toutes les 3 s.
  // Itérations 2026-05-03 — historique des essais sur la rampe pct :
  //   1) exp(-t/τ) par phase     → "les 20 derniers % sont très longs"
  //   2) t/(c + t) par phase     → "vite à 50 puis très lent"
  //   3) linéaire par phase      → "fuse jusqu'à 30 puis lent"
  //   4) LINÉAIRE GLOBALE (ce patch)
  //
  // Tant qu'on calcule la pente par phase, on a forcément un changement
  // de vitesse à chaque transition (phase 0 dure ~5 s vs phase 1+2
  // ~80 s, donc la pente phase 0 est mécaniquement 5-15× plus forte).
  // Stratégie : on bascule sur un timer GLOBAL (depuis le démarrage de
  // l'analyse, pas depuis le démarrage de la phase). Une seule rampe
  // linéaire 4 % → 90 % sur 80 s ≈ 1.07 pt/s constants de bout en bout,
  // peu importe les transitions de phase. La phase backend ne sert plus
  // qu'à BORNER le pct par le haut (cf. PHASE_CAPS plus bas) : si le
  // backend traîne sur l'upload, on cape à la borne haute de la phase 0
  // jusqu'à ce qu'il confirme la bascule.
  const totalStartRef = useRef(null);
  const [totalElapsed, setTotalElapsed] = useState(0);
  useEffect(() => {
    if (totalStartRef.current === null) {
      totalStartRef.current = Date.now();
    }
    const tick = () => {
      if (totalStartRef.current == null) return;
      setTotalElapsed((Date.now() - totalStartRef.current) / 1000);
    };
    tick();
    const id = setInterval(tick, 120);
    return () => clearInterval(id);
  }, []);

  // Error state — habillage v2 (pill mono + carte soft red).
  // Ce return doit IMPÉRATIVEMENT venir après tous les hooks ci-dessus.
  if (error) {
    return (
      <div className="ap-scaffold">
        <ApBrandMark onGoHome={() => onBackToInput?.()} />
        <div className="ap-error">
          <div className="ap-error-body">⚠️ {error}</div>
          <button
            type="button"
            className="ap-error-retry"
            onClick={() => window.location.reload()}
          >
            {s.loading.errorRetry}
          </button>
        </div>
      </div>
    );
  }

  // Étapes labellisées (micro-steps) : 4 chips horizontales.
  // On dérive l'état (done / active / pending) depuis `phase` (0..3) déjà
  // géré par la logique async au-dessus — aucune règle métier changée.
  const microLabels = [
    s.loading.microUpload,
    s.loading.microListening,
    s.loading.microWriting,
    s.loading.microDone,
  ];
  const microState = (i) => (i < phase ? 'is-done' : i === phase ? 'is-active' : '');

  // RAMPE LINÉAIRE UNIQUE 4 → 99 sur 180 s, sans aucun cap intermédiaire.
  // 180 s = 3 min, calibré sur les analyses longues que David observe en
  // pratique (Claude peut mettre plusieurs minutes sur des morceaux
  // costauds ou en période chargée côté Anthropic). Pente : 0.528 pt/s
  // — plus douce qu'avant mais reste parfaitement régulière, et plus
  // de stagnation prolongée à 99 % avant l'apparition de la fiche.
  // Aucun cap intermédiaire (la phase backend n'influence plus du tout
  // le pct : seul le temps écoulé compte).
  const linearPct = 4 + (totalElapsed / 180) * 95;
  const pct = Math.round(Math.max(4, Math.min(99, linearPct)));
  const radius = 100;
  const circumference = 2 * Math.PI * radius; // ≈ 628.32
  const dashOffset = circumference * (1 - pct / 100);

  // Statut courant = l'étape active, sans les points de suspension (les
  // "…" font double emploi avec le pulse amber à côté).
  const statusLabel = (steps[phase] || '').replace(/…$/u, '').trim();

  return (
    <div className="ap-scaffold">
      {/* Logo top-left (header minimal — l'écran d'analyse n'a ni
          sidebar ni topbar nav, juste le brand mark cliquable qui ramène
          au dashboard si on annule l'analyse). */}
      <ApBrandMark onGoHome={() => {
        canceledRef.current = true;
        onBackToInput?.();
      }} />

      <div className="ap-stack">

        {/* Titre dramatique en Cormorant Garamond — raccord avec le
            verdict de la fiche. Le mot d'emphasis (titleEm) reste en
            amber italique, pas de rotation (règle no-eyebrow-rotation). */}
        <h1 className="ap-title">
          <span>{s.loading.titleBefore}</span>{' '}
          <em>{s.loading.titleEm}</em>
        </h1>

        {/* Sous-titre : titre + version courants en mono uppercase
            (eyebrow soft, raccord avec les eyebrows de section fiche). */}
        {(config?.title || config?.version) && (
          <p className="ap-sub">
            {config?.title && <b>{config.title}</b>}
            {config?.version ? <> · <b>{config.version}</b></> : null}
          </p>
        )}

        {/* Anneau radial + % au centre + statut en mono amber */}
        <div className="ap-radial-wrap" aria-hidden="true">
          <svg className="ap-radial" viewBox="0 0 240 240">
            <circle className="track" cx="120" cy="120" r={radius} />
            <circle
              className="bar"
              cx="120"
              cy="120"
              r={radius}
              style={{ strokeDashoffset: dashOffset }}
            />
          </svg>
          <div className="ap-radial-inner">
            <div className="ap-pct">
              {pct}<em>%</em>
            </div>
            <div className="ap-status">{statusLabel}</div>
          </div>
        </div>

        {/* Micro-steps horizontaux — chips pill style cohérent avec
            le système chip global (mono uppercase, bg tinted selon état). */}
        <div className="ap-micro-steps" role="list">
          {microLabels.map((label, i) => (
            <span
              key={i}
              role="listitem"
              className={`ap-micro ${microState(i)}`}
            >
              <span className="ap-micro-bullet" aria-hidden="true" />
              <b>{label}</b>
            </span>
          ))}
        </div>

        {/* Waveform animée */}
        <div className="ap-wave" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        {/* Carte "Le saviez-vous ?" — eyebrow pill + corps DM Sans,
            même grammaire que les cards info de la fiche (.notes-eyebrow
            / .diag-eyebrow). */}
        {shuffledTips.length > 0 && (
          <div className="ap-tip" role="region" aria-label={s.loading.didYouKnow}>
            <div className="ap-tip-kicker">
              <span className="ap-tip-dot" aria-hidden="true" />
              {s.loading.didYouKnow}
            </div>
            <div key={tipIdx} className="ap-tip-body">
              {shuffledTips[tipIdx]}
            </div>
          </div>
        )}

        {/* Bouton "Annuler l'analyse" — pill outline discret. Lève le flag
            canceledRef pour stopper le polling, puis renvoie à l'écran
            d'upload (qui revient au contexte précédent). */}
        {onBackToInput && (
          <button
            type="button"
            className="ap-cancel"
            onClick={() => {
              canceledRef.current = true;
              onBackToInput();
            }}
          >
            {s.loading.cancel}
          </button>
        )}

      </div>
    </div>
  );
};

/**
 * ApBrandMark — logo VERSIONS top-left de l'écran d'analyse.
 * Calé sur .db-topbar-brand (DashboardTopbar) pour rester cohérent
 * visuellement avec les autres écrans, mais positionné en absolute
 * pour ne pas forcer un layout topbar complet (l'écran d'analyse
 * n'a pas de nav / rail / FR-EN — juste le brand mark cliquable
 * qui ramène au dashboard).
 */
function ApBrandMark({ onGoHome }) {
  return (
    <button
      type="button"
      className="ap-brand"
      onClick={onGoHome}
      aria-label="Retour au tableau de bord"
    >
      <img src="/logo-versions-2.svg" alt="" className="ap-brand-logo" />
      <span className="ap-brand-wordmark">
        VER<span className="accent">Si</span>ONS
      </span>
    </button>
  );
}

export default LoadingScreen;
