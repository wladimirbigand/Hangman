'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../lib/GameContext';
import type { ToastType } from '../lib/types';

const STYLES: Record<ToastType, string> = {
  info: 'bg-slate-800 text-white',
  success: 'bg-green-500 text-white',
  warning: 'bg-amber-500 text-white',
  error: 'bg-red-500 text-white',
};

export default function Toasts() {
  const { toasts, dismissToast } = useGame();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            className={`pointer-events-auto rounded-xl px-4 py-3 shadow-lg font-semibold text-sm cursor-pointer ${STYLES[t.type] || STYLES.info}`}
            onClick={() => dismissToast(t.id)}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
