import { useEffect, useMemo, useState } from 'react';
import T from '../constants/theme';
import { supabase } from '../lib/supabase';

// ── Constantes Fadr (synchro avec decode-api/lib/costTracker.js) ──
// Abo Fadr Plus = $10/mois ≈ 9,20 € à 0.92, inclut $10 d'API soit
// 200 minutes au tarif Create Stem Task ($0.05/min ≈ 0,046 €/min).
const FADR_EUR_PER_MIN = 0.046;
const FADR_PLAN_EUR = 9.20;
const FADR_PLAN_MINUTES = 200;

// ── Coûts infra récurrents (mensuel, en EUR) ──
// Ces lignes sont des constantes éditables — pas de tracking en DB. Mettre
// à jour à la main quand un plan change (upgrade, ré-évaluation, etc.).
// Les montants sont en EUR équivalents pour rester homogène avec le reste
// du dashboard. USD → EUR via taux ~0,92 (mis à jour 2026-04-29).
const INFRA_COSTS = [
  {
    label: 'Supabase Pro',
    eurMonth: 23.00,           // $25 × 0.92
    note: '100 Go storage + 250 Go egress + 5 Go max upload',
    tone: 'cerulean',
  },
  {
    label: 'Railway Hobby',
    eurMonth: 4.60,            // $5/mois × 0.92 — inclut $5 d'usage, suffit pour le volume actuel
    note: 'Backend decode-api · $5/mois flat (usage inclus)',
    tone: 'amber',
  },
  {
    label: 'Vercel',
    eurMonth: 0,
    note: 'Free tier — frontend autodeploy',
    tone: 'mint',
  },
];
const INFRA_TOTAL_EUR_MONTH = INFRA_COSTS.reduce((sum, c) => sum + c.eurMonth, 0);

/**
 * AdminScreen — dashboard admin (#/admin), gaté par VITE_ADMIN_EMAIL.
 *
 * Sections :
 *   1. KPIs business (users, titres, recettes 30j, rentabilité 30j)
 *   2. KPIs coûts (moyenne, p95, total 30j, marge sur prix bas)
 *   3. Évolution coût quotidienne (bar chart SVG)
 *   4. Top consommateurs
 *   5. TOUS les utilisateurs (table cliquable, expand inline avec détail titres)
 *   6. Recettes (placeholder en attendant Stripe)
 *   7. Dernières analyses
 *
 * Note préfixe CSS : on n'utilise PAS `ad-*` (filtré par les adblockers
 * qui le confondent avec "advertisement"). Préfixe `cost-*` partout.
 *
 * Données récupérées via 3 RPC SECURITY DEFINER côté DB :
 *   - admin_get_global_stats()  → KPIs globaux + business
 *   - admin_get_user_stats()    → 1 ligne par user avec stats
 *   - admin_get_user_detail(id) → titres + versions d'un user (pour expand)
 *
 * RLS double : email check côté front (gating UX) + check email dans
 * les fonctions Postgres (gating sécurité réelle).
 */
export default function AdminScreen() {
  const ADMIN_EMAIL = (import.meta.env.VITE_ADMIN_EMAIL || '').trim().toLowerCase();
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [logs, setLogs] = useState([]);
  const [globalStats, setGlobalStats] = useState(null);
  const [userStats, setUserStats] = useState([]);
  const [revenue, setRevenue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  // Pour l'expand inline d'un user : null ou { userId, loading, items }
  const [expanded, setExpanded] = useState(null);

  // ── Auth check + fetch toutes les données ───────────
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

        // Fetch en parallèle : analysis_cost_logs (30j), 2 RPC, revenue_logs
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const [logsRes, globalRes, usersRes, revRes] = await Promise.all([
          supabase
            .from('analysis_cost_logs')
            .select('*')
            .gte('created_at', since.toISOString())
            .order('created_at', { ascending: false })
            .limit(2000),
          supabase.rpc('admin_get_global_stats'),
          supabase.rpc('admin_get_user_stats'),
          supabase
            .from('revenue_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50),
        ]);

        if (cancelled) return;
        if (logsRes.error) throw logsRes.error;
        if (globalRes.error) throw globalRes.error;
        if (usersRes.error) throw usersRes.error;
        if (revRes.error) throw revRes.error;

        setLogs(logsRes.data || []);
        // RPC TABLE retourne un array, on prend la 1ère ligne pour global
        setGlobalStats(globalRes.data?.[0] || null);
        setUserStats(usersRes.data || []);
        setRevenue(revRes.data || []);
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Erreur de chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [ADMIN_EMAIL]);

  // ── Stats agrégées coûts (calculées côté JS depuis logs) ────
  const stats = useMemo(() => computeStats(logs), [logs]);
  const dailySeries = useMemo(() => computeDailySeries(logs, 30), [logs]);
  const topUsers = useMemo(() => computeTopUsers(logs, 10, userStats), [logs, userStats]);
  const fadrMonth = useMemo(() => computeFadrMonth(logs), [logs]);
  const stripeStats = useMemo(() => computeStripeStats(revenue, 30), [revenue]);

  const isAdmin = !!ADMIN_EMAIL && user?.email?.toLowerCase() === ADMIN_EMAIL;

  // Tant que Stripe n'est pas branché et qu'aucune vente n'est tombée
  // dans revenue_logs, on cache tout ce qui suppose une activité
  // commerciale (recettes, balance, marge). Réactivé automatiquement
  // dès qu'une recette > 0 apparaît dans globalStats.
  const isLiveBusiness = Number(globalStats?.total_revenue_all_time || 0) > 0;

  // ── Toggle expand sur une ligne user (charge le détail si besoin) ──
  async function toggleExpand(uid) {
    if (expanded?.userId === uid) { setExpanded(null); return; }
    setExpanded({ userId: uid, loading: true, items: [] });
    try {
      const { data, error } = await supabase.rpc('admin_get_user_detail', { target_user_id: uid });
      if (error) throw error;
      setExpanded({ userId: uid, loading: false, items: data || [] });
    } catch (e) {
      setExpanded({ userId: uid, loading: false, items: [], err: e.message });
    }
  }

  return (
    <div className="cost-screen">
      <AdminStyles />

      {/* Pas de topbar ici : on est rendu DANS le layout principal,
          la sidebar à gauche fait office de navigation (lien Dashboard
          + lien Admin doré déjà présents). */}

      {!authChecked && <GateMsg label="Vérification…" />}
      {authChecked && !isAdmin && (
        <GateMsg
          label="Accès refusé."
          sub={ADMIN_EMAIL
            ? "Cette page est réservée à l'admin."
            : "VITE_ADMIN_EMAIL n'est pas configuré côté frontend."}
        />
      )}
      {authChecked && isAdmin && loading && <GateMsg label="Chargement des données…" />}
      {authChecked && isAdmin && err && <GateMsg label="Erreur" sub={err} />}

      {authChecked && isAdmin && !loading && !err && (
        <>
          {/* HERO discret */}
          <section className="cost-hero">
            <div className="cost-hero-inner">
              <div className="cost-eyebrow">
                Admin — {isLiveBusiness ? "Vue d'ensemble" : 'Phase de test'}
              </div>
              <h1 className="cost-hero-title">
                {isLiveBusiness ? (
                  <>Combien ça <em>coûte</em>, combien ça <em>rapporte</em>.</>
                ) : (
                  <>Combien ça <em>coûte</em>.</>
                )}
              </h1>
              <p className="cost-hero-sub">
                {globalStats
                  ? `${globalStats.total_users} user${globalStats.total_users > 1 ? 's' : ''} · ${globalStats.total_tracks} titre${globalStats.total_tracks > 1 ? 's' : ''} · ${globalStats.total_versions} version${globalStats.total_versions > 1 ? 's' : ''}`
                  : 'Données indisponibles'}
                {!isLiveBusiness && ' · monétisation pas encore active'}
              </p>
            </div>
          </section>

          {/* SECTION KPIs BUSINESS */}
          <section className="cost-section">
            <div className="cost-section-eyebrow">
              {isLiveBusiness ? 'Business — 30 derniers jours' : 'Activité — 30 derniers jours'}
            </div>
            <h2 className="cost-section-title">
              {isLiveBusiness ? (
                <>La <em>rentabilité</em> en un coup d'œil.</>
              ) : (
                <>L'<em>activité</em> en un coup d'œil.</>
              )}
            </h2>
            <div className="cost-kpi-grid">
              {isLiveBusiness && (
                <KpiCard
                  label="Recettes nettes 30j"
                  value={fmtEur(stripeStats.net_30d)}
                  sub={`Brut TTC : ${fmtEur(stripeStats.brut_30d)} · frais Stripe : ${fmtEur(stripeStats.fees_30d)}`}
                  tone="mint"
                />
              )}
              <KpiCard
                label="Coûts API 30j"
                value={fmtEur(globalStats?.total_cost_30d || 0)}
                sub={`Total all-time : ${fmtEur(globalStats?.total_cost_all_time || 0)}`}
                tone="amber"
              />
              {isLiveBusiness && (
                <KpiCard
                  label="Balance nette 30j"
                  value={fmtEur(stripeStats.net_30d - (globalStats?.total_cost_30d || 0))}
                  sub={(stripeStats.net_30d - (globalStats?.total_cost_30d || 0)) >= 0 ? 'Rentable ✓ (frais déduits)' : 'Déficit en cours'}
                  tone={(stripeStats.net_30d - (globalStats?.total_cost_30d || 0)) >= 0 ? 'mint' : 'red'}
                />
              )}
              {!isLiveBusiness && (
                <KpiCard
                  label="Analyses 30j"
                  value={String(stats.count)}
                  sub={`Total all-time : ${fmtEur(globalStats?.total_cost_all_time || 0)} de coûts`}
                  tone="violet"
                />
              )}
              <KpiCard
                label="Nouveaux users 30j"
                value={String(globalStats?.new_signups_30d || 0)}
                sub={`Total inscrits : ${globalStats?.total_users || 0}`}
                tone="cerulean"
              />
              {!isLiveBusiness && (
                <KpiCard
                  label="Coût moyen / user"
                  value={fmtEur(globalStats?.total_users > 0 ? (globalStats.total_cost_all_time || 0) / globalStats.total_users : 0)}
                  sub={`sur ${globalStats?.total_users || 0} comptes`}
                  tone="amber"
                />
              )}
            </div>
          </section>

          {/* SECTION KPIs COÛTS */}
          <section className="cost-section">
            <div className="cost-section-eyebrow">Coûts par analyse</div>
            <h2 className="cost-section-title">
              Le <em>vrai prix</em> d'une analyse.
            </h2>
            <div className="cost-kpi-grid">
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
              {isLiveBusiness ? (
                <KpiCard
                  label="Marge sur prix bas (3,00 €)"
                  value={pctMarge(stats.avg, 3.0)}
                  sub="vs prix unit. plancher de 3 €"
                  tone={stats.avg < 1.0 ? 'mint' : 'red'}
                />
              ) : (
                <KpiCard
                  label="Min observé"
                  value={fmtEur(stats.min)}
                  sub={`max ${fmtEur(stats.max)}`}
                  tone="mint"
                />
              )}
            </div>
          </section>

          {/* SECTION COÛTS INFRA RÉCURRENTS — fixed, mensuel, hors API */}
          <section className="cost-section">
            <div className="cost-section-eyebrow">Coûts infra récurrents</div>
            <h2 className="cost-section-title">
              Le <em>fixe mensuel</em> hors coûts d'analyse.
            </h2>
            <div className="cost-kpi-grid">
              {INFRA_COSTS.map((c) => (
                <KpiCard
                  key={c.label}
                  label={c.label}
                  value={fmtEur(c.eurMonth)}
                  sub={c.note}
                  tone={c.tone}
                />
              ))}
              <KpiCard
                label="Total infra / mois"
                value={fmtEur(INFRA_TOTAL_EUR_MONTH)}
                sub={`soit ${fmtEur(INFRA_TOTAL_EUR_MONTH * 12)} / an`}
                tone="violet"
              />
            </div>
            {/* Petit récap ligne pour mettre en perspective avec coûts d'analyse */}
            <div className="cost-fadr-note" style={{ marginTop: 14 }}>
              <strong>Coût total mensuel estimé</strong> = {fmtEur(INFRA_TOTAL_EUR_MONTH)} fixe + {fmtEur(stats.total)} d'API sur les 30 derniers jours
              {' = '}
              <strong>{fmtEur(INFRA_TOTAL_EUR_MONTH + stats.total)}</strong>.
              {isLiveBusiness && (
                <>
                  {' '}Recettes nettes 30j&nbsp;: <strong>{fmtEur(stripeStats.net_30d)}</strong> →
                  {' '}<strong style={{ color: stripeStats.net_30d - INFRA_TOTAL_EUR_MONTH - stats.total >= 0 ? '#8ee07a' : '#ef6b6b' }}>
                    Balance globale&nbsp;: {fmtEur(stripeStats.net_30d - INFRA_TOTAL_EUR_MONTH - stats.total)}
                  </strong>.
                </>
              )}
            </div>
          </section>

          {/* SECTION ÉVOLUTION */}
          <section className="cost-section">
            <div className="cost-section-eyebrow">Évolution coût sur 30 jours</div>
            <h2 className="cost-section-title">
              Volume et coût total <em>par jour</em>.
            </h2>
            <DailyChart series={dailySeries} />
          </section>

          {/* SECTION ABONNEMENT FADR */}
          <section className="cost-section">
            <div className="cost-section-eyebrow">Abonnement Fadr Plus — mois en cours</div>
            <h2 className="cost-section-title">
              Combien de <em>crédits</em> il me reste sur les 9,20 € inclus.
            </h2>
            <div className="cost-kpi-grid">
              <KpiCard
                label="Minutes consommées"
                value={`${fadrMonth.minutesUsed.toFixed(0)} / ${FADR_PLAN_MINUTES}`}
                sub={`${Math.round(fadrMonth.pctUsed * 100)} % de la franchise`}
                tone={fadrMonth.pctUsed >= 0.8 ? 'red' : fadrMonth.pctUsed >= 0.5 ? 'amber' : 'mint'}
              />
              <KpiCard
                label="Crédits utilisés"
                value={fmtEur(fadrMonth.eurUsed)}
                sub={`sur ${fmtEur(FADR_PLAN_EUR)} inclus dans l'abo`}
                tone={fadrMonth.pctUsed >= 0.8 ? 'red' : fadrMonth.pctUsed >= 0.5 ? 'amber' : 'cerulean'}
              />
              <KpiCard
                label="Analyses Fadr ce mois"
                value={String(fadrMonth.count)}
                sub={fadrMonth.avgDurationMin > 0 ? `durée moy. ${fadrMonth.avgDurationMin.toFixed(1)} min` : 'aucune analyse loggée'}
                tone="violet"
              />
              <KpiCard
                label="Reste estimé"
                value={fadrMonth.analysesLeft != null ? `~${fadrMonth.analysesLeft} analyses` : '—'}
                sub={fadrMonth.analysesLeft != null
                  ? 'avant facturation au-delà'
                  : 'logger des analyses pour estimer'}
                tone={fadrMonth.analysesLeft != null && fadrMonth.analysesLeft <= 5 ? 'red' : 'mint'}
              />
            </div>
            <div className="cost-fadr-note">
              Tarif Fadr : {fmtEur(FADR_EUR_PER_MIN)}/minute d'audio (≈ $0,05).
              L'abonnement Fadr Plus ($10/mois) inclut {FADR_PLAN_MINUTES} minutes.
              Au-delà, chaque minute supplémentaire est facturée au même tarif.
              {fadrMonth.eurOver > 0 && (
                <> <strong>Dépassement ce mois : +{fmtEur(fadrMonth.eurOver)}.</strong></>
              )}
            </div>
          </section>

          {/* SECTION TOUS LES USERS */}
          <section className="cost-section">
            <div className="cost-section-eyebrow">Tous les utilisateurs</div>
            <h2 className="cost-section-title">
              {userStats.length} compte{userStats.length > 1 ? 's' : ''} · classés par{' '}
              {isLiveBusiness ? <em>balance croissante</em> : <em>coûts décroissants</em>}
            </h2>
            <div className="cost-table-wrap">
              <table className="cost-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Nom</th>
                    <th style={{textAlign: 'center'}}>Inscrit</th>
                    <th style={{textAlign: 'center'}}>Dernière activité</th>
                    <th style={{textAlign: 'right'}}>Projets</th>
                    <th style={{textAlign: 'right'}}>Titres</th>
                    <th style={{textAlign: 'right'}}>Versions</th>
                    <th style={{textAlign: 'right'}}>Coûts</th>
                    {isLiveBusiness && <th style={{textAlign: 'right'}}>Recettes</th>}
                    {isLiveBusiness && <th style={{textAlign: 'right'}}>Balance</th>}
                  </tr>
                </thead>
                <tbody>
                  {userStats.length === 0 && (
                    <tr><td colSpan={isLiveBusiness ? 10 : 8} className="cost-empty">Aucun utilisateur.</td></tr>
                  )}
                  {(isLiveBusiness
                    ? userStats
                    : [...userStats].sort((a, b) => Number(b.total_cost_eur || 0) - Number(a.total_cost_eur || 0))
                  ).map((u) => {
                    const isOpen = expanded?.userId === u.user_id;
                    const balance = Number(u.balance_eur || 0);
                    return (
                      <>
                        <tr
                          key={u.user_id}
                          className={`cost-row-clickable ${isOpen ? 'cost-row-open' : ''}`}
                          onClick={() => toggleExpand(u.user_id)}
                          aria-expanded={isOpen}
                        >
                          <td className="cost-email">{u.email || '—'}</td>
                          <td className="cost-muted">{[u.prenom, u.nom].filter(Boolean).join(' ') || <span className="cost-anon">—</span>}</td>
                          <td className="cost-muted" style={{textAlign: 'center'}}>{fmtDate(u.signed_up_at, true)}</td>
                          <td className="cost-muted" style={{textAlign: 'center'}}>{u.last_activity ? fmtDate(u.last_activity, true) : <span className="cost-anon">jamais</span>}</td>
                          <td style={{textAlign: 'right'}}>{u.projects_count}</td>
                          <td style={{textAlign: 'right'}}>{u.tracks_count}</td>
                          <td style={{textAlign: 'right'}}>{u.versions_count}</td>
                          <td style={{textAlign: 'right'}} className="cost-muted">{fmtEur(u.total_cost_eur)}</td>
                          {isLiveBusiness && (
                            <td style={{textAlign: 'right'}} className="cost-muted">{fmtEur(u.total_revenue_eur)}</td>
                          )}
                          {isLiveBusiness && (
                            <td style={{textAlign: 'right'}} className={balance >= 0 ? 'cost-balance-pos' : 'cost-balance-neg'}>
                              {fmtEur(balance)}
                            </td>
                          )}
                        </tr>
                        {isOpen && (
                          <tr className="cost-row-detail">
                            <td colSpan={isLiveBusiness ? 10 : 8}>
                              <UserDetail data={expanded} />
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION TOP CONSOMMATEURS (par coût sur 30j, basé sur logs) */}
          <section className="cost-section">
            <div className="cost-section-eyebrow">Top consommateurs sur 30 jours</div>
            <h2 className="cost-section-title">
              Qui coûte <em>le plus</em> en API.
            </h2>
            <div className="cost-table-wrap">
              <table className="cost-table">
                <thead>
                  <tr>
                    <th style={{width: '50px'}}>#</th>
                    <th>Email</th>
                    <th style={{textAlign: 'right'}}>Analyses</th>
                    <th style={{textAlign: 'right'}}>Coût total</th>
                    <th style={{textAlign: 'right'}}>Coût moyen / analyse</th>
                  </tr>
                </thead>
                <tbody>
                  {topUsers.length === 0 && (
                    <tr><td colSpan="5" className="cost-empty">Aucune donnée sur la période.</td></tr>
                  )}
                  {topUsers.map((u, i) => (
                    <tr key={u.userId || i}>
                      <td className="cost-rank">{i + 1}</td>
                      <td className="cost-email">{u.email || (u.userId ? u.userId.slice(0, 8) + '…' : <span className="cost-anon">anonyme</span>)}</td>
                      <td style={{textAlign: 'right'}}>{u.count}</td>
                      <td style={{textAlign: 'right'}} className="cost-total">{fmtEur(u.total)}</td>
                      <td style={{textAlign: 'right'}} className="cost-muted">{fmtEur(u.total / u.count)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION RECETTES — visible uniquement quand au moins une vente
              est tombée. Avant Stripe : section masquée pour ne pas
              polluer l'admin avec des KPIs vides. */}
          {isLiveBusiness && (
            <section className="cost-section">
              <div className="cost-section-eyebrow">Historique des recettes</div>
              <h2 className="cost-section-title">
                Tout ce qui <em>rentre</em>.
              </h2>
              {revenue.length === 0 ? (
                <div className="cost-empty-card">
                  Aucune recette dans la fenêtre récente.
                </div>
              ) : (
                <div className="cost-table-wrap">
                  <table className="cost-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User</th>
                        <th>Source</th>
                        <th>Produit</th>
                        <th style={{textAlign: 'right'}}>Brut TTC</th>
                        <th style={{textAlign: 'right'}}>Net après Stripe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenue.map((r) => (
                        <tr key={r.id}>
                          <td className="cost-muted">{fmtDate(r.created_at)}</td>
                          <td className="cost-userid">{r.user_id ? r.user_id.slice(0, 8) + '…' : <span className="cost-anon">—</span>}</td>
                          <td className="cost-muted">{r.source}</td>
                          <td className="cost-muted">{r.product || '—'}</td>
                          <td style={{textAlign: 'right'}} className="cost-total">{fmtEur(r.amount_eur)}</td>
                          <td style={{textAlign: 'right'}} className="cost-muted">{r.net_eur != null ? fmtEur(r.net_eur) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* SECTION DERNIÈRES ANALYSES */}
          <section className="cost-section">
            <div className="cost-section-eyebrow">Dernières analyses</div>
            <h2 className="cost-section-title">
              Les 20 plus <em>récentes</em>.
            </h2>
            <div className="cost-table-wrap">
              <table className="cost-table">
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
                    <tr><td colSpan="7" className="cost-empty">Aucune analyse loggée.</td></tr>
                  )}
                  {logs.slice(0, 20).map((l) => (
                    <tr key={l.id}>
                      <td className="cost-muted">{fmtDate(l.created_at)}</td>
                      <td className="cost-userid">{l.user_id ? l.user_id.slice(0, 8) + '…' : <span className="cost-anon">—</span>}</td>
                      <td style={{textAlign: 'right'}} className="cost-muted">{fmtDuration(l.audio_duration_sec)}</td>
                      <td style={{textAlign: 'right'}} className="cost-muted">{fmtEur(l.gemini_eur)}</td>
                      <td style={{textAlign: 'right'}} className="cost-muted">{fmtEur(l.claude_eur)}</td>
                      <td style={{textAlign: 'right'}} className="cost-muted">{fmtEur(l.fadr_eur)}</td>
                      <td style={{textAlign: 'right'}} className="cost-total">{fmtEur(l.total_eur)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="cost-footer">
            <div className="cost-footer-mark">
              VER<span className="accent">Si</span>ONS
            </div>
            <div className="cost-footer-line">
              Tarifs unitaires définis dans <code>decode-api/lib/costTracker.js</code>.
              Recettes alimentées via <code>revenue_logs</code> (Stripe webhook à brancher).
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
    <div className="cost-gate">
      <div className="cost-gate-label">{label}</div>
      {sub && <div className="cost-gate-sub">{sub}</div>}
    </div>
  );
}

function KpiCard({ label, value, sub, tone }) {
  return (
    <div className={`cost-kpi cost-kpi-${tone || 'amber'}`}>
      <div className="cost-kpi-label">{label}</div>
      <div className="cost-kpi-value">{value}</div>
      <div className="cost-kpi-sub">{sub}</div>
    </div>
  );
}

function UserDetail({ data }) {
  if (!data) return null;
  if (data.loading) return <div className="cost-detail-state">Chargement du détail…</div>;
  if (data.err) return <div className="cost-detail-state cost-detail-err">Erreur : {data.err}</div>;
  if (!data.items || data.items.length === 0) {
    return <div className="cost-detail-state">Aucun titre uploadé pour ce user.</div>;
  }
  // Group par track
  const byTrack = new Map();
  for (const it of data.items) {
    const k = it.track_id;
    if (!byTrack.has(k)) byTrack.set(k, { title: it.track_title, created_at: it.track_created_at, versions: [] });
    if (it.version_id) byTrack.get(k).versions.push(it);
  }
  return (
    <div className="cost-detail-wrap">
      {Array.from(byTrack.entries()).map(([trackId, t]) => (
        <div className="cost-detail-track" key={trackId}>
          <div className="cost-detail-track-head">
            <span className="cost-detail-track-title">{t.title || 'Sans titre'}</span>
            <span className="cost-detail-track-meta">créé le {fmtDate(t.created_at, true)} · {t.versions.length} version{t.versions.length > 1 ? 's' : ''}</span>
          </div>
          {t.versions.length > 0 && (
            <table className="cost-detail-versions">
              <thead>
                <tr>
                  <th>Version</th>
                  <th style={{textAlign: 'center'}}>Date</th>
                  <th style={{textAlign: 'right'}}>Durée</th>
                  <th style={{textAlign: 'right'}}>Coût</th>
                </tr>
              </thead>
              <tbody>
                {t.versions.map((v) => (
                  <tr key={v.version_id}>
                    <td>{v.version_name || '—'}</td>
                    <td style={{textAlign: 'center'}} className="cost-muted">{fmtDate(v.version_created_at, true)}</td>
                    <td style={{textAlign: 'right'}} className="cost-muted">{fmtDuration(v.audio_duration_sec)}</td>
                    <td style={{textAlign: 'right'}} className="cost-total">{v.cost_eur != null ? fmtEur(v.cost_eur) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

function DailyChart({ series }) {
  const maxCost = Math.max(0.01, ...series.map((d) => d.total));
  const W = 1000, H = 200, PAD = 24;
  const barW = (W - PAD * 2) / series.length - 2;
  return (
    <div className="cost-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="cost-chart-svg">
        {[0.25, 0.5, 0.75, 1].map((p) => (
          <line key={p} x1={PAD} x2={W - PAD}
            y1={H - PAD - (H - PAD * 2) * p}
            y2={H - PAD - (H - PAD * 2) * p}
            stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        {series.map((d, i) => {
          const h = ((d.total / maxCost) || 0) * (H - PAD * 2);
          const x = PAD + i * (barW + 2);
          const y = H - PAD - h;
          return (
            <rect key={d.day} x={x} y={y} width={Math.max(barW, 2)} height={Math.max(h, 1)} rx="2"
              fill="rgba(245,166,35,0.55)" stroke="rgba(245,166,35,0.9)" strokeWidth="0.5">
              <title>{`${d.day} · ${d.count} analyses · ${fmtEur(d.total)}`}</title>
            </rect>
          );
        })}
        {series.length > 0 && (
          <>
            <text x={PAD} y={H - 6} fill="rgba(138,138,144,0.7)" fontSize="9" fontFamily="monospace">{series[0].day.slice(5)}</text>
            <text x={W / 2} y={H - 6} fill="rgba(138,138,144,0.7)" fontSize="9" fontFamily="monospace" textAnchor="middle">{series[Math.floor(series.length / 2)].day.slice(5)}</text>
            <text x={W - PAD} y={H - 6} fill="rgba(138,138,144,0.7)" fontSize="9" fontFamily="monospace" textAnchor="end">{series[series.length - 1].day.slice(5)}</text>
          </>
        )}
      </svg>
    </div>
  );
}

/* ── Helpers stats ────────────────────────────────────── */
function computeStats(logs) {
  const costs = logs.map((l) => Number(l.total_eur || 0)).filter((x) => !Number.isNaN(x));
  if (costs.length === 0) return { count: 0, total: 0, avg: 0, median: 0, p95: 0, min: 0, max: 0 };
  const total = costs.reduce((a, b) => a + b, 0);
  const sorted = [...costs].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  return { count: costs.length, total, avg: total / costs.length, median, p95, min, max };
}

function computeDailySeries(logs, days) {
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

function computeTopUsers(logs, limit, userStats = []) {
  // Map user_id → email pour pouvoir afficher les emails dans le top
  const emailByUid = new Map(userStats.map((u) => [u.user_id, u.email]));
  const map = new Map();
  for (const l of logs) {
    const k = l.user_id || '__anon__';
    const cur = map.get(k) || { userId: l.user_id || null, count: 0, total: 0 };
    cur.count += 1;
    cur.total += Number(l.total_eur || 0);
    map.set(k, cur);
  }
  return Array.from(map.values())
    .map((u) => ({ ...u, email: emailByUid.get(u.userId) || null }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// computeStripeStats — agrège les recettes sur N jours :
// brut TTC encaissé, frais Stripe (= brut - net), recettes nettes.
// La col `net_eur` est calculée par le webhook backend avec une approximation
// 1,5% + 0,25 € (cartes EEE). Pour les cartes UK (2,5% + 0,25 €) le chiffre
// peut être un peu surévalué. Pour la précision réelle, on récupèrera les
// `balance_transaction.fee` Stripe quand on en aura besoin.
function computeStripeStats(revenue, days = 30) {
  const cutoff = Date.now() - days * 86400 * 1000;
  let brut_30d = 0;
  let net_30d = 0;
  let count_30d = 0;
  for (const r of revenue || []) {
    const t = new Date(r.created_at).getTime();
    if (Number.isFinite(t) && t >= cutoff) {
      brut_30d += Number(r.amount_eur || 0);
      net_30d += Number(r.net_eur != null ? r.net_eur : r.amount_eur || 0);
      count_30d += 1;
    }
  }
  const fees_30d = brut_30d - net_30d;
  return { brut_30d, net_30d, fees_30d, count_30d };
}

// computeFadrMonth — agrège la conso Fadr du mois en cours :
// total minutes, € consommés (= minutes × tarif), nb d'analyses Fadr,
// durée moyenne, analyses restantes avant fin de franchise (basé sur
// la durée moyenne mesurée — fallback 4 min si aucune donnée).
function computeFadrMonth(logs) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const fadrLogs = logs.filter((l) => {
    if (!l.fadr_called) return false;
    if (!l.created_at) return false;
    return new Date(l.created_at) >= monthStart;
  });
  const minutesUsed = fadrLogs.reduce((acc, l) => acc + (Number(l.audio_duration_sec || 0) / 60), 0);
  const eurUsed = minutesUsed * FADR_EUR_PER_MIN;
  const count = fadrLogs.length;
  const avgDurationMin = count > 0 ? minutesUsed / count : 0;
  const minutesLeft = Math.max(0, FADR_PLAN_MINUTES - minutesUsed);
  // Estimation : combien d'analyses encore "gratuites" avant dépassement.
  // Prend la durée moyenne mesurée ; fallback 4 min si pas encore de data.
  const fallbackMin = 4;
  const usableAvg = avgDurationMin > 0 ? avgDurationMin : fallbackMin;
  const analysesLeft = count > 0 || fadrLogs.length === 0
    ? Math.max(0, Math.floor(minutesLeft / usableAvg))
    : null;
  const eurOver = Math.max(0, eurUsed - FADR_PLAN_EUR);
  const pctUsed = Math.min(1, minutesUsed / FADR_PLAN_MINUTES);
  return { minutesUsed, eurUsed, count, avgDurationMin, minutesLeft, analysesLeft, eurOver, pctUsed };
}

/* ── Helpers format ───────────────────────────────────── */
function fmtEur(n) {
  if (n == null || Number.isNaN(Number(n))) return '—';
  const v = Number(n);
  if (Math.abs(v) < 0.01 && v !== 0) return v > 0 ? '< 0,01 €' : '> -0,01 €';
  return v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}
function fmtDuration(sec) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
function fmtDate(iso, dateOnly = false) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    if (dateOnly) return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' });
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
      .cost-screen {
        position: relative; z-index: 1;
        min-height: 100vh; min-height: 100dvh;
        background: transparent;
        color: var(--text, ${T.text});
        font-family: var(--body, ${T.body});
        overflow-x: hidden;
      }

      /* TOPBAR */
      .cost-topbar {
        position: relative; z-index: 2;
        max-width: 1480px; margin: 0 auto;
        padding: 22px 28px;
        display: flex; align-items: center; justify-content: space-between;
        gap: 24px;
      }
      .cost-topbar-brand {
        display: inline-flex; align-items: center; gap: 10px;
        background: transparent; border: 0; cursor: pointer;
        padding: 4px 6px; border-radius: 8px;
        transition: opacity .15s;
      }
      .cost-topbar-brand:hover { opacity: 0.82; }
      .cost-topbar-logo {
        height: 26px; width: auto;
        filter: drop-shadow(0 0 16px rgba(245,166,35,0.18));
      }
      .cost-topbar-wordmark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 17px; letter-spacing: -0.4px;
        color: ${T.text}; line-height: 1;
      }
      .cost-topbar-wordmark .accent { color: ${T.amber}; font-style: normal; }

      .cost-topbar-nav { display: inline-flex; align-items: center; gap: 8px; }
      .cost-topbar-link, .cost-topbar-current {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        padding: 9px 16px; border-radius: 999px;
        transition: all .15s;
      }
      .cost-topbar-link {
        background: transparent; color: ${T.textSoft};
        border: 1px solid transparent; cursor: pointer;
      }
      .cost-topbar-link:hover {
        color: ${T.text};
        background: rgba(255,255,255,0.04);
        border-color: rgba(255,255,255,0.10);
      }
      .cost-topbar-current {
        color: ${T.amber};
        background: rgba(245,166,35,0.06);
        border: 1px solid rgba(245,166,35,0.32);
      }

      /* GATE */
      .cost-gate {
        max-width: 480px; margin: 80px auto;
        text-align: center;
        padding: 48px 32px;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
      }
      .cost-gate-label {
        font-family: ${T.mono}; font-size: 12px; font-weight: 500;
        letter-spacing: 2px; text-transform: uppercase;
        color: ${T.amber};
      }
      .cost-gate-sub {
        margin-top: 12px;
        font-family: ${T.body}; font-size: 13.5px; font-weight: 300;
        color: ${T.textSoft};
      }

      /* HERO */
      .cost-hero {
        padding: clamp(24px, 4vw, 48px) 24px clamp(16px, 3vw, 32px);
        display: grid; place-items: center;
      }
      .cost-hero-inner {
        width: 100%; max-width: 760px;
        display: flex; flex-direction: column; align-items: center;
        gap: 14px; text-align: center;
        animation: fadeup .5s ease;
      }
      .cost-eyebrow {
        font-family: ${T.mono}; font-size: 11px; font-weight: 500;
        letter-spacing: 2.4px; color: ${T.amber}; text-transform: uppercase;
      }
      .cost-hero-title {
        font-family: ${T.body}; font-weight: 700;
        font-size: clamp(32px, 4.6vw, 56px);
        line-height: 1.0; letter-spacing: -1.6px;
        color: ${T.text}; margin: 0;
      }
      .cost-hero-title em {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        color: ${T.amber};
      }
      .cost-hero-sub {
        font-family: ${T.body}; font-size: 13.5px; font-weight: 300;
        color: ${T.muted}; margin: 0;
      }

      /* SECTIONS */
      .cost-section {
        padding: clamp(28px, 4vw, 48px) 24px;
        max-width: 1480px; margin: 0 auto;
      }
      .cost-section-eyebrow {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 2.2px; color: ${T.amber}; text-transform: uppercase;
        margin-bottom: 12px;
      }
      .cost-section-title {
        font-family: ${T.body}; font-weight: 500;
        font-size: clamp(18px, 2.2vw, 24px);
        line-height: 1.3; letter-spacing: -0.4px;
        color: ${T.textSoft}; margin: 0 0 24px;
      }
      .cost-section-title em {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        color: ${T.amber};
      }

      /* KPIs */
      .cost-kpi-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 16px;
      }
      .cost-kpi {
        position: relative; overflow: hidden;
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        padding: 22px 22px;
        display: flex; flex-direction: column; gap: 8px;
        transition: border-color .2s;
      }
      .cost-kpi::before {
        content: '';
        position: absolute;
        top: -40%; right: -25%;
        width: 220px; height: 220px;
        border-radius: 50%;
        filter: blur(48px);
        opacity: 0.5;
        pointer-events: none;
      }
      .cost-kpi > * { position: relative; z-index: 1; }
      .cost-kpi:hover { border-color: rgba(255,255,255,0.16); }

      .cost-kpi-amber::before { background: radial-gradient(circle, rgba(245,166,35,0.55), transparent 70%); }
      .cost-kpi-amber .cost-kpi-value { color: ${T.amber}; }
      .cost-kpi-cerulean::before { background: radial-gradient(circle, rgba(92,184,204,0.45), transparent 70%); }
      .cost-kpi-cerulean .cost-kpi-value { color: ${T.cerulean}; }
      .cost-kpi-violet::before { background: radial-gradient(circle, rgba(166,126,245,0.45), transparent 70%); }
      .cost-kpi-violet .cost-kpi-value { color: ${T.violet}; }
      .cost-kpi-mint::before { background: radial-gradient(circle, rgba(142,224,122,0.42), transparent 70%); }
      .cost-kpi-mint .cost-kpi-value { color: ${T.mint}; }
      .cost-kpi-red::before { background: radial-gradient(circle, rgba(255,93,93,0.42), transparent 70%); }
      .cost-kpi-red .cost-kpi-value { color: ${T.red}; }

      .cost-kpi-label {
        font-family: ${T.mono}; font-size: 10.5px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        color: ${T.muted};
      }
      .cost-kpi-value {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 36px; line-height: 1; letter-spacing: -1px;
        color: ${T.text};
      }
      .cost-kpi-sub {
        font-family: ${T.body}; font-size: 12px; font-weight: 300;
        color: ${T.muted2};
      }

      @media (max-width: 980px) { .cost-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
      @media (max-width: 520px) { .cost-kpi-grid { grid-template-columns: 1fr; } }

      /* FADR NOTE */
      .cost-fadr-note {
        margin-top: 16px;
        padding: 14px 18px;
        background: rgba(245,166,35,0.04);
        border: 1px solid rgba(245,166,35,0.16);
        border-radius: 10px;
        font-family: ${T.body}; font-size: 12.5px; font-weight: 300;
        color: ${T.textSoft}; line-height: 1.6;
      }
      .cost-fadr-note strong {
        font-weight: 600;
        color: ${T.red};
      }

      /* CHART */
      .cost-chart {
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        padding: 18px;
      }
      .cost-chart-svg { width: 100%; height: 200px; display: block; }

      /* TABLES */
      .cost-table-wrap {
        background: ${T.s1};
        border: 1px solid ${T.border};
        border-radius: 16px;
        overflow-x: auto;
      }
      .cost-table {
        width: 100%; border-collapse: collapse;
        font-family: ${T.body}; font-size: 13px;
      }
      .cost-table thead th {
        font-family: ${T.mono}; font-size: 10px; font-weight: 500;
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.muted};
        padding: 14px 14px;
        text-align: left;
        border-bottom: 1px solid ${T.border};
        background: rgba(255,255,255,0.015);
        white-space: nowrap;
      }
      .cost-table tbody tr {
        border-top: 1px solid ${T.border};
        transition: background .15s;
      }
      .cost-table tbody tr:hover { background: rgba(255,255,255,0.02); }
      .cost-table tbody td {
        padding: 12px 14px;
        color: ${T.text};
        white-space: nowrap;
      }
      .cost-row-clickable { cursor: pointer; }
      .cost-row-clickable:hover { background: rgba(245,166,35,0.04) !important; }
      .cost-row-open { background: rgba(245,166,35,0.06) !important; }
      .cost-row-detail td { padding: 0 !important; background: rgba(0,0,0,0.18); border-top: none !important; }

      .cost-rank { font-family: ${T.mono}; font-weight: 500; color: ${T.amber}; }
      .cost-userid, .cost-email {
        font-family: ${T.mono}; font-size: 12px; color: ${T.textSoft};
      }
      .cost-email { color: ${T.text}; }
      .cost-anon { color: ${T.muted2}; font-style: italic; }
      .cost-total {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 14px; color: ${T.amber};
      }
      .cost-balance-pos {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 14px; color: ${T.mint};
      }
      .cost-balance-neg {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 14px; color: ${T.red};
      }
      .cost-muted {
        color: ${T.muted};
        font-family: ${T.mono}; font-size: 12px;
      }
      .cost-empty {
        text-align: center;
        padding: 32px 16px !important;
        color: ${T.muted2};
        font-style: italic;
      }
      .cost-empty-card {
        padding: 32px 28px;
        background: ${T.s1};
        border: 1px dashed ${T.border};
        border-radius: 16px;
        text-align: center;
        color: ${T.textSoft};
        font-family: ${T.body}; font-size: 14px; font-weight: 300;
        line-height: 1.7;
      }
      .cost-empty-card code {
        font-family: ${T.mono}; font-size: 12px;
        color: ${T.amber};
        padding: 2px 6px; border-radius: 4px;
        background: rgba(245,166,35,0.08);
      }

      /* DETAIL EXPAND (sub-table dans une row) */
      .cost-detail-state {
        padding: 24px;
        font-family: ${T.body}; font-size: 13px; font-style: italic;
        color: ${T.muted};
        text-align: center;
      }
      .cost-detail-err { color: ${T.red}; }
      .cost-detail-wrap {
        padding: 18px 24px;
        display: flex; flex-direction: column; gap: 16px;
      }
      .cost-detail-track {
        background: rgba(255,255,255,0.02);
        border: 1px solid ${T.border};
        border-radius: 10px;
        overflow: hidden;
      }
      .cost-detail-track-head {
        padding: 12px 16px;
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 16px;
        border-bottom: 1px solid ${T.border};
        background: rgba(245,166,35,0.04);
      }
      .cost-detail-track-title {
        font-family: ${T.serif}; font-style: italic; font-weight: 500;
        font-size: 16px; color: ${T.text};
      }
      .cost-detail-track-meta {
        font-family: ${T.mono}; font-size: 10.5px;
        letter-spacing: 1.2px; text-transform: uppercase;
        color: ${T.muted};
      }
      .cost-detail-versions {
        width: 100%; border-collapse: collapse;
        font-family: ${T.body}; font-size: 12.5px;
      }
      .cost-detail-versions th {
        font-family: ${T.mono}; font-size: 9.5px; font-weight: 500;
        letter-spacing: 1.2px; text-transform: uppercase;
        color: ${T.muted2};
        padding: 8px 12px;
        text-align: left;
        background: transparent;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }
      .cost-detail-versions td {
        padding: 9px 12px;
        border-top: 1px solid rgba(255,255,255,0.03);
        color: ${T.text};
      }

      @media (max-width: 720px) {
        .cost-table thead th, .cost-table tbody td {
          padding: 10px 10px; font-size: 12px;
        }
      }

      /* FOOTER */
      .cost-footer {
        padding: clamp(40px, 6vw, 72px) 24px;
        max-width: 1080px; margin: 0 auto;
        text-align: center;
        display: flex; flex-direction: column; align-items: center; gap: 14px;
      }
      .cost-footer-mark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 22px; letter-spacing: -0.5px;
        color: ${T.text};
      }
      .cost-footer-mark .accent { color: ${T.amber}; }
      .cost-footer-line {
        font-family: ${T.body}; font-size: 13px; font-weight: 300;
        color: ${T.muted};
        max-width: 620px;
      }
      .cost-footer-line code {
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
