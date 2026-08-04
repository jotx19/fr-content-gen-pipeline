import {
  ChartBarIncreasing,
  Home,
  Notebook,
  PenLine,
  type AppIcon,
} from '@/components/icons';

export type AppNavItem = {
  label: string;
  href: string;
  icon: AppIcon;
  /** Match only exact path (e.g. /learn vs /learn/writing) */
  exact?: boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { label: 'Home', href: '/learn', icon: Home, exact: true },
  { label: 'Dashboard', href: '/dashboard', icon: ChartBarIncreasing, exact: true },
  { label: 'Reading', href: '/learn/lesson?mode=practice', icon: Notebook },
  { label: 'Writing', href: '/learn/writing', icon: PenLine },
];

export const LANDING_NAV_ITEMS = [
  { label: 'Learn', href: '/learn' },
  { label: 'Pricing', href: '#pricing' },
] as const;

export function isAppNavActive(
  pathname: string,
  item: Pick<AppNavItem, 'href' | 'exact'>,
) {
  const path = item.href.split('?')[0] ?? item.href;
  if (item.exact) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}
