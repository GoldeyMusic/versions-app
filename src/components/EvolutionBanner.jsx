import { useState } from 'react';

/**
 * EvolutionBanner — panneau d'évolution version-à-version, charté comme
 * les autres panneaux de la colonne droite (Intention artistique, Plan
 * d'action) : card sur fond `--card` avec halo coloré bottom-right,
 * eyebrow mono uppercase + dot, structure cliquable / expand inline.
 *
 * Props :
 *   - evolution : objet retourné par l'API
 *       { resume, progres[], regressions[], persistants[], nouveaux[], dominante }
 *   - previousVersionName : ex "v1" — affiché en titre du panneau ("DEPUIS V1").
 *
 * Items purement informatifs (non cliquables). Si rien à dire, le composant
 * renvoie null.
 */
export default function EvolutionBanner({ evolution, previousVersionName }) {
  const [open, setOpen] = useState(false);

  if (!evolution) return null;
  const {
    resume = '',
    progres = [],
    regressions = [],
    persistants = [],
    nouveaux = [],
    dominante = 'neutre',
  } = evolution;

  const hasAnyItem =
    progres.length + regressions.length + persistants.length + nouveaux.length > 0;
  if (!resume && !hasAnyItem) return null;

  // Couleurs alignées sur les vars CSS de la fiche (voir MockupStyles.jsx).
  const haloColor =
    dominante === 'progres' ? 'var(--mint, #8ee07a)'
    : dominante === 'regressions' ? 'var(--red, #ff5d5d)'
    : 'var(--amber, #f5a623)';

  // Le titre du panneau : on s'aligne avec "INTENTION ARTISTIQUE" / "PLAN
  // D'ACTION" — texte court, mono uppercase, dot ambré en préfixe.
  const titleText = previousVersionName ? `Depuis ${previousVersionName}` : 'Depuis la dernière';

  // Compteurs compacts à droite — affichés uniquement si la liste a du contenu.
  const chips = [];
  if (progres.length) chips.push({ key: 'p', txt: `${progres.length}↑`, color: 'var(--mint, #8ee07a)' });
  if (regressions.length) chips.push({ key: 'r', txt: `${regressions.length}↓`, color: 'var(--red, #ff5d5d)' });
  if (persistants.length) chips.push({ key: 's', txt: `${persistants.length}→`, color: 'var(--muted, rgba(255,255,255,0.5))' });
  if (nouveaux.length) chips.push({ key: 'n', txt: `+${nouveaux.length}`, color: 'var(--amber, #f5a623)' });

  return (
    <section
      style={{
        // Card identique à .intent-panel-fiche / .plan-panel pour homogénéité
        // visuelle dans la colonne droite (cf. MockupStyles.jsx).
        position: 'relative',
        overflow: 'hidden',
        background: 'var(--card, #15151a)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        borderRadius: 14,
        padding: '20px 22px',
        width: '100%',
        boxSizing: 'border-box',
      }}
      aria-label="Évolution depuis la version précédente"
    >
      {/* Halo coloré bottom-right (couleur = dominante de l'évolution) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: haloColor,
          filter: 'blur(80px)',
          opacity: 0.12,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Eyebrow cliquable — structure alignée sur .intent-panel-eyebrow */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'transparent',
          border: 0,
          padding: 0,
          margin: 0,
          cursor: hasAnyItem ? 'pointer' : 'default',
          textAlign: 'left',
          color: 'inherit',
          font: 'inherit',
        }}
      >
        <span
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 4,
            minWidth: 0,
            flex: 1,
          }}
        >
          {/* Titre : DOT + "DEPUIS V1" (mono uppercase ambré, comme les autres panneaux) */}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: 'var(--mono, JetBrains Mono, monospace)',
              fontSize: 10.5,
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              color: 'var(--amber, #f5a623)',
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--amber, #f5a623)',
                flexShrink: 0,
              }}
            />
            <span style={{ whiteSpace: 'nowrap' }}>{titleText}</span>
          </span>

          {/* Sous-titre : le résumé qualitatif. Aligné sur le texte du titre
              (padding-left = dot 6px + gap 10px = 16px), tronqué si trop long. */}
          {resume && (
            <span
              style={{
                paddingLeft: 16,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                lineHeight: 1.4,
                color: 'var(--text, #ededed)',
                fontWeight: 300,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                maxWidth: '100%',
              }}
              title={resume}
            >
              {resume}
            </span>
          )}
        </span>

        {/* Chips compactes (n↑ n↓ n→ +n) — aperçu rapide des deltas */}
        {chips.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {chips.map((c) => (
              <span
                key={c.key}
                style={{
                  fontFamily: 'var(--mono, JetBrains Mono, monospace)',
                  fontSize: 11.5,
                  color: c.color,
                  letterSpacing: 0.5,
                }}
              >
                {c.txt}
              </span>
            ))}
          </span>
        )}

        {/* Chevron — même style que .intent-panel-chev */}
        {hasAnyItem && (
          <span
            aria-hidden="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--amber, #f5a623)',
              marginLeft: 4,
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform .2s ease',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M3 4.5l3 3 3-3"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
      </button>

      {/* Body — listes courtes alignées sur le texte du titre (padding-left 16px) */}
      {open && hasAnyItem && (
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            marginTop: 14,
            paddingLeft: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <EvolutionList label="Progrès" items={progres} color="var(--mint, #8ee07a)" />
          <EvolutionList label="Régressions" items={regressions} color="var(--red, #ff5d5d)" />
          <EvolutionList label="Persistants" items={persistants} color="var(--muted, rgba(255,255,255,0.5))" />
          <EvolutionList label="Nouveaux" items={nouveaux} color="var(--amber, #f5a623)" />
        </div>
      )}
    </section>
  );
}

function EvolutionList({ label, items, color }) {
  if (!items || !items.length) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span
        style={{
          fontFamily: 'var(--mono, JetBrains Mono, monospace)',
          fontSize: 10,
          letterSpacing: 1.4,
          color,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}>
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              lineHeight: 1.55,
              color: 'var(--text, #c5c5c7)',
              fontWeight: 300,
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
            }}
          >
            <span style={{ color, marginTop: 1, flexShrink: 0 }}>·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
