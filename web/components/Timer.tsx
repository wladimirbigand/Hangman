'use client';

import React from 'react';
import { motion } from 'framer-motion';

function Hourglass({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} style={{ filter: 'url(#sketch)' }} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 4 3 Q 12 1.5 20 3" />
        <path d="M 4 29 Q 12 30.5 20 29" />
        <path d="M 5 3 Q 6 12 12 16 Q 18 20 19 29" />
        <path d="M 19 3 Q 18 12 12 16 Q 6 20 5 29" />
      </g>
      {/* Le sable */}
      <path d="M 8 26 Q 12 22 16 26 Z" fill="currentColor" opacity="0.55" />
    </svg>
  );
}

export default function Timer({ timeLeft, timePerTurn }: { timeLeft: number | null; timePerTurn: number | null }) {
  if (!timePerTurn) {
    return (
      <div className="flex items-center gap-2 text-graphite-soft font-body">
        <Hourglass className="w-4 h-5" />
        <span>Temps illimite</span>
      </div>
    );
  }

  const safeTimeLeft = timeLeft ?? timePerTurn;
  const ratio = Math.max(0, Math.min(1, safeTimeLeft / timePerTurn));
  const pressing = safeTimeLeft <= 10; // le chiffre commence a trembler
  const critical = safeTimeLeft <= 5;

  return (
    <div className="flex items-center gap-3 w-full max-w-xs">
      <Hourglass className={`w-5 h-6 shrink-0 ${critical ? 'text-redpen' : 'text-graphite'}`} />

      <span
        className={`font-display font-bold text-2xl w-9 text-center leading-none ${
          critical ? 'text-redpen' : 'text-ink'
        } ${pressing ? 'animate-jitter' : ''}`}
      >
        {safeTimeLeft}
      </span>

      {/* Jauge tracee au crayon : contour dessine, remplissage a l'encre. */}
      <div className="sketch flex-1 h-4 overflow-hidden p-[2px]">
        <motion.div
          className={`h-full ${critical ? 'bg-redpen' : 'bg-ink'}`}
          style={{ borderRadius: '40% 60% 55% 45% / 50% 50% 50% 50%' }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.3, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
