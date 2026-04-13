import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import API from '../constants/api';

const LoadingScreen = ({ config, onDone }) => {
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState(null);
  const jobIdRef = useRef(null);
  const sentFadr = useRef(false);

  const hasRef = !!config?.refFile;

  const steps = hasRef
    ? ["Upload des fichiers…", "Analyse audio…", "Séparation des stems…", "Données audio prêtes…"]
    : ["Upload du fichier…", "Analyse audio…", "Séparation des stems…", "Données audio prêtes…"];

  const bars = Array.from({ length: 32 }, () => Math.random());

  useEffect(() => {
    const run = async () => {
      try {
        setPhase(0);
        sentFadr.current = false;

        // Build FormData
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
        if (!startRes.ok) throw new Error(`Démarrage échoué (${startRes.status})`);
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
            throw new Error(job.error || "Analyse échouée");
          }

          // Stage: Fadr done → immediately go to FicheScreen with partial data
          if ((job.stage === "fadr_done" || job.stage === "fiche_done" || job.stage === "all_done") && !sentFadr.current) {
            sentFadr.current = true;
            setPhase(3);
            // Send partial result — App will switch to FicheScreen
            onDone({
              fadrData: job.fadrData,
              fiche: job.fiche || null,
              listening: job.listening || null,
              meta: job.meta,
              _jobId: jobId,
              _stage: job.stage,
            });
          }

          if (job.status === "complete") {
            // Send final complete result
            onDone({
              fadrData: job.fadrData,
              fiche: job.fiche,
              listening: job.listening || null,
              meta: job.meta,
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

        throw new Error("Timeout — analyse trop longue");
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
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 58px)", gap: 20 }}>
        <div style={{ fontFamily: T.mono, fontSize: 13, color: T.red, textAlign: "center", maxWidth: 320 }}>
          ⚠️ {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          style={{ fontFamily: T.mono, fontSize: 11, padding: "8px 20px", borderRadius: 8, background: T.s2, border: `1px solid ${T.border}`, color: T.muted, cursor: "pointer" }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  // Loading state
  return (
    <div style={{ width: "100%", minHeight: "100%", display: "grid", placeItems: "center", padding: "40px 20px", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
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

        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: T.display, fontSize: "clamp(32px, 8vw, 42px)", letterSpacing: 6, color: T.amber, marginBottom: 10 }}>
            ANALYSE
          </div>
          <div style={{ fontFamily: T.mono, fontSize: 13, color: T.muted }}>
            {steps[phase]}
            <span style={{ animation: "blink 1s infinite" }}>_</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 7 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i <= phase ? 20 : 6, height: 6, borderRadius: 3, background: i <= phase ? T.amber : T.border, transition: "all .3s" }} />
          ))}
        </div>

        <div style={{ fontFamily: T.mono, fontSize: 10, color: T.muted2 }}>
          {phase <= 1 ? "Peut prendre 1 à 2 minutes…" : "Données audio bientôt prêtes…"}
        </div>

        <div style={{ textAlign: "center", fontFamily: T.mono, fontSize: 10, color: T.muted2 }}>
          {config?.title} · {config?.version}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
