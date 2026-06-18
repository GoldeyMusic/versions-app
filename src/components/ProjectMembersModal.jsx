import { useEffect, useState, useCallback } from 'react';
import {
  listProjectMembers,
  createProjectInvite,
  createProjectJoinLink,
  updateMemberRole,
  removeMember,
} from '../lib/storage';

// ── ProjectMembersModal — gestion des membres d'un projet (collab Phase 2)
// Owner : invite par email, génère un lien, change les rôles, retire.
// Membre non-owner : voit la liste (lecture seule).
const ROLE_OPTIONS = ['editor', 'commenter', 'viewer'];

export default function ProjectMembersModal({ project, onClose, s }) {
  const t = (s && s.share) || {};
  const roleLabel = (r) => (t.roles && t.roles[r]) || r;

  const [data, setData] = useState({ members: [], pending: [], my_role: null });
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteRole, setInviteRole] = useState('editor');
  const [linkRole, setLinkRole] = useState('editor');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    const d = await listProjectMembers(project.id);
    setData(d || { members: [], pending: [], my_role: null });
    setLoading(false);
  }, [project.id]);

  useEffect(() => { reload(); }, [reload]);

  const isOwner = data.my_role === 'owner';

  const onInvite = async () => {
    const e = email.trim();
    if (!e || busy) return;
    setBusy(true);
    const res = await createProjectInvite(project.id, e, inviteRole, inviteMsg.trim() || null);
    setBusy(false);
    if (res && !res.error) { setEmail(''); setInviteMsg(''); setNotice(t.inviteSent || 'Invitation envoyée.'); reload(); }
    else setNotice(t.inviteError || "L'envoi a échoué.");
  };

  const onGenerateLink = async () => {
    if (busy) return;
    setBusy(true);
    const res = await createProjectJoinLink(project.id, linkRole);
    setBusy(false);
    if (res && res.link) {
      setLink(res.link);
      try { await navigator.clipboard.writeText(res.link); setNotice(t.linkCopied || 'Lien copié.'); }
      catch { setNotice(''); }
    }
  };

  const onChangeRole = async (userId, role) => {
    if (await updateMemberRole(project.id, userId, role)) reload();
  };
  const onRemove = async (userId) => {
    if (await removeMember(project.id, userId)) reload();
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <style>{PM_CSS}</style>
      <div className="pm-card" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose} aria-label={t.close || 'Fermer'}>×</button>
        <div className="pm-eyebrow">{t.title || 'Membres du projet'}</div>
        <div className="pm-project-name">{project.name}</div>
        {t.subtitle && <p className="pm-subtitle">{t.subtitle}</p>}

        {notice && <div className="pm-notice">{notice}</div>}

        {isOwner && (
          <>
            {/* Invitation par email */}
            <div className="pm-section">
              <div className="pm-label">{t.inviteEmailLabel || 'Inviter par email'}</div>
              <div className="pm-row">
                <input
                  type="email"
                  className="pm-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder || 'email@exemple.com'}
                  onKeyDown={(e) => { if (e.key === 'Enter') onInvite(); }}
                />
                <select className="pm-select" value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                </select>
                <button className="pm-btn primary" disabled={!email.trim() || busy} onClick={onInvite}>
                  {t.inviteBtn || 'Inviter'}
                </button>
              </div>
              <textarea
                className="pm-message"
                value={inviteMsg}
                onChange={(e) => setInviteMsg(e.target.value)}
                placeholder={t.messagePlaceholder || 'Message (facultatif) — un mot pour la personne invitée…'}
                rows={2}
              />
            </div>

            {/* Lien partageable */}
            <div className="pm-section">
              <div className="pm-label">{t.linkTitle || "Lien d'invitation"}</div>
              <div className="pm-row">
                <select className="pm-select" value={linkRole} onChange={(e) => setLinkRole(e.target.value)}>
                  {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                </select>
                <button className="pm-btn" disabled={busy} onClick={onGenerateLink}>
                  {t.generateLink || 'Générer un lien'}
                </button>
              </div>
              {link && <div className="pm-link" title={link}>{link}</div>}
              <div className="pm-hint">{t.linkHint || 'Quiconque a ce lien et se connecte rejoint le projet.'}</div>
            </div>
          </>
        )}

        {/* Liste des membres */}
        <div className="pm-section">
          <div className="pm-label">{t.membersTitle || 'Membres'}</div>
          {loading ? (
            <div className="pm-empty">…</div>
          ) : (
            <div className="pm-members">
              {(data.members || []).map((m) => (
                <div key={m.user_id} className="pm-member">
                  <span className="pm-avatar">{(m.name || m.email || '?').trim().charAt(0).toUpperCase()}</span>
                  <div className="pm-member-id">
                    <div className="pm-member-name">{m.name || m.email}</div>
                    {m.name && m.email && <div className="pm-member-email">{m.email}</div>}
                  </div>
                  {m.is_owner ? (
                    <span className="pm-role-chip owner">{roleLabel('owner')}</span>
                  ) : isOwner ? (
                    <>
                      <select
                        className="pm-select sm"
                        value={m.role}
                        onChange={(e) => onChangeRole(m.user_id, e.target.value)}
                      >
                        {ROLE_OPTIONS.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                      </select>
                      <button className="pm-remove" onClick={() => onRemove(m.user_id)} aria-label={t.remove || 'Retirer'}>×</button>
                    </>
                  ) : (
                    <span className="pm-role-chip">{roleLabel(m.role)}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invitations email en attente (owner) */}
        {isOwner && (data.pending || []).length > 0 && (
          <div className="pm-section">
            <div className="pm-label">{t.pendingTitle || 'Invitations en attente'}</div>
            <div className="pm-members">
              {data.pending.map((p) => (
                <div key={p.token} className="pm-member pending">
                  <span className="pm-avatar ghost">@</span>
                  <div className="pm-member-id"><div className="pm-member-name">{p.email}</div></div>
                  <span className="pm-role-chip">{roleLabel(p.role)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PM_CSS = `
.pm-overlay {
  position: fixed; inset: 0; z-index: 100000; display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); padding: 20px;
}
.pm-card {
  position: relative; width: 100%; max-width: 520px; max-height: 86vh; overflow-y: auto;
  background: #16161b; border: 1px solid rgba(255,255,255,0.10); border-radius: 18px;
  padding: 26px 24px; color: #eaeaea; font-family: 'DM Sans', sans-serif;
}
.pm-close {
  position: absolute; top: 14px; right: 16px; background: none; border: none; cursor: pointer;
  font-size: 24px; line-height: 1; color: rgba(255,255,255,0.5);
}
.pm-close:hover { color: #fff; }
.pm-eyebrow {
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: #f5b056; background: rgba(245,176,86,0.10); border: 1px solid rgba(245,176,86,0.30);
  border-radius: 999px; padding: 4px 11px; display: inline-block;
}
.pm-project-name { font-size: 20px; font-weight: 700; color: #fff; margin: 12px 0 2px; }
.pm-subtitle { font-size: 13px; color: rgba(255,255,255,0.5); margin: 0 0 8px; }
.pm-notice {
  margin: 10px 0; font-size: 13px; color: #7fd6b0; background: rgba(127,214,176,0.10);
  border: 1px solid rgba(127,214,176,0.28); border-radius: 10px; padding: 8px 12px;
}
.pm-section { margin-top: 20px; }
.pm-label { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.75); margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
.pm-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.pm-input {
  flex: 1 1 180px; min-width: 0; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px; padding: 9px 12px; color: #fff; font-family: inherit; font-size: 14px; outline: none;
}
.pm-input:focus { border-color: rgba(245,176,86,0.55); }
.pm-message {
  margin-top: 8px; width: 100%; box-sizing: border-box; resize: vertical; min-height: 40px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
  padding: 9px 12px; color: #fff; font-family: inherit; font-size: 13.5px; line-height: 1.45; outline: none;
}
.pm-message:focus { border-color: rgba(245,176,86,0.55); }
.pm-message::placeholder { color: rgba(255,255,255,0.32); }
.pm-select {
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
  padding: 9px 10px; color: #fff; font-family: inherit; font-size: 13px; cursor: pointer; outline: none;
}
.pm-select.sm { padding: 5px 8px; font-size: 12px; }
.pm-select option { color: #111; }
.pm-btn {
  cursor: pointer; font-family: inherit; font-size: 13px; font-weight: 700; color: #fff;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.16); border-radius: 10px; padding: 9px 14px;
}
.pm-btn:hover { background: rgba(255,255,255,0.10); }
.pm-btn.primary { color: #1a1206; background: linear-gradient(135deg,#f5b056,#d4900e); border: none; }
.pm-btn:disabled { opacity: 0.4; cursor: default; }
.pm-link {
  margin-top: 9px; font-size: 12px; color: #9ec5ff; background: rgba(120,170,255,0.08);
  border: 1px solid rgba(120,170,255,0.22); border-radius: 8px; padding: 8px 10px;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.pm-hint { margin-top: 7px; font-size: 11.5px; color: rgba(255,255,255,0.4); }
.pm-members { display: flex; flex-direction: column; gap: 9px; }
.pm-member { display: flex; align-items: center; gap: 11px; }
.pm-member.pending { opacity: 0.7; }
.pm-avatar {
  flex: 0 0 auto; width: 30px; height: 30px; border-radius: 50%; display: inline-flex;
  align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: #1a1206;
  background: linear-gradient(135deg,#f5b056,#d4900e);
}
.pm-avatar.ghost { background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.6); }
.pm-member-id { flex: 1 1 auto; min-width: 0; }
.pm-member-name { font-size: 14px; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pm-member-email { font-size: 11.5px; color: rgba(255,255,255,0.45); }
.pm-role-chip {
  font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 3px 10px;
}
.pm-role-chip.owner { color: #f5b056; background: rgba(245,176,86,0.10); border-color: rgba(245,176,86,0.30); }
.pm-remove {
  cursor: pointer; background: none; border: none; color: rgba(255,255,255,0.4); font-size: 18px; line-height: 1; padding: 0 4px;
}
.pm-remove:hover { color: #ff8a8a; }
.pm-empty { font-size: 13px; color: rgba(255,255,255,0.4); }
`;
