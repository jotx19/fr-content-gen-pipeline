'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { LayoutGroup, motion } from 'framer-motion';

import { Energy, Note, Notebook, PenLine, Translate, type IconProps } from '@/components/icons';
import { cn } from '@/lib/utils';

type FeatureIconTileProps = {
  icon: ComponentType<IconProps>;
  tileClassName: string;
  iconClassName: string;
  accentColor: string;
  active?: boolean;
  onClick?: () => void;
};

function FeatureIconTile({
  icon: Icon,
  tileClassName,
  iconClassName,
  accentColor,
  active,
  onClick,
}: FeatureIconTileProps) {
  return (
    <div className="relative">
      {active ? (
        <motion.div
          layoutId="pill-active-border"
          className="pointer-events-none absolute -inset-[3px] rounded-[17px] border border-[1px] md:-inset-1 md:rounded-[18px]"
          animate={{ borderColor: accentColor }}
          transition={{
            layout: { type: 'spring', stiffness: 400, damping: 34, mass: 0.55 },
            borderColor: { duration: 0.3, ease: 'easeOut' },
          }}
        />
      ) : null}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-[14px] md:size-11 md:rounded-2xl',
          tileClassName,
        )}
        aria-pressed={active}
      >
        <Icon className={cn('size-5 md:size-[22px]', iconClassName)} strokeWidth={2.25} />
      </button>
    </div>
  );
}

type FeatureItem = FeatureIconTileProps & { id: string };

const features: FeatureItem[] = [
  {
    id: 'reading',
    icon: Notebook,
    tileClassName: 'bg-[#FEE9D9]',
    iconClassName: 'text-[#C45C3A]',
    accentColor: '#C45C3A',
  },
  {
    id: 'writing',
    icon: PenLine,
    tileClassName: 'bg-[#E0E7FF]',
    iconClassName: 'text-[#4F63D8]',
    accentColor: '#4F63D8',
  },
  {
    id: 'streak',
    icon: Energy,
    tileClassName: 'bg-[#FEF9C3]',
    iconClassName: 'text-[#CA8A04]',
    accentColor: '#CA8A04',
  },
  {
    id: 'notes',
    icon: Note,
    tileClassName: 'bg-[#D1FAE5]',
    iconClassName: 'text-[#059669]',
    accentColor: '#059669',
  },
  {
    id: 'translate',
    icon: Translate,
    tileClassName: 'bg-[#EDE9FE]',
    iconClassName: 'text-[#7C3AED]',
    accentColor: '#7C3AED',
  },
];

const ROTATE_MS = 4500;

export function LandingVerticalPill({
  activeIndex,
  onActiveIndexChange,
}: {
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}) {
  return (
    <div
      id="features"
      className="inline-flex w-full shrink-0 justify-center rounded-[22px] border border-transparent bg-white/95 px-2 py-2 shadow-[0_12px_36px_rgba(0,0,0,0.14)] backdrop-blur-sm dark:shadow-[0_12px_36px_rgba(0,0,0,0.45)] md:w-auto md:justify-start md:px-2.5 md:py-2.5"
    >
      <LayoutGroup>
        <div className="inline-flex flex-row items-center gap-1.5 px-0.5 md:flex-col md:gap-2 md:px-0 md:py-0.5">
          {features.map(({ id, ...feature }, index) => (
            <FeatureIconTile
              key={id}
              {...feature}
              active={index === activeIndex}
              onClick={() => onActiveIndexChange(index)}
            />
          ))}
        </div>
      </LayoutGroup>
    </div>
  );
}

export function useFeatureCarousel(initialIndex = 0) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, []);

  return { activeIndex, setActiveIndex, featureCount: features.length };
}

export { features as landingFeatureItems };
