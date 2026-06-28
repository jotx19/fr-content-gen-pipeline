'use client';

import type { WritingBlank, WritingParagraphPart, WritingSentencePrompt } from '@/modules/writing/types/writing';
import { cn } from '@/lib/utils';

type FillBlankAnswerProps = {
  parts: WritingParagraphPart[];
  blanks: WritingBlank[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  readOnly?: boolean;
  className?: string;
};

export function FillBlankAnswer({
  parts,
  blanks,
  values,
  onChange,
  readOnly = false,
  className,
}: FillBlankAnswerProps) {
  const hintById = Object.fromEntries(blanks.map((b) => [b.id, b.hint]));

  return (
    <div
      className={cn(
        'min-h-[120px] w-full rounded-xl border border-dashed border-border/70 px-4 py-4 text-sm leading-[2.1] text-foreground dark:border-white/15',
        readOnly && 'bg-black/[0.03] dark:bg-white/[0.04]',
        className
      )}
    >
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return (
            <span key={`text-${index}`} className="whitespace-pre-wrap">
              {part.value}
            </span>
          );
        }

        return (
          <span key={`blank-${part.id}`} className="mx-0.5 inline-flex align-baseline">
            <input
              type="text"
              value={values[part.id] ?? ''}
              onChange={(e) => onChange(part.id, e.target.value)}
              readOnly={readOnly}
              placeholder={hintById[part.id] ? `(${hintById[part.id]})` : '…'}
              aria-label={`Blank ${part.id}`}
              className={cn(
                'inline-block min-w-[5.5rem] max-w-[9rem] border-b border-dashed border-foreground/35 bg-transparent px-1 py-0.5 text-center text-sm font-medium outline-none focus:border-primary',
                readOnly && 'cursor-default border-foreground/25 text-foreground/90'
              )}
            />
          </span>
        );
      })}
    </div>
  );
}

type BlankListFallbackProps = {
  blanks: WritingBlank[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  readOnly?: boolean;
  className?: string;
};

export function BlankListFallback({
  blanks,
  values,
  onChange,
  readOnly = false,
  className,
}: BlankListFallbackProps) {
  return (
    <div className={cn('space-y-3 px-4 py-4', className)}>
      {blanks.map((blank, index) => (
        <label key={blank.id} className="block space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">
            Blank {index + 1}
            {blank.hint ? ` · ${blank.hint}` : ''}
          </span>
          <input
            type="text"
            value={values[blank.id] ?? ''}
            onChange={(e) => onChange(blank.id, e.target.value)}
            readOnly={readOnly}
            className="w-full rounded-lg border border-border/70 bg-transparent px-3 py-2 text-sm outline-none focus:border-primary dark:border-white/15"
          />
        </label>
      ))}
    </div>
  );
}

type SentenceAnswerProps = {
  prompts: WritingSentencePrompt[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  readOnly?: boolean;
  className?: string;
};

export function SentenceAnswer({
  prompts,
  values,
  onChange,
  readOnly = false,
  className,
}: SentenceAnswerProps) {
  return (
    <div className={cn('space-y-4 px-1 py-1', className)}>
      {prompts.map((row, index) => {
        const words = (values[row.id] ?? '').trim().split(/\s+/).filter(Boolean).length;
        const ok = words >= row.minWords && words <= row.maxWords;
        return (
          <div key={row.id} className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              {index + 1}. {row.prompt}
            </p>
            <textarea
              value={values[row.id] ?? ''}
              onChange={(e) => onChange(row.id, e.target.value)}
              readOnly={readOnly}
              rows={2}
              placeholder="Écrivez une phrase…"
              className="w-full resize-none rounded-xl border border-dashed border-border/70 bg-transparent px-3 py-2 text-sm leading-relaxed outline-none focus:border-primary dark:border-white/15"
            />
            <p
              className={cn(
                'text-xs tabular-nums',
                ok ? 'text-muted-foreground' : 'text-amber-600 dark:text-amber-500'
              )}
            >
              {words} words · target {row.minWords}–{row.maxWords}
            </p>
          </div>
        );
      })}
    </div>
  );
}
