-- 015_recompute_fadr_costs.sql
-- Recalcul rétroactif des colonnes fadr_eur, infra_eur, total_eur dans
-- analysis_cost_logs après changement du modèle de coût Fadr.
--
-- Avant : Fadr facturé en forfait fixe 0,20 € par analyse + infra 0,02 €.
-- Après : Fadr facturé à la durée audio (audio_duration_sec / 60) × 0,046 €
--         (≈ $0.05/min, le tarif réel Create Stem Task de Fadr API).
--         Infra mise à 0 (Vercel + Supabase = forfaits fixes, pas marginaux).
--
-- Les tokens loggés (gemini_*_tokens, claude_*_tokens) et les coûts par
-- modèle (gemini_eur, claude_eur) restent inchangés — seul le bloc Fadr
-- est ré-évalué selon la durée audio enregistrée.
--
-- Marge de sécurité de +5 % conservée (cf. SAFETY_MARGIN_PCT dans costTracker.js).

UPDATE public.analysis_cost_logs
SET
  fadr_eur = ROUND((
    CASE
      WHEN fadr_called AND audio_duration_sec IS NOT NULL
      THEN (audio_duration_sec / 60.0) * 0.046
      ELSE 0
    END
  )::numeric, 4),
  infra_eur = 0,
  total_eur = ROUND((
    (
      COALESCE(gemini_eur, 0) + COALESCE(claude_eur, 0) +
      CASE
        WHEN fadr_called AND audio_duration_sec IS NOT NULL
        THEN (audio_duration_sec / 60.0) * 0.046
        ELSE 0
      END
    ) * 1.05
  )::numeric, 4);
