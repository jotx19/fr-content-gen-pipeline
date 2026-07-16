'use client';

import type * as React from 'react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform, animate, useInView as useInViewFM } from 'framer-motion';
import { interTight } from '@/lib/fonts';
import {
  blueArrowUrl,
  checkMarkUrl,
  heroCardLearn,
  heroCardProgress,
  heroCardReading,
  heroCardWriting,
  heroImage,
} from '@/modules/home/ui/landing-assets';

const featuresFont = interTight.className;

export function ToolIcon({ src, className, style }: { src: string; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`size-9 relative bg-white/10 rounded-lg flex items-center justify-center ${className ?? ''}`} style={style}>
      <img src={src} alt="" width={20} height={20} />
    </div>
  );
}

export function StaggeredWords({
  text,
  baseDelay = 0,
  step = 90,
  active = true,
  groupSize = 1,
}: {
  text: string;
  baseDelay?: number;
  step?: number;
  active?: boolean;
  groupSize?: number;
}) {
  const words = text.split(' ');
  return (
    <>
      {words.map((w, i) => {
        const group = Math.floor(i / groupSize);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: active ? undefined : 0,
              animation: active ? 'rise-up 0.9s ease-out forwards' : undefined,
              animationDelay: active ? `${baseDelay + group * step}ms` : undefined,
            }}
          >
            {w}
            {i < words.length - 1 ? '\u00A0' : ''}
          </span>
        );
      })}
    </>
  );
}

export function CountNumber({ to, duration = 1.5, start }: { to: number; duration?: number; start: boolean }) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  useEffect(() => {
    if (!start) return;
    const controls = animate(mv, to, { duration, ease: 'easeOut' });
    return () => controls.stop();
  }, [start, to, duration, mv]);
  return <motion.span>{rounded}</motion.span>;
}

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInViewFM(ref, { once: true, margin: '-100px' });

  const cursorKeyframes = {
    opacity: [0, 1, 1, 1, 1],
    x: [100, -125, 35, 115, 115],
    y: [100, -10, -10, 40, 40],
  };
  const cursorTransition = {
    duration: 2.6,
    delay: 0.9,
    times: [0, 0.25, 0.6, 0.85, 1],
    ease: 'easeInOut' as const,
  };

  return (
    <section className="bg-black py-24">
      <div ref={ref} className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 px-5 md:flex-row">
        <motion.div
          className="flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0 }}
        >
          <span className="text-6xl text-neutral-100">
            <CountNumber to={6} start={inView} />
          </span>
          <p className="max-w-[250px] text-2xl text-neutral-100 opacity-40">CEFR levels from A1 to C2</p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center gap-4 text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        >
          <span className="text-6xl text-neutral-100">
            <CountNumber to={4} start={inView} />
          </span>
          <p className="max-w-[340px] text-2xl text-neutral-100 opacity-40">TEF writing criteria scored every draft</p>
        </motion.div>

        <motion.div
          className="relative w-full max-w-[570px] overflow-hidden rounded-3xl bg-neutral-900 p-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.4 }}
        >
          <p className="text-4xl leading-snug text-white">
            We help you{' '}
            <span className="relative inline-block px-2 py-1 align-baseline">
              <motion.span
                aria-hidden
                className="absolute inset-0 origin-left rounded-sm bg-white"
                initial={{ scaleX: 0 }}
                animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ duration: 0.91, delay: 1.55, ease: 'linear' }}
                style={{ transformOrigin: 'left center' }}
              />
              <span className="relative font-medium text-white">reach TEF goals</span>
              <motion.span
                aria-hidden
                className="absolute inset-0 px-2 py-1 font-medium whitespace-nowrap text-stone-950"
                initial={{ clipPath: 'inset(0 100% 0 0)' }}
                animate={inView ? { clipPath: 'inset(0 0% 0 0)' } : { clipPath: 'inset(0 100% 0 0)' }}
                transition={{ duration: 0.91, delay: 1.55, ease: 'linear' }}
              >
                reach TEF goals
              </motion.span>
            </span>{' '}
            with adaptive practice
          </p>
          <motion.div
            className="pointer-events-none absolute"
            style={{ top: '40%', left: '55%' }}
            initial={{ opacity: 0, x: 100, y: 100 }}
            animate={inView ? cursorKeyframes : { opacity: 0, x: 100, y: 100 }}
            transition={cursorTransition}
          >
            <img src={blueArrowUrl} alt="" width={28} height={28} />
            <span className="absolute top-[22px] left-[18px] rounded-tr-md rounded-br-md rounded-bl-md bg-blue-500 px-2 py-1 text-xs font-medium whitespace-nowrap text-white">
              Learner
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export function TypingPlaceholderInput({
  placeholder,
  startDelay = 0,
  speed = 70,
}: {
  placeholder: string;
  startDelay?: number;
  speed?: number;
}) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    let cancelled = false;
    let i = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const start = setTimeout(() => {
      const tick = () => {
        if (cancelled) return;
        i += 1;
        setShown(placeholder.slice(0, i));
        if (i < placeholder.length) {
          timer = setTimeout(tick, speed);
        } else {
          setDone(true);
        }
      };
      tick();
    }, startDelay);
    return () => {
      cancelled = true;
      clearTimeout(start);
      if (timer) clearTimeout(timer);
    };
  }, [placeholder, startDelay, speed]);
  return (
    <input
      type="text"
      placeholder={done ? placeholder : shown}
      className="min-w-0 flex-1 bg-transparent text-sm text-neutral-100 outline-none placeholder:text-transparent sm:placeholder:text-neutral-400"
    />
  );
}

export function Typewriter({
  text,
  className,
  speed = 20,
  delay = 0,
}: {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLPreElement>(null);
  const inView = useInViewFM(ref, { once: true, margin: '-80px' });
  const [shown, setShown] = useState('');
  useEffect(() => {
    if (!inView) return;
    let i = 0;
    let raf = 0;
    const start = setTimeout(() => {
      const tick = () => {
        i += 1;
        setShown(text.slice(0, i));
        if (i < text.length) raf = window.setTimeout(tick, speed) as unknown as number;
      };
      tick();
    }, delay * 1000);
    return () => {
      clearTimeout(start);
      clearTimeout(raf);
    };
  }, [inView, text, speed, delay]);
  return (
    <pre ref={ref} className={className}>
      {shown}
      <span className="inline-block w-[0.5ch] -mb-0.5 animate-pulse bg-white/60" style={{ height: '1em' }} />
    </pre>
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

export function SectionHeader({ ctaHref }: { ctaHref: string }) {
  return (
    <div className={`${featuresFont} mb-10 flex flex-col items-start justify-between gap-6 sm:mb-14 md:mb-16 md:flex-row`}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex w-full flex-col gap-10 md:max-w-[690px]"      >
        <WordsReveal
          as="h2"
          className={`${featuresFont} text-3xl leading-tight font-normal text-foreground sm:text-4xl`}
          text="Everything you need to improve placement, daily MCQs, and writing feedback that actually teaches."        />
        <div className="flex items-center gap-4">
          <Link
            href={ctaHref}
            className="rounded-xl bg-foreground px-5 py-3.5 text-[15px] font-medium text-background transition-opacity hover:opacity-90"
          >
            Start free
          </Link>
          <span className="text-sm text-muted-foreground md:hidden">Learn at your pace</span>
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        className="hidden shrink-0 text-right text-lg text-muted-foreground md:block"
      >
        Learn at your pace
      </motion.p>
    </div>
  );
}

export function PillReveal({ delay, children }: { delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      className="flex grow"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

export function Pill({
  label,
  icon,
  bg,
  text,
  iconBg,
  invertIcon = false,
}: {
  label: string;
  icon: string;
  bg: string;
  text: string;
  iconBg: string;
  invertIcon?: boolean;
}) {
  return (
    <div
      style={{ backgroundColor: bg }}
      className={`flex h-20 w-full min-w-0 grow cursor-pointer items-center gap-4 rounded-2xl px-8 transition-transform hover:scale-[1.02] ${text}`}
    >
      <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <img src={icon} alt="" width={20} height={20} style={invertIcon ? { filter: 'brightness(0)' } : undefined} />
      </div>
      <span className="truncate text-2xl font-medium">{label}</span>
    </div>
  );
}

export function CountUp({
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

export function CountUpInView({
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

export function PricingPlan({
  price,
  description,
  features,
  cta,
  ctaClass,
  href,
}: {
  price: string;
  description: string;
  features: { label: string; dim?: boolean }[];
  cta: string;
  ctaClass: string;
  href: string;
}) {
  const item = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 },
  };
  return (
    <motion.div
      className="flex flex-col"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      transition={{ staggerChildren: 0.12, delayChildren: 0.2 }}
    >
      <motion.div className="flex items-baseline gap-3" variants={item} transition={{ duration: 0.55, ease: 'easeOut' }}>
        <span className="text-4xl font-medium text-stone-950">{price}</span>
        <span className="text-2xl text-stone-950/50">/ month</span>
      </motion.div>
      <motion.p className="mt-6 text-2xl text-stone-950" variants={item} transition={{ duration: 0.55, ease: 'easeOut' }}>
        {description}
      </motion.p>
      <motion.div className="my-8 border-t border-black/10" variants={item} transition={{ duration: 0.5, ease: 'easeOut' }} />
      <div className="flex flex-col gap-6">
        {features.map((f) => (
          <motion.div key={f.label} className="flex items-center gap-5" variants={item} transition={{ duration: 0.55, ease: 'easeOut' }}>
            <div className={`flex size-6 shrink-0 items-center justify-center rounded-full bg-stone-950 ${f.dim ? 'opacity-20' : ''}`}>
              <img src={checkMarkUrl} alt="" width={20} height={20} />
            </div>
            <span className="text-lg text-stone-950">{f.label}</span>
          </motion.div>
        ))}
      </div>
      <motion.div variants={item} transition={{ duration: 0.55, ease: 'easeOut' }}>
        <Link href={href} className={`mt-10 block w-full rounded-xl py-4 text-center font-medium ${ctaClass}`}>
          {cta}
        </Link>
      </motion.div>
    </motion.div>
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

export function PracticeShowcase() {
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 sm:grid-cols-2 lg:grid-cols-4">
      {[
        { src: heroCardReading, bg: '#CC6E22', label: 'Reading' },
        { src: heroCardWriting, bg: '#6A4BC7', label: 'Writing' },
        { src: heroCardLearn, bg: '#3D58C4', label: 'Learn' },
        { src: heroCardProgress, bg: '#B83838', label: 'Progress' },
      ].map((card, i) => (
        <motion.div
          key={card.label}
          className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
          style={{ backgroundColor: card.bg }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.08 * i, ease: 'easeOut' }}
        >
          <img src={card.src} alt={card.label} className="absolute inset-0 h-full w-full scale-[0.82] object-contain p-6" />
          <span className="absolute bottom-4 left-4 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
            {card.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export { heroImage };
