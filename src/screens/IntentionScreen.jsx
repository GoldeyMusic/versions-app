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
import useLang from '../hooks/useLang';

const HINTS = [
  "Ex : je veux garder ce côté brut, lo-fi — la voix en retrait est un choix, je cherche un grain à la Frank Ocean / Blonde…",
  "Ex : je cherche un son à la SZA / SOS — chaud, enveloppant, voix bien en avant…",
  "Ex : la voix est volontairement en retrait, comme un souvenir — ne me propose pas de la remonter.",
  "Ex : c'est une démo, pas un master. Dis-moi surtout si l'arrangement tient debout.",
];

// Pool d'exemples catégorisés. À chaque montage de la page, on tire 3 exemples
// différents (shuffle stable) pour varier l'inspiration donnée à l'utilisateur.
// Les 3 familles (Référence, Choix assumé, Garde-fou) illustrent 3 angles
// différents d'une intention artistique.
const EXAMPLES_POOL = [
  // ── Références sonores
  { label: 'Référence', text: 'Je cherche un son à la Frank Ocean — Blonde, pas Channel Orange.' },
  { label: 'Référence', text: "Je vise une ambiance à la SZA / SOS — chaud, enveloppant, voix bien en avant." },
  { label: 'Référence', text: 'Plus proche de Radiohead / In Rainbows que de Kid A — analogique, organique.' },
  { label: 'Référence', text: "Direction Tame Impala / Currents — synthés un peu voilés, basse qui respire." },
  { label: 'Référence', text: "Esprit Burial / Untrue — nocturne, voix hantée, kicks sourds." },
  { label: 'Référence', text: 'Comme un morceau de The Weeknd / After Hours — synth pop 80s un peu froide.' },

  // ── Choix assumés
  { label: 'Choix assumé', text: "La voix en retrait, c'est voulu — pas un défaut de mix." },
  { label: 'Choix assumé', text: "Les aigus volontairement doux, je veux un son mat, pas brillant." },
  { label: 'Choix assumé', text: "Batterie pas parfaitement quantifiée, c'est joué live, c'est le feeling que je cherche." },
  { label: 'Choix assumé', text: "Arrangement minimaliste par choix — pas besoin de rajouter des couches." },
  { label: 'Choix assumé', text: "Basse saturée volontairement, c'est le son — pas une erreur de gain." },

  // ── Garde-fous
  { label: 'Garde-fou', text: 'Je veux garder ce côté brut, lo-fi. Ne me propose pas de le "propre-r".' },
  { label: 'Garde-fou', text: "C'est une démo, pas un master. Dis-moi surtout si l'arrangement tient debout." },
  { label: 'Garde-fou', text: "Pas de polissage sur la voix — je veux garder le grain et les respirations." },
  { label: 'Garde-fou', text: "Ne me dis pas de réduire le low end, j'aime quand ça pousse en bas." },
  { label: 'Garde-fou', text: "Garde le côté 'maquette' — je ne cherche pas un son radio FM." },
];

// Shuffle Fisher-Yates : pioche 3 exemples distincts sans ordre privilégié.
function pickExamples(pool, n = 3) {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

export default function IntentionScreen({
  perception,
  config,
  isFirstVersion = true,
  inheritedIntent = null,
  onSubmit,
  onSkip,
  onCancel,
}) {
  const { s } = useLang();
  const [intent, setIntent] = useState('');
  const [scope, setScope] = useState('track');
  const [hintIndex, setHintIndex] = useState(0);
  const areaRef = useRef(null);

  // On pioche 3 exemples au hasard dans le pool à chaque montage.
  // useState(() => ...) fige le tirage pour toute la durée de l'écran :
  // l'utilisateur ne verra pas les exemples changer sous ses yeux, mais
  // à la prochaine visite de la page le tirage sera différent.
  const [examples] = useState(() => pickExamples(EXAMPLES_POOL, 3));

  const trackTitle = config?.title || '';
  const versionName = config?.version || '';

  // Tips « Le saviez-vous ? » — même source que LoadingScreen (s.loading.tips).
  // On les mélange une fois au montage et on les fait tourner toutes les 12s.
  const tipsSource = Array.isArray(s?.loading?.tips) ? s.loading.tips : [];
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
    const id = setInterval(() => setTipIdx((i) => (i + 1) % shuffledTips.length), 12000);
    return () => clearInterval(id);
  }, [shuffledTips.length]);

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
        <img
          src="/logo-versions-2.svg"
          alt=""
          aria-hidden="true"
          className="intent-logo"
        />
        <div className="intent-head">
          <div className="intent-kicker">Étape 2/3 · intention artistique</div>
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

        {/* Waveform animée + Carte « Le saviez-vous ? » — mêmes composants
            que sur le Loading pour une continuité visuelle totale. */}
        <div className="ap-wave" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
        {shuffledTips.length > 0 && (
          <div className="ap-tip" role="region" aria-label={s.loading.didYouKnow}>
            <div className="ap-tip-kicker">
              <span className="ap-tip-dot" aria-hidden="true" />
              {s.loading.didYouKnow}
            </div>
            <div key={tipIdx} className="ap-tip-body">
              {shuffledTips[tipIdx]}
            </div>
          </div>
        )}

        {/* Bouton Annuler en fin d'écran, isolé, comme sur le Loading */}
        {onCancel && (
          <button className="intent-btn-cancel" type="button" onClick={onCancel}>
            Annuler l'analyse
          </button>
        )}
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
      <img
        src="/logo-versions-2.svg"
        alt=""
        aria-hidden="true"
        className="intent-logo"
      />
      <div className="intent-head">
        <div className="intent-kicker">Étape 2/3 · intention artistique</div>
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
              {examples.map((ex, i) => (
                <button
                  key={`${ex.label}-${i}`}
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
            <div className="intent-pipeline-step done">Écoute qualitative</div>
            <div className="intent-pipeline-step active">Ton intention artistique</div>
            <div className="intent-pipeline-step">Diagnostic calibré</div>
          </div>
        </div>
      </div>

      {/* Waveform animée + Carte « Le saviez-vous ? » — mêmes composants
          que sur le Loading pour une continuité visuelle totale. */}
      <div className="ap-wave" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
      {shuffledTips.length > 0 && (
        <div className="ap-tip" role="region" aria-label={s.loading.didYouKnow}>
          <div className="ap-tip-kicker">
            <span className="ap-tip-dot" aria-hidden="true" />
            {s.loading.didYouKnow}
          </div>
          <div key={tipIdx} className="ap-tip-body">
            {shuffledTips[tipIdx]}
          </div>
        </div>
      )}

      {/* Bouton Annuler en fin d'écran, isolé, comme sur le Loading */}
      {onCancel && (
        <button className="intent-btn-cancel" type="button" onClick={onCancel}>
          Annuler l'analyse
        </button>
      )}
    </div>
  );
}
