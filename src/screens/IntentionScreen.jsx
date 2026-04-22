// ============================================================
// versions-app / screens / IntentionScreen.jsx
// Écran intermédiaire entre la Phase A (écoute Gemini) et la
// Phase B (diagnostic Claude). Collecte l'intention artistique.
// ============================================================
//
// Props :
//   - perception       { lead, tags, bpm, duration } (venu de la Phase A)
//   - config           { title, version, ... } (passé par App.jsx)
//   - isFirstVersion   bool (true = V1, sinon layout compact)
//   - inheritedIntent  string|null (intention du titre, pour V2+)
//   - onSubmit         (intent: string, scope: 'track'|'version') => void
//   - onSkip           () => void
//
// Toutes les classes CSS utilisées ici sont préfixées `.intent-*`
// et définies dans MockupStyles.jsx.
// ============================================================

import { useState, useEffect, useRef } from 'react';

const HINTS = [
  "Ex : je veux garder ce côté brut, lo-fi — la voix en retrait est un choix, je cherche un grain à la Frank Ocean / Blonde…",
  "Ex : je cherche un son à la SZA / SOS — chaud, enveloppant, voix bien en avant…",
  "Ex : la voix est volontairement en retrait, comme un souvenir — ne me propose pas de la remonter.",
  "Ex : c'est une démo, pas un master. Dis-moi surtout si l'arrangement tient debout.",
];

const EXAMPLES = [
  { label: 'Référence', text: 'Je cherche un son à la Frank Ocean — Blonde, pas Channel Orange.' },
  { label: 'Choix assumé', text: "La voix en retrait, c'est voulu — pas un défaut de mix." },
  { label: 'Garde-fou', text: 'Je veux garder ce côté brut, lo-fi. Ne me propose pas de le "propre-r".' },
];

export default function IntentionScreen({
  perception,
  config,
  isFirstVersion = true,
  inheritedIntent = null,
  onSubmit,
  onSkip,
}) {
  const [intent, setIntent] = useState('');
  const [scope, setScope] = useState('track');
  const [hintIndex, setHintIndex] = useState(0);
  const areaRef = useRef(null);

  const trackTitle = config?.title || '';
  const versionName = config?.version || '';

  useEffect(() => {
    const t = setInterval(() => {
      setHintIndex((i) => (i + 1) % HINTS.length);
    }, 3500);
    return () => clearInterval(t);
  }, []);

  const handleExampleClick = (text) => {
    setIntent(text);
    areaRef.current?.focus();
  };

  // ─────────────────────────────────────────────────────────
  // Variante B : V2+ avec intention héritée
  // ─────────────────────────────────────────────────────────
  if (!isFirstVersion && inheritedIntent) {
    return (
      <div className="intent-screen intent-screen-compact">
        <div className="intent-head">
          <div className="intent-kicker">Étape 2/3 · intention</div>
          <h2 className="intent-title">
            Cette <em>{versionName || 'nouvelle version'}</em> de {trackTitle} — tu gardes la même direction&nbsp;?
          </h2>
          <p className="intent-subtitle">
            L'intention enregistrée pour le titre&nbsp;:{' '}
            <i>« {inheritedIntent} »</i>. Laisse vide si tu gardes la même,
            ou ajuste juste pour cette version.
          </p>
        </div>

        <div className="intent-textarea-wrap">
          <textarea
            ref={areaRef}
            className="intent-textarea"
            placeholder="Rien à ajuster ? Laisse vide, on reprend l'intention du titre."
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            maxLength={600}
          />
          <div className="intent-char-count">{intent.length} / 600</div>
        </div>

        <div className="intent-actions">
          <button className="intent-btn-ghost" onClick={onSkip}>
            Passer cette étape →
          </button>
          <button
            className="intent-btn-primary"
            onClick={() => {
              const override = intent.trim();
              if (override) onSubmit(override, 'version');
              else onSkip();
            }}
          >
            Lancer le diagnostic calibré →
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // V1 (ou V2+ sans intention héritée) : layout 2 colonnes
  // ─────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const cleaned = intent.trim();
    if (!cleaned) { onSkip(); return; }
    onSubmit(cleaned, scope);
  };

  return (
    <div className="intent-screen">
      <div className="intent-head">
        <div className="intent-kicker">Étape 2/3 · intention</div>
        <h2 className="intent-title">
          Avant d'aller plus loin, voici ma <em>lecture</em> de ce morceau.
        </h2>
        <p className="intent-subtitle">
          Corrige-moi ou complète si je passe à côté. L'analyse qui suit sera
          calibrée sur ce que tu me dis.
        </p>
      </div>

      <div className="intent-grid">
        {/* Colonne principale : perception + formulaire */}
        <div className="intent-col-main">
          <div className="intent-perception">
            <div className="intent-perception-kicker">CE QUE J'ENTENDS</div>
            <div className="intent-perception-lead">
              {perception?.lead || "J'écoute…"}
            </div>
            {(perception?.tags?.length > 0 || perception?.bpm || perception?.duration) && (
              <div className="intent-perception-meta">
                {perception?.tags?.map((t) => (
                  <span key={t} className="intent-chip">{t}</span>
                ))}
                {perception?.bpm && <span className="intent-tag">BPM ~{perception.bpm}</span>}
                {perception?.duration && <span className="intent-tag">{perception.duration}</span>}
              </div>
            )}
          </div>

          <div className="intent-textarea-wrap">
            <textarea
              ref={areaRef}
              className="intent-textarea"
              placeholder={HINTS[hintIndex]}
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              maxLength={600}
            />
            <div className="intent-char-count">{intent.length} / 600</div>
          </div>

          {/* Sélecteur de portée (uniquement si V1) */}
          {isFirstVersion && (
            <div className="intent-scope">
              <div className="intent-scope-label">Portée de l'intention</div>
              <div className="intent-seg">
                <button
                  type="button"
                  className={`intent-seg-btn ${scope === 'track' ? 'on' : ''}`}
                  onClick={() => setScope('track')}
                >
                  Pour le titre
                </button>
                <button
                  type="button"
                  className={`intent-seg-btn ${scope === 'version' ? 'on' : ''}`}
                  onClick={() => setScope('version')}
                >
                  Cette version uniquement
                </button>
              </div>
            </div>
          )}

          <div className="intent-actions">
            <button className="intent-btn-ghost" onClick={onSkip}>
              Passer cette étape →
            </button>
            <button
              className="intent-btn-primary"
              onClick={handleSubmit}
              disabled={!intent.trim()}
            >
              Lancer le diagnostic calibré →
            </button>
          </div>
        </div>

        {/* Colonne latérale : exemples + pipeline */}
        <div className="intent-col-side">
          <div>
            <div className="intent-examples-title">Des exemples pour te lancer</div>
            <div className="intent-examples">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  className="intent-example"
                  onClick={() => handleExampleClick(ex.text)}
                >
                  <span className="intent-example-label">{ex.label}</span>
                  <span className="intent-example-body">« {ex.text} »</span>
                </button>
              ))}
            </div>
          </div>

          <div className="intent-pipeline">
            <div className="intent-pipeline-title">Pipeline</div>
            <div className="intent-pipeline-step done">Écoute qualitative · Gemini</div>
            <div className="intent-pipeline-step active">Ton intention</div>
            <div className="intent-pipeline-step">Diagnostic calibré · Claude</div>
          </div>
        </div>
      </div>
    </div>
  );
}
