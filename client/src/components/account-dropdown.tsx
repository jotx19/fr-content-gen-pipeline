'use client';

import Link from 'next/link';
import {
  BookOpen,
  LogOut,
  Moon,
  Palette,
  PenLine,
  Sun,
  type AppIcon,
} from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { useThemeToggle } from '@/components/theme-toggle';
import type { AuthUser } from '@/modules/auth/types/auth';
import { cn } from '@/lib/utils';

const panelClass = cn(
  'w-52 rounded-2xl border p-1 shadow-sm backdrop-blur-md',
  'border-black/10 bg-white/90 text-foreground',
  'dark:border-white/15 dark:bg-white/10 dark:text-white dark:shadow-none'
);

const itemClass = cn(
  'cursor-pointer gap-2 !rounded-md px-1.5 py-1 text-sm transition-colors',
  'hover:bg-black/5 focus:bg-black/5 data-[highlighted]:bg-black/5',
  'dark:hover:bg-white/10 dark:focus:bg-white/10 dark:data-[highlighted]:bg-white/10'
);

const iconBoxClass = cn(
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
  'bg-black/5 dark:bg-white/10'
);
const iconClass = 'h-[18px] w-[18px] text-foreground/70 dark:text-white/80';
const trailingIconClass = 'h-3.5 w-3.5 shrink-0 text-foreground/55 dark:text-white/55';
const destructiveItemClass = cn(
  itemClass,
  'text-red-600 dark:text-red-400',
  'hover:bg-red-50 dark:hover:bg-red-500/10',
  'focus:bg-red-50 dark:focus:bg-red-500/10',
  'data-[highlighted]:bg-red-50 dark:data-[highlighted]:bg-red-500/10'
);

const destructiveIconBoxClass = cn(iconBoxClass, 'bg-red-50 dark:bg-red-500/10');
const destructiveIconClass = 'h-[18px] w-[18px] text-red-600 dark:text-red-400';

const iconStroke = 2;

type AccountDropdownContentProps = {
  user: AuthUser;
  initials: string;
  onLogout: () => void;
};

function MenuRow({
  icon: Icon,
  title,
  trailing,
  destructive = false,
}: {
  icon: AppIcon;
  title: string;
  trailing?: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <>
      <div className={destructive ? destructiveIconBoxClass : iconBoxClass}>
        <Icon
          className={destructive ? destructiveIconClass : iconClass}
          strokeWidth={iconStroke}
        />
      </div>
      <span
        className={cn(
          'min-w-0 flex-1 font-medium',
          destructive ? 'text-red-600 dark:text-red-400' : 'text-foreground/90 dark:text-white/90'
        )}
      >
        {title}
      </span>
      {trailing ? <span className="ml-auto shrink-0">{trailing}</span> : null}
    </>
  );
}

export function AccountDropdownContent({ user, initials, onLogout }: AccountDropdownContentProps) {
  const { isDark, toggle, mounted } = useThemeToggle();
  const firstName = user.name.split(' ')[0] ?? user.name;

  return (
    <DropdownMenuContent align="end" sideOffset={8} className={panelClass}>
      <div className="flex items-center gap-2 px-1.5 py-1">
        <div className={iconBoxClass}>
          <Avatar className="h-[18px] w-[18px]">
            <AvatarImage src={user.picture ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-violet-600 text-[9px] font-medium text-white">
              {initials.slice(0, 1)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-medium text-foreground/90 dark:text-white/90">{firstName}</p>
          {user.email && (
            <p className="truncate text-xs text-foreground/60 dark:text-white/60">{user.email}</p>
          )}
        </div>
      </div>

      <DropdownMenuSeparator className="my-0.5 bg-black/10 dark:bg-white/10" />

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn">
          <MenuRow icon={BookOpen} title="Learn" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem asChild className={itemClass}>
        <Link href="/learn/writing">
          <MenuRow icon={PenLine} title="Writing" />
        </Link>
      </DropdownMenuItem>

      <DropdownMenuItem onClick={toggle} className={itemClass}>
        <MenuRow
          icon={Palette}
          title="Appearance"
          trailing={
            mounted ? (
              isDark ? (
                <Sun className={trailingIconClass} strokeWidth={iconStroke} />
              ) : (
                <Moon className={trailingIconClass} strokeWidth={iconStroke} />
              )
            ) : null
          }
        />
      </DropdownMenuItem>

      <DropdownMenuItem onClick={onLogout} className={cn(destructiveItemClass, 'flex w-full items-center gap-2')}>
        <MenuRow icon={LogOut} title="Log out" destructive />
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
