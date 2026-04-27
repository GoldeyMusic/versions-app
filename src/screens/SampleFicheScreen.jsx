import { useState } from 'react';
import GlobalStyles from '../components/GlobalStyles';
import MockupStyles from '../components/MockupStyles';
import ReleaseReadinessBanner from '../components/ReleaseReadinessBanner';
import {
  ScoreRingBig,
  ScoreRingSmall,
  QualitativeSection,
  IntentPanel,
} from './FicheScreen';
import {
  renderWithEmphasis,
  splitVerdict,
  applyVocalTypeToFiche,
  isVoiceCategory,
  normalizeDiagItem,
} from '../lib/ficheHelpers.jsx';
import T from '../constants/theme';

// FontLink dupliqué — comme PublicFicheScreen, on évite l'import circulaire
// d'App pour rester rendu en pré-auth sans dépendance lourde.
function FontLink() {
  return (
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
    />
  );
}

// ── Données fictives (ticket 3.2) ───────────────────────────────────────
// Morceau francophone crédible. Volontairement mid-good (78/100) pour
// montrer une fiche utile avec des actions concrètes — pas un mix parfait.
// Toutes les valeurs techniques (Hz, dB, ratios, plugins) sont plausibles
// et conformes au format de notes ticket 1.1.
const SAMPLE_INTENT = "Pop électro mélancolique. Voix porteuse, fragile mais déterminée. Couplets : retenue, intériorité ; refrain : libération qui ne décolle pas tout à fait. Références : « La Chair » de Christine and the Queens, « Sober » de Lorde.";

const SAMPLE_DATA = {
  trackTitle: 'Brûle',
  versionName: 'V2',
  vocalType: 'vocal',
  analysisResult: {
    intent_used: SAMPLE_INTENT,
    _intent_scope: 'version',
    fiche: {
      globalScore: 78,
      verdict: "Une atmosphère qui tient debout. Reste à dégager le refrain pour qu'il respire vraiment.",
      summary: "La V2 a rapproché le mix de l'intention artistique. Le parti-pris mélancolique est lisible — synthés enveloppants, basse ronde, voix présente sans surjouer. Reste à dégager la voix dans le 2-4 kHz et à mieux différencier le couplet du refrain en dynamique.",
      elements: [
        {
          id: 'el-eq',
          cat: 'Équilibre fréquentiel',
          items: [
            {
              id: 'it-eq-1',
              priority: 'high',
              score: 68,
              title: 'Médium-haut voix encombré',
              why: "La voix lutte avec le synthé lead dans la zone 2-4 kHz, ce qui mange l'intelligibilité du refrain alors que c'est le moment où le texte doit s'entendre le plus clairement.",
              how: 'EQ dynamique sur le synthé : -3 dB autour de 3 kHz, sidechainé sur le bus voix. Q 1.2, attack 10 ms, release 80 ms.',
              plugin_pick: 'FabFilter Pro-Q 3 (mode dynamique)',
            },
            {
              id: 'it-eq-2',
              priority: 'med',
              score: 74,
              title: 'Bas du spectre un peu chargé',
              why: "Cumul d'énergie sous 60 Hz qui floute la basse synthé et la grosse caisse — l'ensemble manque de définition dans le bas.",
              how: 'High-pass à 35 Hz sur le bus instrumental (12 dB/oct), puis -2 dB en shelving sous 50 Hz uniquement sur les pads.',
              plugin_pick: 'Pultec EQP-1A (UAD ou Waves)',
            },
            {
              id: 'it-eq-3',
              priority: 'low',
              score: 82,
              title: 'Présence générale équilibrée',
              why: 'La courbe globale 4-8 kHz est cohérente avec les références — ni clinquant, ni étouffé.',
              how: 'Conserver la balance actuelle. Vérifier sur casque fermé que les hi-hats ne deviennent pas agressifs en sortie.',
              plugin_pick: '—',
            },
          ],
        },
        {
          id: 'el-dyn',
          cat: 'Dynamique',
          items: [
            {
              id: 'it-dyn-1',
              priority: 'high',
              score: 70,
              title: 'Refrain pas assez libéré',
              why: "Le crest factor du refrain (5,8 dB) est presque identique à celui des couplets (5,4 dB). À l'oreille, le refrain ne s'élève pas — il reste en intériorité.",
              how: 'Réduire la compression sur le bus master pendant les refrains : ratio 1.5:1 max, GR ≤ 1 dB. Booster le bus drums de +1.5 dB sur le refrain via automation.',
              plugin_pick: 'API 2500 (Waves) ou SSL G-Master Buss',
            },
            {
              id: 'it-dyn-2',
              priority: 'med',
              score: 76,
              title: 'Transitoires grosse caisse arrondis',
              why: "L'attaque collerait au genre, mais le punch manque sur les downbeats du refrain.",
              how: 'Transient designer : +2 sur attack, sustain neutre. Vérifier qu\'on ne casse pas la cohérence avec la snare (qui doit rester douce).',
              plugin_pick: 'SPL Transient Designer',
            },
          ],
        },
        {
          id: 'el-stereo',
          cat: 'Image stéréo',
          items: [
            {
              id: 'it-st-1',
              priority: 'med',
              score: 72,
              title: 'Pré-refrain perd son centre',
              why: "Pendant le build du pré-refrain, l'élargissement stéréo des pads aspire la voix lead qui semble reculer.",
              how: 'M/S EQ sur les pads pendant le pré-refrain : -1.5 dB sur le côté entre 1-3 kHz. La voix retrouve son ancrage central.',
              plugin_pick: 'iZotope Ozone 11 EQ (mode M/S)',
            },
            {
              id: 'it-st-2',
              priority: 'low',
              score: 84,
              title: 'Mono compatibility correcte',
              why: 'Aucun phasing destructif détecté — les check mono passent proprement.',
              how: 'Conserver la balance actuelle.',
              plugin_pick: '—',
            },
          ],
        },
        {
          id: 'el-space',
          cat: 'Espace et profondeur',
          items: [
            {
              id: 'it-sp-1',
              priority: 'med',
              score: 75,
              title: 'Profondeur trop frontale',
              why: "Tous les éléments arrivent à peu près au même plan. Les pads d'arrière-plan gagneraient à être plus enveloppés pour donner de l'air aux éléments de premier plan.",
              how: 'Reverb plate longue (decay 3.2 s, pre-delay 35 ms, dry/wet 18%) en send sur les pads. Couper sous 250 Hz dans la chaîne de la reverb.',
              plugin_pick: 'Valhalla VintageVerb (preset Plate, Color 1970s)',
            },
            {
              id: 'it-sp-2',
              priority: 'low',
              score: 80,
              title: 'Voix bien posée dans la pièce',
              why: "La reverb sur la voix lead est cohérente : on sent la chambre sans qu'elle masque le grain de la voix.",
              how: 'Conserver. Tester juste un -0.5 dB sur le retour reverb dans le refrain pour gagner en clarté.',
              plugin_pick: '—',
            },
          ],
        },
        {
          id: 'el-cohesion',
          cat: 'Cohérence globale',
          items: [
            {
              id: 'it-co-1',
              priority: 'med',
              score: 76,
              title: 'Pont moins tenu que les couplets',
              why: "Le pont (à 2:14) ouvre l'arrangement mais le mix s'éclaircit un peu trop ; on perd l'identité sombre installée.",
              how: 'Garder la basse synthé active jusqu\'à 2:30 (au lieu de couper à 2:14). Ajouter un sub-bass sine au pont (-12 dB sous la basse principale).',
              plugin_pick: 'Serum (preset sine pure) ou layer du synthé existant',
            },
            {
              id: 'it-co-2',
              priority: 'low',
              score: 82,
              title: 'Identité sonore lisible',
              why: 'Le morceau a une signature claire : on reconnaît un parti-pris cohérent du début à la fin.',
              how: 'Conserver. La signature est un atout — ne pas la diluer.',
              plugin_pick: '—',
            },
          ],
        },
        {
          id: 'el-voice',
          cat: 'Voix',
          items: [
            {
              id: 'it-vo-1',
              priority: 'high',
              score: 71,
              title: 'Sibilances marquées',
              why: "Certaines syllabes (« tout », « tu », « sortie ») ressortent du mix avec une énergie 6-8 kHz excessive.",
              how: 'De-esser : center 6.5 kHz, range -4 dB, threshold -22 dB. En série, EQ statique -1.5 dB shelf à 8 kHz pour adoucir les S consonantes.',
              plugin_pick: 'FabFilter Pro-DS (mode automatique)',
            },
            {
              id: 'it-vo-2',
              priority: 'med',
              score: 78,
              title: 'Compression voix bien dosée',
              why: "La voix tient sans pomper — la dynamique de l'interprétation reste vivante.",
              how: "Conserver la chaîne actuelle. Vérifier que l'auto-make-up gain ne grimpe pas sur les pianissimos.",
              plugin_pick: '1176 (UAD Rev A) ou Waves CLA-76',
            },
            {
              id: 'it-vo-3',
              priority: 'low',
              score: 80,
              title: "Air et présence cohérents avec l'intention",
              why: 'Le grain fragile de la voix est préservé, ce qui sert directement le parti-pris mélancolique du morceau.',
              how: "Conserver. Ne pas céder à la tentation d'ajouter de l'air > 12 kHz pour « sonner pro » — ça casserait l'intention.",
              plugin_pick: '—',
            },
          ],
        },
      ],
      plan: [
        {
          p: 'high',
          task: 'Libérer le refrain en dynamique',
          daw: 'Bus master + bus drums',
          metered: 'Crest 5.8 dB (refrain)',
          target: 'Crest ≥ 7.5 dB (refrain), GR master ≤ 1 dB',
          linkedItemIds: ['it-dyn-1', 'it-eq-1'],
        },
        {
          p: 'high',
          task: 'Dégager la voix dans le 2-4 kHz',
          daw: 'Synthé lead + bus voix',
          metered: 'Voix -6 dB sous synthé sur les refrains',
          target: 'Voix +2 dB au-dessus du synthé sur les refrains',
          linkedItemIds: ['it-eq-1', 'it-vo-1'],
        },
        {
          p: 'med',
          task: 'Maîtriser les sibilances vocales',
          daw: 'Bus voix lead',
          metered: 'Pics > -8 dBFS à 6.5 kHz',
          target: 'Pics ≤ -14 dBFS à 6.5 kHz',
          linkedItemIds: ['it-vo-1'],
        },
        {
          p: 'med',
          task: 'Renforcer la profondeur du fond sonore',
          daw: 'Pads + nappes',
          metered: 'Reverb send pads 8%',
          target: 'Reverb send pads 18%, EQ post -3 dB sous 250 Hz',
          linkedItemIds: ['it-sp-1'],
        },
      ],
    },
    listening: {
      impression: "Le morceau pose immédiatement son atmosphère : on entend la chambre, les murs, la solitude. Le contraste couplet → refrain est là mais reste timide, comme si le refrain n'avait pas encore le droit de respirer pleinement.",
      points_forts: [
        "Voix lead très bien placée : intelligibilité parfaite sans surcompresser.",
        "Basse synthé ronde et tenue, qui porte la mélancolie sans alourdir.",
        "Réverbération des claviers cohérente avec le parti-pris ambiance.",
      ],
      a_travailler: [
        "Le refrain ne s'élève pas suffisamment : il reste au même niveau perceptif que les couplets.",
        "Sibilances marquées sur certaines syllabes (« tout », « tu ») qui sortent du mix.",
        "La cohésion stéréo perd un peu de centre dans le pré-refrain.",
      ],
      espace: "Profondeur travaillée mais assez frontale ; les éléments d'arrière-plan (pads, textures) gagneraient à être encore plus enveloppés.",
      dynamique: 'Crest factor à 7,1 dB en moyenne, correct pour le genre. Le pré-refrain casse un peu trop sa progression dynamique.',
      potentiel: 'Une fois le refrain libéré et la voix mieux dégagée dans le médium-haut, ce mix peut atteindre la zone 85-88. Le potentiel émotionnel est bien là.',
    },
  },
};

// Mock track minimal pour IntentPanel — il lit `currentTrack.artisticIntent`
// en fallback. On le fournit pour que le panneau soit toujours rendu.
const SAMPLE_TRACK = { artisticIntent: SAMPLE_INTENT };

// ────────────────────────────────────────────────────────────────────────

export default function SampleFicheScreen({
  onSignup,
  onBackToLanding,
  topbarCtaLabel = 'Créer mon compte',
  bottomCtaLabel = 'Analyser mon premier titre',
}) {
  const data = SAMPLE_DATA;
  const analysisResult = data.analysisResult;
  const rawFiche = analysisResult.fiche;
  const listening = analysisResult.listening;

  const {
    elements,
    plan,
    globalScore: adjustedScore,
    voiceLabelOverride,
  } = applyVocalTypeToFiche(rawFiche, data.vocalType);
  const score = typeof adjustedScore === 'number' ? adjustedScore : null;

  // Accordéon strict — un seul state, une seule section ouverte à la fois.
  // Identifiants : 'intent', 'impression', 'diag::<id>', 'plan::<i>'.
  // Démo fermée par défaut → le visiteur clique pour ouvrir, comme sur la
  // vraie fiche. Ouvrir une section referme automatiquement la précédente.
  const [openSection, setOpenSection] = useState(null);
  const toggleSection = (id) =>
    setOpenSection((prev) => (prev === id ? null : id));

  return (
    <>
      <FontLink />
      <GlobalStyles />
      <MockupStyles />
      <SampleStyles />
      <div className="public-fiche-shell">
        {/* Bandeau "EXEMPLE" — très clair pour qu'aucun visiteur ne croie
            voir ses propres données. Lien retour landing à gauche, CTA
            d'inscription à droite. */}
        <header className="public-fiche-topbar sample-topbar">
          <div className="pft-left">
            <button type="button" className="sample-back" onClick={onBackToLanding} aria-label="Retour à la landing">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              <span>Versions</span>
            </button>
            <span className="sample-eyebrow">EXEMPLE — données fictives</span>
          </div>
          <div className="pft-right">
            <button type="button" className="pft-cta" onClick={onSignup}>{topbarCtaLabel}</button>
          </div>
        </header>

        <main className="public-fiche-main">
          <div className="sample-stage fiche-v2">
            <div className="public-fiche-page">
            {/* Intention artistique — différenciateur Versions, en TÊTE de
                fiche (cf. plan AubioMix : "intention en 1ʳᵉ section"). */}
            <IntentPanel
              analysisResult={analysisResult}
              currentTrack={SAMPLE_TRACK}
              versionInDb={null}
              open={openSection === 'intent'}
              onToggle={() => toggleSection('intent')}
            />

            {/* Ticket 4.3 — bandeau "Prêt à sortir / Presque / Pas encore".
                Avec 3 items high-prio (médium-haut voix, refrain, sibilances)
                non cochés et un score 78, le verdict tombe sur "Pas encore"
                — démontre la liste de bloquants exacts. */}
            <ReleaseReadinessBanner fiche={rawFiche} completedItems={null} />

            {/* Verdict */}
            <section className="row-verdict">
              <div className="rv-left">
                {score != null && <ScoreRingBig value={score} prevScore={null} />}
                <div className="verdict-text">
                  {(() => {
                    const v = rawFiche.verdict;
                    const sum = rawFiche.summary;
                    if (v && sum && v !== sum) {
                      return (
                        <>
                          <h1>{renderWithEmphasis(v)}</h1>
                          <p>{sum}</p>
                        </>
                      );
                    }
                    const { headline, rest } = splitVerdict(v || sum || '');
                    return (
                      <>
                        <h1>{renderWithEmphasis(headline)}</h1>
                        {rest && <p>{rest}</p>}
                      </>
                    );
                  })()}
                  <div className="public-fiche-meta">
                    <span className="pfm-track">{data.trackTitle}</span>
                    <span className="pfm-sep">·</span>
                    <span className="pfm-version">version {data.versionName}</span>
                  </div>
                  <div className="analyzed-at sample-mock-stamp">
                    Mix fictif — analyse de démonstration
                  </div>
                </div>
              </div>
            </section>

            {/* Écoute qualitative — wrappée dans un collapsible piloté par
                l'accordéon. La QualitativeSection desktop n'est pas pliable
                en interne, donc on l'ouvre/ferme depuis l'extérieur via CSS
                (max-height + overflow:hidden), et on cache son eyebrow
                interne (`q-eyebrow`) pour ne pas dupliquer le titre. */}
            {listening && (
              <div
                className={`sample-collapse${openSection === 'impression' ? ' is-open' : ''}`}
              >
                <button
                  type="button"
                  className="sample-collapse-head"
                  onClick={() => toggleSection('impression')}
                  aria-expanded={openSection === 'impression'}
                >
                  <span className="sc-eyebrow cerulean">
                    <span className="dot" />Écoute qualitative
                  </span>
                  <span className="sc-chev" aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
                <div className="sample-collapse-body">
                  <QualitativeSection listening={listening} />
                </div>
              </div>
            )}

            {/* Diagnostic + Plan en deux colonnes (parité PublicFicheScreen) */}
            {(elements.length > 0 || plan.length > 0) && (
              <div className="row-two">
                <div className="col-diag">
                  {elements.length > 0 && (
                    <>
                      <div className="section-head">
                        <span className="t">Diagnostic par éléments</span>
                        <span className="line" />
                        <span className="count">
                          {elements.length} catégorie{elements.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      {elements.map((el, idx) => {
                        const items = (el.items || []).map(normalizeDiagItem);
                        const scores = items.map((it) => it.score).filter((sc) => typeof sc === 'number');
                        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
                        const isVoice = isVoiceCategory(el.cat);
                        const isPendingVoice = isVoice && voiceLabelOverride;
                        const catLabel = isPendingVoice ? voiceLabelOverride : el.cat;
                        const sectionId = `diag::${el.id || el.cat || idx}`;
                        const isOpen = openSection === sectionId;
                        const catClass = `diag-cat${isOpen ? ' open' : ''}${isPendingVoice ? ' pending-voice' : ''}`;
                        return (
                          <div key={el.id || el.cat || idx} className={catClass}>
                            <div
                              className="diag-cat-head"
                              onClick={() => toggleSection(sectionId)}
                              role="button"
                              tabIndex={0}
                              aria-expanded={isOpen}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleSection(sectionId);
                                }
                              }}
                            >
                              <span className="chev">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                              <span className="name">{catLabel}</span>
                              <span className="count">
                                {items.length} élément{items.length > 1 ? 's' : ''}
                                {avg != null ? ` · moy ${Math.round(avg)}` : ''}
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
                                    {it.plugin_pick && it.plugin_pick !== '—' && (
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

                <div className="col-plan">
                  {plan.length > 0 && (
                    <>
                      <div className="section-head">
                        <span className="t">Plan d'action</span>
                        <span className="line" />
                        <span className="count">
                          {plan.length} ajustement{plan.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="priority-list">
                        {plan.map((p, i) => {
                          const prio = (p.p || '').toLowerCase();
                          const sectionId = `plan::${i}`;
                          const isOpen = openSection === sectionId;
                          const linkedItems = elements.flatMap((el) =>
                            (el.items || [])
                              .filter((it) => Array.isArray(p.linkedItemIds) && it.id && p.linkedItemIds.includes(it.id))
                              .map((it) => ({ ...it, cat: el.cat }))
                          );
                          return (
                            <div key={i} className={`priority collapsible sample-priority${isOpen ? ' open' : ''}`}>
                              <div
                                className="priority-head"
                                onClick={() => toggleSection(sectionId)}
                                role="button"
                                tabIndex={0}
                                aria-expanded={isOpen}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    toggleSection(sectionId);
                                  }
                                }}
                              >
                                <span className={`pbadge ${prio}`}>{(p.p || '').toUpperCase()}</span>
                                <span className="ptitle">{p.task}</span>
                                <span className="pchev" aria-hidden="true">
                                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                    <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              </div>
                              <div className="priority-body">
                                {p.daw && (
                                  <div className="daw-box">
                                    <span className="daw-label">DAW</span>
                                    {p.daw}
                                  </div>
                                )}
                                {(p.metered || p.target) && (
                                  <div className="mt-grid">
                                    {p.metered && (
                                      <div className="mt-box m">
                                        <div className="mt-label">Mesuré</div>
                                        <div className="mt-val">{p.metered}</div>
                                      </div>
                                    )}
                                    {p.target && (
                                      <div className="mt-box t">
                                        <div className="mt-label">Cible</div>
                                        <div className="mt-val">{p.target}</div>
                                      </div>
                                    )}
                                  </div>
                                )}
                                {linkedItems.length > 0 && (
                                  <div className="linked-elements">
                                    <div className="label">Éléments liés</div>
                                    <div className="le-list">
                                      {linkedItems.map(normalizeDiagItem).map((it) => (
                                        <div className="le" key={it.id}>
                                          <span className="cat">{it.cat}</span>
                                          <span className="name">{it.title}</span>
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
                </div>
              </div>
            )}

            {/* CTA bas de page — invitation à analyser son propre morceau. */}
            <section className="sample-cta-banner">
              <div className="sample-cta-eyebrow">VOTRE TOUR</div>
              <h2 className="sample-cta-title">
                <em>Et votre mix à vous,</em><br />
                qu'est-ce qu'il dirait ?
              </h2>
              <p className="sample-cta-body">
                Cette fiche est un exemple. La vraie analyse Versions s'adapte à
                votre intention artistique, à vos références, et au stade de
                votre version. Cinq minutes, un fichier audio, et vous savez où
                creuser.
              </p>
              <button type="button" onClick={onSignup} className="sample-cta-btn">
                {bottomCtaLabel}
              </button>
            </section>
            </div>

            <aside className="sample-chat-side" aria-label="Chat de démonstration">
              <SampleChatPanel />
            </aside>
          </div>
        </main>

        <footer className="public-fiche-footer">
          <span>Versions — un compagnon de studio, pas un juge.</span>
        </footer>
      </div>
    </>
  );
}

// Chat fictif statique — présenté pour montrer la grammaire de l'app
// quand le chat est ancré à droite (parité fiche desktop). Pas de logique :
// les messages sont en dur, l'input est désactivé. Le visiteur clique sur le
// CTA pour créer son compte s'il veut interagir vraiment.
function SampleChatPanel() {
  return (
    <aside className="chat-panel chat-panel-anchored sample-chat-panel">
      <div className="chat-head">
        <span className="ctitle">Discussion</span>
      </div>
      <div className="chat-body">
        <div className="msg user">
          Pourquoi ma voix sonne un peu noyée dans les refrains ?
        </div>
        <div className="msg ai">
          <span className="ai-label">Versions</span>
          Dans les refrains, l'accumulation des pads et des harmonies vocales crée un masquage dans les hauts-médiums (2-4 kHz). Ta voix lead perd en présence. Deux solutions : un EQ additif léger à 3 kHz sur la voix, ou une automation de -2 dB sur les pads uniquement pendant les refrains.
        </div>
        <div className="msg user">
          Et si je veux garder l'effet d'ensemble dense ?
        </div>
        <div className="msg ai">
          <span className="ai-label">Versions</span>
          Dans ce cas, tu peux utiliser un side-chain léger sur les pads déclenché par la voix — ça créera juste assez d'espace sans casser la densité. Essaie un ratio 2:1 avec une attaque rapide.
        </div>
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Posez une question…"
          disabled
          aria-label="Chat de démonstration — désactivé"
        />
        <button type="button" disabled>Envoyer</button>
      </div>
    </aside>
  );
}

function SampleStyles() {
  return (
    <style>{`
      /* Topbar : bouton retour à gauche + eyebrow EXEMPLE.
         On surcharge .public-fiche-topbar pour les éléments specifics. */
      .sample-topbar .pft-left {
        display: flex; align-items: center; gap: 14px;
      }
      .sample-back {
        display: inline-flex; align-items: center; gap: 8px;
        padding: 6px 10px; border-radius: 999px;
        background: transparent; border: 1px solid ${T.border};
        color: ${T.text};
        font-family: ${T.body}; font-weight: 600; font-size: 13px;
        letter-spacing: -0.2px;
        cursor: pointer;
        transition: border-color .15s, background .15s;
      }
      .sample-back:hover { border-color: ${T.borderStrong}; background: rgba(255,255,255,0.03); }
      .sample-back svg { color: ${T.muted}; }
      .sample-eyebrow {
        font-family: ${T.mono}; font-size: 10px; font-weight: 500;
        letter-spacing: 2.2px; text-transform: uppercase;
        color: ${T.amber};
        padding: 4px 10px;
        background: rgba(245,166,35,0.08);
        border: 1px solid rgba(245,166,35,0.30);
        border-radius: 999px;
      }
      .sample-mock-stamp {
        color: ${T.muted2} !important;
        font-style: italic;
      }

      /* Bannière CTA bas de page — pleine largeur, fond ambre subtil,
         halo accentué. Le CTA reprend la grammaire pill ambre du reste
         de l'identité. */
      .sample-cta-banner {
        margin: clamp(48px, 7vw, 80px) 0 0;
        padding: clamp(40px, 6vw, 64px) clamp(24px, 5vw, 48px);
        border-radius: 20px;
        background:
          radial-gradient(ellipse 600px 360px at 50% 0%, rgba(245,166,35,0.10), transparent 70%),
          ${T.s1};
        border: 1px solid rgba(245,166,35,0.22);
        display: flex; flex-direction: column; align-items: center;
        text-align: center; gap: 14px;
      }
      .sample-cta-eyebrow {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2.4px; text-transform: uppercase;
        color: ${T.amber};
      }
      .sample-cta-title {
        font-family: 'Cormorant Garamond', ${T.serif};
        font-weight: 400;
        font-size: clamp(26px, 4.4vw, 38px);
        line-height: 1.22; letter-spacing: -0.2px;
        color: ${T.text}; max-width: 640px; margin: 0;
      }
      .sample-cta-title em {
        font-style: italic; color: ${T.amber}; font-weight: 400;
      }
      .sample-cta-body {
        font-family: ${T.body}; font-weight: 300; font-size: 15px;
        line-height: 1.6; color: ${T.textSoft};
        max-width: 560px; margin: 4px 0 8px;
      }
      .sample-cta-btn {
        margin-top: 8px;
        padding: 16px 32px;
        background: transparent; color: ${T.amber};
        border: 1px solid rgba(245,166,35,0.55); border-radius: 999px;
        font-family: ${T.mono}; font-size: 12px; font-weight: 500;
        letter-spacing: 1.8px; text-transform: uppercase;
        cursor: pointer; transition: all .15s;
      }
      .sample-cta-btn:hover {
        border-color: ${T.amber};
        background: rgba(245,166,35,0.08);
        box-shadow: 0 0 0 6px rgba(245,166,35,0.06);
      }

      /* ── Accordéon strict (sample) ───────────────────────
         Wrapper de section collapsible générique : header cliquable +
         chevron qui pivote, body en max-height transition. Utilisé pour
         "Écoute qualitative" (qui n'a pas de collapsible interne sur
         desktop). Aligné visuellement sur .row-qualitative.stacked
         (panel cerulean + halo bas-droite). */
      .sample-collapse {
        position: relative;
        overflow: hidden;
        background: var(--card, ${T.s1});
        border: 1px solid var(--border, ${T.border});
        border-radius: 14px;
      }
      .sample-collapse::before {
        content: '';
        position: absolute;
        bottom: -60px; right: -60px;
        width: 220px; height: 220px;
        border-radius: 50%;
        background: var(--cerulean, #5cb8cc);
        filter: blur(80px);
        opacity: 0.14;
        pointer-events: none;
        z-index: 0;
      }
      .sample-collapse-head {
        all: unset;
        position: relative;
        z-index: 1;
        display: flex; align-items: center; gap: 12px;
        width: 100%;
        box-sizing: border-box;
        padding: 16px 22px;
        cursor: pointer;
        transition: background .15s;
      }
      .sample-collapse-head:hover { background: rgba(255,255,255,0.025); }
      .sample-collapse-head .sc-eyebrow {
        font-family: var(--mono, ${T.mono});
        font-size: 10.5px;
        letter-spacing: 2.2px;
        text-transform: uppercase;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        flex: 1;
        line-height: 1;
      }
      .sample-collapse-head .sc-eyebrow.cerulean { color: var(--cerulean, #5cb8cc); }
      .sample-collapse-head .sc-eyebrow.cerulean .dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: var(--cerulean, #5cb8cc);
        flex-shrink: 0;
      }
      .sample-collapse-head .sc-chev {
        color: var(--muted, ${T.muted});
        display: inline-flex; align-items: center;
        transition: transform .18s ease, color .15s;
      }
      .sample-collapse.is-open .sc-chev {
        transform: rotate(90deg);
        color: var(--cerulean, #5cb8cc);
      }
      .sample-collapse-body {
        position: relative;
        z-index: 1;
        max-height: 0;
        overflow: hidden;
        transition: max-height .28s ease;
      }
      .sample-collapse.is-open .sample-collapse-body {
        max-height: 4000px;
      }
      /* Quand la QualitativeSection est wrappée, on retire son fond/halo
         pour ne pas avoir un panel dans un panel, et on cache son eyebrow
         interne (notre header le remplace). */
      .sample-collapse > .sample-collapse-body > .row-qualitative.stacked {
        background: transparent;
        border: none;
        border-radius: 0;
        padding: 0 22px 22px;
        margin: 0;
        overflow: visible;
      }
      .sample-collapse > .sample-collapse-body > .row-qualitative.stacked::before {
        display: none;
      }
      .sample-collapse > .sample-collapse-body > .row-qualitative.stacked > .q-eyebrow {
        display: none;
      }

      /* ── Diag categories collapsibles (sample) ───────────
         La règle de base .diag-cat.open .diag-cat-body { display: block }
         est définie dans MockupStyles ; pas besoin de la dupliquer. On
         ajoute juste le hover sur la head et on s'assure que le chev est
         bien rendu (la vraie fiche le styled via .fiche-v2 .diag-panel,
         qu'on n'utilise pas ici — fallback). */
      .public-fiche-page .diag-cat-head {
        cursor: pointer;
        transition: background .15s;
      }
      .public-fiche-page .diag-cat-head:hover { background: rgba(255,255,255,0.025); }
      .public-fiche-page .diag-cat-head .chev {
        display: inline-flex;
        align-items: center;
        color: var(--muted, ${T.muted});
        transition: transform .15s;
        flex-shrink: 0;
      }
      .public-fiche-page .diag-cat.open .diag-cat-head .chev {
        transform: rotate(90deg);
        color: var(--amber, ${T.amber});
      }

      /* ── Plan items (sample) — retire le pcheck/resolve héritage,
           ajoute hover ambre comme la vraie fiche en mode collapsible. */
      .sample-priority .pcheck,
      .sample-priority .resolve-action { display: none; }

      /* ── Stage : page principale + chat fictif à droite ──
         Sur desktop large (≥ 1180px), on passe en grid 2 colonnes :
         contenu principal (max 1080) + colonne chat ancrée à droite.
         Le chat est sticky pour rester visible quand on scrolle la fiche.
         Sous le seuil, le chat est masqué (mobile/tablette) — la grammaire
         "chat ancré" est avant tout une démo desktop. */
      .sample-stage { display: block; width: 100%; }
      .sample-chat-side { display: none; }
      @media (min-width: 1180px) {
        .sample-stage {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 380px;
          column-gap: 28px;
          max-width: 1500px;
          margin: 0 auto;
          padding: 0 28px;
          align-items: start;
        }
        .sample-stage > .public-fiche-page {
          margin: 0;          /* le centrage est géré par .sample-stage */
          padding: 0;
          max-width: 1080px;
        }
        .sample-chat-side {
          display: flex;
          position: sticky;
          top: 88px;          /* topbar 56 + 32 respiration */
          height: calc(100vh - 88px - 24px);
          min-height: 480px;
        }
        .sample-chat-side .chat-panel.chat-panel-anchored {
          position: relative;
          width: 100%;
          height: 100%;
          flex: 1;
          background: ${T.s1};
          border: 1px solid ${T.border};
          border-radius: 14px;
          box-shadow: 0 12px 32px rgba(0,0,0,0.25);
        }
      }
      /* Input désactivé : on garde le rendu visuel actif (pas grisé)
         pour que la maquette ne donne pas l'impression d'être cassée,
         mais on bloque le focus / la frappe via [disabled]. */
      .sample-chat-panel .chat-input input[disabled] {
        opacity: 1;
        cursor: not-allowed;
        background: ${T.s2} !important;
      }
      .sample-chat-panel .chat-input button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        .sample-topbar .pft-left { gap: 10px; flex-wrap: wrap; }
        .sample-eyebrow { font-size: 9px; letter-spacing: 1.8px; padding: 3px 8px; }
        .sample-cta-banner { margin: 40px 0 0; border-radius: 14px; }
        .sample-cta-btn { padding: 14px 26px; font-size: 11px; letter-spacing: 1.5px; }
      }
    `}</style>
  );
}
