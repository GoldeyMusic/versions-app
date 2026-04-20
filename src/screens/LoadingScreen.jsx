import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import API from '../constants/api';
import { confirmDialog } from '../lib/confirm.jsx';
import { hashAudioFile, findDuplicateAudio, loadTracks } from "../lib/storage";
import { supabase } from "../lib/supabase";
import useLang from '../hooks/useLang';

const LoadingScreen = ({ config, onDone, onBackToInput }) => {
  const { s, lang } = useLang();
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState(null);
  const jobIdRef = useRef(null);
  const sentFadr = useRef(false);

  const hasRef = !!config?.refFile;

  const steps = hasRef
    ? [s.loading.stepUploadMulti, s.loading.stepListening, s.loading.stepWriting, s.loading.stepDone]
    : [s.loading.stepUploadOne, s.loading.stepListening, s.loading.stepWriting, s.loading.stepDone];

  const bars = Array.from({ length: 32 }, () => Math.random());
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
          const pollRes = await fetch(`${API}/api/analyze/status/${jobId}`);
          const job = await pollRes.json();
          console.log("🔄 Poll", attempts, "— status:", job.status, "stage:", job.stage, "pct:", job.pct);

          if (job.status === "error") {
            throw new Error(job.error || s.loading.errorFailed);
          }

          // Stage: listening done → immediately go to FicheScreen with partial data
          if ((job.stage === "listening_done" || job.stage === "all_done") && !sentFadr.current) {
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

  // Error state
  if (error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100%", gap: 20, padding: "60px 20px" }}>
        <div style={{ fontFamily: T.mono, fontSize: 13, color: T.red, textAlign: "center", maxWidth: 320 }}>
          ⚠️ {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{ fontFamily: T.mono, fontSize: 11, padding: "8px 20px", borderRadius: 8, background: T.s2, border: `1px solid ${T.border}`, color: T.muted, cursor: "pointer" }}
        >
          {s.loading.errorRetry}
        </button>
      </div>
    );
  }

  // Loading state — embedded in main layout (sidebar + player stay visible)
  return (
    <div style={{ width: "100%", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 20px", boxSizing: "border-box", animation: "fadeup .3s ease" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, maxWidth: 480, width: "100%" }}>

        {/* Spinner + titre */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            border: `2.5px solid ${T.amber}22`,
            borderTopColor: T.amber,
            animation: "spin 1s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <div style={{ fontFamily: T.display, fontSize: 32, fontWeight: 400, color: "#ededed", letterSpacing: 5, textAlign: "center", textTransform: "uppercase" }}>
            {s.loading.title}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 12, color: T.amber, fontWeight: 400, textAlign: "center", lineHeight: 1.6, letterSpacing: 1, opacity: 0.85 }}>
            {config?.title}{config?.version ? ` · ${config.version}` : ""}
          </div>
        </div>

        {/* Étapes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
          {steps.map((label, i) => {
            const done = i < phase;
            const active = i === phase;
            const color = done ? "#7bd88f" : active ? T.amber : "#5a5a5e";
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 16px",
                border: `1px solid ${active ? `${T.amber}55` : "#2a2a2e"}`,
                borderRadius: 10,
                background: active ? `${T.amber}11` : "transparent",
                transition: "all .3s",
              }}>
                <span style={{
                  width: 20, height: 20, borderRadius: "50%",
                  background: done ? color : "transparent",
                  border: `1.5px solid ${color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {done && (
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                      <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {active && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: color, animation: "pulse 1.2s ease-in-out infinite",
                    }} />
                  )}
                </span>
                <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }`}</style>
                <span style={{
                  fontFamily: "JetBrains Mono, monospace", fontSize: 11, letterSpacing: 1,
                  textTransform: "uppercase",
                  color: done ? "#c5c5c7" : active ? T.amber : "#7c7c80",
                }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Mini animated bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 28, width: 120, opacity: 0.6 }}>
          {bars.slice(0, 20).map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: `linear-gradient(to top, ${T.amber}, ${T.amber}33)`,
                borderRadius: "1.5px 1.5px 0 0",
                animation: `barrise ${0.3 + h * 0.4}s ease ${i * 0.03}s alternate infinite`,
                transformOrigin: "bottom",
                height: `${20 + h * 80}%`,
              }}
            />
          ))}
        </div>

        {/* Tip */}
        <div style={{
          width: "100%", padding: "18px 22px",
          background: `${T.amber}08`, border: `1px solid ${T.amber}22`, borderLeft: `3px solid ${T.amber}`,
          borderRadius: 10, minHeight: 70, display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{
            fontFamily: "JetBrains Mono, monospace", fontSize: 9, letterSpacing: 2,
            color: T.amber, textTransform: "uppercase",
          }}>{s.loading.didYouKnow}</div>
          <div key={tipIdx} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#c5c5c7",
            lineHeight: 1.7, fontWeight: 300,
            animation: "fadein .4s ease",
          }}>{shuffledTips[tipIdx]}</div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
