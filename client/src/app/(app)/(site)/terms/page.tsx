import { SitePage } from '@/components/site-page';

export const metadata = { title: 'Terms of Service · Fringo' };

export default function TermsPage() {
  return (
    <SitePage title="Terms of Service">
      <p>Last updated: July 22, 2026</p>
      <p>
        These terms cover use of Fringo — adaptive French practice for TEF/TCF
        prep, available as open-source software and (where offered) a hosted
        demo. The product is <strong>under active development</strong>; features
        may change, break, or be removed without notice.
      </p>

      <h2>Acceptance</h2>
      <p>
        By creating an account or using Fringo you agree to these terms and our{' '}
        <a href="/privacy">Privacy Policy</a>. If you do not agree, do not use
        the service.
      </p>

      <h2>The service</h2>
      <p>
        Fringo provides placement assessment, reading and writing practice,
        progress tracking (XP/levels), and related learning tools. Access may be
        invite-only or rate limited. We may suspend accounts that abuse the
        platform.
      </p>

      <h2>Accounts &amp; security</h2>
      <ul>
        <li>Keep your password confidential</li>
        <li>You are responsible for activity under your account</li>
        <li>
          Do not attempt to access other users’ data or disrupt shared
          infrastructure
        </li>
      </ul>

      <h2>Acceptable use</h2>
      <p>You agree not to use Fringo to:</p>
      <ul>
        <li>Violate applicable laws or third-party rights</li>
        <li>Spam, harass, or distribute malware</li>
        <li>Overload APIs or shared infrastructure beyond fair use</li>
        <li>Probe, scrape, or attack the service</li>
      </ul>

      <h2>Your content</h2>
      <p>
        You retain ownership of content you submit (for example writing
        responses). You grant us a limited license to process that content
        solely to operate the features you use — scoring, feedback, and
        progress. Do not upload secrets or material you are not allowed to use.
      </p>

      <h2>Third-party services</h2>
      <p>
        Model providers, auth providers, databases, and hosting partners have
        their own terms. Your use of those services through Fringo is also
        subject to those terms.
      </p>

      <h2>Disclaimer</h2>
      <p>
        The service is provided <strong>“as is”</strong> without warranties of
        any kind. Practice scores and AI feedback may be wrong, incomplete, or
        unsafe to rely on without review. We are not liable for exam outcomes or
        decisions you make based on Fringo results.
      </p>

      <h2>Open source &amp; contributions</h2>
      <p>
        Fringo is open source and in development. You are welcome to raise
        issues, open pull requests, and contribute code or docs on GitHub:{' '}
        <a
          href="https://github.com/jotx19/fr-content-gen-pipeline"
          target="_blank"
          rel="noopener noreferrer"
        >
          github.com/jotx19/fr-content-gen-pipeline
        </a>
        . Contributions are typically accepted under the project’s existing
        license; by submitting a PR you agree your contribution may be included
        in the project.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms as the product evolves. Continued use after
        changes are posted means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <a href="mailto:singh20x7@gmail.com">singh20x7@gmail.com</a>
      </p>
    </SitePage>
  );
}
