-- 033_plugin_express_quota.sql
-- Garde-fou coût : quota mensuel d'écoutes express (Phase 3 plugin DAW).
--
-- Contexte : l'écoute express (bouton "Écoute express" du plugin) envoie un
-- extrait ~30-60 s au backend qui lance une écoute Gemini courte (~0.01-0.03 $).
-- Sans limite, un utilisateur pourrait la déclencher en boucle. L'endpoint
-- `/api/plugin/express` (api/_plugin.js) appelle déjà la RPC
-- `plugin_express_consume` avant l'écoute, mais elle n'existait pas → la
-- vérification échouait silencieusement (try/catch) et l'écoute tournait
-- sans plafond. Cette migration crée la RPC + sa table de comptage.
--
-- L'appel se fait avec le JWT de l'utilisateur (Authorization: Bearer …) →
-- la RPC lit auth.uid(), pas de paramètre. SECURITY DEFINER pour écrire la
-- table malgré RLS. Reset mensuel implicite (clé = user_id + 'YYYY-MM').
--
-- Refund : l'endpoint consomme AVANT l'écoute (anti-spam) puis appelle
-- `plugin_express_refund` si l'écoute Gemini échoue — cohérent avec la
-- politique "ne jamais débiter sur échec" (cf. protection crédits 4 paliers).

-- ── Table de comptage ────────────────────────────────────────────────
create table if not exists public.plugin_express_usage (
  user_id uuid  not null references auth.users (id) on delete cascade,
  month   text  not null,                  -- 'YYYY-MM' (UTC)
  used    int   not null default 0,
  primary key (user_id, month)
);

alter table public.plugin_express_usage enable row level security;
-- Aucune policy directe : accès uniquement via les RPC SECURITY DEFINER.

-- ── Limite mensuelle (modifiable ici) ────────────────────────────────
-- 15 écoutes / mois. Idée David (badge "FREE 3/15") : un palier gratuit
-- plus bas pourra être branché plus tard selon le tier d'abonnement.
-- Pour l'instant, plafond unique.

-- ── Consume : check + incrément atomique ────────────────────────────
create or replace function public.plugin_express_consume()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_limit int  := 15;
  v_used  int;
begin
  if v_user is null then
    return json_build_object('allowed', false, 'used', 0, 'limit', v_limit, 'reason', 'no_auth');
  end if;

  insert into public.plugin_express_usage (user_id, month, used)
       values (v_user, v_month, 0)
  on conflict (user_id, month) do nothing;

  -- verrou de ligne → pas de course entre requêtes concurrentes
  select used into v_used
    from public.plugin_express_usage
   where user_id = v_user and month = v_month
     for update;

  if v_used >= v_limit then
    return json_build_object('allowed', false, 'used', v_used, 'limit', v_limit);
  end if;

  update public.plugin_express_usage
     set used = used + 1
   where user_id = v_user and month = v_month
   returning used into v_used;

  return json_build_object('allowed', true, 'used', v_used, 'limit', v_limit);
end;
$$;

-- ── Refund : décrément (plancher 0) si l'écoute a échoué ─────────────
create or replace function public.plugin_express_refund()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_used  int;
begin
  if v_user is null then
    return json_build_object('ok', false, 'reason', 'no_auth');
  end if;

  update public.plugin_express_usage
     set used = greatest(0, used - 1)
   where user_id = v_user and month = v_month
   returning used into v_used;

  return json_build_object('ok', true, 'used', coalesce(v_used, 0));
end;
$$;

grant execute on function public.plugin_express_consume() to authenticated;
grant execute on function public.plugin_express_refund()  to authenticated;
