import { useState, useEffect, useRef } from 'react';
import T from '../constants/theme';
import API from '../constants/api';
import { hashAudioFile, findDuplicateAudio } from '../lib/storage';

const TIPS = [
  "Faire des pauses régulières permet de conserver une écoute attentive et objective.",
  "Tes oreilles se fatiguent après 45 min — une pause de 10 min te fait gagner 2h de travail.",
  "Les meilleurs mix se font en sessions courtes. La qualité bat toujours la quantité.",
  "Écouter ton mix dans un autre contexte (voiture, écouteurs) révèle ce que le studio cache.",
  "Baisser le volume de monitoring aide à repérer les déséquilibres de balance.",
  "Prendre du recul sur un mix pendant 24h change complètement ta perception.",
  "Tes décisions de mix sont meilleures le matin — profite de tes oreilles fraîches.",
  "Un bon mix se fait en 10 décisions clés, pas en 100 micro-ajustements.",
  "Comparer régulièrement avec une référence recalibre ton oreille et tes choix.",
  "Le silence entre les sessions est aussi important que le travail lui-même.",
  "Écouter à faible volume est le meilleur test : si le mix fonctionne bas, il fonctionnera fort.",
  "La fatigue auditive est invisible — quand tu doutes d'un choix, c'est souvent le signe qu'il faut pauser.",
];

const LoadingScreen = ({ config, onDone }) => {
  const [phase, setPhase] = useState(0);
  const [error, setError] = useState(null);
  const jobIdRef = useRef(null);
  const sentFadr = useRef(false);

  const hasRef = !!config?.refFile;

  const steps = hasRef
    ? ["Upload des fichiers…", "Écoute qualitative…", "Rédaction de la fiche…", "Analyse terminée…"]
    : ["Upload du fichier…", "Écoute qualitative…", "Rédaction de la fiche…", "Analyse terminée…"];

  const bars = Array.from({ length: 32 }, () => Math.random());
  const [shuffledTips] = useState(() => {
    const arr = [...TIPS];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  });
  const [tipIdx, setTipIdx] = useState(0);

  useEffect(() => {
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
          console.error('🔑 HASH CALCULÉ:', audioHash);
          const dup = await findDuplicateAudio(config.title || '', audioHash);
          if (dup) {
            throw new Error(`Fichier identique à la version "${dup.name}" déjà uploadée pour ce titre. Importe un rendu différent.`);
          }
        }

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

          // Stage: listening done → immediately go to FicheScreen with partial data
          if ((job.stage === "listening_done" || job.stage === "all_done") && !sentFadr.current) {
            sentFadr.current = true;
            setPhase(3);
            onDone({
              fiche: job.fiche || null,
              listening: job.listening || null,
              meta: job.meta,
              audioHash: config.audioHash,
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

        <div style={{ fontFamily: T.body, fontWeight: 300, fontSize: 11, color: T.muted, textAlign: "center", maxWidth: 300, lineHeight: 1.6, fontStyle: "italic", transition: "opacity .4s", minHeight: 36 }}>
          "{shuffledTips[tipIdx]}"
        </div>

        <div style={{ textAlign: "center", fontFamily: T.mono, fontSize: 10, color: T.muted2 }}>
          {config?.title} · {config?.version}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
