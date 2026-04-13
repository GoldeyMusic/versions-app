import { useState, useEffect } from 'react';
import T from '../constants/theme';
import API from '../constants/api';

const LoadingScreen = ({ config, onDone }) => {
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState(null);

  // Determine if we have a reference file
  const hasRef = !!config?.refFile;

  // Steps adapt based on whether we have a reference file
  const steps = hasRef
    ? [
        "Upload des fichiers…",
        "Analyse audio…",
        "Analyse de la référence…",
        "Génération du rapport IA…",
        "Finalisation…",
      ]
    : [
        "Upload du fichier…",
        "Analyse audio…",
        "Génération du rapport IA…",
        "Finalisation…",
      ];

  // Animated bars
  const bars = Array.from({ length: 32 }, () => Math.random());

  useEffect(() => {
    const run = async () => {
      try {
        setPhase(0);

        // Build FormData with file and reference (if present)
        const formData = new FormData();
        if (config.file) formData.append("file", config.file);
        if (config.refFile) formData.append("refFile", config.refFile);
        formData.append("daw", config.daw || "Logic Pro");
        formData.append("title", config.title || "Titre inconnu");
        formData.append("version", config.version || "v1");

        // Start the analysis job
        setPhase(1);
        const startRes = await fetch(`${API}/api/analyze/start`, {
          method: "POST",
          body: formData,
        });
        if (!startRes.ok) {
          throw new Error(`Démarrage échoué (${startRes.status})`);
        }
        const { jobId } = await startRes.json();
        console.log("✅ VERSIONS Job started:", jobId);

        // Poll for completion
        setPhase(2);
        let attempts = 0;
        while (attempts < 60) {
          await new Promise((r) => setTimeout(r, 3000));
          const pollRes = await fetch(`${API}/api/analyze/status/${jobId}`);
          const job = await pollRes.json();
          console.log("🔄 Poll", attempts, "— status:", job.status, "progress:", job.pct);

          if (job.status === "complete") {
            setPhase(steps.length - 1);
            await new Promise((r) => setTimeout(r, 500));
            onDone({
              fiche: job.fiche,
              fadrData: job.fadrData,
              meta: job.meta,
            });
            return;
          }

          if (job.status === "error") {
            throw new Error(job.error || "Analyse échouée");
          }

          // Advance phase based on progress
          if (hasRef) {
            if (job.pct > 75) setPhase(4);
            else if (job.pct > 50) setPhase(3);
            else if (job.pct > 25) setPhase(2);
          } else {
            if (job.pct > 66) setPhase(3);
            else if (job.pct > 33) setPhase(2);
          }

          attempts++;
        }

        throw new Error("Timeout — analyse trop longue");
      } catch (err) {
        console.error("❌ VERSIONS LoadingScreen error:", err.message);
        setError(err.message);
      }
    };

    run();
  }, [config, onDone, hasRef, steps.length]);

  // Error state
  if (error) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "calc(100vh - 58px)",
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: T.mono,
            fontSize: 13,
            color: T.red,
            textAlign: "center",
            maxWidth: 320,
          }}
        >
          ⚠️ {error}
        </div>
        <button
          onClick={() => window.history.back()}
          style={{
            fontFamily: T.mono,
            fontSize: 11,
            padding: "8px 20px",
            borderRadius: 8,
            background: T.s2,
            border: `1px solid ${T.border}`,
            color: T.muted,
            cursor: "pointer",
          }}
        >
          Retour
        </button>
      </div>
    );
  }

  // Loading state
  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        display: "grid",
        placeItems: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 34,
        }}
      >
        {/* Animated bars */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 70, width: 180 }}>
          {bars.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: `linear-gradient(to top, ${T.amber}, ${T.orange}44)`,
                borderRadius: "2px 2px 0 0",
                animation: `barrise ${0.3 + h * 0.4}s ease ${i * 0.025}s alternate infinite`,
                transformOrigin: "bottom",
                height: `${20 + h * 80}%`,
              }}
            />
          ))}
        </div>

        {/* Title and status text */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: T.display,
              fontSize: "clamp(32px, 8vw, 42px)",
              letterSpacing: 6,
              color: T.amber,
              marginBottom: 10,
            }}
          >
            ANALYSE
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: 13,
              color: T.muted,
            }}
          >
            {steps[phase]}
            <span style={{ animation: "blink 1s infinite" }}>_</span>
          </div>
        </div>

        {/* Progress indicators */}
        <div style={{ display: "flex", gap: 7 }}>
          {steps.map((_, i) => (
            <div
              key={i}
              style={{
                width: i <= phase ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i <= phase ? T.amber : T.border,
                transition: "all .3s",
              }}
            />
          ))}
        </div>

        {/* Hint text */}
        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted2 }}>
          {phase <= 1
            ? "Peut prendre 30-60 secondes…"
            : phase === 2
              ? "Analyse audio en cours…"
              : "Presque terminé…"}
        </div>

        {/* Title and version info */}
        <div
          style={{
            textAlign: "center",
            fontFamily: T.mono,
            fontSize: 10,
            color: T.muted2,
          }}
        >
          {config?.title} · {config?.version}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
