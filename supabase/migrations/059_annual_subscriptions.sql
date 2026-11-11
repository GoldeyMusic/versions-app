-- 059_annual_subscriptions.sql
-- Abonnements annuels Solo / Indie / Pro (2026-11-11).
--
-- Un abonné annuel paie une fois par an (prix Stripe recurring.interval =
-- 'year', 2 mois offerts) mais reçoit ses analyses CHAQUE MOIS, comme un
-- abonné mensuel :
--   - la 1re enveloppe est livrée par le webhook invoice.paid
--     (versions-api/api/_billing.js, handleSubscriptionInvoice) ;
--   - les 11 suivantes par grant_annual_monthly_credits(), lancée toutes les
--     heures par pg_cron. Tout se passe en base : aucune dépendance au
--     serveur d'API ni à Stripe pour ces 11 livraisons.
--
-- Champs ajoutés à user_credits :
--   sub_interval      'month' | 'year' (NULL = pas d'abonnement)
--   sub_period_start  début de la période Stripe payée
--   sub_period_end    fin de la période Stripe payée (prochaine facture)
-- monthly_renews_at garde son sens « prochaine enveloppe de crédits » :
-- fin de période en mensuel, échéance mensuelle suivante en annuel.
--
-- Idempotence : chaque enveloppe porte une clé unique dans
-- credit_events.stripe_event_id ('annual_grant:<sub>:<début période>:<k>').
-- Relancer la fonction ne crédite jamais deux fois ; une échéance manquée
-- (tâche en panne) est rattrapée au passage suivant.

ALTER TABLE public.user_credits
  ADD COLUMN IF NOT EXISTS sub_interval TEXT,
  ADD COLUMN IF NOT EXISTS sub_period_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sub_period_end TIMESTAMPTZ;

ALTER TABLE public.user_credits DROP CONSTRAINT IF EXISTS user_credits_sub_interval_check;
ALTER TABLE public.user_credits ADD CONSTRAINT user_credits_sub_interval_check
  CHECK (sub_interval IS NULL OR sub_interval IN ('month', 'year'));

-- Abonnés existants : tous mensuels à cette date.
UPDATE public.user_credits
   SET sub_interval = 'month',
       sub_period_end = monthly_renews_at
 WHERE COALESCE(monthly_grant, 0) > 0
   AND sub_interval IS NULL;

-- ── Livraison mensuelle des abonnés annuels ────────────────────────────
CREATE OR REPLACE FUNCTION public.grant_annual_monthly_credits()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r RECORD;
  k INTEGER;
  due_at TIMESTAMPTZ;
  next_at TIMESTAMPTZ;
  ev_key TEXT;
  inserted INTEGER;
  n INTEGER := 0;
BEGIN
  FOR r IN
    SELECT user_id, monthly_grant, stripe_subscription_id, sub_period_start, sub_period_end
    FROM public.user_credits
    WHERE sub_interval = 'year'
      AND COALESCE(monthly_grant, 0) > 0
      AND stripe_subscription_id IS NOT NULL
      AND sub_period_start IS NOT NULL
      AND sub_period_end IS NOT NULL
      AND monthly_renews_at IS NOT NULL
      AND monthly_renews_at <= NOW()
    FOR UPDATE SKIP LOCKED
  LOOP
    -- Échéances k = 1..11 : début de période + k mois (la 12e enveloppe est
    -- celle de la facture annuelle suivante, livrée par le webhook).
    next_at := r.sub_period_end;
    FOR k IN 1..11 LOOP
      due_at := r.sub_period_start + make_interval(months => k);
      EXIT WHEN due_at >= r.sub_period_end;
      IF due_at > NOW() THEN
        next_at := due_at;
        EXIT;
      END IF;

      ev_key := 'annual_grant:' || r.stripe_subscription_id || ':'
                || to_char(r.sub_period_start AT TIME ZONE 'UTC', 'YYYYMMDD') || ':' || k;
      INSERT INTO public.credit_events (user_id, delta, reason, stripe_event_id, notes)
      VALUES (r.user_id, r.monthly_grant, 'subscription_grant', ev_key,
              format('Abo annuel - enveloppe mensuelle %s/12', k + 1))
      ON CONFLICT (stripe_event_id) DO NOTHING;
      GET DIAGNOSTICS inserted = ROW_COUNT;

      IF inserted > 0 THEN
        UPDATE public.user_credits
           SET subscription_balance = subscription_balance + r.monthly_grant,
               balance_remaining = balance_remaining + r.monthly_grant,
               updated_at = NOW()
         WHERE user_id = r.user_id;
        n := n + 1;
      END IF;
    END LOOP;

    UPDATE public.user_credits
       SET monthly_renews_at = next_at,
           updated_at = NOW()
     WHERE user_id = r.user_id
       AND monthly_renews_at IS DISTINCT FROM next_at;
  END LOOP;
  RETURN n;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_annual_monthly_credits() FROM PUBLIC, anon, authenticated;

-- ── Plugin : un abonné annuel reste abonné toute l'année payée ─────────
-- Avant : abonné = monthly_grant > 0 et monthly_renews_at pas dépassé de plus
-- de 2 jours. En annuel, monthly_renews_at avance chaque mois via la tâche
-- ci-dessus ; on s'appuie donc aussi sur sub_period_end pour que l'illimité
-- du plugin ne dépende pas de la ponctualité de cette tâche.
CREATE OR REPLACE FUNCTION public.plugin_is_subscriber(p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  select exists (
    select 1 from public.user_credits
    where user_id = p_uid
      and coalesce(monthly_grant, 0) > 0
      and (
        monthly_renews_at is null
        or monthly_renews_at > now() - interval '2 days'
        or (sub_interval = 'year' and sub_period_end is not null
            and sub_period_end > now() - interval '2 days')
      )
  );
$$;

-- Toutes les heures à la minute 7 (pg_cron déjà actif, cf. migrations 032 / 057).
SELECT cron.schedule('grant-annual-monthly-credits', '7 * * * *', $$ SELECT public.grant_annual_monthly_credits(); $$);
