'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { ArrowRight, Check, Plus } from '@/components/icons';
import { bricolage, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { FeaturesBridge } from './landing-helpers';

const ease = [0.22, 1, 0.36, 1] as const;

const STREAK_DAYS = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0] as const;

const FAQ_ITEMS = [
  {
    q: 'What is Fringo?',
    a: 'Fringo is a focused French practice app built for learners preparing for exams like TEF and TCF. You place your CEFR level once, then practice reading and writing in short sessions that fit a real schedule. The goal is clear progress you can feel week to week, not another endless content library you never finish.',
  },
  {
    q: 'Is Fringo free to start?',
    a: 'Yes. The Free plan includes CEFR placement, daily reading practice, writing prompts, streaks, and XP, so you can start without a card. When you want unlimited lessons, fuller writing feedback, and progress reports, Pro unlocks those extras. You can stay on Free as long as you like and upgrade only when it makes sense.',
  },
  {
    q: 'How does placement work?',
    a: 'A short CEFR placement test estimates your level in a few minutes. Fringo uses that result to match reading difficulty and writing expectations to where you actually are, instead of forcing a one-size-fits-all path. You get practice that feels challenging enough to grow, without jumping into material that wastes your time.',
  },
  {
    q: 'Can I practice reading and writing?',
    a: 'Yes, both skills are first-class. Reading uses exam-style passages to build comprehension, vocabulary, and pacing under conditions closer to the real test. Writing gives structured prompts plus feedback on clarity, structure, and language so you can revise with purpose. Together they cover the written side of TEF and TCF prep without splitting your attention across five different apps.',
  },
  {
    q: 'How do streaks help?',
    a: 'Every session you finish grows your streak and earns XP, with milestones and level-ups along the way. That visible chain makes it easier to come back tomorrow, even on busy days, because progress is concrete instead of vague. Streaks are there to support consistency, not to punish you, so short daily practice still counts.',
  },
] as const;

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    blurb: 'Start placing and practicing without a card.',
    features: [
      'CEFR placement test',
      'Daily reading practice',
      'Writing prompts',
      'Streaks and XP',
    ],
    cta: 'Start free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/ month',
    blurb: 'Unlimited practice with deeper feedback when you are ready.',
    features: [
      'Everything in Free',
      'Unlimited lessons',
      'Full writing feedback',
      'Progress reports',
      'Priority updates',
    ],
    cta: 'Go Pro',
    featured: true,
  },
] as const;

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
            Built for coming back
          </p>
          <h2
            id="streak-heading"
            className={cn(
              bricolage.className,
              'mt-3 text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-white sm:text-[2.75rem]',
            )}
          >
            Streaks that feel worth keeping.
          </h2>
          <p
            className={`${inter.className} mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-[15px]`}
          >
            Hit a session, grow the day bar, unlock milestones. Level-ups and XP celebrations make
            progress visible, so motivation is not guesswork.
          </p>
          <Link
            href={ctaHref}
            className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-white px-6 text-[15px] font-medium text-black transition-opacity hover:opacity-90"
          >
            Keep your streak
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
                  day streak
                </p>
              </div>
              <p
                className={`${inter.className} mb-1 max-w-[9rem] text-right text-xs leading-snug text-white/55`}
              >
                Next milestone at day 14
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

  return (
    <section
      id="pricing"
      className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24"
      aria-labelledby="pricing-heading"
    >
      <SectionFade className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
        <p
          className={`${inter.className} text-[11px] font-medium uppercase tracking-[0.18em] text-black/55 dark:text-white/55`}
        >
          Pricing
        </p>
        <h2
          id="pricing-heading"
          className={cn(
            bricolage.className,
            'mt-3 text-[1.75rem] font-semibold leading-[1.12] tracking-tight text-black dark:text-white sm:text-[2.75rem]',
          )}
        >
          Simple plans. Start free.
        </h2>
        <p
          className={`${inter.className} mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/70 dark:text-white/70 sm:text-[15px]`}
        >
          Place your level and practice every day. Upgrade when you want more lessons and deeper
          feedback.
        </p>
      </SectionFade>

      <div className="mx-auto grid max-w-4xl gap-4 sm:gap-5 md:grid-cols-2">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={reduceMotion ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.06 + i * 0.08, ease }}
            className={cn(
              'flex flex-col rounded-[1.5rem] px-5 py-7 sm:rounded-[2rem] sm:px-8 sm:py-10',
              plan.featured
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-black/[0.04] text-black dark:bg-white/[0.06] dark:text-white',
            )}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className={`${bricolage.className} text-xl font-semibold sm:text-2xl`}>
                {plan.name}
              </h3>
              {plan.featured ? (
                <span
                  className={`${inter.className} text-[11px] font-medium uppercase tracking-[0.14em] text-white/70 dark:text-black/70`}
                >
                  Popular
                </span>
              ) : null}
            </div>

            <div className="mt-5 flex items-end gap-1.5">
              <span
                className={`${bricolage.className} text-[3rem] font-semibold leading-none tracking-tight sm:text-[3.5rem]`}
              >
                {plan.price}
              </span>
              <span
                className={cn(
                  `${inter.className} mb-1.5 text-sm`,
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
                `${inter.className} mt-4 text-sm leading-relaxed`,
                plan.featured
                  ? 'text-white/80 dark:text-black/80'
                  : 'text-black/70 dark:text-white/70',
              )}
            >
              {plan.blurb}
            </p>

            <ul className="mt-7 flex flex-col gap-3">
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  className={cn(
                    `${inter.className} flex items-start gap-2.5 text-sm`,
                    plan.featured
                      ? 'text-white/85 dark:text-black/85'
                      : 'text-black/80 dark:text-white/80',
                  )}
                >
                  <Check
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0',
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
                'mt-9 inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[15px] font-medium transition-opacity hover:opacity-90',
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

  return (
    <section
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
          FAQ
        </h2>

        <ul className="mt-10 sm:mt-14">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = open === i;
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-button-${i}`;
            const isLast = i === FAQ_ITEMS.length - 1;

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
  const ctaHref = isAuthenticated ? '/learn' : '/signin';
  const ctaLabel = isAuthenticated ? 'Continue learning' : 'Start free';

  return (
    <div className="relative z-10">
      <section
        id="product"
        className="relative z-10 mx-auto max-w-6xl px-5 pb-6 pt-10 sm:px-8 sm:pt-16"
        aria-label="Product features"
      >
        <FeaturesBridge ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </section>

      <StreakBand ctaHref={ctaHref} />
      <Pricing ctaHref={ctaHref} />
      <FaqSection />
    </div>
  );
}
