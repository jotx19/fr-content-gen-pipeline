'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView as useInViewFM, useReducedMotion } from 'framer-motion';
import { bricolage, interTight } from '@/lib/fonts';
import { heroCardReading } from '@/modules/home/ui/landing-assets';
import { cn } from '@/lib/utils';

const featuresFont = interTight.className;

export function FeaturesBridge({ ctaHref }: { ctaHref: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mb-12 flex flex-col items-center gap-6 pt-6 text-center sm:mb-16 sm:pt-10 md:mb-20">
      <motion.h2
        className={cn(
          bricolage.className,
          'max-w-3xl text-[1.85rem] leading-[1.15] font-semibold tracking-tight text-foreground sm:text-[2.5rem] sm:leading-[1.12] lg:text-[3rem]',
        )}
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        Everything you need to improve —
        <br className="hidden sm:block" />
        placement, practice, and progress.
      </motion.h2>
      <motion.p
        className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
        initial={reduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        Adaptive MCQs, TCF-style writing, and XP that moves with every session.
      </motion.p>
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.45, delay: reduceMotion ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href={ctaHref}
          className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-opacity hover:opacity-90"
        >
          Start free
        </Link>
      </motion.div>
    </div>
  );
}

export function WordsReveal({
  text,
  className,
  as = 'span',
  step = 0.06,
  delay = 0,
  duration = 0.7,
  active,
}: {
  text: string;
  className?: string;
  as?: 'span' | 'h2' | 'h3' | 'p';
  step?: number;
  delay?: number;
  duration?: number;
  active?: boolean;
}) {
  const words = text.split(' ');
  const MotionTag = motion[as] as typeof motion.span;
  const triggerProps =
    active === undefined
      ? { whileInView: 'visible' as const, viewport: { once: true, margin: '-80px' } }
      : { animate: active ? ('visible' as const) : ('hidden' as const) };
  return (
    <MotionTag
      className={className}
      initial="hidden"
      {...triggerProps}
      transition={{ staggerChildren: step, delayChildren: delay }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block' }}
          variants={{
            hidden: { opacity: 0, y: 18 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration, ease: 'easeOut' }}
        >
          {w}
          {i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </MotionTag>
  );
}

function CountUp({
  end,
  duration = 1500,
  active,
  format = (n: number) => n.toLocaleString('en-US'),
}: {
  end: number;
  duration?: number;
  active: boolean;
  format?: (n: number) => string;
}) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end, duration]);
  return <>{format(val)}</>;
}

function CountUpInView({
  end,
  duration = 1500,
  delay = 0,
  format,
  active,
}: {
  end: number;
  duration?: number;
  delay?: number;
  format?: (n: number) => string;
  active?: boolean;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInViewFM(ref, { once: true, margin: '-100px' });
  const trigger = active === undefined ? inView : active;
  const [start, setStart] = useState(false);
  useEffect(() => {
    if (!trigger) return;
    const t = setTimeout(() => setStart(true), delay);
    return () => clearTimeout(t);
  }, [trigger, delay]);
  return (
    <span ref={ref}>
      <CountUp end={end} duration={duration} active={start} format={format} />
    </span>
  );
}

function MiniBars({ values, color }: { values: number[]; color: string }) {
  return (
    <div className="flex h-24 w-full items-end gap-1.5">
      {values.map((v, i) => (
        <motion.div
          key={i}
          className="min-w-0 flex-1 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ height: 0 }}
          whileInView={{ height: `${v}%` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, delay: 0.08 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}

export function FeatureCards() {
  const cardAnim = (delay: number) => ({
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-80px' },
    transition: { duration: 0.65, delay, ease: 'easeOut' as const },
  });
  const [countActive, setCountActive] = useState(false);

  const cardShell =
    'relative flex h-[380px] flex-col overflow-hidden rounded-[1.75rem] px-6 pt-8 sm:h-[420px] lg:h-[440px]';

  return (
    <div className={`${featuresFont} grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-3`}>
      <motion.div
        {...cardAnim(0.1)}
        className={`${cardShell} bg-neutral-950`}
        style={{ backgroundImage: 'radial-gradient(ellipse at 30% 0%, rgba(255,255,255,0.04), transparent 55%)' }}
      >
        <WordsReveal
          as="h3"
          className={`${featuresFont} text-[1.65rem] leading-snug text-neutral-100 sm:text-[1.85rem]`}
          text="Adaptive placement"
          delay={0.15}
        />
        <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-neutral-100/40">
          Short reading set. CEFR level matched from day one.
        </p>
        <div className="mt-auto pb-7">
          <p className="mb-2 text-xs text-neutral-100/35">Accuracy</p>
          <MiniBars values={[42, 48, 55, 58, 64, 72, 81]} color="#6BA3C4" />
          <p className="mt-3 text-3xl font-medium tracking-tight text-neutral-100">
            <CountUpInView end={81} />%
          </p>
        </div>
      </motion.div>

      <motion.div {...cardAnim(0.2)} className={`${cardShell} bg-neutral-900`}>
        <WordsReveal
          as="h3"
          className={`${featuresFont} text-[1.65rem] leading-snug text-neutral-100 sm:text-[1.85rem]`}
          text="Daily MCQs"
          delay={0.25}
        />
        <p className="mt-3 max-w-[240px] text-sm leading-relaxed text-neutral-100/40">
          Instant feedback on the skills you need most.
        </p>
        <motion.div
          className="absolute bottom-0 left-1/2 h-[180px] w-[48%] sm:h-[200px]"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.35 }}
          style={{ x: '-50%' }}
        >
          <img src={heroCardReading} alt="" className="h-full w-full object-contain object-bottom opacity-90" />
        </motion.div>
      </motion.div>

      <motion.div
        {...cardAnim(0.3)}
        onViewportEnter={() => setCountActive(true)}
        className={cardShell}
        style={{ backgroundColor: '#D0C9B9' }}
      >
        <p className="text-sm text-neutral-900/45">Writing XP</p>
        <WordsReveal
          as="h3"
          className={`${featuresFont} mt-2 text-[1.65rem] leading-snug font-normal text-neutral-900 sm:text-[1.85rem]`}
          text="Level up toward B2"
          delay={0.35}
          step={0.06}
        />
        <div className="mt-auto pb-7">
          <MiniBars values={[28, 35, 42, 50, 58, 66, 78]} color="#3D3010" />
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl leading-none tracking-tight text-neutral-900">
              +
              <CountUp end={67} duration={1600} active={countActive} />
            </span>
            <span className="text-sm text-neutral-900/55">XP</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
