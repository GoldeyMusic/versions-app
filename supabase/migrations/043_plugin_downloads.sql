-- 043_plugin_downloads.sql
-- Tracking des téléchargements du plugin depuis versions.studio/plugin.
-- Le téléchargement est gaté par le login (décision David 2026-07-05) :
-- chaque download passe par POST /api/plugin/download (versions-api,
-- Bearer JWT) qui insère ici via le SERVICE ROLE puis notifie par email
-- (notifyOps → OPS_NOTIFY_EMAIL).
--
-- RLS activée SANS policy : seul le service role (backend) lit/écrit.
-- user_id en ON DELETE SET NULL : l'historique de téléchargements survit
-- à la suppression du compte (l'email est conservé en colonne propre).

create table if not exists public.plugin_downloads (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  platform text not null check (platform in ('mac', 'windows')),
  version text,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists idx_plugin_downloads_user
  on public.plugin_downloads(user_id);
create index if not exists idx_plugin_downloads_created
  on public.plugin_downloads(created_at desc);

alter table public.plugin_downloads enable row level security;
