'use client';

import React from 'react';
import { motion } from 'framer-motion';

// Le trait se trace comme sous un crayon : un peu lent, jamais lineaire.
const drawTransition = { duration: 0.5, ease: 'easeInOut' as const };

const strokeProps = {
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/**
 * Dessin du pendu, croquis au crayon a papier (potence en graphite, bonhomme au
 * stylo rouge ; craie blanche en mode tableau). Les erreurs sont reparties sur
 * 7 etapes quel que soit le nombre d'erreurs autorise par la difficulte.
 *
 * Les traits sont des courbes de Bezier volontairement imparfaites, et le
 * filtre `#sketch-strong` (voir SketchFilters) les fait legerement onduler.
 */
export default function HangmanDrawing({ errors, maxErrors }: { errors: number; maxErrors: number }) {
  const stage = Math.min(7, Math.ceil((errors / Math.max(1, maxErrors)) * 7));
  const isDead = errors >= maxErrors;

  const part = (index: number) => stage >= index;

  return (
    <div className="flex justify-center">
      <svg viewBox="0 0 220 220" width="200" height="200" style={{ filter: 'url(#sketch-strong)' }}>
        {/* Potence — crayon graphite */}
        <g className="text-graphite">
          <motion.path
            d="M 18 204 Q 60 200 78 206 T 132 202"
            {...strokeProps}
            strokeWidth="5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={drawTransition}
          />
          <motion.path
            d="M 55 205 Q 51 120 57 62 T 54 21"
            {...strokeProps}
            strokeWidth="4.6"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...drawTransition, delay: 0.12 }}
          />
          <motion.path
            d="M 54 21 Q 92 16 116 23 T 141 19"
            {...strokeProps}
            strokeWidth="5.2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...drawTransition, delay: 0.24 }}
          />
          {/* La corde */}
          <motion.path
            d="M 140 20 Q 144 32 139 45"
            {...strokeProps}
            strokeWidth="3.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ ...drawTransition, delay: 0.36 }}
          />
        </g>

        {/* Bonhomme — stylo rouge */}
        <g className="text-redpen">
          {part(1) && (
            <motion.path
              d="M 140 45 C 152 45 162 54 161 66 C 160 78 151 86 139 85 C 127 84 119 76 119 64 C 119 53 128 45 140 45 Z"
              {...strokeProps}
              strokeWidth="4.2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={drawTransition}
            />
          )}

          {/* Visage enfantin : deux points pour les yeux, un trait courbe pour la bouche */}
          {part(1) && !isDead && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <circle cx="133" cy="61" r="2.2" fill="currentColor" />
              <circle cx="147" cy="61" r="2.2" fill="currentColor" />
              <path d="M 132 72 Q 140 78 148 71" {...strokeProps} strokeWidth="2.2" />
            </motion.g>
          )}
          {isDead && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <path d="M 129 57 Q 133 62 136 67" {...strokeProps} strokeWidth="2.4" />
              <path d="M 136 57 Q 132 62 129 67" {...strokeProps} strokeWidth="2.4" />
              <path d="M 144 57 Q 148 62 151 67" {...strokeProps} strokeWidth="2.4" />
              <path d="M 151 57 Q 147 62 144 67" {...strokeProps} strokeWidth="2.4" />
              <path d="M 131 77 Q 140 69 149 76" {...strokeProps} strokeWidth="2.4" />
            </motion.g>
          )}

          {part(2) && (
            <motion.path
              d="M 140 85 Q 136 112 141 140"
              {...strokeProps}
              strokeWidth="4.4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={drawTransition}
            />
          )}
          {part(3) && (
            <motion.path
              d="M 140 96 Q 127 105 113 120"
              {...strokeProps}
              strokeWidth="3.8"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={drawTransition}
            />
          )}
          {part(4) && (
            <motion.path
              d="M 140 96 Q 154 106 166 119"
              {...strokeProps}
              strokeWidth="4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={drawTransition}
            />
          )}
          {part(5) && (
            <motion.path
              d="M 141 140 Q 129 154 116 171"
              {...strokeProps}
              strokeWidth="4.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={drawTransition}
            />
          )}
          {part(6) && (
            <motion.path
              d="M 141 140 Q 153 155 164 170"
              {...strokeProps}
              strokeWidth="4.1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={drawTransition}
            />
          )}
        </g>
      </svg>
    </div>
  );
}
