'use client';

import { AnimatePresence, motion } from 'framer-motion';

type AnimatedTextProps = {
  text: string;
  className?: string;
  delayStep?: number;
  /** When false, only changed characters re-animate (good for counters). */
  remountOnChange?: boolean;
};

export function AnimatedText({
  text,
  className,
  delayStep = 0.014,
  remountOnChange = true,
}: AnimatedTextProps) {
  const chars = text.split('');

  const charNodes = chars.map((char, i) => (
    <motion.span
      key={remountOnChange ? `${text}-${i}` : `${i}-${char}`}
      initial={{ y: 10, opacity: 0, scale: 0.5, filter: 'blur(2px)' }}
      animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
      exit={
        remountOnChange
          ? { y: -10, opacity: 0, scale: 0.5, filter: 'blur(2px)' }
          : undefined
      }
      transition={{
        type: 'spring',
        stiffness: 240,
        damping: 16,
        mass: 1.2,
        delay: i * delayStep,
      }}
      style={{
        display: 'inline-block',
        whiteSpace: char === ' ' ? 'pre' : undefined,
      }}
    >
      {char}
    </motion.span>
  ));

  if (!remountOnChange) {
    return (
      <span className={className} style={{ display: 'inline-flex' }}>
        {charNodes}
      </span>
    );
  }

  return (
    <span className={className} style={{ display: 'inline-flex' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} style={{ display: 'inline-flex', willChange: 'transform' }}>
          {charNodes}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
