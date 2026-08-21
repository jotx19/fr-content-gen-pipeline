'use client';

import { useCallback, useEffect, useId, useRef, useState, type MouseEvent } from 'react';
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';

import { playfair } from '@/lib/fonts';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

type GraphicType =
  | 'waveformBars'
  | 'gridBlocks'
  | 'noiseLines'
  | 'fluidGrid'
  | 'interfaceBlueprint';

type CraftCard = {
  id: string;
  title: string;
  description: string;
  background: string;
  foreground: string;
  bodyColor: string;
  graphicType: GraphicType;
};

const CARDS: CraftCard[] = [
  {
    id: '1',
    title: 'Adaptive\nPlacement',
    description:
      'A short reading set that maps you to CEFR so practice starts at the right level.',
    background: '#E54F10',
    foreground: '#FFFFC2',
    bodyColor: 'rgba(255, 255, 194, 0.7)',
    graphicType: 'waveformBars',
  },
  {
    id: '2',
    title: 'Reading\nModules',
    description:
      'Passages, finding info, and MCQ sets scored like the real exam modules.',
    background: '#F6EBD9',
    foreground: '#524733',
    bodyColor: 'rgba(82, 71, 51, 0.8)',
    graphicType: 'gridBlocks',
  },
  {
    id: '3',
    title: 'Writing\nPractice',
    description:
      'TCF-style prompts with feedback that shows exactly what to fix next.',
    background: '#0A90D2',
    foreground: '#AEFFFF',
    bodyColor: 'rgba(174, 255, 255, 0.8)',
    graphicType: 'noiseLines',
  },
  {
    id: '4',
    title: 'Streaks &\nXP',
    description:
      'Day bars, milestones, and level-ups that make coming back feel worth it.',
    background: '#53F399',
    foreground: '#004D00',
    bodyColor: 'rgba(0, 77, 0, 0.7)',
    graphicType: 'fluidGrid',
  },
  {
    id: '5',
    title: 'Progress\nReports',
    description:
      'Level, confidence, and session history so you always know where you stand.',
    background: '#211F1E',
    foreground: '#F6EBD9',
    bodyColor: 'rgba(246, 235, 217, 0.7)',
    graphicType: 'interfaceBlueprint',
  },
];

/** Desktop fan layout (Interface Craft desktop offsets). */
const FAN: Record<string, { rotation: number; offsetX: number; offsetY: number }> = {
  '1': { rotation: -8, offsetX: -306, offsetY: -10 },
  '2': { rotation: 4, offsetX: -151, offsetY: 20 },
  '3': { rotation: -2, offsetX: 0, offsetY: -41 },
  '4': { rotation: 1, offsetX: 147, offsetY: 16 },
  '5': { rotation: 5, offsetX: 310, offsetY: -19 },
};

const STRIP: Record<
  string,
  { offsetX: number; offsetY: number; rotation: number; scale: number }
> = {
  '1': { offsetX: 49, offsetY: 48, rotation: -4, scale: 1 },
  '2': { offsetX: 31, offsetY: 49, rotation: -2, scale: 1 },
  '3': { offsetX: 0, offsetY: 51, rotation: 0, scale: 1 },
  '4': { offsetX: -10, offsetY: 53, rotation: 2, scale: 1 },
  '5': { offsetX: -33, offsetY: 57, rotation: 3, scale: 1 },
};

const COMPACT = {
  cardW: 228,
  cardH: 288,
  padding: 16,
  graphicW: 196,
  graphicH: 120,
  titleSize: 28,
  titleLineH: 30,
};

const EXPANDED = {
  cardW: 300,
  cardH: 386,
  padding: 20,
  graphicW: 260,
  graphicH: 156,
  titleSize: 30,
  titleLineH: 32,
};

/** Mobile stacked deck positions (Interface Craft mobile). */
const STACK = [
  { x: 0, y: 0, rotation: 0, scale: 1 },
  { x: 12, y: 6, rotation: 2.5, scale: 0.97 },
  { x: 22, y: 12, rotation: 4, scale: 0.94 },
  { x: 30, y: 18, rotation: 5, scale: 0.91 },
  { x: 36, y: 24, rotation: 6, scale: 0.88 },
] as const;

const STACK_ENTER = [
  { x: -30, y: 60 },
  { x: -15, y: 75 },
  { x: 0, y: 90 },
  { x: 15, y: 105 },
  { x: 30, y: 120 },
] as const;

const MOBILE_CARD_W = 264;
const MOBILE_CARD_H = 360;
const MOBILE_STAGE_W = 320;
const MOBILE_STAGE_H = 400;

const spring = { type: 'spring' as const, visualDuration: 0.4, bounce: 0.15 };
const stripBase = { offsetX: 0, offsetY: 184, spacing: 70 };
const STAGE_W = 900;
const STAGE_H = 550;

const stackSpring = { type: 'spring' as const, stiffness: 200, damping: 25 };

function usePrefersReducedMotion() {
  return useReducedMotion() ?? false;
}

function WaveformBars({ color, animate }: { color: string; animate: boolean }) {
  const bars = 48;
  return (
    <div className="flex h-full w-full items-start gap-[3px] pt-1">
      {Array.from({ length: bars }, (_, i) => {
        const t = i / bars;
        const h = 18 + Math.sin(t * Math.PI * 2.2) * 42 + Math.sin(t * Math.PI * 5.1) * 28;
        return (
          <motion.span
            key={i}
            className="min-w-0 flex-1 rounded-[1px]"
            style={{ backgroundColor: color }}
            initial={{ height: 4 }}
            animate={
              animate
                ? { height: [h * 0.55, h, h * 0.7, h] }
                : { height: h }
            }
            transition={
              animate
                ? {
                    duration: 2.4 + (i % 5) * 0.12,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.02,
                  }
                : { duration: 0.5 }
            }
          />
        );
      })}
    </div>
  );
}

function GridBlocks({ color, animate }: { color: string; animate: boolean }) {
  const cols = 10;
  const rows = 7;
  return (
    <div
      className="grid h-full w-full gap-[2px]"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = i % cols;
        const y = Math.floor(i / cols);
        const base = 0.15 + ((x * 7 + y * 13) % 10) / 12;
        return (
          <motion.span
            key={i}
            className="rounded-[2px]"
            style={{ backgroundColor: color }}
            initial={{ opacity: base * 0.4 }}
            animate={
              animate
                ? { opacity: [base * 0.35, base, base * 0.55, base * 0.9] }
                : { opacity: base }
            }
            transition={
              animate
                ? {
                    duration: 2.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: (x + y) * 0.04,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

function NoiseLines({ color, animate }: { color: string; animate: boolean }) {
  const lines = 18;
  return (
    <svg viewBox="0 0 312 192" className="h-full w-full" aria-hidden>
      {Array.from({ length: lines }, (_, i) => {
        const y = 8 + i * 10;
        const amp = 4 + (i % 4);
        const d = `M0 ${y} Q78 ${y - amp} 156 ${y} T312 ${y}`;
        return (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={0.8 + (i % 3) * 0.7}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0.35 }}
            animate={
              animate
                ? { pathLength: 1, opacity: [0.35, 0.95, 0.5, 0.85] }
                : { pathLength: 1, opacity: 0.7 }
            }
            transition={
              animate
                ? {
                    pathLength: { duration: 1.2, delay: i * 0.03 },
                    opacity: { duration: 2.6, repeat: Infinity, delay: i * 0.05 },
                  }
                : { duration: 0.6 }
            }
          />
        );
      })}
    </svg>
  );
}

function FluidGrid({ color, animate }: { color: string; animate: boolean }) {
  const cols = 36;
  const rows = 16;
  return (
    <div
      className="grid h-full w-full gap-px"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {Array.from({ length: cols * rows }, (_, i) => {
        const x = i % cols;
        const y = Math.floor(i / cols);
        const show = (x * 17 + y * 29) % 7 > 1;
        if (!show) return <span key={i} />;
        const h = 40 + ((x + y) % 5) * 12;
        return (
          <motion.span
            key={i}
            className="justify-self-center self-end rounded-[0.5px]"
            style={{ backgroundColor: color, width: '70%' }}
            initial={{ height: '20%' }}
            animate={
              animate
                ? { height: [`${h * 0.4}%`, `${h}%`, `${h * 0.65}%`, `${h}%`] }
                : { height: `${h}%` }
            }
            transition={
              animate
                ? {
                    duration: 2.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: (x % 8) * 0.05,
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
}

function InterfaceBlueprint({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 312 192" className="h-full w-full" aria-hidden>
      <rect x="12" y="16" width="180" height="28" rx="8" fill="none" stroke={color} strokeWidth="1.2" />
      <rect x="204" y="16" width="88" height="28" rx="8" fill="none" stroke={color} strokeWidth="1.2" />
      <rect x="12" y="56" width="288" height="52" rx="10" fill="none" stroke={color} strokeWidth="1.2" />
      <rect x="12" y="122" width="88" height="52" rx="10" fill="none" stroke={color} strokeWidth="1.2" />
      <rect x="112" y="122" width="88" height="52" rx="10" fill="none" stroke={color} strokeWidth="1.2" />
      <rect x="212" y="122" width="88" height="52" rx="10" fill="none" stroke={color} strokeWidth="1.2" />
      <circle cx="28" cy="30" r="4" fill={color} opacity="0.5" />
      <circle cx="44" cy="30" r="4" fill={color} opacity="0.35" />
    </svg>
  );
}

function CardGraphic({
  type,
  color,
  animate,
}: {
  type: GraphicType;
  color: string;
  animate: boolean;
}) {
  switch (type) {
    case 'waveformBars':
      return <WaveformBars color={color} animate={animate} />;
    case 'gridBlocks':
      return <GridBlocks color={color} animate={animate} />;
    case 'noiseLines':
      return <NoiseLines color={color} animate={animate} />;
    case 'fluidGrid':
      return <FluidGrid color={color} animate={animate} />;
    case 'interfaceBlueprint':
      return <InterfaceBlueprint color={color} />;
  }
}

function MobileStackCard({
  card,
  position,
  entrance,
  isTop,
  zIndex,
  index,
  hasEntered,
  reduceMotion,
  onSwipe,
}: {
  card: CraftCard;
  position: (typeof STACK)[number];
  entrance: (typeof STACK_ENTER)[number];
  isTop: boolean;
  zIndex: number;
  index: number;
  hasEntered: boolean;
  reduceMotion: boolean;
  onSwipe: () => void;
}) {
  const { m } = useI18n();
  const copy = m.landing.cards[card.id as keyof typeof m.landing.cards];
  const x = useMotionValue(0);
  const [dragging, setDragging] = useState(false);
  const swiping = useRef(false);
  const rotate = useTransform(x, [-330, 0, 330], [-12, 0, 12]);

  useEffect(() => {
    return x.on('change', (v) => {
      if (swiping.current && Math.abs(v) >= 330) {
        swiping.current = false;
        onSwipe();
        animate(x, 0, { type: 'spring', stiffness: 300, damping: 30 });
      }
    });
  }, [x, onSwipe]);

  return (
    <motion.div
      className="absolute origin-center"
      style={{
        width: MOBILE_CARD_W,
        height: MOBILE_CARD_H,
        left: '50%',
        top: '50%',
        marginLeft: -MOBILE_CARD_W / 2,
        marginTop: -MOBILE_CARD_H / 2,
        zIndex,
      }}
      initial={
        reduceMotion
          ? false
          : {
              x: position.x + entrance.x,
              y: position.y + entrance.y,
              rotate: position.rotation,
              scale: 0.9 * position.scale,
              opacity: 0,
            }
      }
      animate={{
        x: position.x,
        y: position.y,
        rotate: position.rotation,
        scale: position.scale,
        opacity: 1,
      }}
      transition={{
        ...stackSpring,
        delay: hasEntered || reduceMotion ? 0 : 0.25 + 0.05 * index,
      }}
    >
      <motion.div
        className="h-full w-full touch-pan-y select-none"
        style={{
          x,
          rotate,
          cursor: isTop ? (dragging ? 'grabbing' : 'grab') : 'auto',
        }}
        drag={isTop && !reduceMotion ? 'x' : false}
        dragElastic={0.8}
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={() => setDragging(true)}
        onDragEnd={(_, info) => {
          setDragging(false);
          const cur = x.get();
          const vx = info.velocity.x;
          if (Math.abs(cur) >= 40 || Math.abs(vx) >= 300) {
            const dir = Math.abs(cur) >= 40 ? Math.sign(cur) : Math.sign(vx);
            swiping.current = true;
            animate(x, 380 * dir, {
              type: 'spring',
              stiffness: 300,
              damping: 25,
              velocity: vx,
            });
          } else {
            animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
          }
        }}
        onClick={(e) => {
          if (!isTop) return;
          e.stopPropagation();
          onSwipe();
        }}
      >
        <div
          className="h-full w-full overflow-hidden rounded-2xl shadow-[0_18px_40px_-18px_rgba(0,0,0,0.4)]"
          style={{ backgroundColor: card.background }}
        >
          <div className="overflow-hidden" style={{ margin: 16, marginBottom: 12, width: 232, height: 136 }}>
            <CardGraphic
              type={card.graphicType}
              color={card.foreground}
              animate={!reduceMotion && isTop}
            />
          </div>
          <h3
            className={cn(playfair.className, 'whitespace-pre-line font-medium')}
            style={{
              color: card.foreground,
              fontSize: 24,
              lineHeight: '26px',
              padding: '0 16px',
            }}
          >
            {copy.title}
          </h3>
          <p
            style={{
              color: card.bodyColor,
              fontSize: 13,
              lineHeight: '20px',
              padding: '8px 16px 0',
            }}
          >
            {copy.description}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MobileCraftStack({ eager }: { eager: boolean }) {
  const reduceMotion = usePrefersReducedMotion();
  const [order, setOrder] = useState(() => CARDS.map((c) => c.id));
  const [entered, setEntered] = useState(eager);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), reduceMotion ? 0 : 400);
    return () => clearTimeout(t);
  }, [reduceMotion]);

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const availW = Math.max(240, w - 72);
      /* Leave room for nav + title + subtitle + top gap inside the locked hero. */
      const availH = Math.max(240, h - 320);
      setScale(Math.min(availW / MOBILE_STAGE_W, availH / MOBILE_STAGE_H, 1));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const cycle = useCallback(() => {
    setOrder((prev) => {
      if (prev.length < 2) return prev;
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  }, []);

  const layoutW = MOBILE_STAGE_W * scale;
  const layoutH = MOBILE_STAGE_H * scale;

  return (
    <div
      className="relative mx-auto flex w-full items-center justify-center"
      style={{ height: layoutH }}
      aria-label="Fringo practice modes"
    >
      <div className="relative shrink-0" style={{ width: layoutW, height: layoutH }}>
        <motion.div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            width: MOBILE_STAGE_W,
            height: MOBILE_STAGE_H,
            transform: `scale(${scale})`,
          }}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 28 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut', delay: reduceMotion ? 0 : 0.15 }}
        >
          {order.map((id, index) => {
            const card = CARDS.find((c) => c.id === id);
            if (!card) return null;
            const position = STACK[index] ?? STACK[STACK.length - 1];
            const entrance =
              STACK_ENTER[CARDS.findIndex((c) => c.id === id)] ?? STACK_ENTER[0];
            return (
              <MobileStackCard
                key={id}
                card={card}
                position={position}
                entrance={entrance}
                isTop={index === 0}
                zIndex={order.length - index}
                index={index}
                hasEntered={entered}
                reduceMotion={reduceMotion}
                onSwipe={cycle}
              />
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

function DesktopCraftFan({ eager }: { eager: boolean }) {
  const reduceMotion = usePrefersReducedMotion();
  const { m } = useI18n();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [entered, setEntered] = useState(eager);
  const rootRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w < 900) setScale(Math.min(1, (w - 32) / STAGE_W));
      else if (w < 1200) setScale(0.88);
      else setScale(1);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    if (eager) {
      setEntered(true);
      return;
    }
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setEntered(true);
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  const onToggle = useCallback((id: string, e: MouseEvent) => {
    e.stopPropagation();
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  const onDismiss = useCallback(() => setActiveId(null), []);

  const layoutW = STAGE_W * scale;
  const layoutH = STAGE_H * scale;

  return (
    <div
      ref={rootRef}
      className="relative mx-auto flex w-full max-w-5xl items-center justify-center"
      style={{ height: layoutH }}
      onClick={onDismiss}
      aria-label="Fringo practice modes"
    >
      <div className="relative shrink-0" style={{ width: layoutW, height: layoutH }}>
        <motion.div
          className="absolute left-0 top-0 origin-top-left"
          style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
          initial={reduceMotion ? false : { filter: 'blur(8px)', opacity: 0, y: 40 }}
          animate={
            entered || reduceMotion
              ? { filter: 'blur(0px)', opacity: 1, y: 0 }
              : { filter: 'blur(8px)', opacity: 0, y: 40 }
          }
          transition={{ duration: 0.45, ease: 'easeOut', delay: reduceMotion ? 0 : 0.08 }}
        >
          {CARDS.map((card, index) => {
            const isActive = activeId === card.id;
            const size = isActive ? EXPANDED : COMPACT;
            const fan = FAN[card.id];
            const stripPos = STRIP[card.id];

            let x = 0;
            let y = 0;
            let rotate = 0;
            let cardScale = 1;

            if (isActive) {
              x = 0;
              y = -40;
              rotate = 0;
              cardScale = 1;
            } else if (activeId === null) {
              x = fan.offsetX;
              y = fan.offsetY;
              rotate = fan.rotation;
              cardScale = 1;
            } else {
              const total = (CARDS.length - 1) * stripBase.spacing;
              x =
                stripBase.offsetX +
                index * stripBase.spacing -
                total / 2 +
                stripPos.offsetX;
              y = stripBase.offsetY + stripPos.offsetY;
              rotate = stripPos.rotation;
              cardScale = 0.7 * stripPos.scale;
            }

            const copy = m.landing.cards[card.id as keyof typeof m.landing.cards];
            const titleLines = copy.title.split('\n');
            const titleBlockH = size.titleLineH * titleLines.length;
            const titleTop = isActive
              ? size.padding + size.graphicH + 16
              : size.cardH - size.padding - titleBlockH;
            const enterDelay = 0.35 + 0.016 * index;
            const enterYBump = Math.max(16, 28 * Math.abs(index - 2)) + 20 * index;

            return (
              <motion.div
                key={card.id}
                onClick={(e) => onToggle(card.id, e)}
                className="absolute origin-center cursor-pointer select-none"
                style={{ left: '50%', top: '50%', zIndex: isActive ? 40 : index + 1 }}
                initial={
                  reduceMotion
                    ? false
                    : {
                        x: x - size.cardW / 2 + (2 - index) * 28,
                        y: y - size.cardH / 2 + enterYBump,
                        scale: cardScale,
                        rotate,
                      }
                }
                animate={{
                  x: x - size.cardW / 2,
                  y: y - size.cardH / 2,
                  scale: cardScale,
                  rotate,
                }}
                whileHover={
                  activeId || reduceMotion
                    ? undefined
                    : { scale: 1.03 * cardScale, y: y - size.cardH / 2 - 8 }
                }
                transition={{
                  ...spring,
                  delay: entered && !reduceMotion && activeId === null ? enterDelay : 0,
                  x: { type: 'spring', visualDuration: 0.5, bounce: 0.3 },
                  y: { type: 'spring', visualDuration: 0.5, bounce: 0.3 },
                }}
              >
                <motion.div
                  className="relative overflow-hidden rounded-2xl shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)]"
                  style={{ backgroundColor: card.background }}
                  animate={{ width: size.cardW, height: size.cardH }}
                  transition={spring}
                >
                  <motion.div
                    className="absolute overflow-hidden"
                    animate={{
                      left: size.padding,
                      top: size.padding,
                      width: size.graphicW,
                      height: size.graphicH,
                    }}
                    transition={spring}
                  >
                    <CardGraphic
                      type={card.graphicType}
                      color={card.foreground}
                      animate={!reduceMotion && (isActive || activeId === null)}
                    />
                  </motion.div>

                  <motion.div
                    className="absolute px-1"
                    animate={{
                      left: size.padding,
                      top: titleTop,
                      width: size.graphicW,
                    }}
                    transition={spring}
                  >
                    <h3
                      className={cn(playfair.className, 'font-medium leading-none')}
                      style={{
                        color: card.foreground,
                        fontSize: size.titleSize,
                        lineHeight: `${size.titleLineH}px`,
                      }}
                    >
                      {titleLines.map((line) => (
                        <span key={`${uid}-${card.id}-${line}`} className="block">
                          {line}
                        </span>
                      ))}
                    </h3>

                    <motion.p
                      className="mt-3 text-sm leading-relaxed"
                      style={{ color: card.bodyColor }}
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        height: isActive ? 'auto' : 0,
                      }}
                      transition={{ duration: 0.25 }}
                    >
                      {copy.description}
                    </motion.p>
                  </motion.div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}

export function LandingCraftCards({ eager = false }: { eager?: boolean }) {
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 640);
    update();
    setReady(true);
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  if (!ready) {
    return <div className="mx-auto h-[380px] w-full max-w-sm sm:h-[520px]" aria-hidden />;
  }

  return isMobile ? (
    <MobileCraftStack eager={eager} />
  ) : (
    <DesktopCraftFan eager={eager} />
  );
}
