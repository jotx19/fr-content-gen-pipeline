'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

import {
  ChartBarIncreasing,
  ChevronRight,
  Globe,
  Home,
  LogOut,
  Moon,
  Note,
  Notebook,
  Palette,
  PenLine,
  Settings,
  Sun,
  type AppIcon,
} from '@/components/icons';
import { PlanPillBadge } from '@/components/logo';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useI18n } from '@/lib/i18n';
import { inter } from '@/lib/fonts';
import { getPlanBadge, isBillingPro } from '@/lib/billing-plan';
import { cn } from '@/lib/utils';
import { useBillingStatusQuery } from '@/modules/billing/hooks/use-billing-queries';

const panelClass = cn(
  inter.className,
  'w-[240px] rounded-[18px] border p-1.5 shadow-xl',
  'border-black/10 bg-[#F4F4F4] text-foreground',
  'dark:border-white/12 dark:bg-[#1A1A1A] dark:text-white dark:shadow-[0_16px_48px_rgba(0,0,0,0.55)]',
);

const itemClass = cn(
  'cursor-pointer gap-3 rounded-[10px] px-2.5 py-2.5 text-[14px] font-medium outline-none',
  'text-foreground/90 dark:text-white/90',
  'focus:bg-black/[0.06] data-[highlighted]:bg-black/[0.06] data-[state=open]:bg-black/[0.06]',
  'dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10 dark:data-[state=open]:bg-white/10',
);

const subPanelClass = cn(
  inter.className,
  'min-w-[160px] rounded-[14px] border p-1.5 shadow-xl',
  'border-black/10 bg-[#F4F4F4] text-foreground',
  'dark:border-white/12 dark:bg-[#1A1A1A] dark:text-white',
);

const iconClass = 'h-[18px] w-[18px] shrink-0 text-foreground/70 dark:text-white/75';
const chevronClass = 'h-3.5 w-3.5 shrink-0 text-foreground/40 dark:text-white/40';
const valueClass = 'text-[13px] font-normal text-foreground/45 dark:text-white/45';
const iconStroke = 1.75;

const radioItemClass = cn(
  itemClass,
  'relative pl-2.5 pr-9',
);

type AccountDropdownContentProps = {
  onLogout: () => void;
  userName?: string | null;
  userPicture?: string | null;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
};

function MenuRow({
  icon: Icon,
  title,
  trailing,
}: {
  icon: AppIcon;
  title: string;
  trailing?: React.ReactNode;
}) {
  return (
    <>
      <Icon className={iconClass} strokeWidth={iconStroke} />
      <span className="min-w-0 flex-1">{title}</span>
      {trailing}
    </>
  );
}

export function AccountDropdownContent({
  onLogout,
  userName,
  userPicture,
  side = 'right',
  align = 'end',
}: AccountDropdownContentProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { locale, setLocale, t } = useI18n();
  const { data: billing } = useBillingStatusQuery();
  const planBadge = getPlanBadge(billing, { pro: t('common.pro'), trial: t('common.trial') });

  useEffect(() => setMounted(true), []);

  const displayName = userName?.split(' ')[0] || t('common.account');
  const initials =
    userName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'FR';

  const appearanceValue =
    !mounted ? 'system' : theme === 'system' ? 'system' : resolvedTheme === 'dark' ? 'dark' : 'light';

  const appearanceLabel =
    appearanceValue === 'dark'
      ? t('common.dark')
      : appearanceValue === 'light'
        ? t('common.light')
        : t('common.system');

  const languageLabel = locale === 'fr' ? t('common.french') : t('common.english');

  const subTriggerTrailing = (value: string) => (
    <span className="ml-auto flex items-center gap-1.5">
      <span className={valueClass}>{value}</span>
      <ChevronRight className={chevronClass} strokeWidth={2} />
    </span>
  );

  return (
    <DropdownMenuContent
      side={side}
      align={align}
      sideOffset={10}
      className={panelClass}
    >
      <div
        className={cn(
          'mb-1 flex items-center gap-2.5 rounded-[12px] border px-2.5 py-2',
          'border-black/10 bg-white/70 dark:border-white/12 dark:bg-white/[0.04]',
        )}
      >
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={userPicture ?? undefined} alt={userName ?? t('common.account')} />
          <AvatarFallback className="bg-[#7B61FF] text-[11px] font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-foreground dark:text-white">
          {displayName}
        </span>
        {planBadge ? (
          <PlanPillBadge label={planBadge.label} variant={planBadge.variant} />
        ) : null}
      </div>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/dashboard">
          <MenuRow icon={ChartBarIncreasing} title={t('common.dashboard')} />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn">
          <MenuRow icon={Home} title={t('common.home')} />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/notes">
          <MenuRow icon={Note} title={t('common.notes')} />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn/lesson?mode=practice">
          <MenuRow icon={Notebook} title={t('common.reading')} />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn/writing">
          <MenuRow icon={PenLine} title={t('common.writing')} />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="mx-1 my-1.5 bg-black/10 dark:bg-white/10" />

      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={cn(itemClass, 'flex w-full items-center')}>
          <MenuRow
            icon={Palette}
            title={t('common.appearance')}
            trailing={subTriggerTrailing(appearanceLabel)}
          />
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent sideOffset={8} className={subPanelClass}>
          <DropdownMenuRadioGroup
            value={appearanceValue}
            onValueChange={(value) => setTheme(value)}
          >
            <DropdownMenuRadioItem value="light" className={radioItemClass}>
              <Sun className={iconClass} strokeWidth={iconStroke} />
              {t('common.light')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark" className={radioItemClass}>
              <Moon className={iconClass} strokeWidth={iconStroke} />
              {t('common.dark')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system" className={radioItemClass}>
              <Palette className={iconClass} strokeWidth={iconStroke} />
              {t('common.system')}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSub>
        <DropdownMenuSubTrigger className={cn(itemClass, 'flex w-full items-center')}>
          <MenuRow
            icon={Globe}
            title={t('common.language')}
            trailing={subTriggerTrailing(languageLabel)}
          />
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent sideOffset={8} className={subPanelClass}>
          <DropdownMenuRadioGroup
            value={locale}
            onValueChange={(value) => {
              if (value === 'en' || value === 'fr') setLocale(value);
            }}
          >
            <DropdownMenuRadioItem value="en" className={radioItemClass}>
              {t('common.english')}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="fr" className={radioItemClass}>
              {t('common.french')}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/settings">
          <MenuRow icon={Settings} title={t('common.settings')} />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuSeparator className="mx-1 my-1.5 bg-black/10 dark:bg-white/10" />

      <DropdownMenuItem
        onClick={onLogout}
        className={cn(itemClass, 'flex w-full items-center text-foreground/90 dark:text-white/90')}
      >
        <MenuRow icon={LogOut} title={t('common.logOut')} />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
