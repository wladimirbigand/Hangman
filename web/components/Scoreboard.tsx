'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ScoreEntry } from '../lib/types';

export default function Scoreboard({
  scores,
  myId,
  currentPlayerId,
}: {
  scores: ScoreEntry[];
  myId: string | null;
  currentPlayerId: string | null;
}) {
  const sorted = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col gap-2">
      <AnimatePresence>
        {sorted.map((p, index) => (
          <motion.div
            key={p.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 transition-all ${
              p.id === currentPlayerId
                ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-2 ring-indigo-400 animate-pulseGlow'
                : 'bg-slate-100 dark:bg-slate-700/40'
            } ${!p.connected ? 'opacity-40' : ''}`}
          >
            <span className="text-xs font-bold text-slate-400 w-4">{index + 1}</span>
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{ backgroundColor: p.color }}
            >
              {p.pseudo.slice(0, 2).toUpperCase()}
            </span>
            <span className="font-semibold flex-1 truncate text-sm">
              {p.pseudo} {p.id === myId && <span className="text-xs text-slate-400">(toi)</span>}
            </span>
            {p.id === currentPlayerId && <span className="text-xs">✏️</span>}
            <span className="font-display font-extrabold text-indigo-600 dark:text-indigo-300">{p.score}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
