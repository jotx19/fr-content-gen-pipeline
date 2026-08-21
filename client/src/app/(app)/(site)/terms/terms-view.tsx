'use client';

import { SitePage } from '@/components/site-page';
import { useI18n } from '@/lib/i18n';
import { LEGAL_UPDATED, SUPPORT_EMAIL } from '@/lib/legal';

export function TermsView() {
  const { locale, t } = useI18n();
  return (
    <SitePage title={t('legalNav.terms')}>
      {locale === 'fr' ? <French /> : <English />}
    </SitePage>
  );
}

function English() {
  return (
    <>
      <p>Last updated: {LEGAL_UPDATED}</p>
      <p>
        These Terms of Service (“Terms”) are a legally binding agreement between you and Fringo
        (“Fringo”, “we”, “us”, or “our”) governing your access to and use of the Fringo website,
        applications, and related services (the “Service”). By creating an account, purchasing a
        subscription, or using the Service, you agree to these Terms and to our{' '}
        <a href="/privacy">Privacy Policy</a>, <a href="/cookies">Cookie Policy</a>, and{' '}
        <a href="/refunds">Refund Policy</a>. If you do not agree, do not use the Service.
      </p>

      <h2>1. Who may use Fringo</h2>
      <p>
        You must be at least 13 years old to use the Service. If you are under 18 (or the age of
        majority where you live), you may use Fringo only with the consent of a parent or legal
        guardian who agrees to these Terms on your behalf. You represent that the information you
        provide is accurate and that you have the legal capacity to enter into this agreement.
      </p>

      <h2>2. The Service</h2>
      <p>
        Fringo is a software-as-a-service platform for French language practice. Features may
        include CEFR-style placement, reading and writing exercises, scoring, streaks, XP, progress
        reports, and AI-assisted feedback. We may add, change, suspend, or remove features at any
        time. Access to some features may require a paid plan, be rate-limited, or be offered in
        beta.
      </p>
      <p>
        Fringo is an independent learning product. It is <strong>not affiliated with, endorsed
        by, or sponsored by</strong> any official TEF, TCF, IRCC, France Éducation international,
        CCI, or other exam, immigration, or government body. Practice content is designed for
        study purposes and may differ from live exam materials.
      </p>

      <h2>3. Accounts and security</h2>
      <ul>
        <li>You are responsible for your account credentials and for all activity under your account.</li>
        <li>Notify us promptly at <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> if you suspect unauthorized access.</li>
        <li>We may refuse, suspend, or close accounts that violate these Terms, appear fraudulent, or pose a security or legal risk.</li>
        <li>One person may not share a paid account except as we expressly allow.</li>
      </ul>

      <h2>4. Plans, billing, and taxes</h2>
      <p>
        We may offer a Free plan and one or more paid plans (currently “Pro”). Plan features,
        prices, and limits are described on our pricing page and may change. Paid plans are billed
        in advance on a recurring basis (for example monthly) until you cancel.
      </p>
      <ul>
        <li>
          <strong>Auto-renewal.</strong> Paid subscriptions renew automatically at the then-current
          price unless you cancel before the renewal date.
        </li>
        <li>
          <strong>Payment.</strong> You authorize us and our payment processor to charge your
          selected payment method for subscription fees, applicable taxes, and any failed-payment
          retries. You are responsible for keeping payment details current.
        </li>
        <li>
          <strong>Price changes.</strong> We may change prices with notice (for example by email
          or in-product notice). The new price applies from the next renewal after notice, unless
          you cancel.
        </li>
        <li>
          <strong>Cancellation.</strong> You may cancel at any time. Access generally continues
          through the end of the current billing period. Cancellation stops future charges; it
          does not automatically refund time already paid, except as described in our{' '}
          <a href="/refunds">Refund Policy</a>.
        </li>
        <li>
          <strong>Failed payments.</strong> If a charge fails, we may retry, downgrade you to Free,
          or suspend paid features until payment succeeds.
        </li>
      </ul>

      <h2>5. Educational and exam disclaimer</h2>
      <p>
        Fringo is a practice tool only. We do <strong>not</strong> guarantee any exam score,
        CEFR level, immigration outcome, admission, job, or other result. Placement estimates,
        scores, progress metrics, and feedback are informational. Official exams are administered
        solely by their respective bodies. You remain solely responsible for your study, exam
        registration, and any decisions you make based on Fringo.
      </p>

      <h2>6. AI-generated output</h2>
      <p>
        Some features use automated or third-party machine-learning systems to score answers,
        generate prompts, or provide writing feedback. AI output can be incomplete, biased,
        outdated, or wrong. It is not a substitute for a qualified teacher, official exam
        guidance, or professional advice. You should not rely on it as the sole basis for exam
        or immigration decisions.
      </p>

      <h2>7. Your content</h2>
      <p>
        You retain ownership of content you submit (for example writing responses, notes, and
        profile details) (“User Content”). You grant Fringo a worldwide, non-exclusive, royalty-free
        license to host, process, transmit, and display User Content solely as needed to operate,
        secure, improve, and provide the Service, including scoring and AI feedback.
      </p>
      <p>
        You represent that you have the rights to submit User Content and that it does not
        infringe others’ rights or contain unlawful, confidential, or sensitive personal data you
        are not allowed to share. We may remove User Content that we reasonably believe violates
        these Terms or the law.
      </p>

      <h2>8. Our intellectual property</h2>
      <p>
        The Service, including software, design, text, graphics, lesson structure, trademarks, and
        branding, is owned by Fringo or its licensors. We grant you a limited, revocable,
        non-exclusive, non-transferable license to use the Service for your personal, non-commercial
        learning in accordance with these Terms. You may not copy, scrape, reverse engineer, resell,
        or create a competing product from the Service except to the extent such restriction is
        prohibited by law.
      </p>
      <p>
        Feedback you send us (ideas, suggestions, bug reports) may be used by us without
        restriction or compensation.
      </p>

      <h2>9. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Violate any applicable law, regulation, or third-party right</li>
        <li>Harass, threaten, defraud, or impersonate others</li>
        <li>Upload malware, spam, or content that is illegal or exploitative</li>
        <li>Attempt to access other users’ accounts or data</li>
        <li>Probe, scrape, overload, or disrupt the Service or its infrastructure</li>
        <li>Circumvent usage limits, paywalls, or security controls</li>
        <li>Use the Service to train competing models or datasets without our written permission</li>
        <li>Misrepresent Fringo scores or certificates as official exam results</li>
      </ul>
      <p>
        We may investigate violations and cooperate with law enforcement where required.
      </p>

      <h2>10. Third-party services</h2>
      <p>
        The Service may rely on third parties such as authentication providers (for example Google
        Sign-In), hosting and database providers, payment processors, and AI model providers.
        Those services have their own terms and privacy policies. We are not responsible for
        third-party outages, changes, or acts except as required by law.
      </p>

      <h2>11. Suspension and termination</h2>
      <p>
        You may stop using Fringo at any time and may request account deletion as described in
        the Privacy Policy. We may suspend or terminate access immediately if you breach these
        Terms, if required by law, or if we discontinue the Service. Upon termination, the license
        granted to you ends. Sections that by their nature should survive (including intellectual
        property, disclaimers, limitation of liability, indemnification, and dispute terms)
        survive termination.
      </p>

      <h2>12. Disclaimer of warranties</h2>
      <p>
        THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE.” TO THE MAXIMUM EXTENT PERMITTED BY
        LAW, WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING
        MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT
        WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR THAT SCORES,
        PLACEMENT RESULTS, OR AI FEEDBACK WILL BE ACCURATE OR SUITABLE FOR ANY EXAM OR LEGAL
        PURPOSE.
      </p>

      <h2>13. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, FRINGO AND ITS OWNERS, OPERATORS, EMPLOYEES, AND
        SUPPLIERS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
        EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, DATA, GOODWILL, OR EXAM /
        IMMIGRATION / EDUCATION OUTCOMES, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        OUR TOTAL LIABILITY FOR ANY CLAIM ARISING OUT OF THE SERVICE WILL NOT EXCEED THE GREATER
        OF (A) THE AMOUNTS YOU PAID TO FRINGO FOR THE SERVICE IN THE TWELVE (12) MONTHS BEFORE
        THE CLAIM, OR (B) USD $50 IF YOU HAVE ONLY USED A FREE PLAN.
      </p>
      <p>
        Some jurisdictions do not allow certain limitations. In those places, our liability is
        limited to the fullest extent permitted. Nothing in these Terms limits liability that
        cannot be limited under applicable law (for example liability for fraud, or for death or
        personal injury caused by negligence where such a limit is unenforceable).
      </p>

      <h2>14. Indemnification</h2>
      <p>
        You will defend, indemnify, and hold harmless Fringo and its operators from claims,
        damages, losses, and expenses (including reasonable legal fees) arising from your User
        Content, your use of the Service, or your violation of these Terms or applicable law.
      </p>

      <h2>15. Disputes</h2>
      <p>
        Before filing a claim, you agree to contact us at{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> and try to resolve the dispute
        informally for at least 30 days. To the extent permitted by law, you and Fringo agree
        that disputes will be resolved individually, not as a class, collective, or representative
        action. If a class-action waiver is unenforceable where you live, that portion does not
        apply to you.
      </p>
      <p>
        These Terms are governed by the laws applicable to the operator of Fringo, without regard
        to conflict-of-law rules, except that mandatory consumer-protection laws of your country
        of residence continue to apply. Courts in that operator’s jurisdiction will have exclusive
        jurisdiction, except where consumer law gives you the right to sue in your home courts.
      </p>

      <h2>16. Changes</h2>
      <p>
        We may update these Terms from time to time. We will post the revised Terms on this page
        and update the “Last updated” date. Material changes may also be communicated by email or
        in-product notice. Continued use after the effective date constitutes acceptance. If you
        do not agree, you must stop using the Service and cancel any paid plan.
      </p>

      <h2>17. General</h2>
      <ul>
        <li>If a provision is unenforceable, the rest of the Terms remain in effect.</li>
        <li>Our failure to enforce a provision is not a waiver.</li>
        <li>You may not assign these Terms without our consent. We may assign them in connection with a merger, acquisition, or sale of assets.</li>
        <li>These Terms, together with the policies linked above, are the entire agreement between you and Fringo regarding the Service.</li>
        <li>Headings are for convenience only.</li>
      </ul>

      <h2>18. Contact</h2>
      <p>
        Questions about these Terms:{' '}
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
        Les présentes Conditions d’utilisation (« Conditions ») constituent un accord juridiquement
        contraignant entre vous et Fringo (« Fringo », « nous » ou « notre ») régissant votre accès
        et votre utilisation du site web, des applications et des services associés de Fringo (le
        « Service »). En créant un compte, en souscrivant un abonnement ou en utilisant le Service,
        vous acceptez les présentes Conditions ainsi que notre{' '}
        <a href="/privacy">Politique de confidentialité</a>, notre{' '}
        <a href="/cookies">Politique relative aux cookies</a> et notre{' '}
        <a href="/refunds">Politique de remboursement</a>. Si vous n’êtes pas d’accord, n’utilisez
        pas le Service.
      </p>

      <h2>1. Qui peut utiliser Fringo</h2>
      <p>
        Vous devez avoir au moins 13 ans pour utiliser le Service. Si vous avez moins de 18 ans
        (ou l’âge de la majorité là où vous vivez), vous ne pouvez utiliser Fringo qu’avec le
        consentement d’un parent ou tuteur légal qui accepte les présentes Conditions en votre
        nom. Vous déclarez que les informations que vous fournissez sont exactes et que vous avez
        la capacité juridique de conclure le présent accord.
      </p>

      <h2>2. Le Service</h2>
      <p>
        Fringo est une plateforme logicielle en tant que service (SaaS) pour la pratique du
        français. Les fonctionnalités peuvent inclure un test de niveau de type CECRL, des
        exercices de lecture et d’écriture, une notation, des séries, de l’XP, des rapports de
        progression et un retour assisté par IA. Nous pouvons ajouter, modifier, suspendre ou
        retirer des fonctionnalités à tout moment. L’accès à certaines fonctionnalités peut
        exiger une offre payante, être limité en volume, ou être proposé en version bêta.
      </p>
      <p>
        Fringo est un produit d’apprentissage indépendant. Il <strong>n’est affilié à, ni
        approuvé, ni parrainé par</strong> aucun organisme officiel du TEF, du TCF, d’IRCC, de
        France Éducation international, d’une CCI, ni aucun autre organisme d’examen,
        d’immigration ou gouvernemental. Le contenu d’entraînement est conçu à des fins d’étude
        et peut différer des épreuves officielles.
      </p>

      <h2>3. Comptes et sécurité</h2>
      <ul>
        <li>Vous êtes responsable de vos identifiants de compte et de toute activité effectuée sous votre compte.</li>
        <li>Informez-nous sans délai à <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> si vous soupçonnez un accès non autorisé.</li>
        <li>Nous pouvons refuser, suspendre ou fermer les comptes qui violent les présentes Conditions, semblent frauduleux, ou présentent un risque de sécurité ou juridique.</li>
        <li>Une personne ne peut pas partager un compte payant, sauf si nous l’autorisons expressément.</li>
      </ul>

      <h2>4. Offres, facturation et taxes</h2>
      <p>
        Nous pouvons proposer une offre Gratuite et une ou plusieurs offres payantes (actuellement
        « Pro »). Les fonctionnalités, prix et limites des offres sont décrits sur notre page
        tarifs et peuvent changer. Les offres payantes sont facturées d’avance de façon
        récurrente (par exemple mensuellement) jusqu’à votre résiliation.
      </p>
      <ul>
        <li>
          <strong>Renouvellement automatique.</strong> Les abonnements payants se renouvellent
          automatiquement au tarif alors en vigueur, sauf si vous résiliez avant la date de
          renouvellement.
        </li>
        <li>
          <strong>Paiement.</strong> Vous nous autorisez, ainsi que notre prestataire de paiement,
          à débiter le moyen de paiement choisi pour les frais d’abonnement, les taxes applicables
          et les éventuelles relances en cas d’échec de paiement. Vous êtes responsable de
          maintenir vos informations de paiement à jour.
        </li>
        <li>
          <strong>Changements de prix.</strong> Nous pouvons modifier les prix moyennant un
          préavis (par exemple par e-mail ou notification dans le produit). Le nouveau prix
          s’applique à partir du renouvellement suivant le préavis, sauf si vous résiliez.
        </li>
        <li>
          <strong>Résiliation.</strong> Vous pouvez résilier à tout moment. L’accès se poursuit
          généralement jusqu’à la fin de la période de facturation en cours. La résiliation
          arrête les prélèvements futurs ; elle n’entraîne pas automatiquement le remboursement
          du temps déjà payé, sauf dans les cas décrits dans notre{' '}
          <a href="/refunds">Politique de remboursement</a>.
        </li>
        <li>
          <strong>Échecs de paiement.</strong> Si un prélèvement échoue, nous pouvons réessayer,
          vous rétrograder vers l’offre Gratuite, ou suspendre les fonctionnalités payantes
          jusqu’à ce que le paiement aboutisse.
        </li>
      </ul>

      <h2>5. Avertissement pédagogique et relatif aux examens</h2>
      <p>
        Fringo est uniquement un outil d’entraînement. Nous <strong>ne</strong> garantissons{' '}
        <strong>aucun</strong> score d’examen, niveau CECRL, résultat d’immigration, admission,
        emploi ou autre résultat. Les estimations de niveau, scores, indicateurs de progression
        et retours sont fournis à titre informatif. Les examens officiels sont administrés
        uniquement par leurs organismes respectifs. Vous restez seul responsable de vos études,
        de votre inscription à l’examen et de toute décision prise sur la base de Fringo.
      </p>

      <h2>6. Contenu généré par l’IA</h2>
      <p>
        Certaines fonctionnalités utilisent des systèmes automatisés ou d’apprentissage
        automatique de tiers pour noter des réponses, générer des sujets ou fournir un retour
        d’écriture. Le contenu généré par l’IA peut être incomplet, biaisé, obsolète ou
        incorrect. Il ne remplace pas un enseignant qualifié, les consignes officielles d’un
        examen, ni un conseil professionnel. Vous ne devez pas vous y fier comme unique
        fondement de décisions d’examen ou d’immigration.
      </p>

      <h2>7. Votre contenu</h2>
      <p>
        Vous conservez la propriété du contenu que vous soumettez (par exemple réponses écrites,
        notes et informations de profil) (« Contenu utilisateur »). Vous accordez à Fringo une
        licence mondiale, non exclusive et gratuite pour héberger, traiter, transmettre et
        afficher le Contenu utilisateur uniquement dans la mesure nécessaire pour exploiter,
        sécuriser, améliorer et fournir le Service, y compris la notation et le retour par IA.
      </p>
      <p>
        Vous déclarez que vous avez les droits nécessaires pour soumettre le Contenu utilisateur
        et qu’il ne porte pas atteinte aux droits d’autrui ni ne contient de données personnelles
        illicites, confidentielles ou sensibles que vous n’êtes pas autorisé à partager. Nous
        pouvons retirer le Contenu utilisateur dont nous estimons raisonnablement qu’il viole
        les présentes Conditions ou la loi.
      </p>

      <h2>8. Notre propriété intellectuelle</h2>
      <p>
        Le Service, y compris le logiciel, le design, les textes, les graphismes, la structure
        des leçons, les marques et l’identité visuelle, appartient à Fringo ou à ses concédants.
        Nous vous accordons une licence limitée, révocable, non exclusive et incessible d’utiliser
        le Service pour votre apprentissage personnel et non commercial, conformément aux
        présentes Conditions. Vous ne pouvez pas copier, extraire (scraper), désosser, revendre
        ni créer un produit concurrent à partir du Service, sauf dans la mesure où une telle
        restriction est interdite par la loi.
      </p>
      <p>
        Les retours que vous nous envoyez (idées, suggestions, signalements de bugs) peuvent
        être utilisés par nous sans restriction ni compensation.
      </p>

      <h2>9. Utilisation acceptable</h2>
      <p>Vous acceptez de ne pas :</p>
      <ul>
        <li>Violer une loi, un règlement ou un droit de tiers applicable</li>
        <li>Harceler, menacer, frauder ou usurper l’identité d’autrui</li>
        <li>Téléverser des logiciels malveillants, du pourriel, ou un contenu illégal ou exploitatif</li>
        <li>Tenter d’accéder aux comptes ou aux données d’autres utilisateurs</li>
        <li>Sonder, extraire, surcharger ou perturber le Service ou son infrastructure</li>
        <li>Contourner les limites d’usage, les barrières de paiement ou les contrôles de sécurité</li>
        <li>Utiliser le Service pour entraîner des modèles ou jeux de données concurrents sans notre autorisation écrite</li>
        <li>Présenter les scores ou certificats Fringo comme des résultats d’examen officiels</li>
      </ul>
      <p>
        Nous pouvons enquêter sur les violations et coopérer avec les autorités lorsque la loi
        l’exige.
      </p>

      <h2>10. Services tiers</h2>
      <p>
        Le Service peut s’appuyer sur des tiers tels que des prestataires d’authentification
        (par exemple Google Sign-In), d’hébergement et de bases de données, des prestataires de
        paiement et des fournisseurs de modèles d’IA. Ces services ont leurs propres conditions
        et politiques de confidentialité. Nous ne sommes pas responsables des pannes, changements
        ou actes de tiers, sauf lorsque la loi l’exige.
      </p>

      <h2>11. Suspension et résiliation</h2>
      <p>
        Vous pouvez cesser d’utiliser Fringo à tout moment et demander la suppression de votre
        compte comme décrit dans la Politique de confidentialité. Nous pouvons suspendre ou
        résilier l’accès immédiatement si vous violez les présentes Conditions, si la loi
        l’exige, ou si nous cessons le Service. À la résiliation, la licence qui vous a été
        accordée prend fin. Les dispositions qui, par leur nature, doivent survivre (y compris
        la propriété intellectuelle, les exclusions de garantie, la limitation de responsabilité,
        l’indemnisation et les clauses relatives aux litiges) survivent à la résiliation.
      </p>

      <h2>12. Exclusion de garanties</h2>
      <p>
        LE SERVICE EST FOURNI « EN L’ÉTAT » ET « SELON DISPONIBILITÉ ». DANS LA MESURE MAXIMALE
        PERMISE PAR LA LOI, NOUS DÉCLINONS TOUTE GARANTIE, EXPRESSE, IMPLICITE OU LÉGALE, Y
        COMPRIS LES GARANTIES DE QUALITÉ MARCHANDE, D’ADÉQUATION À UN USAGE PARTICULIER, DE
        TITRE ET DE NON-CONTREFAÇON. NOUS NE GARANTISSONS PAS QUE LE SERVICE SERA ININTERROMPU,
        SÉCURISÉ, SANS ERREUR, NI QUE LES SCORES, RÉSULTATS DE NIVEAU OU RETOURS D’IA SERONT
        EXACTS OU ADAPTÉS À UN EXAMEN OU À UNE FINALITÉ JURIDIQUE.
      </p>

      <h2>13. Limitation de responsabilité</h2>
      <p>
        DANS LA MESURE MAXIMALE PERMISE PAR LA LOI, FRINGO ET SES PROPRIÉTAIRES, EXPLOITANTS,
        EMPLOYÉS ET FOURNISSEURS NE SERONT PAS RESPONSABLES DE TOUT DOMMAGE INDIRECT, ACCESSOIRE,
        SPÉCIAL, CONSÉCUTIF, EXEMPLAIRE OU PUNITIF, NI D’AUCUNE PERTE DE PROFITS, DE DONNÉES,
        D’ACHALANDAGE, OU DE RÉSULTATS D’EXAMEN / D’IMMIGRATION / D’ÉDUCATION, MÊME S’ILS ONT
        ÉTÉ AVISÉS DE LA POSSIBILITÉ DE TELS DOMMAGES.
      </p>
      <p>
        NOTRE RESPONSABILITÉ TOTALE POUR TOUTE RÉCLAMATION DÉCOULANT DU SERVICE NE DÉPASSERA PAS
        LE PLUS ÉLEVÉ DES MONTANTS SUIVANTS : (A) LES SOMMES QUE VOUS AVEZ PAYÉES À FRINGO POUR
        LE SERVICE AU COURS DES DOUZE (12) MOIS PRÉCÉDANT LA RÉCLAMATION, OU (B) 50 USD SI VOUS
        N’AVEZ UTILISÉ QU’UNE OFFRE GRATUITE.
      </p>
      <p>
        Certaines juridictions n’autorisent pas certaines limitations. Dans ces lieux, notre
        responsabilité est limitée dans toute la mesure permise. Rien dans les présentes
        Conditions ne limite une responsabilité qui ne peut être limitée en vertu du droit
        applicable (par exemple la responsabilité pour fraude, ou pour décès ou préjudice
        corporel causé par une négligence lorsque une telle limitation est inapplicable).
      </p>

      <h2>14. Indemnisation</h2>
      <p>
        Vous défendrez, indémniserez et dégagerez de toute responsabilité Fringo et ses
        exploitants à l’égard des réclamations, dommages, pertes et frais (y compris les
        honoraires d’avocat raisonnables) découlant de votre Contenu utilisateur, de votre
        utilisation du Service, ou de votre violation des présentes Conditions ou du droit
        applicable.
      </p>

      <h2>15. Litiges</h2>
      <p>
        Avant de déposer une réclamation, vous acceptez de nous contacter à{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> et de tenter de résoudre le
        litige de façon informelle pendant au moins 30 jours. Dans la mesure permise par la
        loi, vous et Fringo convenez que les litiges seront tranchés individuellement, et non
        sous forme d’action collective, de groupe ou représentative. Si une renonciation aux
        actions collectives est inapplicable là où vous vivez, cette partie ne s’applique pas
        à vous.
      </p>
      <p>
        Les présentes Conditions sont régies par les lois applicables à l’exploitant de Fringo,
        sans égard aux règles de conflit de lois, sous réserve que les dispositions impératives
        de protection des consommateurs de votre pays de résidence continuent de s’appliquer.
        Les tribunaux de la juridiction de cet exploitant auront compétence exclusive, sauf
        lorsque le droit de la consommation vous donne le droit d’agir devant les tribunaux de
        votre lieu de résidence.
      </p>

      <h2>16. Modifications</h2>
      <p>
        Nous pouvons mettre à jour les présentes Conditions de temps à autre. Nous publierons
        les Conditions révisées sur cette page et mettrons à jour la date de « Dernière mise à
        jour ». Les changements importants peuvent également être communiqués par e-mail ou
        notification dans le produit. L’utilisation continue après la date d’entrée en vigueur
        vaut acceptation. Si vous n’êtes pas d’accord, vous devez cesser d’utiliser le Service
        et résilier toute offre payante.
      </p>

      <h2>17. Dispositions générales</h2>
      <ul>
        <li>Si une disposition est inapplicable, le reste des Conditions demeure en vigueur.</li>
        <li>Notre omission de faire respecter une disposition ne constitue pas une renonciation.</li>
        <li>Vous ne pouvez pas céder les présentes Conditions sans notre consentement. Nous pouvons les céder dans le cadre d’une fusion, d’une acquisition ou d’une vente d’actifs.</li>
        <li>Les présentes Conditions, avec les politiques liées ci-dessus, constituent l’intégralité de l’accord entre vous et Fringo concernant le Service.</li>
        <li>Les titres sont fournis uniquement pour la commodité.</li>
      </ul>

      <h2>18. Contact</h2>
      <p>
        Questions relatives aux présentes Conditions :{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </>
  );
}
