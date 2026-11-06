-- 058 — Instrumentation (audit 2026-11-06)
--
-- 1. analysis_cost_logs.timings : durée par étape du pipeline (ms), écrite
--    par versions-api/lib/costTracker.js (markTiming dans api/_analyze.js).
-- 2. product_events : événements produit côté site (modale d'ajout ouverte,
--    fichier déposé, analyse lancée…) via RPC log_product_event (auth requis).
-- 3. plugin_first_seen.last_seen_at / open_count : dernière ouverture du
--    plugin, mis à jour par plugin_touch_first_seen (déjà appelée à chaque
--    ouverture via plugin_get_account + status de quota).
-- 4. plugin_express_events : un enregistrement par écoute express acceptée
--    (plugin_express_consume) → permet « express → analyse complète à 7 j ».
-- 5. admin_get_activation_stats(p_days) : agrégats pour le bloc Funnel de /admin.

-- ── 1. Timings pipeline ─────────────────────────────────────────────
alter table public.analysis_cost_logs
  add column if not exists timings jsonb;

-- ── 2. Événements produit ───────────────────────────────────────────
create table if not exists public.product_events (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  event       text not null,
  props       jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists product_events_user_created_idx
  on public.product_events (user_id, created_at desc);
create index if not exists product_events_event_created_idx
  on public.product_events (event, created_at desc);
alter table public.product_events enable row level security;
-- Aucune policy : écriture via RPC SECURITY DEFINER, lecture via RPC admin.

create or replace function public.log_product_event(p_event text, p_props jsonb default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  v_count int;
begin
  if uid is null or p_event is null then
    return;
  end if;
  if p_event not in (
    'add_modal_open', 'add_modal_file', 'add_modal_launch', 'add_modal_close',
    'pricing_view', 'checkout_click', 'sample_view'
  ) then
    return;
  end if;
  -- Garde-fou anti-boucle : 200 événements / heure / user max.
  select count(*) into v_count
    from public.product_events
   where user_id = uid and created_at > now() - interval '1 hour';
  if v_count >= 200 then
    return;
  end if;
  insert into public.product_events (user_id, event, props)
  values (uid, left(p_event, 40), p_props);
end;
$$;
grant execute on function public.log_product_event(text, jsonb) to authenticated;

-- ── 3. Dernière ouverture du plugin ─────────────────────────────────
alter table public.plugin_first_seen
  add column if not exists last_seen_at timestamptz,
  add column if not exists open_count integer not null default 0;
update public.plugin_first_seen
   set last_seen_at = first_seen_at
 where last_seen_at is null;

-- open_count ne s'incrémente qu'une fois par tranche de 10 min : les 3 RPC
-- d'ouverture (account + 2 quotas) arrivent dans la même seconde.
create or replace function public.plugin_touch_first_seen(uid uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if uid is null then return; end if;
  insert into public.plugin_first_seen (user_id, email, last_seen_at, open_count)
  select uid, (select u.email from auth.users u where u.id = uid), now(), 1
  on conflict (user_id) do update
    set open_count   = case
                         when public.plugin_first_seen.last_seen_at is null
                           or public.plugin_first_seen.last_seen_at < now() - interval '10 minutes'
                         then public.plugin_first_seen.open_count + 1
                         else public.plugin_first_seen.open_count
                       end,
        last_seen_at = now();
end;
$$;

-- ── 4. Écoutes express horodatées ───────────────────────────────────
create table if not exists public.plugin_express_events (
  id          bigserial primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);
create index if not exists plugin_express_events_user_created_idx
  on public.plugin_express_events (user_id, created_at desc);
alter table public.plugin_express_events enable row level security;

create or replace function public.plugin_express_consume()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  per text := to_char(now() at time zone 'utc', 'YYYY-MM');
  lim int  := case when public.plugin_is_subscriber(uid) then 300 else 15 end;
  cur int;
begin
  if uid is null then
    return json_build_object('allowed', false, 'error', 'no_user');
  end if;

  insert into public.plugin_express_usage (user_id, period, count)
    values (uid, per, 0)
    on conflict (user_id, period) do nothing;

  select count into cur from public.plugin_express_usage
    where user_id = uid and period = per
    for update;

  if cur >= lim then
    return json_build_object('allowed', false, 'used', cur, 'limit', lim);
  end if;

  update public.plugin_express_usage
    set count = count + 1, updated_at = now()
    where user_id = uid and period = per
    returning count into cur;

  insert into public.plugin_express_events (user_id) values (uid);

  return json_build_object('allowed', true, 'used', cur, 'limit', lim);
end;
$$;

-- ── 5. Agrégats admin ───────────────────────────────────────────────
create or replace function public.admin_get_activation_stats(p_days integer default 30)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_since timestamptz := now() - make_interval(days => greatest(p_days, 1));
  v_funnel jsonb;
  v_express jsonb;
  v_plugin jsonb;
  v_timings jsonb;
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  -- Funnel site (comptes hors admin)
  with team as (select user_id from public.admin_users),
  ev as (
    select user_id, event
      from public.product_events
     where created_at >= v_since
       and user_id not in (select user_id from team)
  ),
  vv as (
    select v.id, v.track_id, t.user_id, v.created_at
      from public.versions v
      join public.tracks t on t.id = v.track_id
     where v.created_at >= v_since
       and t.user_id not in (select user_id from team)
  )
  select jsonb_build_object(
    'signups',      (select count(*) from auth.users u
                      where u.created_at >= v_since
                        and u.id not in (select user_id from team)),
    'modal_open',   (select count(distinct user_id) from ev where event = 'add_modal_open'),
    'modal_file',   (select count(distinct user_id) from ev where event = 'add_modal_file'),
    'modal_launch', (select count(distinct user_id) from ev where event = 'add_modal_launch'),
    'analysts',     (select count(distinct user_id) from vv),
    'analyses',     (select count(*) from vv),
    'v2_users',     (select count(distinct vv.user_id) from vv
                      where (select count(*) from public.versions v2 where v2.track_id = vv.track_id) >= 2)
  ) into v_funnel;

  -- Express → analyse complète dans les 7 jours
  with team as (select user_id from public.admin_users),
  ex as (
    select user_id, created_at
      from public.plugin_express_events
     where created_at >= v_since
       and user_id not in (select user_id from team)
  )
  select jsonb_build_object(
    'express_users', (select count(distinct user_id) from ex),
    'express_count', (select count(*) from ex),
    'express_to_site_7d', (
      select count(distinct e.user_id)
        from ex e
       where exists (
         select 1 from public.versions v
           join public.tracks t on t.id = v.track_id
          where t.user_id = e.user_id
            and v.created_at >  e.created_at
            and v.created_at <= e.created_at + interval '7 days'
       )
    )
  ) into v_express;

  -- Plugin : dernière ouverture
  select jsonb_build_object(
    'installed',   count(*),
    'seen_7d',     count(*) filter (where last_seen_at >= now() - interval '7 days'),
    'seen_30d',    count(*) filter (where last_seen_at >= now() - interval '30 days'),
    'dormant_30d', count(*) filter (where last_seen_at is null or last_seen_at < now() - interval '30 days')
  ) into v_plugin
  from public.plugin_first_seen
  where user_id not in (select user_id from public.admin_users);

  -- Timings pipeline (médiane / p90 par étape, ms)
  with tl as (
    select timings
      from public.analysis_cost_logs
     where created_at >= v_since and timings is not null
  )
  select jsonb_build_object(
    'n', (select count(*) from tl),
    'total_p50',     (select percentile_cont(0.5) within group (order by (timings->>'total_ms')::numeric)     from tl where timings ? 'total_ms'),
    'total_p90',     (select percentile_cont(0.9) within group (order by (timings->>'total_ms')::numeric)     from tl where timings ? 'total_ms'),
    'listening_p50', (select percentile_cont(0.5) within group (order by (timings->>'listening_ms')::numeric) from tl where timings ? 'listening_ms'),
    'listening_p90', (select percentile_cont(0.9) within group (order by (timings->>'listening_ms')::numeric) from tl where timings ? 'listening_ms'),
    'fiche_p50',     (select percentile_cont(0.5) within group (order by (timings->>'fiche_ms')::numeric)     from tl where timings ? 'fiche_ms'),
    'fiche_p90',     (select percentile_cont(0.9) within group (order by (timings->>'fiche_ms')::numeric)     from tl where timings ? 'fiche_ms'),
    'fadr_p50',      (select percentile_cont(0.5) within group (order by (timings->>'fadr_ms')::numeric)      from tl where timings ? 'fadr_ms'),
    'rag_p50',       (select percentile_cont(0.5) within group (order by (timings->>'rag_ms')::numeric)       from tl where timings ? 'rag_ms'),
    'evolution_p50', (select percentile_cont(0.5) within group (order by (timings->>'evolution_ms')::numeric) from tl where timings ? 'evolution_ms')
  ) into v_timings;

  return jsonb_build_object(
    'days', greatest(p_days, 1),
    'funnel', v_funnel,
    'express', v_express,
    'plugin', v_plugin,
    'timings', v_timings
  );
end;
$$;
grant execute on function public.admin_get_activation_stats(integer) to authenticated;
