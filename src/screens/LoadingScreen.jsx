import { useState, useEffect, useRef } from 'react';
import API from '../constants/api';
import { confirmDialog } from '../lib/confirm.jsx';
import { hashAudioFile, findDuplicateAudio, loadTracks, getInheritedIntentByTitle } from "../lib/storage";
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
        let previousFiche = null;
        try {
          const allTracks = await loadTracks();
          const sameTitle = allTracks.find((t) => t.title === config.title);
          if (sameTitle?.versions?.length) {
            const last = sameTitle.versions[sameTitle.versions.length - 1];
            previousFiche = last?.analysisResult?.fiche || null;
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

        // Récupère l'utilisateur courant pour l'upload Supabase Storage côté backend
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || null;
        console.log('[analyze] userId:', userId);

        // Build FormData
        const formData = new FormData();
        if (config.file) formData.append("file", config.file);
        if (config.refFile) formData.append("refFile", config.refFile);
        formData.append("daw", config.daw || "Logic Pro");
        formData.append("title", config.title || "Titre inconnu");
        formData.append("version", config.version || "v1");
        // Type vocal du titre — permet au backend (Railway) d'adapter les prompts
        // IA (ton bienveillant pour 'pending', section voix ignorée pour 'final').
        // Défaut 'vocal' pour compat avec les titres existants.
        formData.append("vocalType", config.vocalType || "vocal");
        // Langue cible pour les textes de la fiche (labels, verdict, summary…).
        formData.append("locale", lang || 'fr');
        if (userId) formData.append("userId", userId);
        if (previousFiche) formData.append("previousFiche", JSON.stringify(previousFiche));
        if (durationSeconds) formData.append("durationSeconds", String(durationSeconds));

        // ── Gestion du feature flag intention ──
        // - Flag OFF               → skipIntent=true (backend enchaîne direct, comme avant)
        // - Flag ON + inlineIntent → intent=<texte> (backend enchaîne avec intention)
        // - Flag ON sans inline    → pas de skipIntent, le backend passera par awaiting_intent
        if (!INTENT_ENABLED) {
          formData.append("skipIntent", "true");
        } else if (config.inlineIntent) {
          formData.append("intent", config.inlineIntent);
        }

        // Start the analysis job
        setPhase(1);
        const startRes = await fetch(`${API}/api/analyze/start`, {
          method: "POST",
          body: formData,
        });
        if (!startRes.ok) throw new Error(s.loading.errorStart.replace('{status}', String(startRes.status)));
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

  // Error state — habillage v2 (pill mono + carte soft red)
  if (error) {
    return (
      <div className="ap-scaffold">
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

  // Mapping percentage pour l'anneau radial. Les paliers sont calés au
  // milieu de chaque étape — visuellement on ne veut pas partir de 0%
  // (sinon l'anneau est vide pendant l'upload), ni atteindre 100% tant
  // que `onDone` n'a pas été appelé (sinon l'utilisateur croit que c'est
  // fini mais on attend encore Claude).
  const pctByPhase = [8, 38, 68, 94];
  const pct = pctByPhase[Math.max(0, Math.min(phase, 3))];
  const radius = 100;
  const circumference = 2 * Math.PI * radius; // ≈ 628.32
  const dashOffset = circumference * (1 - pct / 100);

  // Statut courant = l'étape active, sans les points de suspension (les
  // "…" font double emploi avec le pulse amber à côté).
  const statusLabel = (steps[phase] || '').replace(/…$/u, '').trim();

  return (
    <div className="ap-scaffold">
      <div className="ap-stack">

        {/* Logo VERSIONS posé à plat (pas de cadre) */}
        <img
          src="/logo-versions.svg"
          alt=""
          aria-hidden="true"
          className="ap-logo"
        />

        <h2 className="ap-title">
          {s.loading.titleBefore}{' '}
          <em>{s.loading.titleEm}</em>
        </h2>
        <p className="ap-sub">
          {config?.title && <b>{config.title}</b>}
          {config?.version ? <> · <b>{config.version}</b></> : null}
        </p>

        {/* Anneau radial + % au centre + statut en mono amber */}
        <div className="ap-radial-wrap" aria-hidden="true">
          <svg className="ap-radial" viewBox="0 0 220 220">
            <circle className="track" cx="110" cy="110" r={radius} />
            <circle
              className="bar"
              cx="110"
              cy="110"
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

        {/* Micro-steps horizontaux */}
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

        {/* Carte "Le saviez-vous ?" (même moule que les mini-modales) */}
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

export default LoadingScreen;
