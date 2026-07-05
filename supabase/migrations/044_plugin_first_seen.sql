-- 044_plugin_first_seen.sql
-- Notif "première connexion depuis le plugin" (2026-07-05) — le signal
-- d'installation RÉELLE (vs simple téléchargement, cf. 043_plugin_downloads).
--
-- Mécanique SANS toucher au plugin (rétroactif pour tous les binaires déjà
-- installés) : à chaque ouverture/login, le plugin appelle déjà 3 RPC avec
-- le JWT user (plugin_get_account au login, plugin_chat_status et
-- plugin_express_quota_status pour les compteurs de quota). On y greffe
-- plugin_touch_first_seen() : INSERT ... ON CONFLICT DO NOTHING dans
-- plugin_first_seen → la PREMIÈRE occurrence par user déclenche le
-- Database Webhook (INSERT plugin_first_seen → versions-api
-- /api/internal/notify-plugin-first-seen → email ops).
-- Webhook DÉJÀ CRÉÉ en prod directement en SQL (2026-07-05, trigger
-- "notify-plugin-first-seen", même URL Railway/secret/pattern que
-- notify-signup — secret volontairement absent de ce fichier) ; il est
-- visible/éditable dans le dashboard sous Integrations → Database
-- Webhooks. Si besoin de le recréer : copier la config du trigger
-- notify-signup (pg_get_triggerdef) en changeant table et path.
--
-- ATTENTION : plugin_chat_status / plugin_express_quota_status passent de
-- STABLE à VOLATILE (un INSERT l'exige). OK : le plugin les appelle en
-- POST (AuthClient::callRpc, JUCE withPOSTData) et PostgREST accepte le
-- POST sur du volatile.
--
-- AU PASSAGE : remise en conformité du quota express GRATUIT à 5/mois
-- (décision David 2026-07-01, migration plugin_quota_free_express5_chat15
-- incomplète en prod : le chat était bien passé à 15/jour mais les 2
-- fonctions express annonçaient/appliquaient encore 15/mois). La page
-- /plugin du site promet déjà "5 écoutes/mois". Abonnés inchangés (300).

-- ─── Table ────────────────────────────────────────────────────────
create table if not exists public.plugin_first_seen (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_seen_at timestamptz not null default now()
);

-- RLS sans policy : seul le service role (backend) et les fonctions
-- SECURITY DEFINER y touchent.
alter table public.plugin_first_seen enable row level security;

-- ─── Helper : marque la 1re connexion plugin ─────────────────────
create or replace function public.plugin_touch_first_seen(uid uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if uid is null then return; end if;
  insert into public.plugin_first_seen (user_id, email)
  select uid, (select u.email from auth.users u where u.id = uid)
  on conflict (user_id) do nothing;
end;
$$;

-- Pas d'appel direct possible via PostgREST (sinon n'importe quel JWT
-- pourrait marquer n'importe quel uid). Les RPC SECURITY DEFINER
-- ci-dessous l'appellent en tant qu'owner → non affectées.
revoke execute on function public.plugin_touch_first_seen(uuid) from public, anon, authenticated;

-- ─── plugin_get_account : + touch (appelée au login plugin) ──────
create or replace function public.plugin_get_account()
returns json
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
begin
  perform public.plugin_touch_first_seen(uid);
  return json_build_object(
    'credits', coalesce((select balance_remaining from public.user_credits where user_id = uid), 0),
    'plan', case
              when (select stripe_subscription_id from public.user_credits where user_id = uid) is not null
                then 'PRO'
              else 'FREE'
            end
  );
end;
$$;

-- ─── plugin_chat_status : + touch, STABLE → VOLATILE ─────────────
create or replace function public.plugin_chat_status()
returns json
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  uid    uuid    := auth.uid();
  is_sub boolean := public.plugin_is_subscriber(uid);
  per    text    := case when is_sub then to_char(now() at time zone 'utc','YYYY-MM')
                         else to_char(now() at time zone 'utc','YYYY-MM-DD') end;
  lim    int     := case when is_sub then 1000 else 15 end;
  cur    int     := 0;
begin
  if uid is null then return json_build_object('ok', false, 'used', 0, 'limit', lim); end if;
  perform public.plugin_touch_first_seen(uid);
  select count into cur from public.plugin_chat_usage where user_id = uid and period = per;
  return json_build_object('ok', true, 'used', coalesce(cur,0), 'limit', lim,
                           'subscriber', is_sub,
                           'period', case when is_sub then 'month' else 'day' end);
end;
$$;

-- ─── plugin_express_quota_status : + touch, STABLE → VOLATILE,
--     gratuit 15 → 5 (mise en conformité décision 2026-07-01) ─────
create or replace function public.plugin_express_quota_status()
returns json
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  per text := to_char(now() at time zone 'utc', 'YYYY-MM');
  is_sub boolean := public.plugin_is_subscriber(uid);
  lim int := case when is_sub then 300 else 5 end;
  cur int := 0;
begin
  if uid is null then
    return json_build_object('ok', false, 'used', 0, 'limit', lim);
  end if;
  perform public.plugin_touch_first_seen(uid);
  select count into cur from public.plugin_express_usage
    where user_id = uid and period = per;
  return json_build_object('ok', true, 'used', coalesce(cur,0),
                           'limit', lim, 'subscriber', is_sub);
end;
$$;

-- ─── plugin_express_consume : gratuit 15 → 5 (même conformité) ───
create or replace function public.plugin_express_consume()
returns json
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  uid uuid := auth.uid();
  per text := to_char(now() at time zone 'utc', 'YYYY-MM');
  lim int  := case when public.plugin_is_subscriber(uid) then 300 else 5 end;
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

  return json_build_object('allowed', true, 'used', cur, 'limit', lim);
end;
$$;
