'use client';

import { SitePage } from '@/components/site-page';
import { useI18n } from '@/lib/i18n';
import { LEGAL_UPDATED, SUPPORT_EMAIL } from '@/lib/legal';

export function RefundsView() {
  const { locale, t } = useI18n();
  return (
    <SitePage title={t('legalNav.refunds')}>
      {locale === 'fr' ? <French /> : <English />}
    </SitePage>
  );
}

function English() {
  return (
    <>
      <p>Last updated: {LEGAL_UPDATED}</p>
      <p>
        This Refund Policy applies to paid Fringo plans (currently Pro). It forms part of our{' '}
        <a href="/terms">Terms of Service</a>. Free plan use is not billed and is not eligible
        for a refund.
      </p>

      <h2>Monthly subscriptions</h2>
      <p>
        Pro is billed in advance for each billing period. You may cancel at any time. Cancellation
        stops the next renewal. You generally keep paid access until the end of the period you
        already paid for. We do not prorate unused days on a standard monthly plan, except as
        required by law or as described below.
      </p>

      <h2>First-charge refund (goodwill window)</h2>
      <p>
        If this is your first paid Fringo subscription, you may request a full refund within
        seven (7) days of the initial charge if you have not been able to use the Service as
        described at purchase (for example a blocking technical issue we cannot resolve). Email{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> from the address on your account
        and include the account email and approximate purchase date.
      </p>
      <p>
        After that window, or for subsequent renewal charges, payments are non-refundable except
        where we are required to refund you under applicable consumer law.
      </p>

      <h2>When we will refund</h2>
      <p>We will refund (or not charge) in these cases:</p>
      <ul>
        <li>A duplicate or clearly accidental charge caused by our billing error</li>
        <li>You were charged after a cancellation that we had already confirmed as effective before the renewal</li>
        <li>The first-charge window above, if you qualify</li>
        <li>Any refund required by the consumer-protection laws that apply to you</li>
      </ul>

      <h2>When we will not refund</h2>
      <ul>
        <li>Change of mind after the first-charge window</li>
        <li>Failure to cancel before renewal</li>
        <li>Dissatisfaction with exam results, scores, or AI feedback</li>
        <li>Account closure for violation of our Terms</li>
        <li>Partial use of a billing period you chose not to cancel</li>
      </ul>

      <h2>How refunds are issued</h2>
      <p>
        Approved refunds are returned to the original payment method, typically within 5–10
        business days depending on your bank or payment provider. Chargebacks filed without
        contacting us first may delay resolution; please email us so we can help directly.
      </p>

      <h2>Chargebacks</h2>
      <p>
        If you believe a charge is wrong, contact us before opening a dispute with your bank.
        Unwarranted chargebacks may result in account suspension while we investigate.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this Policy. The version posted on this page on the date of purchase or
        renewal applies to that charge, except where a later version is more favorable to you or
        required by law.
      </p>

      <h2>Contact</h2>
      <p>
        Billing and refund requests:{' '}
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
        La présente Politique de remboursement s’applique aux offres payantes Fringo
        (actuellement Pro). Elle fait partie de nos{' '}
        <a href="/terms">Conditions d’utilisation</a>. L’offre Gratuite n’est pas facturée et
        n’est pas éligible à un remboursement.
      </p>

      <h2>Abonnements mensuels</h2>
      <p>
        Pro est facturé d’avance pour chaque période de facturation. Vous pouvez résilier à tout
        moment. La résiliation arrête le prochain renouvellement. Vous conservez généralement
        l’accès payant jusqu’à la fin de la période déjà payée. Nous ne proratisons pas les
        jours non utilisés d’une offre mensuelle standard, sauf si la loi l’exige ou comme
        décrit ci-dessous.
      </p>

      <h2>Remboursement du premier prélèvement (délai de bonne volonté)</h2>
      <p>
        S’il s’agit de votre premier abonnement payant Fringo, vous pouvez demander un
        remboursement intégral dans les sept (7) jours suivant le premier prélèvement si vous
        n’avez pas pu utiliser le Service tel que décrit lors de l’achat (par exemple un
        problème technique bloquant que nous ne pouvons pas résoudre). Écrivez à{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> depuis l’adresse de votre compte
        et indiquez l’e-mail du compte ainsi que la date d’achat approximative.
      </p>
      <p>
        Après ce délai, ou pour les prélèvements de renouvellement suivants, les paiements ne
        sont pas remboursables, sauf lorsque le droit de la consommation applicable nous oblige
        à vous rembourser.
      </p>

      <h2>Quand nous remboursons</h2>
      <p>Nous remboursons (ou n’encaissons pas) dans les cas suivants :</p>
      <ul>
        <li>Un prélèvement en double ou clairement accidentel causé par une erreur de facturation de notre part</li>
        <li>Vous avez été débité après une résiliation que nous avions déjà confirmée comme effective avant le renouvellement</li>
        <li>Le délai du premier prélèvement ci-dessus, si vous y êtes admissible</li>
        <li>Tout remboursement exigé par les lois de protection des consommateurs qui vous sont applicables</li>
      </ul>

      <h2>Quand nous ne remboursons pas</h2>
      <ul>
        <li>Changement d’avis après le délai du premier prélèvement</li>
        <li>Défaut de résiliation avant le renouvellement</li>
        <li>Insatisfaction quant aux résultats d’examen, aux scores ou au retour d’IA</li>
        <li>Fermeture de compte pour violation de nos Conditions</li>
        <li>Utilisation partielle d’une période de facturation que vous avez choisi de ne pas résilier</li>
      </ul>

      <h2>Comment les remboursements sont versés</h2>
      <p>
        Les remboursements approuvés sont retournés sur le moyen de paiement d’origine,
        généralement sous 5 à 10 jours ouvrables selon votre banque ou prestataire de paiement.
        Les rétrofacturations ouvertes sans nous avoir d’abord contactés peuvent retarder la
        résolution ; veuillez nous écrire afin que nous puissions vous aider directement.
      </p>

      <h2>Rétrofacturations</h2>
      <p>
        Si vous estimez qu’un prélèvement est erroné, contactez-nous avant d’ouvrir un litige
        auprès de votre banque. Les rétrofacturations non fondées peuvent entraîner la
        suspension du compte le temps de l’enquête.
      </p>

      <h2>Modifications</h2>
      <p>
        Nous pouvons mettre à jour la présente Politique. La version publiée sur cette page à
        la date d’achat ou de renouvellement s’applique à ce prélèvement, sauf si une version
        ultérieure vous est plus favorable ou est exigée par la loi.
      </p>

      <h2>Contact</h2>
      <p>
        Demandes de facturation et de remboursement :{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </>
  );
}
