import T from '../constants/theme';

/**
 * TermsScreen — Conditions générales d'utilisation (FR).
 * Page publique accessible via `#/terms`. Style aligné sur PrivacyScreen
 * (mêmes classes .legal-* — un seul écran monté à la fois, pas de conflit).
 */
export default function TermsScreen({ onBackToLanding, onGoPrivacy }) {
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
        <div className="legal-eyebrow">CGU</div>
        <h1 className="legal-title">
          Conditions générales <em>d'utilisation</em>
        </h1>
        <p className="legal-updated">Dernière mise à jour : 4 mai 2026</p>

        <p className="legal-lede">
          Les présentes conditions générales d'utilisation (« CGU »)
          régissent l'accès et l'utilisation du service Versions, accessible
          à l'adresse www.versions.studio. En créant un compte ou en
          utilisant le service, vous acceptez sans réserve les présentes CGU.
        </p>

        <section className="legal-section">
          <h2>1. Objet du service</h2>
          <p>
            Versions est un service en ligne d'analyse de mix audio par
            intelligence artificielle. Il permet à un utilisateur d'importer
            une piste audio (mix ou master), d'obtenir une analyse
            détaillée — équilibre fréquentiel, dynamique, stéréo, qualité
            d'écoute — sous forme d'une fiche, et de comparer les versions
            successives d'un même titre.
          </p>
          <p>
            Le service est destiné à un usage professionnel ou personnel
            dans le cadre du processus créatif et technique de production
            musicale. Il ne constitue pas une prestation de mastering ni un
            avis d'ingénieur du son certifié.
          </p>
        </section>

        <section className="legal-section">
          <h2>2. Éditeur</h2>
          <p>
            Le service est édité par David Berdugo, exerçant en
            auto-entreprise sous la dénomination <strong>Multicolorz</strong>,
            immatriculée en France.
          </p>
          <p>
            Contact :{' '}
            <a href="mailto:berdugo.david@gmail.com">berdugo.david@gmail.com</a>
          </p>
        </section>

        <section className="legal-section">
          <h2>3. Inscription et compte utilisateur</h2>
          <p>
            L'accès au service nécessite la création d'un compte via
            l'authentification Google OAuth. Vous garantissez l'exactitude
            des informations transmises et vous engagez à maintenir la
            confidentialité de vos identifiants.
          </p>
          <p>
            Le compte est strictement personnel. Vous êtes seul responsable
            de toute activité réalisée depuis votre compte. Vous devez nous
            informer immédiatement de toute utilisation non autorisée.
          </p>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis vos
            réglages ou en nous contactant à{' '}
            <a href="mailto:berdugo.david@gmail.com">berdugo.david@gmail.com</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2>4. Crédits, abonnement et facturation</h2>
          <p>
            Le service fonctionne sur un système de crédits. Chaque analyse
            consomme un crédit. Les crédits peuvent être obtenus :
          </p>
          <ul>
            <li>
              <strong>Via un abonnement mensuel</strong> — un nombre de
              crédits est attribué chaque mois et expire à la fin de la
              période d'abonnement.
            </li>
            <li>
              <strong>Via l'achat de packs ponctuels</strong> — les crédits
              packs sont cumulables et n'expirent pas tant que votre compte
              reste actif.
            </li>
          </ul>
          <p>
            Les paiements sont traités par Stripe. Aucune donnée bancaire
            n'est stockée sur nos serveurs. Les prix indiqués sont en euros,
            toutes taxes comprises lorsque applicables.
          </p>
          <p>
            Conformément à l'article L221-28 du Code de la consommation,
            vous renoncez à votre droit de rétractation pour les services
            numériques fournis immédiatement après votre commande. Cette
            renonciation est expressément acceptée au moment de la
            souscription.
          </p>
          <p>
            Vous pouvez résilier votre abonnement à tout moment depuis vos
            réglages. La résiliation prend effet à la fin de la période en
            cours ; aucun remboursement prorata temporis n'est effectué.
          </p>
        </section>

        <section className="legal-section">
          <h2>5. Propriété intellectuelle</h2>
          <p>
            <strong>Vos fichiers audio restent votre propriété exclusive.</strong>{' '}
            Vous conservez l'ensemble des droits d'auteur, droits voisins
            et droits sur les masters relatifs aux pistes que vous importez.
            Versions ne revendique aucun droit sur vos œuvres.
          </p>
          <p>
            En important une piste, vous nous accordez uniquement la licence
            limitée, non exclusive et révocable nécessaire au stockage, à la
            lecture et à l'analyse technique du fichier dans le cadre du
            service. Cette licence prend fin lorsque vous supprimez la
            piste ou votre compte.
          </p>
          <p>
            Les fiches d'analyse générées par Versions, ainsi que les
            éléments de l'interface (textes, graphismes, logos, code), sont
            la propriété de l'éditeur et protégés par le droit de la
            propriété intellectuelle. Vous pouvez librement utiliser le
            contenu des fiches pour vos propres besoins de production, mais
            vous ne pouvez pas reproduire ou distribuer publiquement
            l'interface ou le service sans autorisation.
          </p>
          <p>
            Vous garantissez détenir l'ensemble des droits nécessaires sur
            les fichiers que vous importez et vous engagez à ne pas
            soumettre de contenu portant atteinte aux droits de tiers.
          </p>
        </section>

        <section className="legal-section">
          <h2>6. Disponibilité et responsabilité</h2>
          <p>
            Nous mettons tout en œuvre pour garantir la disponibilité du
            service, sans toutefois pouvoir l'assurer sans interruption.
            Des opérations de maintenance, des incidents techniques ou des
            facteurs externes peuvent entraîner des indisponibilités
            temporaires.
          </p>
          <p>
            Les analyses produites par Versions sont fournies à titre
            indicatif. Elles ne sauraient se substituer à l'avis d'un
            ingénieur du son et n'engagent pas l'éditeur sur le résultat
            final d'une production. La décision artistique et technique
            finale vous appartient.
          </p>
          <p>
            La responsabilité de l'éditeur ne saurait être engagée pour les
            dommages indirects (perte de données, perte de chance, manque à
            gagner) résultant de l'utilisation du service. La responsabilité
            globale de l'éditeur est en tout état de cause limitée au
            montant payé par l'utilisateur au cours des douze (12) derniers
            mois.
          </p>
        </section>

        <section className="legal-section">
          <h2>7. Usage acceptable</h2>
          <p>Vous vous engagez à ne pas :</p>
          <ul>
            <li>importer de contenu illicite, contrefaisant ou portant atteinte aux droits de tiers ;</li>
            <li>tenter d'accéder à des comptes ou ressources qui ne vous appartiennent pas ;</li>
            <li>perturber le fonctionnement du service ou d'en contourner les protections techniques ;</li>
            <li>extraire massivement ou automatiquement le contenu du service à des fins commerciales sans autorisation ;</li>
            <li>utiliser le service pour entraîner des modèles d'intelligence artificielle tiers.</li>
          </ul>
          <p>
            Tout manquement peut entraîner la suspension ou la résiliation
            de votre compte, sans préjudice des actions en réparation que
            l'éditeur pourrait engager.
          </p>
        </section>

        <section className="legal-section">
          <h2>8. Données personnelles</h2>
          <p>
            Le traitement de vos données personnelles est décrit en détail
            dans notre{' '}
            {onGoPrivacy ? (
              <button type="button" onClick={onGoPrivacy} className="legal-inline-link">
                politique de confidentialité
              </button>
            ) : (
              <span>politique de confidentialité</span>
            )}
            . Nous traitons vos données dans le respect du RGPD et de la loi
            Informatique et Libertés.
          </p>
        </section>

        <section className="legal-section">
          <h2>9. Résiliation</h2>
          <p>
            Vous pouvez cesser d'utiliser le service et supprimer votre
            compte à tout moment. L'éditeur peut suspendre ou résilier
            l'accès d'un utilisateur en cas de manquement aux présentes
            CGU, après notification lorsque cela est raisonnablement
            possible.
          </p>
          <p>
            En cas de résiliation, les fichiers audio et données associées
            sont supprimés sous 30 jours, sous réserve des obligations
            légales de conservation (comptabilité, fiscalité).
          </p>
        </section>

        <section className="legal-section">
          <h2>10. Modifications des CGU</h2>
          <p>
            Les présentes CGU peuvent être modifiées pour refléter
            l'évolution du service ou du cadre légal. Toute modification
            substantielle vous sera notifiée par e-mail ou via une bannière
            dans l'application. La poursuite de l'utilisation du service
            après notification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section className="legal-section">
          <h2>11. Droit applicable et juridiction</h2>
          <p>
            Les présentes CGU sont soumises au droit français. À défaut de
            résolution amiable, tout litige relatif à leur exécution ou à
            leur interprétation sera soumis aux tribunaux français
            compétents, sauf disposition légale impérative contraire.
          </p>
          <p>
            Conformément aux articles L611-1 et suivants du Code de la
            consommation, les utilisateurs consommateurs peuvent recourir à
            un médiateur de la consommation ou utiliser la plateforme
            européenne de règlement en ligne des litiges accessible à
            l'adresse https://ec.europa.eu/consumers/odr.
          </p>
        </section>

        <section className="legal-section">
          <h2>12. Contact</h2>
          <p>
            Pour toute question relative aux présentes CGU :{' '}
            <a href="mailto:berdugo.david@gmail.com">berdugo.david@gmail.com</a>.
          </p>
        </section>

        <nav className="legal-footer-nav" aria-label="Pages légales">
          {onGoPrivacy && (
            <button type="button" onClick={onGoPrivacy} className="legal-link">
              Politique de confidentialité
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
      .legal-section a,
      .legal-inline-link {
        color: ${T.amber};
        text-decoration: none;
        border: 0;
        background: transparent;
        padding: 0;
        font: inherit;
        cursor: pointer;
        border-bottom: 1px solid ${T.amberLine};
        transition: border-color .15s;
      }
      .legal-section a:hover,
      .legal-inline-link:hover {
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
