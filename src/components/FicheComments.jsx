import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  loadFicheComments,
  addFicheComment,
  fetchSharedComments,
  addSharedComment,
  resolveComment,
  deleteComment,
} from '../lib/storage';

// ── FicheComments — fil de commentaires d'une fiche (collaboration Phase 1)
// Deux modes, choisis par les props :
//   • owner  : on passe `versionId` (la fiche nous appartient, RLS direct).
//   • shared : on passe `token` (fiche partagée, RPC SECURITY DEFINER).
// Lire fonctionne en anonyme ; écrire exige d'être connecté (partage identifié).
// L'ancrage par section (champ `anchor` en base) est réservé à une itération
// ultérieure — ici c'est un fil unique par version.

function displayNameOf(user) {
  if (!user) return '';
  const m = user.user_metadata || {};
  return (m.full_name || m.name || m.user_name || user.email || '').toString().trim();
}

function timeAgo(iso, lang) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diff = Math.round((then - Date.now()) / 1000); // négatif = passé
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(lang === 'en' ? 'en' : 'fr', { numeric: 'auto' });
  const steps = [
    [60, 'second'],
    [3600, 'minute'],
    [86400, 'hour'],
    [604800, 'day'],
    [2629800, 'week'],
    [31557600, 'month'],
    [Infinity, 'year'],
  ];
  let unit = 'second';
  let value = diff;
  let prevLimit = 1;
  for (const [limit, u] of steps) {
    if (abs < limit) { unit = u; value = Math.round(diff / prevLimit); break; }
    prevLimit = limit;
  }
  try { return rtf.format(value, unit); } catch { return ''; }
}

function Avatar({ name }) {
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?';
  return <span className="fc-avatar" aria-hidden="true">{initial}</span>;
}

export default function FicheComments({ s, lang, versionId = null, token = null, anchors = [] }) {
  const t = (s && s.comments) || {};
  const mode = token ? 'shared' : 'owner';
  const canModerate = mode === 'owner'; // propriétaire = peut résoudre/supprimer tout
  const anchorList = Array.isArray(anchors) ? anchors.filter(Boolean) : [];

  const [user, setUser] = useState(undefined); // undefined = pas encore résolu
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [anchor, setAnchor] = useState(''); // '' = Général (anchor null)
  const [sending, setSending] = useState(false);
  const [hideResolved, setHideResolved] = useState(false);
  const [filterAnchor, setFilterAnchor] = useState(null); // null = tout afficher

  // En mode owner sans version persistée, rien à afficher.
  const ownerInactive = mode === 'owner' && (!versionId || String(versionId).startsWith('__pending'));

  const reload = useCallback(async () => {
    setLoading(true);
    const list = mode === 'shared'
      ? await fetchSharedComments(token)
      : await loadFicheComments(versionId);
    setComments(Array.isArray(list) ? list : []);
    setLoading(false);
  }, [mode, token, versionId]);

  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(({ data }) => { if (alive) setUser(data?.user || null); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (ownerInactive) { setComments([]); setLoading(false); return; }
    reload();
  }, [ownerInactive, reload]);

  if (ownerInactive) return null;

  const loggedIn = !!user;
  const myName = displayNameOf(user) || t.you || 'Moi';

  const submit = async () => {
    const clean = body.trim();
    if (!clean || sending) return;
    setSending(true);
    const a = anchor || null;
    let created = null;
    if (mode === 'shared') {
      const res = await addSharedComment(token, clean, myName, a);
      if (res && !res.error) created = res;
    } else {
      created = await addFicheComment(versionId, clean, myName, a);
    }
    setSending(false);
    if (created) {
      setComments((prev) => [...prev, created]);
      setBody('');
      setAnchor('');
    } else {
      // En cas d'échec (token, réseau), on recharge pour rester cohérent.
      reload();
    }
  };

  const onToggleResolved = async (c) => {
    const ok = await resolveComment(c.id, !c.resolved);
    if (ok) setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, resolved: !c.resolved } : x)));
  };

  const onDelete = async (c) => {
    if (typeof window !== 'undefined' && !window.confirm(t.deleteConfirm || 'Supprimer ?')) return;
    const ok = await deleteComment(c.id);
    if (ok) setComments((prev) => prev.filter((x) => x.id !== c.id));
  };

  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); submit(); }
  };

  const visible = comments
    .filter((c) => (hideResolved ? !c.resolved : true))
    .filter((c) => (filterAnchor ? c.anchor === filterAnchor : true));
  const resolvedCount = comments.filter((c) => c.resolved).length;
  // Sections réellement utilisées dans les commentaires (pour le filtre).
  const usedAnchors = Array.from(new Set(comments.map((c) => c.anchor).filter(Boolean)));
  const total = comments.length;
  const countLabel = total > 0
    ? (total > 1 ? (t.countMany || '{n}') : (t.countOne || '{n}')).replace('{n}', String(total))
    : '';

  return (
    <section className="fiche-comments" aria-label={t.title || 'Commentaires'}>
      <style>{FC_CSS}</style>

      <div className="fc-head">
        <span className="fc-eyebrow">{t.title || 'Commentaires'}</span>
        {countLabel && <span className="fc-count">{countLabel}</span>}
        {resolvedCount > 0 && (
          <button
            type="button"
            className="fc-toggle-resolved"
            onClick={() => setHideResolved((v) => !v)}
          >
            {hideResolved ? (t.showResolved || 'Afficher les résolus') : (t.hideResolved || 'Masquer les résolus')}
          </button>
        )}
      </div>
      {t.subtitle && <p className="fc-subtitle">{t.subtitle}</p>}

      {usedAnchors.length > 0 && (
        <div className="fc-filters">
          <button
            type="button"
            className={`fc-filter${filterAnchor === null ? ' is-on' : ''}`}
            onClick={() => setFilterAnchor(null)}
          >
            {t.filterAll || 'Tout'}
          </button>
          {usedAnchors.map((a) => (
            <button
              key={a}
              type="button"
              className={`fc-filter${filterAnchor === a ? ' is-on' : ''}`}
              onClick={() => setFilterAnchor(a)}
            >
              {a}
            </button>
          ))}
        </div>
      )}

      <div className="fc-list">
        {loading ? (
          <div className="fc-empty">…</div>
        ) : visible.length === 0 ? (
          <div className="fc-empty">{t.empty || 'Aucun commentaire.'}</div>
        ) : (
          visible.map((c) => {
            const canManage = canModerate || c.isMine;
            return (
              <div key={c.id} className={`fc-item${c.resolved ? ' is-resolved' : ''}`}>
                <Avatar name={c.authorName} />
                <div className="fc-body">
                  <div className="fc-meta">
                    <span className="fc-author">{c.isMine ? (t.you || 'Toi') : c.authorName}</span>
                    <span className="fc-time">{timeAgo(c.createdAt, lang)}</span>
                    {c.anchor && <span className="fc-anchor-chip">{c.anchor}</span>}
                    {c.resolved && <span className="fc-resolved-chip">{t.resolved || 'Résolu'}</span>}
                  </div>
                  <div className="fc-text">{c.body}</div>
                  {canManage && (
                    <div className="fc-actions">
                      <button type="button" className="fc-act" onClick={() => onToggleResolved(c)}>
                        {c.resolved ? (t.unresolve || 'Rouvrir') : (t.resolve || 'Marquer résolu')}
                      </button>
                      <button type="button" className="fc-act fc-act-danger" onClick={() => onDelete(c)}>
                        {t.deleteLabel || 'Supprimer'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Composer */}
      {user === undefined ? null : loggedIn ? (
        <div className="fc-composer">
          {anchorList.length > 0 && (
            <select
              className="fc-anchor-select"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              aria-label={t.anchorLabel || 'Partie concernée'}
            >
              <option value="">{t.anchorAll || 'Général'}</option>
              {anchorList.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          )}
          <div className="fc-composer-row">
            <textarea
              className="fc-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={t.placeholder || 'Écris un commentaire…'}
              rows={2}
            />
            <button
              type="button"
              className="fc-send"
              disabled={!body.trim() || sending}
              onClick={submit}
            >
              {sending ? (t.sending || 'Envoi…') : (t.send || 'Commenter')}
            </button>
          </div>
        </div>
      ) : (
        <div className="fc-signin">
          <span>{t.signInToComment || 'Connecte-toi pour commenter.'}</span>
          <a href="/" className="fc-signin-cta">{t.signInCta || 'Se connecter'}</a>
        </div>
      )}
    </section>
  );
}

// Styles locaux — charte ambre Versions, cohérents avec les chips/eyebrows.
const FC_CSS = `
.fiche-comments { margin-top: 28px; }
.fc-head { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.fc-eyebrow {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: #f5b056; background: rgba(245,176,86,0.10);
  border: 1px solid rgba(245,176,86,0.30); border-radius: 999px; padding: 4px 11px;
}
.fc-count { font-size: 12px; color: rgba(255,255,255,0.45); font-weight: 600; }
.fc-toggle-resolved {
  margin-left: auto; background: none; border: none; cursor: pointer;
  font-size: 12px; color: rgba(255,255,255,0.45); font-family: inherit; padding: 2px 4px;
}
.fc-toggle-resolved:hover { color: rgba(255,255,255,0.75); }
.fc-subtitle { margin: 8px 0 16px; font-size: 13px; color: rgba(255,255,255,0.45); }
.fc-list { display: flex; flex-direction: column; gap: 14px; }
.fc-empty { font-size: 13px; color: rgba(255,255,255,0.40); padding: 8px 0; }
.fc-item { display: flex; gap: 11px; align-items: flex-start; }
.fc-item.is-resolved { opacity: 0.55; }
.fc-avatar {
  flex: 0 0 auto; width: 30px; height: 30px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  font-size: 13px; font-weight: 700; color: #1a1206;
  background: linear-gradient(135deg, #f5b056, #d4900e);
}
.fc-body { flex: 1 1 auto; min-width: 0; }
.fc-meta { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
.fc-author { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.92); }
.fc-time { font-size: 11.5px; color: rgba(255,255,255,0.40); }
.fc-resolved-chip {
  font-size: 10px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
  color: #7fd6b0; background: rgba(127,214,176,0.12);
  border: 1px solid rgba(127,214,176,0.30); border-radius: 999px; padding: 1px 7px;
}
.fc-anchor-chip {
  font-size: 10.5px; font-weight: 600; color: #9ec5ff;
  background: rgba(120,170,255,0.10); border: 1px solid rgba(120,170,255,0.28);
  border-radius: 999px; padding: 1px 8px;
}
.fc-filters { display: flex; flex-wrap: wrap; gap: 7px; margin: 0 0 16px; }
.fc-filter {
  cursor: pointer; font-family: inherit; font-size: 11.5px; font-weight: 600;
  color: rgba(255,255,255,0.55); background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; padding: 3px 11px;
}
.fc-filter:hover { color: rgba(255,255,255,0.85); }
.fc-filter.is-on { color: #9ec5ff; background: rgba(120,170,255,0.12); border-color: rgba(120,170,255,0.40); }
.fc-anchor-select {
  align-self: flex-start; font-family: inherit; font-size: 12.5px; color: #fff;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; padding: 7px 11px; outline: none; cursor: pointer;
}
.fc-anchor-select:focus { border-color: rgba(245,176,86,0.55); }
.fc-anchor-select option { color: #111; }
.fc-text { margin-top: 3px; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.82); white-space: pre-wrap; word-break: break-word; }
.fc-actions { display: flex; gap: 14px; margin-top: 6px; }
.fc-act {
  background: none; border: none; cursor: pointer; font-family: inherit;
  font-size: 12px; color: rgba(255,255,255,0.45); padding: 0;
}
.fc-act:hover { color: rgba(255,255,255,0.80); }
.fc-act-danger:hover { color: #ff8a8a; }
.fc-composer {
  margin-top: 16px; display: flex; flex-direction: column; gap: 9px;
}
.fc-composer-row { display: flex; gap: 10px; align-items: flex-end; }
.fc-textarea {
  flex: 1 1 auto; resize: vertical; min-height: 42px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 12px; padding: 11px 13px; color: #fff; font-family: inherit; font-size: 14px;
  line-height: 1.45; outline: none; transition: border-color 0.15s ease;
}
.fc-textarea:focus { border-color: rgba(245,176,86,0.55); }
.fc-textarea::placeholder { color: rgba(255,255,255,0.32); }
.fc-send {
  flex: 0 0 auto; cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 700;
  color: #1a1206; background: linear-gradient(135deg, #f5b056, #d4900e);
  border: none; border-radius: 11px; padding: 11px 18px; transition: opacity 0.15s ease;
}
.fc-send:disabled { opacity: 0.4; cursor: default; }
.fc-signin {
  margin-top: 16px; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
  font-size: 13px; color: rgba(255,255,255,0.55);
  background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; padding: 12px 14px;
}
.fc-signin-cta {
  font-weight: 700; color: #f5b056; text-decoration: none;
  border: 1px solid rgba(245,176,86,0.35); border-radius: 999px; padding: 5px 13px;
}
.fc-signin-cta:hover { background: rgba(245,176,86,0.10); }
`;
