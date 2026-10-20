-- ════════════════════════════════════════════════════════════════════
-- 053 — Ligne « Versions est édité par Archipel Audio » dans les deux
-- emails envoyés directement par la base (via Resend + pg_net) :
--   - notify_owner_on_comment() : nouveau commentaire sur une fiche ;
--   - create_project_invite()   : invitation à collaborer.
--
-- On ne réécrit pas les fonctions : on lit leur définition en prod,
-- on insère la ligne après le dernier paragraphe du pied de page, et on
-- la ré-exécute. Idempotent (no-op si archipelaudio.com est déjà présent),
-- et échoue bruyamment si l'ancre n'est plus trouvée.
-- Même ligne que lib/emailFooter.js côté versions-api.
-- ════════════════════════════════════════════════════════════════════

DO $do$
DECLARE
  d      text;
  anchor text;
  line   text := $l$<p style="font-size:11px;color:#6c6c76;margin-top:6px">Versions est édité par <a href="https://www.archipelaudio.com" style="color:#6c6c76;text-decoration:underline">Archipel Audio</a>.</p>$l$;
BEGIN
  d := pg_get_functiondef('public.notify_owner_on_comment()'::regprocedure);
  IF position('archipelaudio.com' in d) = 0 THEN
    anchor := $a$une de tes fiches Versions.</p>'$a$;
    IF position(anchor in d) = 0 THEN
      RAISE EXCEPTION 'anchor not found in notify_owner_on_comment';
    END IF;
    d := replace(d, anchor, $a$une de tes fiches Versions.</p>$a$ || line || $a$'$a$);
    EXECUTE d;
  END IF;

  d := pg_get_functiondef('public.create_project_invite(uuid, text, text, text, uuid)'::regprocedure);
  IF position('archipelaudio.com' in d) = 0 THEN
    anchor := $a$Lien valable 14 jours.</p>'$a$;
    IF position(anchor in d) = 0 THEN
      RAISE EXCEPTION 'anchor not found in create_project_invite';
    END IF;
    d := replace(d, anchor, $a$Lien valable 14 jours.</p>$a$ || line || $a$'$a$);
    EXECUTE d;
  END IF;
END
$do$;
