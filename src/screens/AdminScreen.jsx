import { useEffect, useMemo, useState } from 'react';
import T from '../constants/theme';
import { supabase } from '../lib/supabase';

/**
 * AdminScreen — dashboard admin (#/admin), gaté par VITE_ADMIN_EMAIL.
 *
 * Affiche les coûts agrégés depuis la table analysis_cost_logs :
 *   - 4 KPI cards (coût moyen, médiane, p95, total 30 jours)
 *   - mini bar chart SVG par jour sur 30 jours
 *   - top consommateurs (10 users qui coûtent le plus)
 *   - 20 dernières analyses détaillées
 *
 * RLS côté DB filtre déjà : seul l'email admin peut lire la table.
 * Côté frontend on double-check pour rediriger proprement non-admins.
 */
export default function AdminScreen({ onBackToDashboard }) {
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // ── Auth check + fetch logs ──────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user: u } } = await supabase.auth.getUser();
        if (cancelled) return;
        setUser(u);
        setAuthChecked(true);
        const isAdmin = !!ADMIN_EMAIL && u?.email?.toLowerCase() === ADMIN_EMAIL;
        if (!isAdmin) {
          setLoading(false);
          return;
        }
        // Fetch des 30 derniers jours, max 2000 lignes (largement assez
        // pour un MVP : si on dépasse on pagine plus tard).
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const { data, error } = await supabase
          .from('analysis_cost_logs')
          .select('*')
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false })
          .limit(2000);
        if (cancelled) return;
        if (error) throw error;
        setLogs(data || []);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ADMIN_EMAIL]);

  // ── Stats agrégées (calculées côté JS) ───────────────
  const stats = useMemo(() => computeStats(logs), [logs]);
  const dailySeries = useMemo(() => computeDailySeries(logs, 30), [logs]);
  const topUsers = useMemo(() => computeTopUsers(logs, 10), [logs]);

  const isAdmin = !!ADMIN_EMAIL && user?.email?.toLowerCase() === ADMIN_EMAIL;

  return (
    <div className="ad-screen">
      <AdminStyles />

      {/* TOPBAR */}
      <header className="ad-topbar">
        <button
          type="button"
          className="ad-topbar-brand"
          onClick={onBackToDashboard}
          aria-label="Retour au dashboard"
        >
          <img src="/logo-versions-2.svg" alt="" className="ad-topbar-logo" />
          <span className="ad-topbar-wordmark">
            VER<span className="accent">Si</span>ONS
          </span>
        </button>
        <nav className="ad-topbar-nav" aria-label="Navigation">
          <button type="button" className="ad-topbar-link" onClick={onBackToDashboard}>
            Dashboard
          </button>
          <span className="ad-topbar-current" aria-current="page">Admin</span>
        </nav>
      </header>

      {/* GATE non-admin / loading / error */}
      {!authChecked && <GateMsg label="Vérification…" />}
      {authChecked && !isAdmin && (
        <GateMsg
          label="Accès refusé."
          sub={ADMIN_EMAIL
            ? "Cette page est réservée à l'admin."
            : "VITE_ADMIN_EMAIL n'est pas configuré côté frontend."}
        />
      )}
      {authChecked && isAdmin && loading && <GateMsg label="Chargement des coûts…" />}
      {authChecked && isAdmin && err && <GateMsg label="Erreur" sub={err} />}

      {authChecked && isAdmin && !loading && !err && (
        <>
          {/* HERO discret */}
          <section className="ad-hero">
            <div className="ad-hero-inner">
              <div className="ad-eyebrow">Admin — Coûts d'analyse</div>
              <h1 className="ad-hero-title">
                Combien ça nous <em>coûte</em>, vraiment.
              </h1>
              <p className="ad-hero-sub">
                Données des 30 derniers jours · {logs.length} analyse{logs.length > 1 ? 's' : ''} loggée{logs.length > 1 ? 's' : ''}
              </p>
            </div>
          </section>

          {/* SECTION KPIs */}
          <section className="ad-section">
            <div className="ad-kpi-grid">
              <KpiCard
                label="Coût moyen"
                value={fmtEur(stats.avg)}
                sub={`médiane ${fmtEur(stats.median)}`}
                tone="amber"
              />
              <KpiCard
                label="P95 (worst case)"
                value={fmtEur(stats.p95)}
                sub="95 % des analyses coûtent moins"
                tone="violet"
              />
              <KpiCard
                label="Total 30 jours"
                value={fmtEur(stats.total)}
                sub={`${stats.count} analyses`}
                tone="cerulean"
              />
              <KpiCard
                label="Marge sur prix bas (3,00 €)"
                value={pctMarge(stats.avg, 3.0)}
                sub={`vs prix unit. plancher de 3 €`}
                tone={stats.avg < 1.0 ? 'mint' : 'red'}
              />
            </div>
          </section>

          {/* SECTION ÉVOLUTION (bar chart SVG) */}
          <section className="ad-section">
            <div className="ad-section-eyebrow">Évolution sur 30 jours</div>
            <h2 className="ad-section-title">
              Volume et coût total <em>par jour</em>.
            </h2>
            <DailyChart series={dailySeries} />
          </section>

          {/* SECTION TOP USERS */}
          <section className="ad-section">
            <div className="ad-section-eyebrow">Top consommateurs (30 jours)</div>
            <h2 className="ad-section-title">
              Qui consomme <em>le plus</em>.
            </h2>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th style={{width: '50px'}}>#</th>
                    <th>User ID</th>
                    <th style={{textAlign: 'right'}}>Analyses</th>
                    <th style={{textAlign: 'right'}}>Coût total</th>
                    <th style={{textAlign: 'right'}}>Coût moyen / analyse</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.length === 0 && (
                    <tr><td colSpan="5" className="ad-empty">Aucune donnée sur la période.</td></tr>
                  )}
                  {topUsers.map((u, i) => (
                    <tr key={u.userId || i}>
                      <td className="ad-rank">{i + 1}</td>
                      <td className="ad-userid">
                        {u.userId ? u.userId.slice(0, 8) + '…' : <span className="ad-anon">anonyme</span>}
                      </td>
                      <td style={{textAlign: 'right'}}>{u.count}</td>
                      <td style={{textAlign: 'right'}} className="ad-total">{fmtEur(u.total)}</td>
                      <td style={{textAlign: 'right'}} className="ad-muted">{fmtEur(u.total / u.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION DERNIÈRES ANALYSES */}
          <section className="ad-section">
            <div className="ad-section-eyebrow">Dernières analyses</div>
            <h2 className="ad-section-title">
              Les 20 plus <em>récentes</em>.
            </h2>
            <div className="ad-table-wrap">
              <table className="ad-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>User</th>
                    <th style={{textAlign: 'right'}}>Durée audio</th>
                    <th style={{textAlign: 'right'}}>Gemini</th>
                    <th style={{textAlign: 'right'}}>Claude</th>
                    <th style={{textAlign: 'right'}}>Fadr</th>
                    <th style={{textAlign: 'right'}}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 && (
                    <tr><td colSpan="7" className="ad-empty">Aucune analyse loggée.</td></tr>
                  )}
                  {logs.slice(0, 20).map((l) => (
                    <tr key={l.id}>
                      <td className="ad-muted">{fmtDate(l.created_at)}</td>
                      <td className="ad-userid">{l.user_id ? l.user_id.slice(0, 8) + '…' : <span className="ad-anon">—</span>}</td>
                      <td style={{textAlign: 'right'}} className="ad-muted">{fmtDuration(l.audio_duration_sec)}</td>
                      <td style={{textAlign: 'right'}} className="ad-muted">{fmtEur(l.gemini_eur)}</td>
                      <td style={{textAlign: 'right'}} className="ad-muted">{fmtEur(l.claude_eur)}</td>
                      <td style={{textAlign: 'right'}} className="ad-muted">{fmtEur(l.fadr_eur)}</td>
                      <td style={{textAlign: 'right'}} className="ad-total">{fmtEur(l.total_eur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* FOOTER */}
          <footer className="ad-footer">
            <div className="ad-footer-mark">
              VER<span className="accent">Si</span>ONS
            </div>
            <div className="ad-footer-line">
              Tarifs unitaires définis dans <code>decode-api/lib/costTracker.js</code>.
              Modifie-les si Gemini/Claude/Fadr changent leurs prix.
            </div>
          </footer>
        </>
      )}
    </div>
  );
}

/* ── Sub-components ───────────────────────────────────── */
function GateMsg({ label, sub }) {
  return (
    <div className="ad-gate">
      <div className="ad-gate-label">{label}</div>
      {sub && <div className="ad-gate-sub">{sub}</div>}
    </div>
  );
}

function KpiCard({ label, value, sub, tone }) {
  return (
    <div className={`ad-kpi ad-kpi-${tone || 'amber'}`}>
      <div className="ad-kpi-label">{label}</div>
      <div className="ad-kpi-value">{value}</div>
      <div className="ad-kpi-sub">{sub}</div>
    </div>
  );
}

function DailyChart({ series }) {
  // Mini bar chart SVG natif. Hauteur fixe, largeur 100% du container.
  // Une barre par jour, hauteur proportionnelle au coût total du jour.
  // Tooltip via title="" natif au hover (suffisant pour un MVP admin).
  const maxCost = Math.max(0.01, ...series.map((d) => d.total));
  const W = 1000, H = 200, PAD = 24;
  const barW = (W - PAD * 2) / series.length - 2;

  return (
    <div className="ad-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="ad-chart-svg">
        {/* grid horizontale légère */}
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <line
            key={p}
            x1={PAD} x2={W - PAD}
            y1={H - PAD - (H - PAD * 2) * p}
            y2={H - PAD - (H - PAD * 2) * p}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        ))}
        {series.map((d, i) => {
          const h = ((d.total / maxCost) || 0) * (H - PAD * 2);
          const x = PAD + i * (barW + 2);
          const y = H - PAD - h;
          return (
            <rect
              key={d.day}
              x={x} y={y}
              width={Math.max(barW, 2)}
              height={Math.max(h, 1)}
              rx="2"
              fill="rgba(245,166,35,0.55)"
              stroke="rgba(245,166,35,0.9)"
              strokeWidth="0.5"
            >
              <title>{`${d.day} · ${d.count} analyses · ${fmtEur(d.total)}`}</title>
            </rect>
          );
        })}
        {/* labels axe X — 1ère et dernière date seulement, et milieu */}
        {series.length > 0 && (
          <>
            <text x={PAD} y={H - 6} fill="rgba(138,138,144,0.7)" fontSize="9" fontFamily="monospace">
              {series[0].day.slice(5)}
            </text>
            <text x={W / 2} y={H - 6} fill="rgba(138,138,144,0.7)" fontSize="9" fontFamily="monospace" textAnchor="middle">
              {series[Math.floor(series.length / 2)].day.slice(5)}
            </text>
            <text x={W - PAD} y={H - 6} fill="rgba(138,138,144,0.7)" fontSize="9" fontFamily="monospace" textAnchor="end">
              {series[series.length - 1].day.slice(5)}
            </text>
          </>
        )}
      </svg>
    </div>
  );
}

/* ── Helpers stats ────────────────────────────────────── */
function computeStats(logs) {
  const costs = logs.map((l) => Number(l.total_eur || 0)).filter((x) => !Number.isNaN(x));
  if (costs.length === 0) return { count: 0, total: 0, avg: 0, median: 0, p95: 0 };
  const total = costs.reduce((a, b) => a + b, 0);
  const sorted = [...costs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
  return { count: costs.length, total, avg: total / costs.length, median, p95 };
}

function computeDailySeries(logs, days) {
  // Bucketize par jour (YYYY-MM-DD), 30 jours en arrière, jours sans data = 0
  const map = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { day: key, count: 0, total: 0 });
  }
  for (const l of logs) {
    const key = (l.created_at || '').slice(0, 10);
    const slot = map.get(key);
    if (slot) {
      slot.count += 1;
      slot.total += Number(l.total_eur || 0);
    }
  }
  return Array.from(map.values());
}

function computeTopUsers(logs, limit) {
  const map = new Map();
  for (const l of logs) {
    const k = l.user_id || '__anon__';
    const cur = map.get(k) || { userId: l.user_id || null, count: 0, total: 0 };
    cur.count += 1;
    cur.total += Number(l.total_eur || 0);
    map.set(k, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.total - a.total).slice(0, limit);
}

/* ── Helpers format ───────────────────────────────────── */
function fmtEur(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  const v = Number(n);
  if (v < 0.01 && v > 0) return '< 0,01 €';
  return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
function fmtDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}
function pctMarge(coutMoyen, prixUnit) {
  if (!coutMoyen || coutMoyen <= 0) return '—';
  if (coutMoyen >= prixUnit) return '< 0 % (PERTE)';
  const m = ((prixUnit - coutMoyen) / prixUnit) * 100;
  return Math.round(m) + ' %';
}

/* ── Styles ────────────────────────────────────────────── */
function AdminStyles() {
  return (
    <style>{`
      .ad-screen {
        position: relative; z-index: 1;
        min-height: 100vh; min-height: 100dvh;
        background: transparent;
        color: var(--text, ${T.text});
        font-family: var(--body, ${T.body});
        overflow-x: hidden;
      }

      /* TOPBAR — calque sur PricingScreen */
      .ad-topbar {
        position: relative; z-index: 2;
        max-width: 1280px; margin: 0 auto;
        padding: 22px 28px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 24px;
      }
      .ad-topbar-brand {
        display: inline-flex; align-items: center; gap: 10px;
        background: transparent; border: 0; cursor: pointer;
        padding: 4px 6px; border-radius: 8px;
        transition: opacity .15s;
      }
      .ad-topbar-brand:hover { opacity: 0.82; }
      .ad-topbar-logo {
        height: 26px; width: auto;
        filter: drop-shadow(0 0 16px rgba(245,166,35,0.18));
      }
      .ad-topbar-wordmark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 17px; letter-spacing: -0.4px;
        color: ${T.text}; line-height: 1;
      }
      .ad-topbar-wordmark .accent { color: ${T.amber}; font-style: normal; }

      .ad-topbar-nav { display: inline-flex; align-items: center; gap: 8px; }
      .ad-topbar-link, .ad-topbar-current {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        padding: 9px 16px; border-radius: 999px;
        transition: all .15s;
      }
      .ad-topbar-link {
        background: transparent; color: ${T.textSoft};
        border: 1px solid transparent; cursor: pointer;
      }
      .ad-topbar-link:hover {
        color: ${T.text};
        background: rgba(255,255,255,0.04);
        border-color: rgba(255,255,255,0.10);
      }
      .ad-topbar-current {
        color: ${T.amber};
        background: rgba(245,166,35,0.06);
        border: 1px solid rgba(245,166,35,0.32);
      }

      /* GATE (loading / err / refused) */
      .ad-gate {
        max-width: 480px; margin: 80px auto;
        text-align: center;
        padding: 48px 32px;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
      }
      .ad-gate-label {
        font-family: ${T.mono}; font-size: 12px; font-weight: 500;
        letter-spacing: 2px; text-transform: uppercase;
        color: ${T.amber};
      }
      .ad-gate-sub {
        margin-top: 12px;
        font-family: ${T.body}; font-size: 13.5px; font-weight: 300;
        color: ${T.textSoft};
      }

      /* HERO */
      .ad-hero {
        padding: clamp(24px, 4vw, 48px) 24px clamp(16px, 3vw, 32px);
        display: grid; place-items: center;
      }
      .ad-hero-inner {
        width: 100%; max-width: 760px;
        display: flex; flex-direction: column; align-items: center;
        gap: 14px; text-align: center;
        animation: fadeup .5s ease;
      }
      .ad-eyebrow {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2.4px; color: ${T.amber}; text-transform: uppercase;
      }
      .ad-hero-title {
        font-family: ${T.body}; font-weight: 700;
        font-size: clamp(32px, 4.6vw, 56px);
        line-height: 1.0; letter-spacing: -1.6px;
        color: ${T.text}; margin: 0;
      }
      .ad-hero-title em {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        color: ${T.amber};
      }
      .ad-hero-sub {
        font-family: ${T.body}; font-size: 13.5px; font-weight: 300;
        color: ${T.muted}; margin: 0;
      }

      /* SECTIONS */
      .ad-section {
        padding: clamp(28px, 4vw, 48px) 24px;
        max-width: 1280px; margin: 0 auto;
      }
      .ad-section-eyebrow {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 2.2px; color: ${T.amber}; text-transform: uppercase;
        margin-bottom: 12px;
      }
      .ad-section-title {
        font-family: ${T.body}; font-weight: 500;
        font-size: clamp(18px, 2.2vw, 24px);
        line-height: 1.3; letter-spacing: -0.4px;
        color: ${T.textSoft}; margin: 0 0 24px;
      }
      .ad-section-title em {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        color: ${T.amber};
      }

      /* KPIs */
      .ad-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }
      .ad-kpi {
        position: relative; overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        padding: 22px 22px;
        display: flex; flex-direction: column; gap: 8px;
        transition: border-color .2s;
      }
      .ad-kpi::before {
        content: '';
        position: absolute;
        top: -40%; right: -25%;
        width: 220px; height: 220px;
        border-radius: 50%;
        filter: blur(48px);
        opacity: 0.5;
        pointer-events: none;
      }
      .ad-kpi > * { position: relative; z-index: 1; }
      .ad-kpi:hover { border-color: rgba(255,255,255,0.16); }

      .ad-kpi-amber::before {
        background: radial-gradient(circle, rgba(245,166,35,0.55), transparent 70%);
      }
      .ad-kpi-amber .ad-kpi-value { color: ${T.amber}; }
      .ad-kpi-cerulean::before {
        background: radial-gradient(circle, rgba(92,184,204,0.45), transparent 70%);
      }
      .ad-kpi-cerulean .ad-kpi-value { color: ${T.cerulean}; }
      .ad-kpi-violet::before {
        background: radial-gradient(circle, rgba(166,126,245,0.45), transparent 70%);
      }
      .ad-kpi-violet .ad-kpi-value { color: ${T.violet}; }
      .ad-kpi-mint::before {
        background: radial-gradient(circle, rgba(142,224,122,0.42), transparent 70%);
      }
      .ad-kpi-mint .ad-kpi-value { color: ${T.mint}; }
      .ad-kpi-red::before {
        background: radial-gradient(circle, rgba(255,93,93,0.42), transparent 70%);
      }
      .ad-kpi-red .ad-kpi-value { color: ${T.red}; }

      .ad-kpi-label {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        color: ${T.muted};
      }
      .ad-kpi-value {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 36px; line-height: 1; letter-spacing: -1px;
        color: ${T.text};
      }
      .ad-kpi-sub {
        font-family: ${T.body}; font-size: 12px; font-weight: 300;
        color: ${T.muted2};
      }

      @media (max-width: 980px) {
        .ad-kpi-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 520px) {
        .ad-kpi-grid { grid-template-columns: 1fr; }
      }

      /* CHART */
      .ad-chart {
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        padding: 18px;
      }
      .ad-chart-svg {
        width: 100%; height: 200px;
        display: block;
      }

      /* TABLES */
      .ad-table-wrap {
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        overflow: hidden;
      }
      .ad-table {
        width: 100%; border-collapse: collapse;
        font-family: ${T.body}; font-size: 13px;
      }
      .ad-table thead th {
        font-family: ${T.mono}; font-size: 10px; font-weight: 500;
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.muted};
        padding: 14px 16px;
        text-align: left;
        border-bottom: 1px solid ${T.border};
        background: rgba(255,255,255,0.015);
      }
      .ad-table tbody tr {
        border-top: 1px solid ${T.border};
        transition: background .15s;
      }
      .ad-table tbody tr:hover { background: rgba(255,255,255,0.02); }
      .ad-table tbody td {
        padding: 12px 16px;
        color: ${T.text};
      }
      .ad-rank {
        font-family: ${T.mono}; font-weight: 500;
        color: ${T.amber};
      }
      .ad-userid {
        font-family: ${T.mono}; font-size: 12px;
        color: ${T.textSoft};
      }
      .ad-anon { color: ${T.muted2}; font-style: italic; }
      .ad-total {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 14px; color: ${T.amber};
      }
      .ad-muted {
        color: ${T.muted};
        font-family: ${T.mono}; font-size: 12px;
      }
      .ad-empty {
        text-align: center;
        padding: 32px 16px !important;
        color: ${T.muted2};
        font-style: italic;
      }

      @media (max-width: 720px) {
        .ad-table thead th, .ad-table tbody td {
          padding: 10px 10px; font-size: 12px;
        }
      }

      /* FOOTER */
      .ad-footer {
        padding: clamp(40px, 6vw, 72px) 24px;
        max-width: 1080px; margin: 0 auto;
        text-align: center;
        display: flex; flex-direction: column; align-items: center; gap: 14px;
      }
      .ad-footer-mark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 22px; letter-spacing: -0.5px;
        color: ${T.text};
      }
      .ad-footer-mark .accent { color: ${T.amber}; }
      .ad-footer-line {
        font-family: ${T.body}; font-size: 13px; font-weight: 300;
        color: ${T.muted};
        max-width: 540px;
      }
      .ad-footer-line code {
        font-family: ${T.mono}; font-size: 12px;
        color: ${T.amber};
        padding: 2px 6px; border-radius: 4px;
        background: rgba(245,166,35,0.08);
      }

      @keyframes fadeup {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}
