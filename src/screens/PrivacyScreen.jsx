import T from '../constants/theme';

/**
 * PrivacyScreen — Politique de confidentialité (FR).
 * Page publique accessible via `#/privacy`. Style aligné sur la landing
 * (topbar logo, fond transparent au-dessus du halo global, prose centrée).
 */
export default function PrivacyScreen({ onBackToLanding, onGoTerms }) {
  return (
    <div className="legal-screen">
      <LegalStyles />

      <header className="legal-topbar">
        <button
          type="button"
          onClick={onBackToLanding}
          className="legal-topbar-brand"
          aria-label="Retour à l'accueil"
        >
          <img src="/logo-versions-2.svg" alt="" className="legal-topbar-logo" />
          <span className="legal-topbar-wordmark">
            VER<span className="accent">Si</span>ONS
          </span>
        </button>
      </header>

      <main className="legal-main">
        <div className="legal-eyebrow">CONFIDENTIALITÉ</div>
        <h1 className="legal-title">
          Politique de <em>confidentialité</em>
        </h1>
        <p className="legal-updated">Dernière mise à jour : 4 mai 2026</p>

        <p className="legal-lede">
          La présente politique décrit comment Versions collecte, utilise et
          protège vos données personnelles lorsque vous utilisez le service
          accessible à l'adresse www.versions.studio.
        </p>

        <section className="legal-section">
          <h2>1. Identité de l'éditeur</h2>
          <p>
            Le service Versions est édité par David Berdugo, exerçant en
            auto-entreprise sous la dénomination <strong>Multicolorz</strong>,
            immatriculée en France sous le SIRET 819 747 296.
          </p>
          <p>
            Contact : <a href="mailto:contact@versions.studio">contact@versions.studio</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Données collectées et finalités</h2>
          <p>Nous collectons uniquement les données nécessaires au fonctionnement du service :</p>
          <ul>
            <li>
              <strong>Adresse e-mail</strong> — transmise par Google lors de
              l'authentification OAuth, utilisée pour identifier votre compte
              et vous envoyer les communications relatives au service.
            </li>
            <li>
              <strong>Fichiers audio</strong> — les pistes que vous importez
              pour analyse (mix ou master) sont stockées sur Supabase Storage
              afin de permettre leur lecture, leur analyse par notre moteur
              et l'affichage de vos fiches d'analyse.
            </li>
            <li>
              <strong>Données d'analyse</strong> — résultats produits par le
              moteur d'analyse (scores, diagnostics, métriques DSP),
              conservés pour vous permettre de consulter et comparer vos
              versions dans le temps.
            </li>
            <li>
              <strong>Préférences utilisateur</strong> — DAW utilisé, langue
              d'interface, intentions artistiques, paramètres de votre profil.
            </li>
            <li>
              <strong>Données de paiement</strong> — gérées intégralement par
              Stripe ; nous ne stockons aucune donnée bancaire sur nos
              serveurs. Stripe nous communique uniquement le statut des
              transactions (réussite, échec, abonnement actif).
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>3. Base légale du traitement</h2>
          <p>Les traitements sont fondés sur :</p>
          <ul>
            <li>
              <strong>L'exécution du contrat</strong> qui vous lie à Versions
              lorsque vous créez un compte et utilisez le service (article
              6.1.b du RGPD) — c'est la base légale principale pour la
              gestion du compte, le stockage des fichiers audio et la
              génération des analyses.
            </li>
            <li>
              <strong>Votre consentement</strong> (article 6.1.a du RGPD)
              pour l'authentification via Google, recueilli au moment de la
              connexion OAuth.
            </li>
            <li>
              <strong>Les obligations légales</strong> applicables à
              l'éditeur (article 6.1.c), notamment en matière comptable et
              fiscale pour les transactions Stripe.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>4. Hébergement et sous-traitants</h2>
          <p>
            Versions s'appuie sur des prestataires techniques tiers qui
            agissent en qualité de sous-traitants au sens du RGPD :
          </p>
          <ul>
            <li>
              <strong>Vercel</strong> — hébergement de l'application front-end.
            </li>
            <li>
              <strong>Railway</strong> — hébergement du backend d'analyse.
            </li>
            <li>
              <strong>Supabase</strong> — base de données et stockage des
              fichiers audio.
            </li>
            <li>
              <strong>Stripe</strong> — traitement des paiements.
            </li>
            <li>
              <strong>Google</strong> — fournisseur d'identité OAuth utilisé
              pour la connexion.
            </li>
            <li>
              <strong>Anthropic</strong> — fournisseur du modèle Claude
              utilisé pour générer les analyses textuelles. Les fichiers
              audio ne sont pas envoyés à Anthropic ; seuls les indicateurs
              extraits par notre moteur d'analyse interne sont transmis.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>5. Durée de conservation</h2>
          <ul>
            <li>
              <strong>Compte utilisateur, fichiers audio et analyses</strong>{' '}
              — conservés tant que votre compte est actif, puis 30 jours
              après la suppression du compte. Vous pouvez supprimer chaque
              titre individuellement depuis votre tableau de bord à tout
              moment.
            </li>
            <li>
              <strong>Données de facturation</strong> — conservées 10 ans
              conformément aux obligations comptables françaises.
            </li>
            <li>
              <strong>Logs techniques</strong> — conservés au maximum 12
              mois à des fins de sécurité et de débogage.
            </li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>6. Vos droits</h2>
          <p>
            Conformément au Règlement Général sur la Protection des Données
            (RGPD) et à la loi Informatique et Libertés, vous disposez des
            droits suivants sur vos données personnelles :
          </p>
          <ul>
            <li><strong>Droit d'accès</strong> — obtenir une copie des données que nous détenons sur vous.</li>
            <li><strong>Droit de rectification</strong> — corriger toute donnée inexacte ou incomplète.</li>
            <li><strong>Droit à l'effacement</strong> — demander la suppression de vos données.</li>
            <li><strong>Droit à la portabilité</strong> — récupérer vos données dans un format structuré et lisible par machine.</li>
            <li><strong>Droit d'opposition</strong> — vous opposer à un traitement spécifique.</li>
            <li><strong>Droit de retirer votre consentement</strong> à tout moment, sans que cela compromette la licéité des traitements antérieurs.</li>
          </ul>
          <p>
            Pour exercer ces droits, écrivez-nous à{' '}
            <a href="mailto:contact@versions.studio">contact@versions.studio</a>.
            Vous disposez également du droit d'introduire une réclamation
            auprès de la CNIL (www.cnil.fr).
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Cookies</h2>
          <p>
            Versions n'utilise <strong>pas de cookies de tracking ni de
            publicité</strong>. Seuls des cookies strictement nécessaires
            au fonctionnement du service sont déposés sur votre appareil :
          </p>
          <ul>
            <li>Un cookie de session lié à votre authentification.</li>
            <li>Des éléments de stockage local (localStorage) pour mémoriser vos préférences (langue, DAW, paramètres d'interface).</li>
          </ul>
          <p>
            Ces traceurs étant strictement nécessaires à la fourniture du
            service, ils ne requièrent pas de consentement préalable
            conformément aux recommandations de la CNIL.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Sécurité</h2>
          <p>
            Toutes les communications entre votre navigateur et nos
            serveurs sont chiffrées via HTTPS. L'accès à vos fichiers audio
            est protégé par les politiques de sécurité (Row Level Security)
            de Supabase, qui garantissent que seul le propriétaire d'un
            fichier peut y accéder.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Modifications</h2>
          <p>
            Nous pouvons être amenés à modifier la présente politique pour
            l'adapter à des évolutions légales ou techniques. Toute
            modification substantielle vous sera notifiée par e-mail ou
            via une bannière dans l'application.
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Contact</h2>
          <p>
            Pour toute question relative à vos données personnelles ou à
            la présente politique :{' '}
            <a href="mailto:contact@versions.studio">contact@versions.studio</a>.
          </p>
        </section>

        <nav className="legal-footer-nav" aria-label="Pages légales">
          {onGoTerms && (
            <button type="button" onClick={onGoTerms} className="legal-link">
              Conditions générales d'utilisation
            </button>
          )}
          {onBackToLanding && (
            <button type="button" onClick={onBackToLanding} className="legal-link">
              Retour à l'accueil
            </button>
          )}
        </nav>
      </main>
    </div>
  );
}

function LegalStyles() {
  return (
    <style>{`
      .legal-screen {
        position: relative; z-index: 1;
        min-height: 100vh; min-height: 100dvh;
        background: transparent;
        color: var(--text, ${T.text});
        font-family: var(--body, ${T.body});
      }

      .legal-topbar {
        padding: 22px 18px;
        display: flex; align-items: center; justify-content: flex-start;
      }
      .legal-topbar-brand {
        display: inline-flex; align-items: center; gap: 8px;
        background: transparent; border: 0; cursor: pointer; padding: 0;
        color: ${T.text};
      }
      .legal-topbar-logo {
        height: 38px; width: auto;
        filter: drop-shadow(0 0 16px rgba(245,166,35,0.18));
      }
      .legal-topbar-wordmark {
        font-family: ${T.body}; font-weight: 700;
        font-size: 27px; letter-spacing: -0.5px;
        color: ${T.text}; line-height: 1;
      }
      .legal-topbar-wordmark .accent { color: ${T.amber}; }

      .legal-main {
        max-width: 700px;
        margin: 0 auto;
        padding: clamp(32px, 6vw, 64px) 24px clamp(64px, 10vw, 120px);
      }

      .legal-eyebrow {
        font-family: ${T.mono};
        font-size: 11px; font-weight: 500;
        letter-spacing: 2px; text-transform: uppercase;
        color: ${T.amber};
        margin-bottom: 16px;
      }
      .legal-title {
        font-family: ${T.body};
        font-weight: 600;
        font-size: clamp(32px, 4.6vw, 48px);
        line-height: 1.15; letter-spacing: -0.8px;
        color: ${T.text};
        margin: 0 0 12px;
      }
      .legal-title em {
        font-style: normal;
        color: ${T.amber};
      }
      .legal-updated {
        font-family: ${T.mono};
        font-size: 11px; font-weight: 400;
        letter-spacing: 1.4px; text-transform: uppercase;
        color: ${T.muted};
        margin: 0 0 32px;
      }
      .legal-lede {
        font-size: 17px; line-height: 1.6;
        color: ${T.textSoft};
        margin: 0 0 40px;
      }

      .legal-section {
        margin-bottom: 32px;
      }
      .legal-section h2 {
        font-family: ${T.body};
        font-weight: 600;
        font-size: 18px; line-height: 1.3;
        letter-spacing: -0.2px;
        color: ${T.text};
        margin: 0 0 12px;
      }
      .legal-section p {
        font-size: 15px; line-height: 1.7;
        color: ${T.textSoft};
        margin: 0 0 12px;
      }
      .legal-section p:last-child { margin-bottom: 0; }
      .legal-section ul {
        margin: 0 0 12px;
        padding-left: 22px;
      }
      .legal-section li {
        font-size: 15px; line-height: 1.7;
        color: ${T.textSoft};
        margin-bottom: 8px;
      }
      .legal-section li:last-child { margin-bottom: 0; }
      .legal-section strong {
        color: ${T.text};
        font-weight: 600;
      }
      .legal-section a {
        color: ${T.amber};
        text-decoration: none;
        border-bottom: 1px solid ${T.amberLine};
        transition: border-color .15s;
      }
      .legal-section a:hover {
        border-bottom-color: ${T.amber};
      }

      .legal-footer-nav {
        margin-top: 56px;
        padding-top: 32px;
        border-top: 1px solid ${T.border};
        display: flex; flex-wrap: wrap; gap: 12px 24px;
      }
      .legal-link {
        font-family: ${T.mono};
        font-size: 11px; font-weight: 500;
        letter-spacing: 1.6px; text-transform: uppercase;
        color: ${T.muted};
        background: transparent; border: 0;
        padding: 0;
        cursor: pointer;
        transition: color .15s;
      }
      .legal-link:hover { color: ${T.amber}; }

      @media (max-width: 768px) {
        .legal-main { padding: 32px 20px 80px; }
        .legal-title { font-size: 30px; }
        .legal-lede { font-size: 16px; }
        .legal-section h2 { font-size: 17px; }
      }
    `}</style>
  );
}
