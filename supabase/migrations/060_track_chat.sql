-- 060_track_chat.sql
-- Chat unifié, étape 1 : mémoire commune site + plugin (2026-11-11).
--
-- Avant : deux chats qui s'ignoraient.
--   - site   : historique par VERSION, dans versions.chat_history (jsonb),
--              écrit par le navigateur ;
--   - plugin : 8 derniers échanges gardés dans l'état du plugin, rien en base.
-- Désormais : UN fil par (personne, titre) dans track_chat_messages. Le site
-- et le plugin y lisent et y écrivent tous les deux, via le serveur d'API
-- (service role). Le fil est PRIVÉ par personne, même sur un titre partagé :
-- le plugin n'envoie que les mesures de son utilisateur.
--
--   source      'site' | 'plugin' : d'où vient le message
--   version_id  version affichée au moment de l'échange (site), NULL côté plugin
--   meta        { "seed": "<clé>" } pour la charte mastering injectée par le site
--
-- versions.chat_history est conservée telle quelle (retour arrière possible) ;
-- son contenu est recopié ici, attribué au propriétaire du titre.

CREATE TABLE IF NOT EXISTS public.track_chat_messages (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id    UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  version_id  UUID REFERENCES public.versions(id) ON DELETE SET NULL,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL CHECK (length(content) > 0),
  source      TEXT NOT NULL DEFAULT 'site' CHECK (source IN ('site', 'plugin')),
  meta        JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS track_chat_messages_thread_idx
  ON public.track_chat_messages (user_id, track_id, created_at, id);

ALTER TABLE public.track_chat_messages ENABLE ROW LEVEL SECURITY;

-- Lecture : uniquement son propre fil.
DROP POLICY IF EXISTS track_chat_select_own ON public.track_chat_messages;
CREATE POLICY track_chat_select_own ON public.track_chat_messages
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Écriture depuis le navigateur : seulement la charte mastering (message
-- assistant « seed » du site). Les échanges question / réponse sont écrits
-- par le serveur d'API après la réponse du modèle.
DROP POLICY IF EXISTS track_chat_insert_own ON public.track_chat_messages;
CREATE POLICY track_chat_insert_own ON public.track_chat_messages
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND source = 'site');

-- Effacer sa conversation (bouton corbeille du chat).
DROP POLICY IF EXISTS track_chat_delete_own ON public.track_chat_messages;
CREATE POLICY track_chat_delete_own ON public.track_chat_messages
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── Reprise de l'historique existant ───────────────────────────────────
-- Un message par élément de versions.chat_history, dans l'ordre : versions
-- de la plus ancienne à la plus récente, puis position dans le tableau.
-- created_at = création de la version + 1 s par message (ordre stable).
-- Rejouable : ne fait rien si le titre a déjà des messages repris.
INSERT INTO public.track_chat_messages
  (user_id, track_id, version_id, role, content, source, meta, created_at)
SELECT
  t.user_id,
  v.track_id,
  v.id,
  e.elem->>'role',
  e.elem->>'content',
  'site',
  CASE WHEN e.elem ? '_seed'
       THEN jsonb_build_object('seed', e.elem->>'_seed', 'migrated', true)
       ELSE jsonb_build_object('migrated', true) END,
  COALESCE(v.created_at, now()) + make_interval(secs => e.ord)
FROM public.versions v
JOIN public.tracks t ON t.id = v.track_id
CROSS JOIN LATERAL jsonb_array_elements(v.chat_history) WITH ORDINALITY AS e(elem, ord)
WHERE jsonb_typeof(v.chat_history) = 'array'
  AND t.user_id IS NOT NULL
  AND e.elem->>'role' IN ('user', 'assistant')
  AND COALESCE(e.elem->>'content', '') <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.track_chat_messages m
    WHERE m.track_id = v.track_id AND (m.meta->>'migrated')::boolean IS TRUE
  )
ORDER BY v.created_at NULLS FIRST, e.ord;
