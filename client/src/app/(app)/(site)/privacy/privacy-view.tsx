'use client';

import { SitePage } from '@/components/site-page';
import { useI18n } from '@/lib/i18n';
import { LEGAL_UPDATED, SUPPORT_EMAIL } from '@/lib/legal';

export function PrivacyView() {
  const { locale, t } = useI18n();
  return (
    <SitePage title={t('legalNav.privacy')}>
      {locale === 'fr' ? <French /> : <English />}
    </SitePage>
  );
}

function English() {
  return (
    <>
      <p>Last updated: {LEGAL_UPDATED}</p>
      <p>
        This Privacy Policy explains how Fringo (“Fringo”, “we”, “us”) collects, uses, shares, and
        protects personal information when you use our website and learning platform (the
        “Service”). It should be read with our <a href="/terms">Terms of Service</a> and{' '}
        <a href="/cookies">Cookie Policy</a>.
      </p>
      <p>
        Depending on where you live, Fringo is the controller of personal data processed through
        the hosted Service. If we cannot reasonably provide the Service without certain data
        (for example an account identifier), we will tell you, and you may choose not to use
        those features.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Account information</h3>
      <p>
        When you register, we collect identifiers such as username and a hashed password. If you
        use Google Sign-In, we receive the identifiers Google provides (typically a Google account
        id, email address, and display name) as permitted by your Google settings.
      </p>
      <h3>Learning information</h3>
      <p>
        We collect placement answers, reading and writing responses, scores, streaks, XP, level
        progress, and related session metadata so practice can continue across visits and so we
        can generate feedback and reports.
      </p>
      <h3>Settings and device data</h3>
      <p>
        We store preferences you choose (for example theme). Servers may log technical information
        such as timestamps, IP address, browser type, request path, and error diagnostics needed
        to operate and secure the Service. We do not use advertising cookies or sell personal
        information.
      </p>
      <h3>Payment information</h3>
      <p>
        If you subscribe to a paid plan, payment card details are processed by our payment
        processor. We typically receive billing status, plan type, and limited transaction
        metadata — not your full card number.
      </p>
      <h3>Communications</h3>
      <p>
        If you email us, we keep the content of that correspondence as needed to respond and
        keep a support record.
      </p>

      <h2>2. How we use information</h2>
      <p>We use personal information to:</p>
      <ul>
        <li>Create and authenticate your account</li>
        <li>Provide placement, practice, scoring, feedback, streaks, and progress features</li>
        <li>Process subscriptions, cancellations, and refunds</li>
        <li>Apply your settings and keep you signed in</li>
        <li>Secure the Service, prevent abuse, and debug outages</li>
        <li>Send service messages (for example security or billing notices)</li>
        <li>Comply with law and enforce our Terms</li>
        <li>Improve the product in aggregated or de-identified form where practical</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal information and we do not share it for
        cross-context behavioral advertising.
      </p>

      <h2>3. Legal bases (EEA/UK and similar)</h2>
      <p>Where a legal basis is required, we rely on:</p>
      <ul>
        <li>
          <strong>Contract</strong> — to provide the Service you requested (account, lessons,
          paid plans)
        </li>
        <li>
          <strong>Legitimate interests</strong> — to secure, maintain, and improve the Service,
          provided those interests are not overridden by your rights
        </li>
        <li>
          <strong>Consent</strong> — where we ask for it (and you may withdraw it)
        </li>
        <li>
          <strong>Legal obligation</strong> — where we must retain or disclose information to
          comply with law
        </li>
      </ul>

      <h2>4. How we share information</h2>
      <p>We share information only as needed to operate Fringo:</p>
      <ul>
        <li>
          <strong>Processors</strong> — hosting, database, authentication, email, AI model, and
          payment providers that process data on our instructions
        </li>
        <li>
          <strong>AI providers</strong> — prompts and relevant User Content may be sent to model
          providers when you use AI-assisted features, under their terms and privacy policies
        </li>
        <li>
          <strong>Legal</strong> — if required by law, valid legal process, or to protect rights,
          safety, and the integrity of the Service
        </li>
        <li>
          <strong>Business transfer</strong> — in connection with a merger, acquisition, or sale
          of assets, subject to appropriate confidentiality
        </li>
      </ul>
      <p>
        We do not allow processors to use your learning content for their own advertising. Model
        providers may process prompts under their own policies; we configure them for product
        functionality, not ads.
      </p>

      <h2>5. International transfers</h2>
      <p>
        We and our processors may process data in countries other than your own, including the
        United States or other locations where our vendors operate. Where required, we use
        appropriate safeguards such as standard contractual clauses or vendor terms that provide
        a comparable level of protection.
      </p>

      <h2>6. Retention</h2>
      <p>
        We keep account and learning data while your account is active so you can resume practice
        and we can provide reports. After deletion or prolonged inactivity, we delete or
        de-identify personal data within a reasonable period, unless a longer retention is
        required for billing, dispute, security, or legal reasons (for example tax records for
        paid transactions).
      </p>

      <h2>7. Security</h2>
      <p>
        We use reasonable technical and organizational measures (including hashed passwords,
        access controls, and encrypted transport) to protect personal information. No method of
        transmission or storage is 100% secure. You are responsible for using a strong unique
        password and for activity on your devices.
      </p>

      <h2>8. Your rights</h2>
      <p>
        Depending on your location (including the EEA, UK, Canada, and certain US states), you
        may have the right to:
      </p>
      <ul>
        <li>Access a copy of personal data we hold about you</li>
        <li>Correct inaccurate data</li>
        <li>Delete your account and associated personal data</li>
        <li>Object to or restrict certain processing</li>
        <li>Receive a portable copy of data you provided</li>
        <li>Withdraw consent where processing is based on consent</li>
        <li>Appeal a denial of a privacy request, where the law provides that right</li>
        <li>Lodge a complaint with a data protection authority</li>
      </ul>
      <p>
        To exercise these rights, email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. We may need to verify your
        identity before fulfilling a request. Some rights are limited where we must keep data
        for legal, security, or billing reasons.
      </p>
      <p>
        If you are a California resident, you have the right to know, delete, and correct
        personal information, and to opt out of “sale” or “sharing” as those terms are defined
        under California law. Fringo does not sell or share personal information as those terms
        are defined. We will not discriminate against you for exercising privacy rights.
      </p>

      <h2>9. Children</h2>
      <p>
        The Service is not directed to children under 13, and we do not knowingly collect
        personal information from children under 13. If you believe we have, contact us and we
        will delete it. Users between 13 and 18 should use Fringo only with parental consent.
      </p>

      <h2>10. Automated processing</h2>
      <p>
        Placement scores and writing feedback may be generated automatically. These outputs are
        learning aids, not legally or similarly significant decisions about you (such as exam
        certification or immigration determinations). You can contact us if you believe a stored
        score is wrong.
      </p>

      <h2>11. Do Not Track</h2>
      <p>
        The Service does not currently respond to browser Do Not Track signals. We do not use
        third-party advertising trackers.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update this Policy from time to time. The “Last updated” date will change, and
        material updates may be announced by email or in-product notice. Continued use after an
        update means you acknowledge the revised Policy.
      </p>

      <h2>13. Contact</h2>
      <p>
        Privacy questions and data requests:{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </>
  );
}

function French() {
  return (
    <>
      <p>Dernière mise à jour : {LEGAL_UPDATED}</p>
      <p>
        La présente Politique de confidentialité explique comment Fringo (« Fringo », « nous »)
        collecte, utilise, partage et protège les informations personnelles lorsque vous utilisez
        notre site web et notre plateforme d’apprentissage (le « Service »). Elle doit être lue
        conjointement avec nos <a href="/terms">Conditions d’utilisation</a> et notre{' '}
        <a href="/cookies">Politique relative aux cookies</a>.
      </p>
      <p>
        Selon votre lieu de résidence, Fringo est le responsable du traitement des données
        personnelles traitées via le Service hébergé. Si nous ne pouvons raisonnablement fournir
        le Service sans certaines données (par exemple un identifiant de compte), nous vous en
        informerons, et vous pourrez choisir de ne pas utiliser ces fonctionnalités.
      </p>

      <h2>1. Informations que nous collectons</h2>
      <h3>Informations de compte</h3>
      <p>
        Lors de l’inscription, nous collectons des identifiants tels qu’un nom d’utilisateur et
        un mot de passe haché. Si vous utilisez Google Sign-In, nous recevons les identifiants
        fournis par Google (en général un identifiant de compte Google, une adresse e-mail et un
        nom affiché), conformément à vos paramètres Google.
      </p>
      <h3>Informations d’apprentissage</h3>
      <p>
        Nous collectons les réponses au test de niveau, les réponses de lecture et d’écriture,
        les scores, les séries, l’XP, la progression de niveau et les métadonnées de session
        associées, afin que la pratique puisse se poursuivre d’une visite à l’autre et que nous
        puissions générer des retours et des rapports.
      </p>
      <h3>Paramètres et données d’appareil</h3>
      <p>
        Nous enregistrons les préférences que vous choisissez (par exemple le thème). Les
        serveurs peuvent consigner des informations techniques telles que des horodatages,
        l’adresse IP, le type de navigateur, le chemin de la requête et des diagnostics d’erreur
        nécessaires pour exploiter et sécuriser le Service. Nous n’utilisons pas de cookies
        publicitaires et ne vendons pas d’informations personnelles.
      </p>
      <h3>Informations de paiement</h3>
      <p>
        Si vous souscrivez une offre payante, les données de carte de paiement sont traitées par
        notre prestataire de paiement. Nous recevons généralement le statut de facturation, le
        type d’offre et des métadonnées de transaction limitées — pas votre numéro de carte
        complet.
      </p>
      <h3>Communications</h3>
      <p>
        Si vous nous écrivez, nous conservons le contenu de cette correspondance dans la mesure
        nécessaire pour répondre et tenir un dossier d’assistance.
      </p>

      <h2>2. Comment nous utilisons les informations</h2>
      <p>Nous utilisons les informations personnelles pour :</p>
      <ul>
        <li>Créer et authentifier votre compte</li>
        <li>Fournir le test de niveau, la pratique, la notation, les retours, les séries et les fonctionnalités de progression</li>
        <li>Traiter les abonnements, résiliations et remboursements</li>
        <li>Appliquer vos paramètres et vous maintenir connecté</li>
        <li>Sécuriser le Service, prévenir les abus et diagnostiquer les pannes</li>
        <li>Envoyer des messages de service (par exemple avis de sécurité ou de facturation)</li>
        <li>Respecter la loi et faire appliquer nos Conditions</li>
        <li>Améliorer le produit sous forme agrégée ou dé-identifiée lorsque c’est possible</li>
      </ul>
      <p>
        Nous <strong>ne</strong> vendons <strong>pas</strong> vos informations personnelles et
        nous ne les partageons pas à des fins de publicité comportementale inter-contextes.
      </p>

      <h2>3. Bases juridiques (EEE/Royaume-Uni et régimes similaires)</h2>
      <p>Lorsqu’une base juridique est requise, nous nous appuyons sur :</p>
      <ul>
        <li>
          <strong>Le contrat</strong> — pour fournir le Service que vous avez demandé (compte,
          leçons, offres payantes)
        </li>
        <li>
          <strong>L’intérêt légitime</strong> — pour sécuriser, maintenir et améliorer le Service,
          pour autant que ces intérêts ne prévalent pas sur vos droits
        </li>
        <li>
          <strong>Le consentement</strong> — lorsque nous le demandons (et vous pouvez le retirer)
        </li>
        <li>
          <strong>L’obligation légale</strong> — lorsque nous devons conserver ou divulguer des
          informations pour nous conformer à la loi
        </li>
      </ul>

      <h2>4. Comment nous partageons les informations</h2>
      <p>Nous partageons des informations uniquement dans la mesure nécessaire pour exploiter Fringo :</p>
      <ul>
        <li>
          <strong>Sous-traitants</strong> — prestataires d’hébergement, de bases de données,
          d’authentification, d’e-mail, de modèles d’IA et de paiement qui traitent les données
          sur nos instructions
        </li>
        <li>
          <strong>Fournisseurs d’IA</strong> — les invites et le Contenu utilisateur pertinent
          peuvent être envoyés aux fournisseurs de modèles lorsque vous utilisez des
          fonctionnalités assistées par IA, selon leurs conditions et politiques de
          confidentialité
        </li>
        <li>
          <strong>Obligations légales</strong> — si la loi, une procédure juridique valide, ou la
          protection des droits, de la sécurité et de l’intégrité du Service l’exigent
        </li>
        <li>
          <strong>Transfert d’entreprise</strong> — dans le cadre d’une fusion, d’une acquisition
          ou d’une vente d’actifs, sous réserve d’une confidentialité appropriée
        </li>
      </ul>
      <p>
        Nous n’autorisons pas les sous-traitants à utiliser votre contenu d’apprentissage pour
        leur propre publicité. Les fournisseurs de modèles peuvent traiter les invites selon
        leurs propres politiques ; nous les configurons pour le fonctionnement du produit, pas
        pour la publicité.
      </p>

      <h2>5. Transferts internationaux</h2>
      <p>
        Nous et nos sous-traitants pouvons traiter des données dans des pays autres que le vôtre,
        y compris les États-Unis ou d’autres lieux où nos prestataires opèrent. Lorsque cela est
        requis, nous utilisons des garanties appropriées telles que des clauses contractuelles
        types ou des conditions de prestataires offrant un niveau de protection comparable.
      </p>

      <h2>6. Conservation</h2>
      <p>
        Nous conservons les données de compte et d’apprentissage tant que votre compte est actif
        afin que vous puissiez reprendre la pratique et que nous puissions fournir des rapports.
        Après suppression ou inactivité prolongée, nous supprimons ou dé-identifions les données
        personnelles dans un délai raisonnable, sauf si une conservation plus longue est requise
        pour des raisons de facturation, de litige, de sécurité ou juridiques (par exemple les
        documents fiscaux des transactions payantes).
      </p>

      <h2>7. Sécurité</h2>
      <p>
        Nous utilisons des mesures techniques et organisationnelles raisonnables (y compris des
        mots de passe hachés, des contrôles d’accès et un transport chiffré) pour protéger les
        informations personnelles. Aucune méthode de transmission ou de stockage n’est sûre à
        100 %. Vous êtes responsable d’utiliser un mot de passe unique et fort, ainsi que de
        l’activité sur vos appareils.
      </p>

      <h2>8. Vos droits</h2>
      <p>
        Selon votre lieu de résidence (y compris l’EEE, le Royaume-Uni, le Canada et certains
        États américains), vous pouvez avoir le droit de :
      </p>
      <ul>
        <li>Accéder à une copie des données personnelles que nous détenons à votre sujet</li>
        <li>Corriger des données inexactes</li>
        <li>Supprimer votre compte et les données personnelles associées</li>
        <li>Vous opposer à certains traitements ou les limiter</li>
        <li>Recevoir une copie portable des données que vous avez fournies</li>
        <li>Retirer votre consentement lorsque le traitement est fondé sur le consentement</li>
        <li>Faire appel d’un refus à une demande de confidentialité, lorsque la loi le prévoit</li>
        <li>Introduire une réclamation auprès d’une autorité de protection des données</li>
      </ul>
      <p>
        Pour exercer ces droits, écrivez à{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Nous pourrons devoir vérifier
        votre identité avant de donner suite. Certains droits sont limités lorsque nous devons
        conserver des données pour des raisons juridiques, de sécurité ou de facturation.
      </p>
      <p>
        Si vous résidez en Californie, vous avez le droit de savoir, de supprimer et de corriger
        les informations personnelles, et de vous opposer à la « vente » ou au « partage » au
        sens du droit californien (CCPA). Fringo ne vend ni ne partage d’informations personnelles
        au sens de ces termes. Nous ne vous discriminerons pas pour l’exercice de vos droits
        relatifs à la vie privée.
      </p>

      <h2>9. Enfants</h2>
      <p>
        Le Service n’est pas destiné aux enfants de moins de 13 ans, et nous ne collectons pas
        sciemment d’informations personnelles d’enfants de moins de 13 ans. Si vous pensez que
        nous en avons collecté, contactez-nous et nous les supprimerons. Les utilisateurs âgés
        de 13 à 18 ans ne doivent utiliser Fringo qu’avec le consentement parental.
      </p>

      <h2>10. Traitement automatisé</h2>
      <p>
        Les scores de niveau et les retours d’écriture peuvent être générés automatiquement. Ces
        résultats sont des aides à l’apprentissage, et non des décisions ayant un effet juridique
        ou similaire à votre égard (telles qu’une certification d’examen ou une décision
        d’immigration). Vous pouvez nous contacter si vous estimez qu’un score enregistré est
        erroné.
      </p>

      <h2>11. Signaux Do Not Track</h2>
      <p>
        Le Service ne répond pas actuellement aux signaux Do Not Track du navigateur. Nous
        n’utilisons pas de traceurs publicitaires de tiers.
      </p>

      <h2>12. Modifications</h2>
      <p>
        Nous pouvons mettre à jour la présente Politique de temps à autre. La date de « Dernière
        mise à jour » changera, et les mises à jour importantes pourront être annoncées par
        e-mail ou notification dans le produit. L’utilisation continue après une mise à jour
        signifie que vous prenez acte de la Politique révisée.
      </p>

      <h2>13. Contact</h2>
      <p>
        Questions de confidentialité et demandes relatives aux données :{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </>
  );
}
