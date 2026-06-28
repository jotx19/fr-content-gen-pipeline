import Link from 'next/link';
import { BRAND } from '@/lib/brand';
import { LOGO_PATH } from '@/lib/logo-path';
import { bricolage } from '@/lib/fonts';
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
  rounded?: 'full' | 'xl' | '2xl';
};

export function LogoIcon({ className, size = 32, rounded = 'full' }: LogoIconProps) {
  const roundedClass =
    rounded === 'full' ? 'rounded-full' : rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center text-black',
        roundedClass,
        className
      )}
      style={{ width: size, height: size, backgroundColor: BRAND.colors.lime }}
    >
      <Logo size={Math.round(size * 0.68)} />
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
  iconRounded = 'full',
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
