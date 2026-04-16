import { useState, useEffect, useRef } from "react";
import STRINGS from "./constants/strings";
import T from "./constants/theme";
import API from "./constants/api";
import { LangContext } from "./hooks/useLang";
import useMobile from "./hooks/useMobile";
import GlobalStyles from "./components/GlobalStyles";
import MockupStyles from "./components/MockupStyles";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import BottomPlayer from "./components/BottomPlayer";
import AskModal from "./components/AskModal";
import Sidebar from "./components/Sidebar";
import InputScreen from "./screens/InputScreen";
import LoadingScreen from "./screens/LoadingScreen";
import FicheScreen from "./screens/FicheScreen";
import VersionsScreen from "./screens/VersionsScreen";

import { saveAnalysis, getAnalysis, loadTracks } from "./lib/storage";
import { supabase } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import AuthScreen from "./screens/AuthScreen";
import ReglagesScreen from "./screens/ReglagesScreen";

/* ── Font loader ────────────────────────────────────────── */
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&family=Instrument+Serif:ital@0;1&display=swap');`}</style>
);

/* ── Welcome Home Screen ───────────────────────────────── */
const HOME_TIPS = [
  "Faire des pauses régulières permet de conserver une écoute attentive et objective.",
  "Tes oreilles se fatiguent après 45 min — une pause de 10 min te fait gagner 2h de travail.",
  "Écouter ton mix dans un autre contexte (voiture, écouteurs) révèle ce que le studio cache.",
  "Baisser le volume de monitoring aide à repérer les déséquilibres de balance.",
  "Prendre du recul sur un mix pendant 24h change complètement ta perception.",
  "Comparer régulièrement avec une référence recalibre ton oreille et tes choix.",
  "Le silence entre les sessions est aussi important que le travail lui-même.",
  "Écouter à faible volume est le meilleur test : si le mix fonctionne bas, il fonctionnera fort.",
];

function WelcomeHome({ user, userProfile, onNewTrack, onAddVersion, onSelectVersion }) {
  const [tracks, setTracks] = useState([]);
  const [tip] = useState(() => HOME_TIPS[Math.floor(Math.random() * HOME_TIPS.length)]);
  const [pickingTrack, setPickingTrack] = useState(false);

  useEffect(() => {
    loadTracks().then(setTracks);
  }, []);

  const displayName = userProfile?.prenom || null;

  // Stats
  const totalTracks = tracks.length;
  const totalVersions = tracks.reduce((sum, t) => sum + (t.versions?.length || 0), 0);
  const allScores = tracks.flatMap(t =>
    (t.versions || []).map(v => v.analysisResult?.fiche?.globalScore).filter(s => typeof s === "number")
  );
  const avgScore = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null;

  // Dernières analyses (4 max)
  const recent = tracks.flatMap(t =>
    (t.versions || []).filter(v => v.analysisResult?.fiche).map(v => ({
      track: t,
      version: v,
      score: v.analysisResult?.fiche?.globalScore,
      verdict: v.analysisResult?.fiche?.verdict || v.analysisResult?.fiche?.summary || "",
      date: v.date,
    }))
  ).sort((a, b) => new Date(b.version.id) - new Date(a.version.id)).slice(0, 4);

  const scoreColor = (s) => s < 50 ? "#ef6b6b" : s < 75 ? "#f5b056" : "#7bd88f";

  return (
    <div className="welcome-home">
      {/* Header */}
      <div className="wh-header">
        <div className="wh-greeting">{displayName ? `Salut ${displayName} !` : "Salut !"}</div>
        <div className="wh-tip">
          <div className="wh-tip-label">Le saviez-vous</div>
          <div className="wh-tip-text">{tip}</div>
        </div>
      </div>

      {/* Stats */}
      {totalTracks > 0 && (
        <div className="wh-stats">
          <div className="wh-stat">
            <div className="wh-stat-value">{totalTracks}</div>
            <div className="wh-stat-label">{totalTracks > 1 ? "titres" : "titre"}</div>
          </div>
          <div className="wh-stat">
            <div className="wh-stat-value">{totalVersions}</div>
            <div className="wh-stat-label">{totalVersions > 1 ? "versions" : "version"}</div>
          </div>
          {avgScore != null && (
            <div className="wh-stat">
              <div className="wh-stat-value" style={{ color: scoreColor(avgScore) }}>{avgScore}</div>
              <div className="wh-stat-label">score moyen</div>
            </div>
          )}
        </div>
      )}

      {/* Raccourcis */}
      <div className="wh-actions">
        <button className="wh-action" onClick={onNewTrack}>
          <span className="wh-action-icon">+</span>
          <span>Nouveau titre</span>
        </button>
        {totalTracks > 0 && (
          <div style={{ position: "relative" }}>
            <button className="wh-action" onClick={() => setPickingTrack(!pickingTrack)}>
              <span className="wh-action-icon">↻</span>
              <span>Ajouter une version</span>
            </button>
            {pickingTrack && (
              <div className="wh-track-picker">
                <div className="wh-picker-label">À quel titre ?</div>
                {tracks.map((t) => (
                  <div
                    key={t.id}
                    className="wh-picker-item"
                    onClick={() => { setPickingTrack(false); onAddVersion(t); }}
                  >
                    {t.title}
                    <span className="wh-picker-count">{t.versions?.length || 0} version{(t.versions?.length || 0) > 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dernières analyses */}
      {recent.length > 0 && (
        <div className="wh-recent">
          <div className="wh-section-title">Dernières analyses</div>
          <div className="wh-recent-list">
            {recent.map((r, i) => (
              <div
                key={i}
                className="wh-recent-card"
                onClick={() => onSelectVersion(r.track, r.version)}
              >
                <div className="wh-recent-score" style={{
                  borderColor: typeof r.score === "number" ? scoreColor(r.score) : "#5a5a5e",
                  color: typeof r.score === "number" ? scoreColor(r.score) : "#7c7c80",
                }}>
                  {typeof r.score === "number" ? r.score : "—"}
                </div>
                <div className="wh-recent-info">
                  <div className="wh-recent-title">{r.track.title}</div>
                  <div className="wh-recent-version">{r.version.name}{r.date ? ` · ${r.date}` : ""}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalTracks === 0 && (
        <div className="wh-empty">
          <img src="/logo-versions.svg" alt="" style={{ height: 60, width: "auto", opacity: 0.3 }} />
          <div>Importe ton premier titre pour commencer l'aventure.</div>
        </div>
      )}
    </div>
  );
}

const SIDEBAR_WIDTH = 260;

/* ═══════════════════════════════════════════════════════════ */
/* APP                                                        */
/* ═══════════════════════════════════════════════════════════ */
export default function VersionsApp() {
  const { user, loading: authLoading, signOut } = useAuth();
  const isMobile = useMobile();
  const isDesktop = !isMobile;
  // On desktop, default = "welcome" (neutral empty state); on mobile, old default = "input"
  const [screen, setScreen] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px)").matches) return "input";
    return "welcome";
  });
  const [config, setConfig] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [askOpen, setAskOpen] = useState(false);
  // When adding a new version from an existing track, we prefill the title
  // and, after analysis completes, auto-open that track's folder in Versions tab
  const [prefillTitle, setPrefillTitle] = useState("");
  const [autoSelectTrackTitle, setAutoSelectTrackTitle] = useState("");
  const [sidebarRefreshKey, setSidebarRefreshKey] = useState(0);

  // ── User profile (avatar, prénom…) ──
  const [userProfile, setUserProfile] = useState(null);
  useEffect(() => {
    if (!user) { setUserProfile(null); return; }
    supabase
      .from("profiles")
      .select("prenom, nom, avatar_url, default_daw, langue")
      .eq("id", user.id)
      .single()
      .then(({ data }) => { if (data) setUserProfile(data); })
      .catch(() => {});
  }, [user]);

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

  const play = (trackTitle, versionName, storagePath, playlist, currentIdx, keepProgress) => {
    if (!storagePath) return; // pas d'audio disponible
    if (!keepProgress) resetKeyRef.current += 1;
    setPlayerState({
      trackTitle, versionName, storagePath, isPlaying: true,
      playlist: playlist || [], currentIdx: currentIdx || 0,
      resetKey: resetKeyRef.current,
    });
  };
  const loadPlayer = (trackTitle, versionName, storagePath) => {
    if (!storagePath) return;
    resetKeyRef.current += 1;
    setPlayerState({
      trackTitle, versionName, storagePath, isPlaying: false,
      playlist: [], currentIdx: 0,
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
      storagePath: next.storagePath,
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
      storagePath: prev.storagePath,
      isPlaying: true, playlist: playerState.playlist, currentIdx: prevIdx,
      resetKey: resetKeyRef.current,
    });
  };
  const hasNext = playerState?.playlist?.length > 0 && playerState.currentIdx < playerState.playlist.length - 1;
  const hasPrev = playerState?.playlist?.length > 0 && playerState.currentIdx > 0;

  // ── Background polling for progressive results ──
  const pollingRef = useRef(null);

  // Track saved state to avoid double-saving
  const savedRef = useRef(false);

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
          // Save completed analysis to localStorage
          if (job.status === "complete" && !savedRef.current) {
            savedRef.current = true;
            setAnalysisResult(prev => {
              const full = { ...prev, fiche: job.fiche || prev?.fiche, listening: job.listening || prev?.listening, storagePath: job.storagePath || prev?.storagePath || null, _stage: "all_done" };
              saveAnalysis(config, full, job.storagePath || prev?.storagePath || null)
                .then(() => setSidebarRefreshKey(k => k + 1))
                .catch(e => console.warn("saveAnalysis failed:", e));
              return full;
            });
          }
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
    savedRef.current = false;
    setScreen("loading");
  };
  const handleLoaded = (result) => {
    // Called with partial or complete results — always go to fiche
    const merged = { ...(analysisResult || {}), ...result };
    setAnalysisResult(merged);
    const cfgWithHash = result.audioHash ? { ...config, audioHash: result.audioHash } : config;
    if (result.audioHash) setConfig(cfgWithHash);
    if (screen !== "fiche") {
      setScreen("fiche");
      // Start background polling if not complete yet
      if (result._jobId && result._stage !== "all_done") {
        startBackgroundPolling(result._jobId);
      } else if (result._stage === "all_done" && !savedRef.current) {
        // Analysis completed in one shot — save immediately
        savedRef.current = true;
        saveAnalysis(cfgWithHash, merged, merged.storagePath || null)
          .then(() => setSidebarRefreshKey(k => k + 1))
          .catch(e => console.warn("saveAnalysis failed:", e));
      }
    }
  };
  const goHome = () => {
    setScreen(isDesktop ? "welcome" : "input");
    setConfig(null);
    setAnalysisResult(null);
    setPrefillTitle("");
  };

  // Sidebar handlers
  const handleSidebarSelectVersion = async (track, v) => {
    console.log('[select-version]', v.name, 'storagePath:', v.storagePath, 'isPlaying:', playerState?.isPlaying);
    const saved = await getAnalysis(track.id, v.id);
    setConfig({ title: track.title, version: v.name, daw: config?.daw || "Logic Pro" });
    setAnalysisResult(saved || v.analysisResult || null);
    setScreen("fiche");
    // Charger l'audio — continue la lecture si déjà en cours
    if (v.storagePath) {
      if (playerState?.isPlaying) {
        play(track.title, v.name, v.storagePath);
      } else {
        loadPlayer(track.title, v.name, v.storagePath);
      }
    }
  };
  const handleSidebarAddVersion = (track) => {
    setPrefillTitle(track.title);
    setAutoSelectTrackTitle(track.title);
    setAnalysisResult(null);
    setConfig(null);
    setScreen("input");
  };
  const handleSidebarNewTrack = () => {
    setPrefillTitle("");
    setAutoSelectTrackTitle("");
    setAnalysisResult(null);
    setConfig(null);
    setScreen("input");
  };

  // ── Screen routing ──
  const renderContent = () => {
    switch (screen) {
      case "welcome":
        return (
          <WelcomeHome
            user={user}
            userProfile={userProfile}
            onNewTrack={handleSidebarNewTrack}
            onAddVersion={handleSidebarAddVersion}
            onSelectVersion={handleSidebarSelectVersion}
          />
        );
      case "input":
        return <InputScreen onAnalyze={handleAnalyze} onAsk={() => setAskOpen(true)} initialTitle={prefillTitle} />;
      case "loading":
        return <LoadingScreen config={config} onDone={handleLoaded} onBackToInput={handleSidebarNewTrack} />;
      case "fiche":
        return (
          <FicheScreen
            config={config}
            analysisResult={analysisResult}
            onSelectVersion={handleSidebarSelectVersion}
            refreshKey={sidebarRefreshKey}
            onAddVersion={(track) => {
              setPrefillTitle(track.title);
              setAutoSelectTrackTitle(track.title);
              setAnalysisResult(null);
              setConfig(null);
              setScreen("input");
            }}
          />
        );
      case "versions":
        return (
          <VersionsScreen
            onViewAnalysis={async (track, v) => {
              const saved = await getAnalysis(track.id, v.id);
              setConfig({ title: track.title, version: v.name, daw: config?.daw || "Logic Pro" });
              setAnalysisResult(saved || v.analysisResult || null);
              setScreen("fiche");
            }}
            onAddVersion={(track) => {
              setPrefillTitle(track.title);
              setAutoSelectTrackTitle(track.title);
              setAnalysisResult(null);
              setConfig(null);
              setScreen("input");
            }}
            autoSelectTrackTitle={autoSelectTrackTitle}
            onAutoSelectConsumed={() => setAutoSelectTrackTitle("")}
            onPlay={play}
            onStop={stopPlay}
            playerState={playerState}
          />
        );
      case "reglages":
        return <ReglagesScreen onSignOut={signOut} onGoHome={goHome} onProfileUpdate={setUserProfile} />;
      default:
        return <InputScreen onAnalyze={handleAnalyze} onAsk={() => setAskOpen(true)} />;
    }
  };

  // Auth gate
  if (authLoading) {
    return (
      <>
        <FontLink />
        <GlobalStyles />
        <div style={{minHeight:"100vh",display:"grid",placeItems:"center",background:T.black,color:T.muted,fontFamily:T.mono,fontSize:12,letterSpacing:2}}>
          CHARGEMENT...
        </div>
      </>
    );
  }
  if (!user) {
    return (
      <LangContext.Provider value={{ lang, s, setLang }}>
        <FontLink />
        <GlobalStyles />
        <MockupStyles />
        <AuthScreen />
      </LangContext.Provider>
    );
  }

  // On desktop, the sidebar shows the tracks list so we don't need the "versions" screen
  const showSidebar = isDesktop;
  const contentMarginLeft = showSidebar ? SIDEBAR_WIDTH : 0;

  return (
    <LangContext.Provider value={{ lang, s, setLang }}>
      <FontLink />
      <GlobalStyles />
      <MockupStyles />
      <div className={showSidebar ? "app" : "dapp"}>
        {/* Desktop Sidebar */}
        {showSidebar && (
          <Sidebar
            currentTrackTitle={config?.title}
            currentVersionName={config?.version}
            onSelectVersion={handleSidebarSelectVersion}
            onAddVersion={handleSidebarAddVersion}
            onNewTrack={handleSidebarNewTrack}
            onGoReglages={() => setScreen("reglages")}
            onAskOpen={() => setAskOpen(true)}
            onPlay={play}
            onStop={stopPlay}
            playerState={playerState}
            user={user}
            userProfile={userProfile}
            onSignOut={signOut}
            onGoHome={goHome}
            refreshKey={sidebarRefreshKey}
          />
        )}

        {/* Main column */}
        <div style={showSidebar ? { display: "flex", flexDirection: "column", minWidth: 0 } : { marginLeft: contentMarginLeft, display: "flex", flexDirection: "column", minHeight: "100vh", transition: "margin-left .2s" }}>
          {/* Header — mobile only (desktop logo is in the sidebar) */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}><Header onHome={goHome} /></div>
              <button
                onClick={() => setScreen("reglages")}
                style={{
                  background: 'none', border: 'none', color: 'var(--muted)',
                  padding: '12px 16px', cursor: 'pointer', fontSize: 18,
                }}
                aria-label="Réglages"
              >⚙</button>
            </div>
          )}

          {/* Ask Modal */}
          {askOpen && <AskModal onClose={() => setAskOpen(false)} />}

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", width: "100%", minHeight: 0 }}>
            {renderContent()}
          </div>

          {/* Persistent Bottom Player */}
          {(playerState || screen === "versions" || screen === "fiche" || screen === "loading") && (
            <BottomPlayer
              trackTitle={playerState?.trackTitle}
              versionName={playerState?.versionName}
              storagePath={playerState?.storagePath}
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

          {/* Bottom Nav — mobile only */}
          {isMobile && (
            <BottomNav
              active={askOpen ? "ask" : screen === "input" || screen === "fiche" ? "input" : screen === "versions" ? "historique" : screen}
              onChange={(id) => {
                setAskOpen(false);
                const target = id === "historique" ? "versions" : id;
                // Clear prefill when user intentionally navigates to the input tab
                if (target === "input") setPrefillTitle("");
                setScreen(target);
              }}
              onAsk={() => setAskOpen(o => !o)}
            />
          )}
        </div>
      </div>
    </LangContext.Provider>
  );
}
