'use client';

import { SitePage } from '@/components/site-page';
import { useI18n } from '@/lib/i18n';
import { LEGAL_UPDATED, SUPPORT_EMAIL } from '@/lib/legal';

export function CookiesView() {
  const { locale, t } = useI18n();
  return (
    <SitePage title={t('legalNav.cookies')}>
      {locale === 'fr' ? <French /> : <English />}
    </SitePage>
  );
}

function English() {
  return (
    <>
      <p>Last updated: {LEGAL_UPDATED}</p>
      <p>
        This Cookie Policy explains how Fringo uses cookies and similar technologies (local
        storage, session storage) on the Service. It should be read with our{' '}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2>What cookies are</h2>
      <p>
        Cookies are small text files stored on your device. Similar technologies such as local
        storage can also remember information in your browser. We use these tools so the product
        can function — for example to keep you signed in and remember your theme.
      </p>

      <h2>Cookies we use</h2>
      <p>We currently use first-party, functional storage only:</p>
      <ul>
        <li>
          <strong>Authentication / session</strong> — tokens or session state so you stay signed
          in and so requests can be authorized. These are strictly necessary.
        </li>
        <li>
          <strong>Preferences</strong> — theme (light/dark) and similar UI choices you make.
        </li>
        <li>
          <strong>Progress cache</strong> — local keys that help restore placement progress or
          recent practice stats on your device.
        </li>
      </ul>
      <p>
        We do not use advertising cookies, cross-site tracking cookies, or third-party ad
        networks. If we later add optional analytics, we will update this page and, where
        required, ask for consent.
      </p>

      <h2>Third-party cookies</h2>
      <p>
        If you sign in with Google, Google may set its own cookies or storage as part of its
        authentication flow, governed by Google’s policies. Payment processors, if used at
        checkout, may also set cookies needed to complete a transaction securely.
      </p>

      <h2>Duration</h2>
      <p>
        Session cookies expire when you close your browser or sign out. Persistent items (such
        as a remembered theme or a stored session) remain until they expire, you clear them, or
        you sign out, depending on the item.
      </p>

      <h2>How to control cookies</h2>
      <p>
        You can clear or block cookies and site data in your browser settings. Because our
        cookies are needed for core features, blocking them may sign you out or reset
        preferences. Browser help pages for Chrome, Safari, Firefox, and Edge explain how to
        manage cookies.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this Policy when our use of cookies changes. The “Last updated” date will
        be revised accordingly.
      </p>

      <h2>Contact</h2>
      <p>
        Cookie questions:{' '}
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
        La présente Politique relative aux cookies explique comment Fringo utilise les cookies
        et des technologies similaires (stockage local, stockage de session) sur le Service. Elle
        doit être lue conjointement avec notre{' '}
        <a href="/privacy">Politique de confidentialité</a>.
      </p>

      <h2>Ce que sont les cookies</h2>
      <p>
        Les cookies sont de petits fichiers texte stockés sur votre appareil. Des technologies
        similaires telles que le stockage local peuvent aussi mémoriser des informations dans
        votre navigateur. Nous utilisons ces outils pour que le produit fonctionne — par exemple
        pour vous maintenir connecté et mémoriser votre thème.
      </p>

      <h2>Cookies que nous utilisons</h2>
      <p>Nous n’utilisons actuellement que du stockage fonctionnel en première partie :</p>
      <ul>
        <li>
          <strong>Authentification / session</strong> — jetons ou état de session pour que vous
          restiez connecté et que les requêtes puissent être autorisées. Ils sont strictement
          nécessaires.
        </li>
        <li>
          <strong>Préférences</strong> — thème (clair/sombre) et choix d’interface similaires que
          vous faites.
        </li>
        <li>
          <strong>Cache de progression</strong> — clés locales qui aident à restaurer la
          progression du test de niveau ou les statistiques de pratique récentes sur votre
          appareil.
        </li>
      </ul>
      <p>
        Nous n’utilisons pas de cookies publicitaires, de cookies de suivi intersites, ni de
        réseaux publicitaires de tiers. Si nous ajoutons plus tard des analyses optionnelles,
        nous mettrons à jour cette page et, lorsque la loi l’exige, demanderons votre
        consentement.
      </p>

      <h2>Cookies de tiers</h2>
      <p>
        Si vous vous connectez avec Google, Google peut déposer ses propres cookies ou stockages
        dans le cadre de son flux d’authentification, régis par les politiques de Google. Les
        prestataires de paiement, s’ils sont utilisés au moment du paiement, peuvent également
        déposer des cookies nécessaires pour finaliser une transaction de façon sécurisée.
      </p>

      <h2>Durée</h2>
      <p>
        Les cookies de session expirent lorsque vous fermez votre navigateur ou vous déconnectez.
        Les éléments persistants (tels qu’un thème mémorisé ou une session enregistrée)
        demeurent jusqu’à leur expiration, jusqu’à ce que vous les effaciez, ou jusqu’à votre
        déconnexion, selon l’élément.
      </p>

      <h2>Comment contrôler les cookies</h2>
      <p>
        Vous pouvez effacer ou bloquer les cookies et les données de site dans les paramètres de
        votre navigateur. Parce que nos cookies sont nécessaires aux fonctionnalités
        essentielles, les bloquer peut vous déconnecter ou réinitialiser vos préférences. Les
        pages d’aide de Chrome, Safari, Firefox et Edge expliquent comment gérer les cookies.
      </p>

      <h2>Modifications</h2>
      <p>
        Nous pouvons mettre à jour la présente Politique lorsque notre utilisation des cookies
        change. La date de « Dernière mise à jour » sera révisée en conséquence.
      </p>

      <h2>Contact</h2>
      <p>
        Questions relatives aux cookies :{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
      </p>
    </>
  );
}
