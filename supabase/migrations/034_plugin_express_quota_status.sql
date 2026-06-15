-- 034 — Lecture du quota d'écoutes express (badge "N/15" dans le plugin).
--
-- Pendant : 033_plugin_express_quota.sql (table plugin_express_usage +
-- consume/refund). Ici : lecture SEULE, pour afficher l'état du quota sur
-- le bouton "Ecoute express" du plugin sans consommer quoi que ce soit.
-- v_limit dupliqué avec plugin_express_consume (15) — garder synchro.

create or replace function public.plugin_express_quota_status()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user  uuid := auth.uid();
  v_month text := to_char(now() at time zone 'utc', 'YYYY-MM');
  v_limit int  := 15; -- MEME valeur que plugin_express_consume
  v_used  int  := 0;
begin
  if v_user is null then
    return json_build_object('ok', false, 'used', 0, 'limit', v_limit);
  end if;

  select used into v_used
    from public.plugin_express_usage
   where user_id = v_user and month = v_month;

  return json_build_object('ok', true, 'used', coalesce(v_used, 0), 'limit', v_limit);
end;
$$;

revoke all on function public.plugin_express_quota_status() from public;
grant execute on function public.plugin_express_quota_status() to authenticated;
