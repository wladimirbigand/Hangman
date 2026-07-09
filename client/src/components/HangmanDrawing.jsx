import React from 'react';
import { motion } from 'framer-motion';

const lineTransition = { duration: 0.35, ease: 'easeOut' };

/**
 * Dessin du pendu en SVG anime. Les erreurs sont reparties sur 7 etapes
 * (tete, corps, bras G, bras D, jambe G, jambe D, visage triste) quel que
 * soit le nombre d'erreurs autorise par la difficulte.
 */
export default function HangmanDrawing({ errors, maxErrors }) {
  const stage = Math.min(7, Math.ceil((errors / Math.max(1, maxErrors)) * 7));
  const isDead = errors >= maxErrors;

  const part = (index) => stage >= index;

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 220 220" width="200" height="200" className="drop-shadow-sm">
        {/* Potence */}
        <motion.line x1="20" y1="205" x2="130" y2="205" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
          className="text-amber-700 dark:text-amber-400"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={lineTransition} />
        <motion.line x1="55" y1="205" x2="55" y2="20" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
          className="text-amber-700 dark:text-amber-400"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...lineTransition, delay: 0.1 }} />
        <motion.line x1="55" y1="20" x2="140" y2="20" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
          className="text-amber-700 dark:text-amber-400"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...lineTransition, delay: 0.2 }} />
        <motion.line x1="140" y1="20" x2="140" y2="45" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
          className="text-amber-700 dark:text-amber-400"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...lineTransition, delay: 0.3 }} />

        {/* Tete */}
        {part(1) && (
          <motion.circle cx="140" cy="65" r="20" fill="none" stroke="currentColor" strokeWidth="5"
            className="text-rose-500 dark:text-rose-400"
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            style={{ transformOrigin: '140px 65px' }} />
        )}

        {/* Visage */}
        {part(1) && !isDead && (
          <>
            <circle cx="133" cy="62" r="2" fill="currentColor" className="text-rose-500 dark:text-rose-400" />
            <circle cx="147" cy="62" r="2" fill="currentColor" className="text-rose-500 dark:text-rose-400" />
          </>
        )}
        {part(7) && isDead && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <line x1="130" y1="58" x2="136" y2="66" stroke="currentColor" strokeWidth="2" className="text-rose-600 dark:text-rose-400" />
            <line x1="136" y1="58" x2="130" y2="66" stroke="currentColor" strokeWidth="2" className="text-rose-600 dark:text-rose-400" />
            <line x1="144" y1="58" x2="150" y2="66" stroke="currentColor" strokeWidth="2" className="text-rose-600 dark:text-rose-400" />
            <line x1="150" y1="58" x2="144" y2="66" stroke="currentColor" strokeWidth="2" className="text-rose-600 dark:text-rose-400" />
            <path d="M 132 76 Q 140 70 148 76" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-600 dark:text-rose-400" />
          </motion.g>
        )}

        {/* Corps */}
        {part(2) && (
          <motion.line x1="140" y1="85" x2="140" y2="140" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
            className="text-indigo-500 dark:text-indigo-300"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={lineTransition} />
        )}
        {/* Bras gauche */}
        {part(3) && (
          <motion.line x1="140" y1="95" x2="115" y2="120" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
            className="text-indigo-500 dark:text-indigo-300"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={lineTransition} />
        )}
        {/* Bras droit */}
        {part(4) && (
          <motion.line x1="140" y1="95" x2="165" y2="120" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
            className="text-indigo-500 dark:text-indigo-300"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={lineTransition} />
        )}
        {/* Jambe gauche */}
        {part(5) && (
          <motion.line x1="140" y1="140" x2="118" y2="170" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
            className="text-purple-600 dark:text-purple-300"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={lineTransition} />
        )}
        {/* Jambe droite */}
        {part(6) && (
          <motion.line x1="140" y1="140" x2="162" y2="170" stroke="currentColor" strokeWidth="5" strokeLinecap="round"
            className="text-purple-600 dark:text-purple-300"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={lineTransition} />
        )}
      </svg>
    </div>
  );
}
