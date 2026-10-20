-- ════════════════════════════════════════════════════════════════════
-- 054 — Textes de la carte « Nouvelles d'Archipel Audio » du tableau de
-- bord (src/components/ArchipelConsentToast.jsx), proposée aux comptes
-- qui n'ont encore fait aucun choix. Contexte 'account' : la réponse passe
-- par archipel_set_preference(), qui vérifie la version publiée.
-- Toute modification du texte = nouvelle version (ne jamais réutiliser).
-- Idempotent.
-- ════════════════════════════════════════════════════════════════════

INSERT INTO public.archipel_text_versions (version, context, locale, body) VALUES
  ('toast-fr-2026-10-A', 'account', 'fr',
   'Versions fait partie de la famille Archipel Audio. Tu veux recevoir de temps en temps nos autres outils pour musiciens ? — Par email · désinscription en un clic · [lien : Confidentialité] — Boutons de même poids, aucun présélectionné : [Non merci] [Oui, volontiers]'),
  ('toast-en-2026-10-A', 'account', 'en',
   'Versions is part of the Archipel Audio family. Would you like to receive our other tools for musicians now and then? — By email · one-click unsubscribe · [link: Privacy] — Equal-weight buttons, none preselected: [No thanks] [Yes, please]')
ON CONFLICT (version) DO NOTHING;
