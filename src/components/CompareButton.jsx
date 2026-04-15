import { useState, useEffect, useRef } from 'react';
import { getOrCreateComparison } from '../lib/storage';

export default function CompareButton({ track, currentVersion }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [otherName, setOtherName] = useState(null);
  const btnRef = useRef(null);
  const ddRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const h = (e) => {
      if (ddRef.current?.contains(e.target) || btnRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const esc = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', h);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', h);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const others = (track?.versions || []).filter((v) => v.name !== currentVersion?.name);
  const hasOthers = others.length > 0;

  const run = async (other) => {
    setOpen(false);
    setLoading(true);
    setError(null);
    setResult(null);
    setOtherName(other.name);
    try {
      // A = plus ancienne, B = plus récente (on se fie à created_at)
      const aIsOlder = new Date(other.date || 0) < new Date(currentVersion.date || 0);
      const A = aIsOlder ? other : currentVersion;
      const B = aIsOlder ? currentVersion : other;
      const r = await getOrCreateComparison(track.id, A, B);
      setResult({ ...r, _A: A.name, _B: B.name });
    } catch (e) {
      setError(e.message || 'erreur');
    } finally {
      setLoading(false);
    }
  };

  const close = () => { setResult(null); setError(null); setOtherName(null); };

  return (
    <>
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button
          ref={btnRef}
          onClick={() => hasOthers && setOpen((o) => !o)}
          disabled={!hasOthers}
          style={{
            background: 'transparent',
            border: '1px solid #2a2a2e',
            color: hasOthers ? '#c5c5c7' : '#555',
            fontFamily: 'IBM Plex Mono, monospace',
            fontSize: 10,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            padding: '7px 12px',
            borderRadius: 8,
            cursor: hasOthers ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
          title={hasOthers ? 'Comparer à une autre version' : 'Aucune autre version disponible'}
        >
          Comparer <span style={{ fontSize: 8 }}>▾</span>
        </button>
        {open && hasOthers && (
          <div
            ref={ddRef}
            style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
              minWidth: 180, background: '#141416', border: '1px solid #2a2a2e',
              borderRadius: 10, padding: 6, boxShadow: '0 12px 40px rgba(0,0,0,.5)',
            }}
          >
            <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 9, color: '#7c7c80', letterSpacing: 1.5, padding: '6px 10px 8px' }}>
              COMPARER À
            </div>
            {others.map((v) => (
              <button
                key={v.id}
                onClick={() => run(v)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '8px 12px', borderRadius: 6, border: 'none',
                  background: 'transparent', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: 12, color: '#c5c5c7',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245,176,86,.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
              >{v.name}</button>
            ))}
          </div>
        )}
      </div>

      {(loading || result || error) && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 32,
          }}
        >
          <div style={{
            background: '#141416', border: '1px solid #2a2a2e', borderRadius: 14,
            width: '100%', maxWidth: 1100, maxHeight: '85vh', overflow: 'auto',
            padding: '28px 32px', position: 'relative',
          }}>
            <button
              onClick={close}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'transparent', border: 'none', color: '#7c7c80',
                fontSize: 22, cursor: 'pointer', padding: 4, lineHeight: 1,
              }}
            >×</button>
            {loading && (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#7c7c80', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, letterSpacing: 1.5 }}>
                COMPARAISON EN COURS — {currentVersion?.name} VS {otherName}…
              </div>
            )}
            {error && (
              <div style={{ padding: 24, color: '#ef6b6b' }}>Erreur : {error}</div>
            )}
            {result && (
              <>
                <div style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, color: '#7c7c80', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                  Comparaison — {result._A} → {result._B}
                </div>
                {result.resume && (
                  <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 24, color: '#e7e7e9', lineHeight: 1.3, margin: '0 0 24px' }}>
                    {result.resume}
                  </h2>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                  <Column title="Progrès" items={result.progres} color="#7bd88f" />
                  <Column title="Régressions" items={result.regressions} color="#ef6b6b" />
                  <Column title="Inchangé" items={result.inchanges} color="#7c7c80" />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function Column({ title, items, color }) {
  return (
    <div>
      <div style={{
        fontFamily: 'IBM Plex Mono, monospace', fontSize: 10, letterSpacing: 2,
        textTransform: 'uppercase', color, marginBottom: 14,
        paddingBottom: 8, borderBottom: `1px solid ${color}33`,
      }}>
        {title} <span style={{ color: '#555', marginLeft: 6 }}>{items?.length || 0}</span>
      </div>
      {(!items || items.length === 0) && (
        <div style={{ color: '#555', fontSize: 12, fontStyle: 'italic' }}>—</div>
      )}
      {(items || []).map((it, i) => (
        <div key={i} style={{ marginBottom: 14 }}>
          <div style={{ color: '#e7e7e9', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{it.titre}</div>
          <div style={{ color: '#a5a5a7', fontSize: 12, lineHeight: 1.5 }}>{it.detail}</div>
        </div>
      ))}
    </div>
  );
}
