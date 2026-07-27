'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';
import { bricolage } from '@/lib/fonts';
import { useAuthStore } from '@/store/authStore';

const ease = [0.22, 1, 0.36, 1] as const;
const fade = { duration: 0.28, ease };

/**
 * Drops-style fan: tight overlap, mild arc, center card in front.
 * Offset is distance from center (…-3,-2,-1,0,1,2,3).
 */
const HERO_CARDS = [
  { src: '/home/hero-cards/h.png', bg: '#CC6E22', offset: -3, label: '@reading' },
  { src: '/home/hero-cards/k.png', bg: '#3D7A52', offset: -2, label: '@writing' },
  { src: '/home/hero-cards/a.png', bg: '#3D58C4', offset: -1, label: '@mcq' },
  { src: '/home/hero-cards/s.png', bg: '#B83838', offset: 0, label: '@progress' },
  { src: '/home/hero-cards/a.png', bg: '#3D58C4', offset: 1, label: '@placement' },
  { src: '/home/hero-cards/k.png', bg: '#3D7A52', offset: 2, label: '@tef' },
  { src: '/home/hero-cards/h.png', bg: '#CC6E22', offset: 3, label: '@cefr' },
] as const;

const bubbleJelly = {
  scaleX: [1, 1.25, 0.75, 1.15, 0.95, 1.05, 1],
  scaleY: [1, 0.75, 1.25, 0.85, 1.05, 0.95, 1],
};

/** @name chat-bubble tooltip with a triangle tail. Optional jelly squash-stretch pop. */
function HeroCardBubble({
  label,
  color,
  show,
  jelly = true,
}: {
  label: string;
  color: string;
  show: boolean;
  jelly?: boolean;
}) {
  return (
    <AnimatePresence>
      {show ? (
        <motion.div
          className="pointer-events-none absolute bottom-full left-1/2 z-40 mb-6 -translate-x-1/2 whitespace-nowrap"
          style={{ transformOrigin: 'bottom center' }}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={jelly ? { opacity: 1, ...bubbleJelly } : { opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: jelly ? 0.5 : 0.18, ease: 'easeOut' }}
        >
          <div
            className="rounded-full px-5 py-2 text-[14px] font-semibold text-white shadow-[0_8px_24px_-6px_rgba(0,0,0,0.5)]"
            style={{ backgroundColor: color }}
          >
            {label}
          </div>
          <span
            className="absolute left-1/2 -translate-x-1/2"
            style={{
              bottom: -8,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: `10px solid ${color}`,
            }}
            aria-hidden
          />
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function cardTransform(offset: number) {
  const abs = Math.abs(offset);
  return {
    rotate: offset * 7,
    y: abs * 18,
    scale: 1 - abs * 0.045,
    z: 10 - abs,
  };
}

function HeroCardFace({
  src,
  bg,
  className,
}: {
  src: string;
  bg: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center',
        'h-[15.5rem] w-[12rem] rounded-[1.75rem]',
        'sm:h-[15rem] sm:w-[12.5rem] sm:rounded-[1.1rem]',
        'lg:h-[17.5rem] lg:w-[14rem] lg:rounded-[1.1rem]',
        'shadow-[0_18px_40px_-18px_rgba(0,0,0,0.28)] dark:shadow-[0_22px_48px_-20px_rgba(0,0,0,0.65)]',
        'ring-1 ring-black/5',
        className,
      )}
      style={{ backgroundColor: bg }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- local hero product PNGs */}
      <img
        src={src}
        alt=""
        draggable={false}
        decoding="async"
        className="h-[82%] w-[82%] object-contain select-none"
      />
    </div>
  );
}

/** Wrap index delta into −floor(n/2)…floor(n/2) so the arc stays oval. */
function relativeOffset(index: number, active: number, length: number) {
  let diff = index - active;
  const half = Math.floor(length / 2);
  if (diff > half) diff -= length;
  if (diff < -half) diff += length;
  return diff;
}

const MOBILE_CARD_W = 164;
const MOBILE_STEP_X = 98;
const carouselEase = { type: 'spring' as const, stiffness: 240, damping: 28, mass: 0.85 };

/**
 * Mobile coverflow: center card lifts (offset 0), sides drop.
 * Auto-advances so the right card rises into center and the left sinks away.
 */
function HeroCardCarousel({ reduceMotion }: { reduceMotion: boolean }) {
  const centerStart = HERO_CARDS.findIndex((c) => c.offset === 0);
  const [active, setActive] = useState(
    centerStart >= 0 ? centerStart : Math.floor(HERO_CARDS.length / 2),
  );

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % HERO_CARDS.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div
      className="relative -mx-4 h-[340px] w-[calc(100%+2rem)] overflow-x-clip pt-10 sm:hidden"
      aria-hidden
    >
      <div className="relative mx-auto h-full w-full max-w-md">
        {HERO_CARDS.map((card, index) => {
          const offset = relativeOffset(index, active, HERO_CARDS.length);
          const t = cardTransform(offset);
          const abs = Math.abs(offset);
          const isCenter = offset === 0;

          return (
            <motion.div
              key={`${card.label}-${index}`}
              className="absolute bottom-6 left-1/2"
              style={{
                width: MOBILE_CARD_W,
                marginLeft: -MOBILE_CARD_W / 2,
                zIndex: t.z,
              }}
              initial={false}
              animate={{
                x: offset * MOBILE_STEP_X,
                y: t.y,
                rotate: t.rotate,
                scale: t.scale,
                opacity: abs > 3 ? 0 : 1,
              }}
              transition={reduceMotion ? { duration: 0 } : carouselEase}
            >
              <HeroCardBubble label={card.label} color={card.bg} show={isCenter} />
              <HeroCardFace
                src={card.src}
                bg={card.bg}
                className="h-[15.5rem] w-[12rem] rounded-[1.5rem]"
              />
            </motion.div>
          );
        })}
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-14 bg-gradient-to-r from-background via-background/80 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-14 bg-gradient-to-l from-background via-background/80 to-transparent"
        aria-hidden
      />
    </div>
  );
}

/** Desktop+: Drops-style stationary fan with @name bubble tooltips. */
function HeroCardFan({ reduceMotion }: { reduceMotion: boolean }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="relative mx-auto hidden h-[360px] w-full max-w-5xl items-end justify-center overflow-visible sm:flex lg:h-[420px]">
      <div className="flex items-end justify-center overflow-visible pl-8 sm:pl-12">
        {HERO_CARDS.map((card, index) => {
          const t = cardTransform(card.offset);
          const hoverKey = `${card.label}-${index}`;
          const isHovered = hovered === hoverKey;

          return (
            <motion.div
              key={hoverKey}
              className={cn(
                'relative shrink-0 cursor-pointer',
                index > 0 && '-ml-10 sm:-ml-14 lg:-ml-16',
              )}
              style={{ zIndex: isHovered ? 30 : t.z }}
              onHoverStart={() => setHovered(hoverKey)}
              onHoverEnd={() => setHovered((prev) => (prev === hoverKey ? null : prev))}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: t.y + 28, rotate: t.rotate, scale: t.scale }
              }
              animate={{
                opacity: 1,
                y: t.y,
                rotate: t.rotate,
                scale: t.scale,
              }}
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      y: t.y - 12,
                      scale: t.scale * 1.03,
                      transition: { duration: 0.15, ease },
                    }
              }
              transition={{
                ...fade,
                delay: reduceMotion ? 0 : index * 0.02,
              }}
            >
              <HeroCardBubble
                label={card.label}
                color={card.bg}
                show={isHovered}
                jelly={false}
              />
              <HeroCardFace src={card.src} bg={card.bg} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function LandingHeroSection() {
  const reduceMotion = useReducedMotion() ?? false;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const primaryHref = isAuthenticated ? '/learn' : '/signin';

  return (
    <section
      id="features"
      className="relative z-10 flex min-h-[calc(100dvh-5rem)] flex-col overflow-visible px-4 pb-0 pt-8 sm:min-h-[calc(100dvh-3.5rem)] sm:px-8 sm:pb-0 sm:pt-12"
      aria-label="Fringo home"
    >
      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-[0.95] flex-col items-center justify-center text-center">
        <motion.h1
          className={cn(
            bricolage.className,
            'max-w-4xl text-[2.65rem] leading-[1.08] font-semibold tracking-[-0.035em] text-foreground sm:text-[3.25rem] sm:leading-[1.05] lg:text-[4rem]',
          )}
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade}
        >
          Learn French with Clarity
          and  Fringo
        </motion.h1>

        <motion.p
          className="mt-4 max-w-md md:text-xs text-[10px] leading-[1.7] text-muted-foreground sm:mt-5"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade}
        >
          Adaptive placement, daily practice, and full progress reports everything you need to
          reach your French goals. Start free and learn at your own pace.
        </motion.p>

        <motion.div
          className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:mt-8"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fade}
        >
          <Link
            href={primaryHref}
            className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-[15px] font-medium text-background transition-transform duration-200 hover:scale-105 active:scale-[1.02] sm:h-12 sm:px-7"
          >
            {isAuthenticated ? 'Explore' : 'Start free'}
          </Link>
          <Link
            href="/learn"
            className="inline-flex h-11 items-center rounded-full bg-black/5 px-6 text-[15px] font-medium text-foreground transition-transform duration-200 hover:scale-105 active:scale-[1.02] dark:bg-white/10 sm:h-12 sm:px-7"
          >
            Learn more
          </Link>
        </motion.div>
      </div>

      <div className="relative z-20 mt-auto w-full -translate-y-8 overflow-visible pb-2 sm:-translate-y-12 sm:pb-4 lg:-translate-y-16">
        <HeroCardCarousel reduceMotion={reduceMotion} />
        <HeroCardFan reduceMotion={reduceMotion} />
      </div>
    </section>
  );
}
