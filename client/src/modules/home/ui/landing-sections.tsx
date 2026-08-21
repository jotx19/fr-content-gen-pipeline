'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { ArrowRight, Check, Plus } from '@/components/icons';
import { bricolage, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';
import { useAuthStore } from '@/store/authStore';
import { FeaturesBridge } from './landing-helpers';

const ease = [0.22, 1, 0.36, 1] as const;

const STREAK_DAYS = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0] as const;

function SectionFade({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

function StreakBand({ ctaHref }: { ctaHref: string }) {
  const reduceMotion = useReducedMotion();
  const filled = STREAK_DAYS.filter(Boolean).length;
  const { t } = useI18n();

  return (
    <section
      className="relative overflow-hidden bg-[#1A2E24] text-white"
      aria-labelledby="streak-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 30%, #C9A227 0%, transparent 42%), radial-gradient(circle at 85% 70%, #3D7A52 0%, transparent 40%)',
        }}
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
        <SectionFade>
          <p
            className={`${inter.className} text-[11px] font-medium uppercase tracking-[0.18em] text-white/70`}
          >
            {t('landing.streakEyebrow')}
          </p>
          <h2
            id="streak-heading"
            className={cn(
              bricolage.className,
              'mt-3 text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.75rem]',
            )}
          >
            {t('landing.streakTitle')}
          </h2>
          <p
            className={`${inter.className} mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-[15px]`}
          >
            {t('landing.streakBody')}
          </p>
          <Link
            href={ctaHref}
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-black transition-opacity hover:opacity-90"
          >
            {t('landing.keepStreak')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </SectionFade>

        <SectionFade delay={0.1}>
          <div className="rounded-[1.75rem] bg-white/[0.07] px-5 py-6 sm:px-7 sm:py-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p
                  className={`${bricolage.className} text-[3rem] font-semibold leading-none tracking-tight text-white sm:text-[3.5rem]`}
                >
                  {filled}
                </p>
                <p
                  className={`${inter.className} mt-1 text-[11px] font-medium uppercase tracking-wide text-white/55`}
                >
                  {t('landing.dayStreak')}
                </p>
              </div>
              <p
                className={`${inter.className} mb-1 max-w-[9rem] text-right text-xs leading-snug text-white/55`}
              >
                {t('landing.nextMilestone')}
              </p>
            </div>

            <div className="mt-6 flex items-end gap-2 sm:gap-2.5">
              {STREAK_DAYS.map((on, i) => (
                <motion.div
                  key={i}
                  className={cn(
                    'min-w-0 flex-1 rounded-[5px]',
                    on ? 'bg-white' : 'bg-white/15',
                  )}
                  initial={reduceMotion ? false : { height: 0 }}
                  whileInView={{ height: on ? 72 : 40 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{
                    duration: 0.55,
                    delay: reduceMotion ? 0 : 0.04 + i * 0.04,
                    ease,
                  }}
                />
              ))}
            </div>
          </div>
        </SectionFade>
      </div>
    </section>
  );
}

function Pricing({ ctaHref }: { ctaHref: string }) {
  const reduceMotion = useReducedMotion();
  const { t, m } = useI18n();
  const plans = [
    {
      name: m.landing.plans.free.name,
      price: '$0',
      period: t('common.forever'),
      blurb: m.landing.plans.free.blurb,
      features: m.landing.plans.free.features,
      cta: m.landing.plans.free.cta,
      featured: false,
    },
    {
      name: m.landing.plans.pro.name,
      price: '$12',
      period: t('common.perMonth'),
      blurb: m.landing.plans.pro.blurb,
      features: m.landing.plans.pro.features,
      cta: m.landing.plans.pro.cta,
      featured: true,
    },
  ];

  return (
    <section
      id="pricing"
      className="mx-auto max-w-6xl px-7 py-16 sm:px-8 sm:py-24"
      aria-labelledby="pricing-heading"
    >
      <SectionFade className="mx-auto mb-8 max-w-2xl text-center sm:mb-16">
        <p
          className={`${inter.className} text-[11px] font-medium uppercase tracking-[0.18em] text-black/55 dark:text-white/55`}
        >
          {t('landing.pricingEyebrow')}
        </p>
        <h2
          id="pricing-heading"
          className={cn(
            bricolage.className,
            'mt-3 text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-black dark:text-white sm:text-[2.75rem]',
          )}
        >
          {t('landing.pricingTitle')}
        </h2>
        <p
          className={`${inter.className} mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/70 dark:text-white/70 sm:text-[15px]`}
        >
          {t('landing.pricingBody')}
        </p>
      </SectionFade>

      <div className="mx-auto grid max-w-4xl gap-3 sm:gap-5 md:grid-cols-2">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.06 + i * 0.08, ease }}
            className={cn(
              'flex flex-col rounded-[1.25rem] px-4 py-5 sm:rounded-[2rem] sm:px-8 sm:py-10',
              plan.featured
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-black/[0.04] text-black dark:bg-white/[0.06] dark:text-white',
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className={`${bricolage.className} text-lg font-semibold sm:text-2xl`}>
                {plan.name}
              </h3>
              {plan.featured ? (
                <span
                  className={`${inter.className} text-[11px] font-medium uppercase tracking-[0.14em] text-white/70 dark:text-black/70`}
                >
                  {t('common.popular')}
                </span>
              ) : null}
            </div>

            <div className="mt-3 flex items-end gap-1.5 sm:mt-5">
              <span
                className={`${bricolage.className} text-[2.35rem] font-semibold leading-none tracking-tight sm:text-[3.5rem]`}
              >
                {plan.price}
              </span>
              <span
                className={cn(
                  `${inter.className} mb-1 text-xs sm:mb-1.5 sm:text-sm`,
                  plan.featured
                    ? 'text-white/70 dark:text-black/70'
                    : 'text-black/55 dark:text-white/55',
                )}
              >
                {plan.period}
              </span>
            </div>

            <p
              className={cn(
                `${inter.className} mt-3 text-[13px] leading-relaxed sm:mt-4 sm:text-sm`,
                plan.featured
                  ? 'text-white/80 dark:text-black/80'
                  : 'text-black/70 dark:text-white/70',
              )}
            >
              {plan.blurb}
            </p>

            <ul className="mt-5 flex flex-col gap-2 sm:mt-7 sm:gap-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className={cn(
                    `${inter.className} flex items-start gap-2 text-[13px] sm:gap-2.5 sm:text-sm`,
                    plan.featured
                      ? 'text-white/85 dark:text-black/85'
                      : 'text-black/80 dark:text-white/80',
                  )}
                >
                  <Check
                    className={cn(
                      'mt-0.5 h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4',
                      plan.featured
                        ? 'text-white dark:text-black'
                        : 'text-black/70 dark:text-white/70',
                    )}
                    strokeWidth={2.5}
                  />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={ctaHref}
              className={cn(
                'mt-6 inline-flex h-9 items-center justify-center gap-2 rounded-full px-5 text-[13px] font-medium transition-opacity hover:opacity-90 sm:mt-9 sm:h-11 sm:px-6 sm:text-[15px]',
                plan.featured
                  ? 'bg-white text-black dark:bg-black dark:text-white'
                  : 'bg-black text-white dark:bg-white dark:text-black',
              )}
            >
              {plan.cta}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();
  const { t, m } = useI18n();

  return (
    <section
      id="faq"
      className="px-5 py-16 sm:px-8 sm:py-24"
      aria-labelledby="faq-heading"
    >
      <SectionFade className="mx-auto max-w-2xl">
        <h2
          id="faq-heading"
          className={cn(
            bricolage.className,
            'text-center text-[1.45rem] font-semibold leading-[1.1] tracking-tight text-black dark:text-white sm:text-[2.75rem]',
          )}
        >
          {t('landing.faqTitle')}
        </h2>

        <ul className="mt-10 sm:mt-14">
          {m.landing.faq.map((item, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            const isLast = i === m.landing.faq.length - 1;

            return (
              <li
                key={item.q}
                className={cn(
                  !isLast && 'border-b border-black/10 dark:border-white/10',
                )}
              >
                <button
                  type="button"
                  id={buttonId}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left sm:py-6"
                >
                  <span
                    className={cn(
                      inter.className,
                      'text-[15px] font-medium tracking-tight text-black dark:text-white sm:text-[17px]',
                    )}
                  >
                    {item.q}
                  </span>
                  <Plus
                    className={cn(
                      'h-4 w-4 shrink-0 text-black/55 transition-transform duration-300 dark:text-white/55',
                      isOpen && 'rotate-45',
                    )}
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={reduceMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduceMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease }}
                      className="overflow-hidden"
                    >
                      <p
                        className={`${inter.className} pb-5 pr-10 text-sm leading-relaxed text-black/70 dark:text-white/70 sm:pb-6 sm:text-[15px]`}
                      >
                        {item.a}
                      </p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </SectionFade>
    </section>
  );
}

export function LandingSections() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { t } = useI18n();
  const ctaHref = isAuthenticated ? '/learn' : '/signin';
  const ctaLabel = isAuthenticated ? t('common.continue') : t('landing.startFree');

  return (
    <div className="relative z-10">
      <section
        id="product"
        className="relative z-10 mx-auto max-w-6xl px-5 pb-6 pt-10 sm:px-8 sm:pt-16"
        aria-label={t('common.features')}
      >
        <FeaturesBridge ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </section>

      <StreakBand ctaHref={ctaHref} />
      <Pricing ctaHref={ctaHref} />
      <FaqSection />
    </div>
  );
}
