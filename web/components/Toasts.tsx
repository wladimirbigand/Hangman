'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../lib/GameContext';
import type { ToastType } from '../lib/types';

// Chaque type de post-it a sa couleur de papier et son petit symbole griffonne.
const STYLES: Record<ToastType, { bg: string; mark: string }> = {
  info: { bg: '#FDF3A7', mark: '✎' },
  success: { bg: '#D8F0C8', mark: '✓' },
  warning: { bg: '#FBE0B5', mark: '!' },
  error: { bg: '#F6C9C2', mark: '✗' },
};

// Les post-it ne sont jamais colles bien droit.
const TILTS = [-2, 1.5, -1, 2];

export default function Toasts() {
  const { toasts, dismissToast } = useGame();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-xs w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t, i) => {
          const style = STYLES[t.type] || STYLES.info;
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 30, rotate: 0 }}
              animate={{ opacity: 1, x: 0, rotate: TILTS[i % TILTS.length] }}
              exit={{ opacity: 0, x: 30, scale: 0.9 }}
              onClick={() => dismissToast(t.id)}
              style={{ background: style.bg }}
              className="postit-note no-chalk pointer-events-auto cursor-pointer px-4 py-3 font-body
                         flex items-start gap-2 leading-snug"
            >
              <span className="font-marker text-sm mt-0.5 shrink-0" aria-hidden="true">
                {style.mark}
              </span>
              <span>{t.text}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
