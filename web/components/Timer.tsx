'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Timer({ timeLeft, timePerTurn }: { timeLeft: number | null; timePerTurn: number | null }) {
  if (!timePerTurn) {
    return (
      <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-bold text-sm">
        <span>⏱️</span> Illimite
      </div>
    );
  }

  const safeTimeLeft = timeLeft ?? timePerTurn;
  const ratio = Math.max(0, Math.min(1, safeTimeLeft / timePerTurn));
  const urgent = safeTimeLeft <= 5;

  return (
    <div className="flex items-center gap-3 w-full max-w-xs">
      <motion.span
        className={`font-display font-extrabold text-lg w-8 text-center ${urgent ? 'text-red-500' : 'text-indigo-500'}`}
        animate={urgent ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.5, repeat: urgent ? Infinity : 0 }}
      >
        {safeTimeLeft}
      </motion.span>
      <div className="flex-1 h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${urgent ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-400 to-purple-500'}`}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
