'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerDoodle } from './Doodles';
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
  const best = sorted.length ? sorted[0].score : 0;

  return (
    <div className="flex flex-col">
      <AnimatePresence>
        {sorted.map((p, index) => {
          const isLeader = p.score === best && best > 0;
          const isCurrent = p.id === currentPlayerId;

          return (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              // Chaque ligne du tableau penche un peu : rien n'est trace a la regle.
              style={{ rotate: `${((index % 3) - 1) * 0.25}deg` }}
              className={`relative flex items-center gap-2 py-2 border-b border-dashed border-graphite-soft/40
                ${!p.connected ? 'opacity-40' : ''}`}
            >
              {/* Tour actuel : un coup de surligneur sur toute la ligne */}
              {isCurrent && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-[-4px] inset-y-1 bg-highlighter/60 -skew-x-3 -z-10"
                />
              )}

              <span className="font-display text-sm text-graphite-soft w-4">{index + 1}.</span>
              <PlayerDoodle id={p.id} className="w-6 h-6 text-graphite" />

              <span className="font-body flex-1 truncate">
                {p.pseudo}
                {p.id === myId && <span className="text-graphite-soft text-sm"> (toi)</span>}
              </span>

              {isCurrent && (
                <span className="font-display text-sm text-ink" title="A lui de jouer">
                  ✏️
                </span>
              )}

              {/* Le meilleur score est entoure, comme la bonne reponse d'une copie. */}
              <span
                className={`font-display font-bold text-lg text-ink px-1.5 ${
                  isLeader ? 'circled !border-ink' : ''
                }`}
              >
                {p.score}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
