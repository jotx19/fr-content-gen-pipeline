'use client';

import Link from 'next/link';

import { LogoIcon } from '@/components/logo';
import { useI18n } from '@/lib/i18n';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: readonly { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-black dark:text-white">
        {title}
      </p>
      <ul className="mt-3 space-y-2 text-[13px] text-black/65 dark:text-white/65">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="transition-colors hover:text-black dark:hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        bricolage.className,
        'border-t border-black/10 bg-background text-foreground dark:border-white/10',
      )}
    >
      <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <Link href="/" className="inline-flex h-fit shrink-0 items-center gap-2">
            <LogoIcon size={28} rounded="xl" />
            <span className="text-sm font-semibold tracking-tight">fringo</span>
          </Link>

          <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:flex sm:gap-14 md:gap-16">
            <FooterColumn
              title={t('footer.product')}
              links={[
                { href: '/#features', label: t('common.features') },
                { href: '/#pricing', label: t('common.pricing') },
                { href: '/#faq', label: t('common.faq') },
              ]}
            />
            <FooterColumn
              title={t('footer.support')}
              links={[{ href: '/contact', label: t('common.contact') }]}
            />
            <FooterColumn
              title={t('footer.legal')}
              links={[
                { href: '/terms', label: t('footer.terms') },
                { href: '/privacy', label: t('footer.privacy') },
                { href: '/cookies', label: t('footer.cookies') },
                { href: '/refunds', label: t('footer.refunds') },
              ]}
            />
          </div>
        </div>

        <div className="mt-12 border-t border-black/10 pt-6 text-[12px] text-black/50 dark:border-white/10 dark:text-white/50">
          <p>{t('footer.copyright', { year })}</p>
        </div>
      </div>
    </footer>
  );
}
