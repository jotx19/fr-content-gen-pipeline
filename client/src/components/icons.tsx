'use client';

import { HugeiconsIcon, type IconSvgElement } from '@hugeicons/react';
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
  Award01Icon,
  BarChartIcon,
  BookOpen01Icon,
  Cancel01Icon,
  ChartBarIncreasingIcon,
  ChartNoAxesCombinedIcon,
  ChevronDownIcon,
  ClipboardListIcon,
  Copy01Icon,
  Delete02Icon,
  DotIcon,
  Download01Icon,
  EnergyIcon,
  FilterHorizontalIcon,
  Globe02Icon,
  Home01Icon,
  InformationCircleIcon,
  Link01Icon,
  Loading03Icon,
  Logout01Icon,
  Menu01Icon,
  Moon02Icon,
  Notebook01Icon,
  NoteIcon,
  Notification03Icon,
  PaintBrush01Icon,
  PauseIcon,
  PencilIcon,
  RefreshIcon,
  Settings01Icon,
  StarIcon,
  Sun03Icon,
  Target01Icon,
  Tick01Icon,
  Undo02Icon,
  User02Icon,
  Calendar03Icon,
  VolumeHighIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

export type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
};

const TAILWIND_SIZE: Record<string, number> = {
  '3': 12,
  '3.5': 14,
  '4': 16,
  '5': 20,
  '6': 24,
  '7': 28,
  '8': 32,
  '9': 36,
  '10': 40,
};

function resolveSize(className?: string, size?: number) {
  if (size != null) return size;
  const match = className?.match(/\bh-(\d+(?:\.\d+)?)\b/);
  if (match && TAILWIND_SIZE[match[1]]) return TAILWIND_SIZE[match[1]];
  return 24;
}

function createIcon(icon: IconSvgElement, defaultStroke = 2) {
  function Icon({ className, size, strokeWidth = defaultStroke }: IconProps) {
    return (
      <HugeiconsIcon
        icon={icon}
        size={resolveSize(className, size)}
        color="currentColor"
        strokeWidth={strokeWidth}
        className={cn('inline-block shrink-0', className)}
      />
    );
  }
  return Icon;
}

export type AppIcon = ReturnType<typeof createIcon>;

export const Add = createIcon(Add01Icon);
export const Plus = Add;
export const ArrowLeft = createIcon(ArrowLeft01Icon);
export const ArrowRight = createIcon(ArrowRight01Icon);
export const ChevronRight = createIcon(ArrowRight01Icon);
export const ArrowUp = createIcon(ArrowUp01Icon);
export const ArrowUpDown = createIcon(ArrowUpDownIcon);
export const ArrowDown = createIcon(ArrowDown01Icon);
export const Award = createIcon(Award01Icon);
export const BarChart3 = createIcon(BarChartIcon);
export const BookOpen = createIcon(BookOpen01Icon);
export const ChartBarIncreasing = createIcon(ChartBarIncreasingIcon);
export const ChartNoAxesCombined = createIcon(ChartNoAxesCombinedIcon);
export const Check = createIcon(Tick01Icon);
export const ChevronDown = createIcon(ChevronDownIcon);
export const ClipboardList = createIcon(ClipboardListIcon);
export const Copy = createIcon(Copy01Icon);
export const Dot = createIcon(DotIcon);
export const Download = createIcon(Download01Icon);
export const Energy = createIcon(EnergyIcon);
export const FilterHorizontal = createIcon(FilterHorizontalIcon);
export const Globe = createIcon(Globe02Icon);
export const Home = createIcon(Home01Icon);
export const Info = createIcon(InformationCircleIcon);
export const LinkIcon = createIcon(Link01Icon);
export const Loader2 = createIcon(Loading03Icon);
export const LogOut = createIcon(Logout01Icon);
export const Menu = createIcon(Menu01Icon);
export const Moon = createIcon(Moon02Icon);
export const Notebook = createIcon(Notebook01Icon);
export const Note = createIcon(NoteIcon);
export const Notification = createIcon(Notification03Icon);
export const Palette = createIcon(PaintBrush01Icon);
export const Pause = createIcon(PauseIcon);
export const PenLine = createIcon(PencilIcon);
export const RefreshCw = createIcon(RefreshIcon);
export const Settings = createIcon(Settings01Icon);
export const Star = createIcon(StarIcon);
export const Sun = createIcon(Sun03Icon);
export const Target = createIcon(Target01Icon);
export const Trash2 = createIcon(Delete02Icon);
export const Undo2 = createIcon(Undo02Icon);
export const User = createIcon(User02Icon);
export const Calendar = createIcon(Calendar03Icon);
export const Volume2 = createIcon(VolumeHighIcon);
export const X = createIcon(Cancel01Icon);
