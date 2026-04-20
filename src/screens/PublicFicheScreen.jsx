import { useEffect, useState } from 'react';
import GlobalStyles from '../components/GlobalStyles';
import MockupStyles from '../components/MockupStyles';
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
} from '../lib/ficheHelpers.jsx';
import { fetchPublicFiche } from '../lib/storage';
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
  const { s } = useLang();
  // L'état initial dépend du token (présent ou non) — on évite un setState
  // synchrone dans l'effet (règle react-hooks/set-state-in-effect).
  const [state, setState] = useState(() => (
    token ? { status: 'loading', data: null } : { status: 'notfound', data: null }
  ));

  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      const data = await fetchPublicFiche(token);
      if (!alive) return;
      if (!data) {
        setState({ status: 'notfound', data: null });
      } else {
        setState({ status: 'ok', data });
      }
    })();
    return () => { alive = false; };
  }, [token]);

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
            {/* Verdict */}
            <section className="row-verdict">
              <div className="rv-left">
                {score != null && <ScoreRingBig value={score} prevScore={null} />}
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
                </div>
              </div>
            </section>

            {/* Écoute qualitative */}
            {listening && <QualitativeSection listening={listening} />}

            {/* Diagnostic + Plan en deux colonnes comme la fiche privée */}
            {(elements.length > 0 || plan.length > 0) && (
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
                        const items = el.items || [];
                        const scores = items.map((it) => it.score).filter((s) => typeof s === 'number');
                        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                        const isVoice = isVoiceCategory(el.cat);
                        const isPendingVoice = isVoice && voiceLabelOverride;
                        const catLabel = isPendingVoice ? voiceLabelOverride : el.cat;
                        const catClass = isPendingVoice ? 'diag-cat open pending-voice' : 'diag-cat open';
                        return (
                          <div key={el.id || el.cat || idx} className={catClass}>
                            <div className="diag-cat-head">
                              <span className="name">{catLabel}</span>
                              <span className="count">
                                {isPendingVoice
                                  ? s.fiche.pendingVoiceStep
                                  : `${items.length} ${items.length > 1 ? s.fiche.elementPlural : s.fiche.elementSingular}${avg != null ? `${s.fiche.avgPrefix}${avg.toFixed(1).replace(/\.0$/, '')}` : ''}`}
                              </span>
                            </div>
                            <div className="diag-cat-body">
                              {items.map((it, i) => (
                                <div key={it.id || i} className="diag-item">
                                  <ScoreRingSmall value={it.score} />
                                  <div className="di-body">
                                    <div className="di-name">{it.label}</div>
                                    {it.detail && <div className="di-detail">{it.detail}</div>}
                                    {Array.isArray(it.tools) && it.tools.length > 0 && (
                                      <div className="di-tools">
                                        {it.tools.map((t) => <span key={t}>{t}</span>)}
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

                <div className="col-plan">
                  {plan.length > 0 && (
                    <>
                      <div className="section-head">
                        <span className="t">{s.fiche.planTitle}</span>
                        <span className="line" />
                        <span className="count">
                          {plan.length} {plan.length > 1 ? s.fiche.adjustmentPlural : s.fiche.adjustmentSingular}
                        </span>
                      </div>
                      <div className="priority-list">
                        {plan.map((p, i) => {
                          const prio = (p.p || '').toLowerCase();
                          const linkedItems = elements.flatMap((el) =>
                            (el.items || [])
                              .filter((it) => Array.isArray(p.linkedItemIds) && it.id && p.linkedItemIds.includes(it.id))
                              .map((it) => ({ ...it, cat: el.cat }))
                          );
                          return (
                            <div key={i} className="priority collapsible open read-only">
                              <div className="priority-head">
                                <span className={`pbadge ${prio}`}>{(p.p || '').toUpperCase()}</span>
                                <span className="ptitle">{p.task}</span>
                              </div>
                              <div className="priority-body">
                                {p.daw && (
                                  <div className="daw-box">
                                    <span className="daw-label">{s.fiche.focusDawLabel}</span>
                                    {p.daw}
                                  </div>
                                )}
                                {(p.metered || p.target) && (
                                  <div className="mt-grid">
                                    {p.metered && (
                                      <div className="mt-box m">
                                        <div className="mt-label">{s.fiche.focusMeasured}</div>
                                        <div className="mt-val">{p.metered}</div>
                                      </div>
                                    )}
                                    {p.target && (
                                      <div className="mt-box t">
                                        <div className="mt-label">{s.fiche.focusTarget}</div>
                                        <div className="mt-val">{p.target}</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {linkedItems.length > 0 && (
                                  <div className="linked-elements">
                                    <div className="label">{s.fiche.focusLinkedItems}</div>
                                    <div className="le-list">
                                      {linkedItems.map((it) => (
                                        <div className="le" key={it.id}>
                                          <span className="cat">{it.cat}</span>
                                          <span className="name">{it.label}</span>
                                          {typeof it.score === 'number' && <ScoreRingSmall value={it.score} />}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Notes perso (lecture seule) */}
                  {userNotes && (
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
                  )}
                </div>
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
