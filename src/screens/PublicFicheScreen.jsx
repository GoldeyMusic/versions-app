import { useEffect, useState } from 'react';
import GlobalStyles from '../components/GlobalStyles';
import MockupStyles from '../components/MockupStyles';
import ReleaseReadinessBanner from '../components/ReleaseReadinessBanner';
import {
  ScoreRingBig,
  ScoreRingSmall,
  QualitativeSection,
} from './FicheScreen';
import {
  renderWithEmphasis,
  formatAnalyzedAt,
  splitVerdict,
  applyVocalTypeToFiche,
  isVoiceCategory,
  normalizeDiagItem,
} from '../lib/ficheHelpers.jsx';
import { fetchPublicFiche, translateAnalysisResult } from '../lib/storage';
import useLang from '../hooks/useLang';

// FontLink dupliqué depuis App.jsx (évite l'import circulaire de App dans ce
// composant qui peut tourner avant même l'auth). On garde juste la balise
// <link> nécessaire au rendu typographique.
function FontLink() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
    />
  );
}

// Fiche lecture seule accessible par lien public : #/p/<token>
// Aucune auth requise. Utilise la RPC `get_public_fiche(token)` qui renvoie
// (via SECURITY DEFINER) uniquement la fiche correspondant au token — aucune
// autre version / projet / notes externes n'est exposé.
export default function PublicFicheScreen({ token }) {
  const { s, lang } = useLang();
  // L'état initial dépend du token (présent ou non) — on évite un setState
  // synchrone dans l'effet (règle react-hooks/set-state-in-effect).
  const [state, setState] = useState(() => (
    token ? { status: 'loading', data: null } : { status: 'notfound', data: null }
  ));
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      const data = await fetchPublicFiche(token);
      if (!alive) return;
      if (!data) {
        setState({ status: 'notfound', data: null });
        return;
      }
      // Serve l'analysisResult directement dans la langue du visiteur si
      // possible. Ordre d'essai :
      //  1) source = target → on sert l'original.
      //  2) cache présent (rempli par l'owner) pour la langue cible → cache.
      //  3) appel /api/translate à la volée (pas de writeback, visiteur anonyme).
      const target = (lang || 'fr').toString().toLowerCase().slice(0, 2);
      const source = (data.analysisLocale || 'fr').toString().toLowerCase().slice(0, 2);
      if (source === target || !data.analysisResult) {
        setState({ status: 'ok', data });
        return;
      }
      const cached = data.analysisTranslations && data.analysisTranslations[target];
      if (cached) {
        setState({ status: 'ok', data: { ...data, analysisResult: cached } });
        return;
      }
      // Cache miss : on affiche l'original tout de suite, et on déclenche la
      // traduction en arrière-plan avec un indicateur.
      setState({ status: 'ok', data });
      setTranslating(true);
      try {
        const tr = await translateAnalysisResult(data.analysisResult, source, target);
        if (!alive) return;
        if (tr) setState({ status: 'ok', data: { ...data, analysisResult: tr } });
      } catch (e) {
        console.warn('[PublicFicheScreen] translate failed', e?.message);
      } finally {
        if (alive) setTranslating(false);
      }
    })();
    return () => { alive = false; };
  }, [token, lang]);

  if (state.status === 'loading') {
    return (
      <>
        <FontLink />
        <GlobalStyles />
        <MockupStyles />
        <div className="public-fiche-shell">
          <div className="public-fiche-loading">{s.publicFiche.loading}</div>
        </div>
      </>
    );
  }

  if (state.status === 'notfound') {
    return (
      <>
        <FontLink />
        <GlobalStyles />
        <MockupStyles />
        <div className="public-fiche-shell">
          <div className="public-fiche-404">
            <div className="pfx-kicker">VERSIONS</div>
            <h1>{s.publicFiche.notFoundTitle}</h1>
            <p>{s.publicFiche.notFoundBody}</p>
            <a href="#/" className="pfx-home">{s.publicFiche.notFoundHome}</a>
          </div>
        </div>
      </>
    );
  }

  const { data } = state;
  const analysisResult = data.analysisResult || {};
  const rawFiche = analysisResult.fiche || {};
  const listening = analysisResult.listening || null;
  const userNotes = (analysisResult.userNotes || '').trim();

  // Type vocal du titre : vient du RPC (migration 005). Pour les anciens
  // partages créés avant la migration, vocalType sera 'vocal' par défaut.
  const vocalType = data.vocalType || 'vocal';
  const {
    elements,
    plan,
    globalScore: adjustedScore,
    voiceLabelOverride,
  } = applyVocalTypeToFiche(rawFiche, vocalType);
  const score = typeof adjustedScore === 'number' ? adjustedScore : null;

  return (
    <>
      <FontLink />
      <GlobalStyles />
      <MockupStyles />
      <div className="public-fiche-shell">
        {/* Bandeau haut — VERSIONS + mention lecture seule */}
        <header className="public-fiche-topbar">
          <div className="pft-left">
            <span className="pft-brand">VERSIONS</span>
            <span className="pft-subbrand">{s.publicFiche.headerShared}</span>
          </div>
          <div className="pft-right">
            <a href="#/" className="pft-cta">{s.publicFiche.topbarCta}</a>
          </div>
        </header>

        <main className="public-fiche-main">
          <div className="public-fiche-page">
            {/* Ticket 4.3 — bandeau "Prêt à sortir" (lecture seule, pas de
                completedItems sur un partage public — le bandeau reflète
                la fiche brute uniquement). uploadType vient de la RPC
                publique : default 'mix' si la signature actuelle ne
                renvoie pas encore le champ (cf. storage.fetchPublicFiche). */}
            <ReleaseReadinessBanner
              fiche={rawFiche}
              completedItems={null}
              uploadType={data.uploadType || 'mix'}
            />
            {/* Verdict */}
            <section className="row-verdict">
              <div className="rv-left">
                {score != null && <ScoreRingBig value={score} prevScore={null} />}
                {(() => {
                  // Ticket 4.1 — bandeau plafond de score (lecture seule).
                  const sf = rawFiche?.score_floor;
                  if (!sf || !sf.applied) return null;
                  const tpl = sf.highCount === 1 ? s.fiche.scoreFloorOneItem : s.fiche.scoreFloorManyItems;
                  const txt = (tpl || '')
                    .replace('{count}', String(sf.highCount))
                    .replace('{ceiling}', String(sf.ceiling));
                  return (
                    <div className="score-floor-banner" role="note">
                      <span className="sf-dot" aria-hidden="true" />
                      <span className="sf-text">{txt}</span>
                    </div>
                  );
                })()}
                <div className="verdict-text">
                  {(() => {
                    const vText = rawFiche.verdict || rawFiche.summary || '';
                    if (!vText) return <h1>{data.trackTitle || s.publicFiche.verdictFallback}</h1>;
                    if (rawFiche.verdict && rawFiche.summary && rawFiche.verdict !== rawFiche.summary) {
                      return (
                        <>
                          <h1>{renderWithEmphasis(rawFiche.verdict)}</h1>
                          <p>{rawFiche.summary}</p>
                        </>
                      );
                    }
                    const { headline, rest } = splitVerdict(vText);
                    return (
                      <>
                        <h1>{renderWithEmphasis(headline)}</h1>
                        {rest && <p>{rest}</p>}
                      </>
                    );
                  })()}
                  <div className="public-fiche-meta">
                    <span className="pfm-track">{data.trackTitle}</span>
                    {data.versionName && (
                      <>
                        <span className="pfm-sep">·</span>
                        <span className="pfm-version">
                          {s.publicFiche.versionPrefix.replace('{name}', data.versionName)}
                        </span>
                      </>
                    )}
                  </div>
                  {(() => {
                    const stamp = formatAnalyzedAt(data.createdAt);
                    return stamp ? <div className="analyzed-at">{stamp}</div> : null;
                  })()}
                  {translating && (
                    <div className="analyzed-at" style={{ opacity: 0.6, fontStyle: 'italic' }}>
                      {s.fiche.translating}
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Écoute qualitative */}
            {listening && <QualitativeSection listening={listening} />}

            {/* Diagnostic + Notes en deux colonnes comme la fiche privée */}
            {(elements.length > 0 || userNotes) && (
              <div className="row-two">
                <div className="col-diag">
                  {elements.length > 0 && (
                    <>
                      <div className="section-head">
                        <span className="t">{s.fiche.diagTitle}</span>
                        <span className="line" />
                        <span className="count">
                          {elements.length} {elements.length > 1 ? s.fiche.categoryPlural : s.fiche.categorySingular}
                        </span>
                      </div>
                      {elements.map((el, idx) => {
                        const items = (el.items || []).map(normalizeDiagItem);
                        const scores = items.map((it) => it.score).filter((s) => typeof s === 'number');
                        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                        const isVoice = isVoiceCategory(el.cat);
                        const isPendingVoice = isVoice && voiceLabelOverride;
                        const catLabel = isPendingVoice ? s.fiche.voiceComingSoon : el.cat;
                        const catClass = isPendingVoice ? 'diag-cat open pending-voice' : 'diag-cat open';
                        return (
                          <div key={el.id || el.cat || idx} className={catClass}>
                            <div className="diag-cat-head">
                              <span className="name">{catLabel}</span>
                              <span className="count">
                                {isPendingVoice
                                  ? s.fiche.pendingVoiceStep
                                  : `${items.length} ${items.length > 1 ? s.fiche.elementPlural : s.fiche.elementSingular}${avg != null ? `${s.fiche.avgPrefix}${Math.round(avg)}` : ''}`}
                              </span>
                            </div>
                            <div className="diag-cat-body">
                              {items.map((it, i) => (
                                <div key={it.id || i} className={`diag-item${it.priority ? ` prio-${it.priority}` : ''}`}>
                                  <ScoreRingSmall value={it.score} />
                                  <div className="di-body">
                                    <div className="di-name">
                                      {it.priority && (
                                        <span className={`di-prio prio-${it.priority}`} aria-label={`priorité ${it.priority}`} />
                                      )}
                                      {it.title}
                                    </div>
                                    {it.why && <div className="di-detail">{it.why}</div>}
                                    {it.how && (
                                      <div className="di-how">
                                        <span className="di-how-label">Action</span>
                                        <code>{it.how}</code>
                                      </div>
                                    )}
                                    {it.plugin_pick && (
                                      <div className="di-tools">
                                        <span className="di-plugin">{it.plugin_pick}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                </div>

                {userNotes && (
                  <div className="col-plan">
                    {/* Notes perso (lecture seule) */}
                    <div className="notes-section">
                      <div className="notes-block read-only">
                        <div className="notes-head">
                          <span className="notes-title">{s.publicFiche.artistNotesTitle}</span>
                        </div>
                        <div className="notes-body read-only">
                          <div className="notes-readonly">{userNotes}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        <footer className="public-fiche-footer">
          <span>{s.publicFiche.footerText}</span>
        </footer>
      </div>
    </>
  );
}
