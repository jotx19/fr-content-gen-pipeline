'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import { useTheme } from 'next-themes';
import type { Block } from '@blocknote/core';

import '@blocknote/core/fonts/inter.css';
import '@blocknote/mantine/style.css';

import { cn } from '@/lib/utils';

type NotesEditorProps = {
  initialContent: unknown;
  editable?: boolean;
  onChange?: (content: Block[], excerpt: string) => void;
  className?: string;
};

function blocksToExcerpt(blocks: Block[]): string {
  const parts: string[] = [];
  for (const block of blocks) {
    if (!('content' in block) || !Array.isArray(block.content)) continue;
    for (const item of block.content) {
      if (item && typeof item === 'object' && 'text' in item && typeof item.text === 'string') {
        parts.push(item.text);
      }
    }
    if (parts.join(' ').trim().length > 160) break;
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim().slice(0, 180);
}

export function NotesEditor({
  initialContent,
  editable = true,
  onChange,
  className,
}: NotesEditorProps) {
  const { resolvedTheme } = useTheme();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const initial = useMemo(() => {
    if (Array.isArray(initialContent) && initialContent.length > 0) {
      return initialContent as Block[];
    }
    return undefined;
  }, [initialContent]);

  const editor = useCreateBlockNote({
    initialContent: initial,
  });

  useEffect(() => {
    if (!onChange) return;
    return editor.onChange((ed) => {
      const blocks = ed.document;
      onChangeRef.current?.(blocks, blocksToExcerpt(blocks));
    });
  }, [editor, onChange]);

  return (
    <div className={cn('notes-editor min-h-[50vh] w-full', className)}>
      <BlockNoteView
        editor={editor}
        editable={editable}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
        slashMenu
        sideMenu
        formattingToolbar
        linkToolbar
        emojiPicker
        filePanel={false}
      />
    </div>
  );
}
