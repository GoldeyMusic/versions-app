import { useState } from 'react';

/**
 * EvolutionBanner — bandeau discret affiche au-dessus de la fiche d une
 * version V_n quand une version precedente a deja ete analysee.
 *
 * Props :
 *   - evolution : objet retourne par l API
 *       { resume, progres[], regressions[], persistants[], nouveaux[], dominante }
 *   - previousVersionName : ex "V1" — affiche en label si fourni, sinon
 *     fallback "la version precedente".
 *
 * Volontairement sobre : 1 ligne fermee + trait coloré, expansion inline
 * sans modale. Items purement informatifs (non cliquables) — c est un
 * signal de progression, pas un nouveau plan d action.
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

  // Si on n a vraiment rien a dire, on n affiche pas le bandeau.
  const hasAnyItem =
    progres.length + regressions.length + persistants.length + nouveaux.length > 0;
  if (!resume && !hasAnyItem) return null;

  // Couleur du trait gauche selon la dominante de l evolution.
  const accent =
    dominante === 'progres' ? '#7bd88f'
    : dominante === 'regressions' ? '#ef6b6b'
    : '#7c7c80'; // neutre = gris discret pour ne pas surcharger la palette ambre

  const arrow =
    dominante === 'progres' ? '↗'
    : dominante === 'regressions' ? '↘'
    : '→';

  const prevLabel = previousVersionName ? `Depuis ${previousVersionName}` : 'Depuis la dernière';

  // Compactes a droite : on n affiche un chip que si la liste correspondante
  // est non vide, pour eviter "0↑ 0↓ 0→" qui parasite le visuel.
  const chips = [];
  if (progres.length) chips.push({ key: 'p', txt: `${progres.length}↑`, color: '#7bd88f' });
  if (regressions.length) chips.push({ key: 'r', txt: `${regressions.length}↓`, color: '#ef6b6b' });
  if (persistants.length) chips.push({ key: 's', txt: `${persistants.length}→`, color: '#7c7c80' });
  if (nouveaux.length) chips.push({ key: 'n', txt: `+${nouveaux.length}`, color: '#f5b056' });

  // Le bandeau s appuie sur les memes valeurs que le reste de la fiche
  // (font, palette) — cf. FicheScreen.jsx — pour rester coherent visuellement.
  return (
    <section
      style={{
        marginTop: 18,
        marginBottom: -6, // laisse ListeningSection (marginTop:48) gerer l espace en dessous
        borderLeft: `2px solid ${accent}`,
        borderTop: '1px solid #2a2a2e',
        borderRight: '1px solid #2a2a2e',
        borderBottom: '1px solid #2a2a2e',
        borderRadius: 8,
        background: 'rgba(245,176,86,.02)',
        overflow: 'hidden',
      }}
      aria-label="Évolution depuis la version précédente"
    >
      {/* Ligne fermee — toujours rendue, cliquable pour expand */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 14px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#c5c5c7',
          textAlign: 'left',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          lineHeight: 1.45,
        }}
        aria-expanded={open}
      >
        <span style={{ color: accent, fontSize: 14, lineHeight: 1, flexShrink: 0 }}>{arrow}</span>
        <span
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 11,
            letterSpacing: 1.5,
            color: '#7c7c80',
            textTransform: 'uppercase',
            flexShrink: 0,
          }}
        >
          {prevLabel}
        </span>
        <span
          style={{
            flex: 1,
            minWidth: 0,
            color: '#ededed',
            fontWeight: 300,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {resume || '—'}
        </span>
        {chips.length > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {chips.map((c) => (
              <span
                key={c.key}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 12,
                  color: c.color,
                  letterSpacing: 0.5,
                }}
              >
                {c.txt}
              </span>
            ))}
          </span>
        )}
        {hasAnyItem && (
          <span
            style={{
              color: '#7c7c80',
              fontSize: 10,
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform .18s ease',
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            ▾
          </span>
        )}
      </button>

      {/* Detail expand — listes courtes, alignees sur le label de gauche */}
      {open && hasAnyItem && (
        <div
          style={{
            padding: '6px 14px 14px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            borderTop: '1px solid #2a2a2e',
          }}
        >
          <EvolutionList label="Progrès" items={progres} color="#7bd88f" />
          <EvolutionList label="Régressions" items={regressions} color="#ef6b6b" />
          <EvolutionList label="Persistants" items={persistants} color="#7c7c80" />
          <EvolutionList label="Nouveaux" items={nouveaux} color="#f5b056" />
        </div>
      )}
    </section>
  );
}

function EvolutionList({ label, items, color }) {
  if (!items || !items.length) return null;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span
        style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 11,
          letterSpacing: 1.5,
          color,
          textTransform: 'uppercase',
          flexShrink: 0,
          width: 90,
          paddingTop: 2,
        }}
      >
        {label}
      </span>
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        {items.map((it, i) => (
          <li
            key={i}
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              lineHeight: 1.55,
              color: '#c5c5c7',
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
