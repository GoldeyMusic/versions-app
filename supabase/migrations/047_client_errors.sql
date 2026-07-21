-- 047_client_errors.sql — journal des crashs JavaScript côté front.
--
-- Contexte (2026-07-21) : page blanche non diagnosticable chez un
-- utilisateur Windows/Edge. Le front (src/lib/crashReporter.js) POST les
-- erreurs sur versions-api /api/client-error, qui insère ici en
-- service_role. Aucune écriture directe depuis le navigateur.
--
-- RLS activée SANS policy : anon/authenticated n'ont aucun accès
-- (service_role bypasse). Lecture via SQL editor / dashboard admin.
--
-- APPLIQUÉE sur Supabase le 2026-07-21.

create table if not exists public.client_errors (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  message     text not null,
  stack       text,
  source      text,
  path        text,
  ua          text,
  user_id     uuid references auth.users(id) on delete set null,
  email       text,
  ip          text
);

create index if not exists client_errors_created_at_idx on public.client_errors (created_at desc);
create index if not exists client_errors_user_id_idx     on public.client_errors (user_id);

alter table public.client_errors enable row level security;

comment on table public.client_errors is
  'Crashs JS front rapportés par crashReporter.js via /api/client-error (service_role only).';
