import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { LOGO_PATH } from '@/lib/logo-path';
import { bricolage, inter } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  size?: number;
};

export function Logo({ className, size = 32 }: LogoProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <path d={LOGO_PATH} fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
    </svg>
  );
}

type LogoIconProps = LogoProps & {
  rounded?: 'md' | 'lg' | 'xl' | '2xl' | 'full';
};

const ROUNDED_CLASS: Record<NonNullable<LogoIconProps['rounded']>, string> = {
  md: 'rounded-sm',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

export function LogoIcon({ className, size = 32, rounded = 'md' }: LogoIconProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        ROUNDED_CLASS[rounded],
        'bg-[#DFFF4F] text-black',
        className
      )}
      style={{ width: size, height: size }}
    >
      <Logo size={Math.round(size * 0.58)} />
    </span>
  );
}

type BrandLogoProps = {
  className?: string;
  href?: string;
  showText?: boolean;
  showIcon?: boolean;
  iconSize?: number;
  textClassName?: string;
  iconRounded?: LogoIconProps['rounded'];
};

export function BrandLogo({
  className,
  href = '/',
  showText = true,
  showIcon = true,
  iconSize = 32,
  textClassName,
  iconRounded = 'md',
}: BrandLogoProps) {
  const content = (
    <>
      {showIcon && <LogoIcon size={iconSize} rounded={iconRounded} />}
      {showText && (
        <span
          className={cn(
            `${bricolage.className} text-xl font-semibold tracking-tight text-foreground sm:text-2xl`,
            textClassName
          )}
        >
          {BRAND.name}
        </span>
      )}
    </>
  );

  const rootClass = cn('inline-flex items-center gap-2', className);

  if (href) {
    return (
      <Link href={href} className={rootClass} aria-label={BRAND.name}>
        {content}
      </Link>
    );
  }

  return <span className={rootClass}>{content}</span>;
}

type BrandPlanPillProps = {
  className?: string;
  href?: string;
  pillLabel: string;
  variant?: 'pro' | 'trial';
  textClassName?: string;
};

const brandNameClass = cn(
  bricolage.className,
  'text-xl font-semibold tracking-tight text-foreground sm:text-2xl',
);

const planPillClass = {
  pro: 'bg-[#DFFF4F] text-black',
  trial:
    'border border-[#675549]/20 bg-[#675549]/8 text-[#675549] dark:border-white/15 dark:bg-white/10 dark:text-white/90',
} as const;

type PlanPillBadgeProps = {
  className?: string;
  label: string;
  variant?: 'pro' | 'trial';
};

/** Compact plan badge — logo + uppercase label (Pro / Trial) */
export function PlanPillBadge({
  className,
  label,
  variant = 'pro',
}: PlanPillBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1',
        planPillClass[variant],
        className,
      )}
    >
      <Logo
        size={15}
        className={cn('shrink-0', variant === 'pro' ? 'text-black' : 'currentColor')}
      />
      <span
        className={cn(inter.className, 'text-[10px] font-semibold uppercase tracking-wide')}
      >
        {label}
      </span>
    </span>
  );
}

/** Plan pill (icon + label) with brand name outside — matches BrandLogo text size */
export function BrandPlanPill({
  className,
  href = '/learn',
  pillLabel,
  variant = 'pro',
  textClassName,
}: BrandPlanPillProps) {
  const content = (
    <>
      <PlanPillBadge label={pillLabel} variant={variant} />
      <span className={cn(brandNameClass, textClassName)}>{BRAND.name}</span>
    </>
  );

  const rootClass = cn('inline-flex shrink-0 items-center gap-2', className);

  if (href) {
    return (
      <Link href={href} className={rootClass} aria-label={`${BRAND.name} ${pillLabel}`}>
        {content}
      </Link>
    );
  }

  return <span className={rootClass}>{content}</span>;
}
