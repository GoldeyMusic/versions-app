import { useState, useEffect, useRef } from "react";
import STRINGS from "./constants/strings";
import T from "./constants/theme";
import API from "./constants/api";
import { LangContext } from "./hooks/useLang";
import useMobile from "./hooks/useMobile";
import GlobalStyles from "./components/GlobalStyles";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import BottomPlayer from "./components/BottomPlayer";
import AskModal from "./components/AskModal";
import InputScreen from "./screens/InputScreen";
import LoadingScreen from "./screens/LoadingScreen";
import FicheScreen from "./screens/FicheScreen";
import VersionsScreen from "./screens/VersionsScreen";
import { IconSettings } from "./components/Icons";

/* ── Font loader ────────────────────────────────────────── */
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');`}</style>
);

/* ── Placeholder screen for Réglages ───────────────────── */
const PlaceholderScreen = ({ title, icon, desc }) => (
  <div style={{width:"100%",minHeight:"100%",display:"grid",placeItems:"center",padding:"40px 30px",boxSizing:"border-box",animation:"fadeup .3s ease"}}>
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
      <div style={{width:56,height:56,borderRadius:16,background:T.amberGlow,border:`1px solid ${T.amber}22`,display:"flex",alignItems:"center",justifyContent:"center"}}>{icon}</div>
      <div style={{fontFamily:T.display,fontSize:28,letterSpacing:4,color:T.amber}}>{title}</div>
      <div style={{fontFamily:T.body,fontWeight:300,fontSize:12,color:T.muted,textAlign:"center",lineHeight:1.6}}>{desc}</div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════ */
/* APP                                                        */
/* ═══════════════════════════════════════════════════════════ */
export default function VersionsApp() {
  const [screen, setScreen] = useState("input"); // input | loading | fiche | versions | reglages
  const [config, setConfig] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  const isMobile = useMobile();

  // ── Language ──
  const [lang, setLangState] = useState("fr");
  useEffect(() => {
    try {
      const stored = localStorage.getItem("versions_lang");
      if (stored === "en") setLangState("en");
    } catch {}
  }, []);
  const setLang = (l) => {
    setLangState(l);
    try { localStorage.setItem("versions_lang", l); } catch {}
  };
  const s = STRINGS[lang];

  // ── Persistent player state ──
  const [playerState, setPlayerState] = useState(null);
  const resetKeyRef = useRef(0);

  const play = (trackTitle, versionName, playlist, currentIdx, keepProgress) => {
    if (!keepProgress) resetKeyRef.current += 1;
    setPlayerState({
      trackTitle, versionName, isPlaying: true,
      playlist: playlist || [], currentIdx: currentIdx || 0,
      resetKey: resetKeyRef.current,
    });
  };
  const togglePlay = () => setPlayerState(prev => prev ? { ...prev, isPlaying: !prev.isPlaying } : null);
  const stopPlay = () => setPlayerState(null);
  const playNext = () => {
    if (!playerState?.playlist?.length) return;
    const nextIdx = playerState.currentIdx + 1;
    if (nextIdx >= playerState.playlist.length) {
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
      return;
    }
    const next = playerState.playlist[nextIdx];
    resetKeyRef.current += 1;
    setPlayerState({
      trackTitle: next.trackTitle, versionName: next.versionName,
      isPlaying: true, playlist: playerState.playlist, currentIdx: nextIdx,
      resetKey: resetKeyRef.current,
    });
  };
  const playPrev = () => {
    if (!playerState?.playlist?.length) return;
    const prevIdx = playerState.currentIdx - 1;
    if (prevIdx < 0) return;
    const prev = playerState.playlist[prevIdx];
    resetKeyRef.current += 1;
    setPlayerState({
      trackTitle: prev.trackTitle, versionName: prev.versionName,
      isPlaying: true, playlist: playerState.playlist, currentIdx: prevIdx,
      resetKey: resetKeyRef.current,
    });
  };
  const hasNext = playerState?.playlist?.length > 0 && playerState.currentIdx < playerState.playlist.length - 1;
  const hasPrev = playerState?.playlist?.length > 0 && playerState.currentIdx > 0;

  // ── Background polling for progressive results ──
  const pollingRef = useRef(null);

  const startBackgroundPolling = (jobId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/analyze/status/${jobId}`);
        const job = await res.json();
        if (job.fiche) {
          setAnalysisResult(prev => ({ ...prev, fiche: job.fiche, _stage: job.stage }));
        }
        if (job.listening) {
          setAnalysisResult(prev => ({ ...prev, listening: job.listening, _stage: job.stage }));
        }
        if (job.status === "complete" || job.status === "error") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      } catch (e) { console.error("bg poll error:", e); }
    }, 3000);
  };

  // Cleanup on unmount
  useEffect(() => () => { if (pollingRef.current) clearInterval(pollingRef.current); }, []);

  // ── Handlers ──
  const handleAnalyze = (cfg) => {
    setConfig(cfg);
    setAnalysisResult(null);
    setScreen("loading");
  };
  const handleLoaded = (result) => {
    // Called with partial or complete results — always go to fiche
    setAnalysisResult(prev => ({ ...(prev || {}), ...result }));
    if (screen !== "fiche") {
      setScreen("fiche");
      // Start background polling if not complete yet
      if (result._jobId && result._stage !== "all_done") {
        startBackgroundPolling(result._jobId);
      }
    }
  };
  const goHome = () => {
    setScreen("input");
    setConfig(null);
    setAnalysisResult(null);
  };

  // ── Screen routing ──
  const renderContent = () => {
    switch (screen) {
      case "input":
        return <InputScreen onAnalyze={handleAnalyze} onAsk={() => setAskOpen(true)} />;
      case "loading":
        return <LoadingScreen config={config} onDone={handleLoaded} />;
      case "fiche":
        return <FicheScreen config={config} analysisResult={analysisResult} />;
      case "versions":
        return (
          <VersionsScreen
            onViewAnalysis={(track, v) => {
              setConfig({ title: track.title, version: v.name, daw: "Logic Pro" });
              setScreen("fiche");
            }}
            onPlay={play}
            onStop={stopPlay}
            playerState={playerState}
          />
        );
      case "reglages":
        return (
          <PlaceholderScreen
            title="RÉGLAGES"
            icon={<IconSettings c={T.amber} s={24} />}
            desc="DAW par défaut, langue, notifications, abonnement et préférences d'analyse."
          />
        );
      default:
        return <InputScreen onAnalyze={handleAnalyze} onAsk={() => setAskOpen(true)} />;
    }
  };

  return (
    <LangContext.Provider value={{ lang, s, setLang }}>
      <FontLink />
      <GlobalStyles />
      <div className="dapp">
        {/* Header */}
        <Header onHome={goHome} />

        {/* Ask Modal */}
        {askOpen && <AskModal onClose={() => setAskOpen(false)} />}

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", width: "100%", minHeight: 0 }}>
          {renderContent()}
        </div>

        {/* Persistent Bottom Player */}
        {screen !== "loading" && (playerState || screen === "versions") && (
          <BottomPlayer
            trackTitle={playerState?.trackTitle}
            versionName={playerState?.versionName}
            isPlaying={!!playerState?.isPlaying}
            onToggle={togglePlay}
            onNext={playNext}
            onPrev={playPrev}
            hasNext={hasNext}
            hasPrev={hasPrev}
            resetKey={playerState?.resetKey || 0}
            idle={!playerState}
          />
        )}

        {/* Bottom Nav */}
        {screen !== "loading" && (
          <BottomNav
            active={askOpen ? "ask" : screen === "input" || screen === "fiche" ? "input" : screen}
            onChange={(id) => { setAskOpen(false); setScreen(id === "input" ? "input" : id); }}
            onAsk={() => setAskOpen(o => !o)}
          />
        )}
      </div>
    </LangContext.Provider>
  );
}
