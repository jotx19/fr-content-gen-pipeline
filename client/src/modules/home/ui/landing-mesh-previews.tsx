'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { Energy, Note, Notebook, PenLine, Translate } from '@/components/icons';
import { bricolage } from '@/lib/fonts';
import { cn } from '@/lib/utils';

type HeroFeaturePreviewId = 'reading' | 'writing' | 'streak' | 'notes' | 'translate';

function MeshCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'w-full rounded-[20px] border border-white/25 bg-white/92 p-4 shadow-[0_10px_32px_rgba(0,0,0,0.16)] backdrop-blur-sm dark:border-white/15 dark:bg-white/10 dark:shadow-[0_10px_32px_rgba(0,0,0,0.35)] md:rounded-[22px] md:p-5',
        className,
      )}
    >
      {children}
    </div>
  );
}

function Bar({ className }: { className?: string }) {
  return <span className={cn('block h-2 rounded-full bg-black/[0.08] dark:bg-white/15 md:h-2.5', className)} />;
}

function IconBadge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-xl md:size-10 md:rounded-2xl', className)}>
      {children}
    </span>
  );
}

function ReadingMeshPreview() {
  return (
    <MeshCard>
      <div className="mb-3 flex items-center gap-2.5 md:mb-4">
        <IconBadge className="bg-[#FEE9D9] text-[#C45C3A]">
          <Notebook className="size-5 md:size-6" strokeWidth={2.25} />
        </IconBadge>
        <Bar className="w-20 bg-[#C45C3A]/20 md:w-24" />
      </div>
      <div className="space-y-2 md:space-y-2.5">
        <Bar className="w-full" />
        <Bar className="w-[90%]" />
        <Bar className="w-[72%]" />
      </div>
      <div className="mt-3 space-y-2 md:mt-4 md:space-y-2.5">
        <div className="rounded-xl border border-[#C45C3A]/20 bg-[#FEE9D9]/55 px-3 py-2.5 md:px-3.5 md:py-3">
          <Bar className="h-1.5 w-[65%] bg-[#C45C3A]/35 md:h-2" />
        </div>
        <div className="rounded-xl border border-black/[0.05] px-3 py-2.5 dark:border-white/10 md:px-3.5 md:py-3">
          <Bar className="h-1.5 w-[50%] md:h-2" />
        </div>
      </div>
    </MeshCard>
  );
}

function WritingMeshPreview() {
  return (
    <MeshCard>
      <div className="mb-3 flex items-center gap-2.5 md:mb-4">
        <IconBadge className="bg-[#E0E7FF] text-[#4F63D8]">
          <PenLine className="size-5 md:size-6" strokeWidth={2.25} />
        </IconBadge>
        <span className={cn(bricolage.className, 'text-xs font-semibold text-[#4F63D8] md:text-sm')}>
          TEF · Expression écrite
        </span>
      </div>
      <div className="rounded-xl border border-[#4F63D8]/12 bg-white/80 dark:bg-white/5 p-3 md:p-3.5">
        <div className="space-y-2 md:space-y-2.5">
          <Bar className="w-full bg-[#4F63D8]/12" />
          <Bar className="w-[85%] bg-[#4F63D8]/10" />
          <Bar className="w-[58%] bg-[#4F63D8]/8" />
        </div>
        <p className={cn(bricolage.className, 'mt-3 text-right text-[10px] font-medium text-black/35 dark:text-white/40 md:text-xs')}>
          142 mots
        </p>
      </div>
    </MeshCard>
  );
}

function StreakMeshPreview() {
  return (
    <MeshCard>
      <div className="mb-3 flex items-center gap-2.5 md:mb-4">
        <IconBadge className="bg-[#FEF9C3] text-[#CA8A04]">
          <Energy className="size-5 md:size-6" strokeWidth={2.25} />
        </IconBadge>
        <span className={cn(bricolage.className, 'text-xs font-semibold text-[#CA8A04] md:text-sm')}>
          12 day streak · 120 XP
        </span>
      </div>
      <div className="rounded-xl border border-[#CA8A04]/12 bg-white/80 dark:bg-white/5 p-3 md:p-3.5">
        <div className="flex gap-1.5">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className={cn('h-2 flex-1 rounded-full md:h-2.5', i < 5 ? 'bg-[#CA8A04]' : 'bg-black/[0.08] dark:bg-white/15')} />
          ))}
        </div>
        <div className="mt-3 space-y-2 md:space-y-2.5">
          <Bar className="w-full bg-[#CA8A04]/12" />
          <Bar className="w-[70%] bg-[#CA8A04]/8" />
        </div>
      </div>
    </MeshCard>
  );
}

function NotesMeshPreview() {
  return (
    <MeshCard>
      <div className="mb-3 flex items-center gap-2.5 md:mb-4">
        <IconBadge className="bg-[#D1FAE5] text-[#059669]">
          <Note className="size-5 md:size-6" strokeWidth={2.25} />
        </IconBadge>
        <Bar className="w-20 bg-[#059669]/18 md:w-24" />
      </div>
      <div className="space-y-2 rounded-xl border border-[#059669]/10 bg-white/80 dark:bg-white/5 p-3 md:space-y-2.5 md:p-3.5">
        <Bar className="w-full bg-[#059669]/14" />
        <Bar className="w-[82%]" />
        <Bar className="w-[68%]" />
      </div>
    </MeshCard>
  );
}

function TranslateMeshPreview() {
  return (
    <MeshCard>
      <div className="mb-3 flex items-center gap-2.5 md:mb-4">
        <IconBadge className="bg-[#EDE9FE] text-[#7C3AED]">
          <Translate className="size-5 md:size-6" strokeWidth={2.25} />
        </IconBadge>
        <span className={cn(bricolage.className, 'text-xs font-semibold text-[#7C3AED] md:text-sm')}>
          FR → EN
        </span>
      </div>
      <div className="space-y-2 md:space-y-2.5">
        <div className="rounded-xl border border-black/[0.05] bg-white/80 px-3 py-2.5 dark:border-white/10 dark:bg-white/5 md:px-3.5 md:py-3">
          <Bar className="w-[80%]" />
        </div>
        <p className="text-center text-xs font-bold text-[#7C3AED] md:text-sm">↓</p>
        <div className="rounded-xl border border-[#7C3AED]/15 bg-[#EDE9FE]/35 px-3 py-2.5 md:px-3.5 md:py-3">
          <Bar className="w-[72%] bg-[#7C3AED]/28" />
        </div>
      </div>
    </MeshCard>
  );
}

const MESH_PREVIEWS: Record<HeroFeaturePreviewId, () => React.JSX.Element> = {
  reading: ReadingMeshPreview,
  writing: WritingMeshPreview,
  streak: StreakMeshPreview,
  notes: NotesMeshPreview,
  translate: TranslateMeshPreview,
};

const PREVIEW_ORDER: HeroFeaturePreviewId[] = ['reading', 'writing', 'streak', 'notes', 'translate'];

export function MeshFeaturePreview({ activeIndex }: { activeIndex: number }) {
  const id = PREVIEW_ORDER[activeIndex] ?? 'reading';
  const Preview = MESH_PREVIEWS[id];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -4, scale: 0.98 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        <Preview />
      </motion.div>
    </AnimatePresence>
  );
}
