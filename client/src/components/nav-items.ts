import {
  ChartBarIncreasing,
  Home,
  Note,
  Notebook,
  PenLine,
  Translate,
  type AppIcon,
} from '@/components/icons';

export type AppNavKey =
  | 'home'
  | 'dashboard'
  | 'notes'
  | 'translate'
  | 'reading'
  | 'writing';

export type AppNavItem = {
  navKey: AppNavKey;
  href: string;
  icon: AppIcon;
  /** Match only exact path (e.g. /learn vs /learn/writing) */
  exact?: boolean;
  /** Render a subtle divider above this item in the sidebar */
  separatorBefore?: boolean;
};

export const APP_NAV_ITEMS: AppNavItem[] = [
  { navKey: 'home', href: '/learn', icon: Home, exact: true },
  { navKey: 'dashboard', href: '/dashboard', icon: ChartBarIncreasing, exact: true },
  { navKey: 'notes', href: '/notes', icon: Note },
  { navKey: 'translate', href: '/translate', icon: Translate },
  { navKey: 'reading', href: '/learn/lesson?mode=practice', icon: Notebook, separatorBefore: true },
  { navKey: 'writing', href: '/learn/writing', icon: PenLine },
];

export const LANDING_NAV_ITEMS = [
  { navKey: 'learn' as const, href: '/learn' },
  { navKey: 'pricing' as const, href: '#pricing' },
];

export function isAppNavActive(
  pathname: string,
  item: Pick<AppNavItem, 'href' | 'exact'>,
) {
  const path = item.href.split('?')[0] ?? item.href;
  if (item.exact) return pathname === path;
  return pathname === path || pathname.startsWith(`${path}/`);
}
