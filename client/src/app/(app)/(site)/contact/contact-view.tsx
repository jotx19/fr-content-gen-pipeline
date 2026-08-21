'use client';

import { SitePage } from '@/components/site-page';
import { useI18n } from '@/lib/i18n';
import { SUPPORT_EMAIL } from '@/lib/legal';

export function ContactView() {
  const { locale, t } = useI18n();
  return (
    <SitePage title={t('legalNav.contact')}>
      {locale === 'fr' ? <French /> : <English />}
    </SitePage>
  );
}

function English() {
  return (
    <>
      <p>
        For account help, billing, privacy requests, or product questions, email us and we will
        get back to you as soon as we can.
      </p>

      <h2>Email</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <p>Please include:</p>
      <ul>
        <li>The email on your Fringo account</li>
        <li>A short description of the issue</li>
        <li>For billing, the approximate date of the charge</li>
      </ul>

      <h2>Privacy and legal</h2>
      <p>
        Data access or deletion requests, and questions about our policies, can use the same
        address. See our <a href="/privacy">Privacy Policy</a>,{' '}
        <a href="/terms">Terms of Service</a>, <a href="/cookies">Cookie Policy</a>, and{' '}
        <a href="/refunds">Refund Policy</a>.
      </p>
    </>
  );
}

function French() {
  return (
    <>
      <p>
        Pour l’aide relative au compte, la facturation, les demandes de confidentialité ou les
        questions sur le produit, écrivez-nous et nous vous répondrons dès que possible.
      </p>

      <h2>E-mail</h2>
      <p>
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
      <p>Veuillez indiquer :</p>
      <ul>
        <li>L’adresse e-mail de votre compte Fringo</li>
        <li>Une courte description du problème</li>
        <li>Pour la facturation, la date approximative du prélèvement</li>
      </ul>

      <h2>Confidentialité et mentions légales</h2>
      <p>
        Les demandes d’accès ou de suppression de données, ainsi que les questions sur nos
        politiques, peuvent utiliser la même adresse. Consultez notre{' '}
        <a href="/privacy">Politique de confidentialité</a>, nos{' '}
        <a href="/terms">Conditions d’utilisation</a>, notre{' '}
        <a href="/cookies">Politique relative aux cookies</a> et notre{' '}
        <a href="/refunds">Politique de remboursement</a>.
      </p>
    </>
  );
}
