import { useState, useRef, useEffect } from 'react';
import T from '../constants/theme';
import API from '../constants/api';
import { IconX, IconSend } from './Icons';

export default function AskModal({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages,
            { role: 'user', content: userMessage },
          ].map((m) => ({
            role: m.role,
            content: m.text || m.content,
          })),
        }),
      });
      const data = await res.json();
      const txt = data.reply || data.error || 'Pas de réponse.';
      setMessages((prev) => [...prev, { role: 'assistant', text: txt }]);
    } catch (e) {
      // Fallback for mobile or API errors
      let fallback = '⚠️ Aperçu desktop uniquement — réponse simulée pour mobile.\n\n';
      const q = userMessage.toLowerCase();
      if (q.includes('wurly') || q.includes('electric piano') || q.includes('rhodes')) {
        fallback +=
          'Pour un Wurly avec chorus + trémolo sur Logic :\n1. Vintage Electric Piano (natif Logic) comme source\n2. Chorus : Rate 0.8Hz, Depth 40%, Mix 50%\n3. Tremolo : Rate 5-7Hz, Depth 70%\n4. Alternative pro : Scarbee Vintage Keys (Kontakt)';
      } else if (q.includes('compres')) {
        fallback +=
          'Compression : Attack 8-12ms (laisse le transitoire), Release Auto, Ratio 4:1.\nSur Logic : Compressor mode Vintage VCA. Gratuit : TDR Kotelnikov.';
      } else if (q.includes('reverb') || q.includes('réverb')) {
        fallback +=
          'Réverbe : Valhalla Room (50€) ou Supermassive (gratuit).\nPre-delay 20ms pour séparer la source. Decay 1-2s selon l\'espace voulu.';
      } else {
        fallback +=
          'Teste sur desktop pour une réponse complète de l\'IA. Sur mobile, les appels API ne sont pas supportés dans cet aperçu.';
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: fallback }]);
    }
    setLoading(false);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 400,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(3px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 52,
          bottom: 56,
          left: 0,
          right: 0,
          zIndex: 401,
          background: `${T.s1}e0`,
          backdropFilter: 'blur(16px)',
          borderTop: `1px solid ${T.border}`,
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeup .2s ease',
        }}
      >
        <div
          style={{
            padding: '16px 20px 12px',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: T.display,
                fontSize: 20,
                letterSpacing: 3,
                color: T.amber,
              }}
            >
              ASSISTANT VERSIONS
            </div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: 10,
                color: T.muted,
                marginTop: 2,
              }}
            >
              Expert production musicale · Tous DAWs · Base de connaissance active
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.s2,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: T.muted,
              flexShrink: 0,
            }}
          >
            <IconX c={T.muted} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: '16px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            minHeight: 180,
          }}
        >
          {messages.length === 0 && (
            <div style={{ padding: '30px 0', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="13" stroke={T.amber} strokeWidth="1.5" opacity=".3" />
                <path
                  d="M12 14c0-2.2 1.5-3.5 4-3.5s4 1.3 4 3.5c0 1.5-1 2.5-2 3-.7.3-.8 1-.8 1.5"
                  stroke={T.amber}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <circle cx="16" cy="22" r="1" fill={T.amber} />
              </svg>
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: 12,
                  color: T.muted,
                  textAlign: 'center',
                  lineHeight: 1.6,
                }}
              >
                Tips de production, mixage, plugins,
                <br />
                techniques — demande ce que tu veux.
              </div>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  justifyContent: 'center',
                  marginTop: 4,
                }}
              >
                {[
                  'Comment bien compresser une voix ?',
                  'Réglages EQ pour un kick EDM',
                  'Différence entre reverb plate et hall',
                  'Meilleur bus master chain',
                ].map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                    }}
                    style={{
                      fontFamily: T.mono,
                      fontSize: 9,
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: T.s2,
                      border: `1px solid ${T.border}`,
                      color: T.muted,
                      cursor: 'pointer',
                      transition: 'all .15s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = T.amber;
                      e.currentTarget.style.color = T.text;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = T.border;
                      e.currentTarget.style.color = T.muted;
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
                padding: '10px 14px',
                borderRadius: 12,
                background: m.role === 'user' ? T.amberGlow : T.s2,
                border: `1px solid ${m.role === 'user' ? T.amber + '33' : T.border}`,
              }}
            >
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: 12,
                  color: T.text,
                  lineHeight: 1.6,
                  fontWeight: m.role === 'user' ? 400 : 300,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12, background: T.s2, border: `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted }}>
                Réflexion<span style={{ animation: 'blink 1s infinite' }}>…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div
          style={{
            padding: '12px 20px 20px',
            borderTop: `1px solid ${T.border}`,
            display: 'flex',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ta question…"
            style={{
              flex: 1,
              background: T.s2,
              border: `1px solid ${input ? T.amber + '66' : T.border}`,
              borderRadius: 10,
              padding: '10px 14px',
              color: T.text,
              outline: 'none',
              fontSize: 12,
              transition: 'border-color .2s',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: 'none',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
              background: input.trim()
                ? `linear-gradient(135deg,${T.amber},${T.orange})`
                : T.s2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: input.trim() ? T.black : T.muted,
              transition: 'all .2s',
              flexShrink: 0,
            }}
          >
            <IconSend c={input.trim() ? T.black : T.muted} />
          </button>
        </div>
      </div>
    </>
  );
}
