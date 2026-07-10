'use client';

import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { PlayerDoodle, DoodleStar } from './Doodles';
import type { ScoreEntry } from '../lib/types';

const LABELS = ['1er 🏆', '2eme', '3eme'];
const HEIGHTS = ['h-36', 'h-24', 'h-16'];
const ORDER = [1, 0, 2]; // affichage podium: 2e, 1er, 3e

// Griffonnages festifs qui apparaissent autour du podium.
const CHEERS = ['BRAVO !', 'GG !', 'Trop fort', 'Youpi !'];

export default function Podium({
  classement,
  isHost,
  onReplay,
  onLeave,
}: {
  classement: ScoreEntry[];
  isHost: boolean;
  onReplay: () => void;
  onLeave: () => void;
}) {
  const top3 = classement.slice(0, 3);
  const rest = classement.slice(3);

  // Positions tirees une fois : les etoiles ne doivent pas sauter a chaque rendu.
  const stars = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        top: `${8 + ((i * 37) % 80)}%`,
        left: `${5 + ((i * 53) % 90)}%`,
        size: 14 + ((i * 7) % 16),
        delay: (i % 5) * 0.15,
      })),
    [],
  );

  useEffect(() => {
    const duration = 1800;
    const end = Date.now() + duration;
    // Confettis discrets, dans les couleurs de la trousse (crayon, encre, feutre).
    (function frame() {
      confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#2B2B2B', '#1A3C8F', '#C0392B', '#F9E547'] });
      confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#2B2B2B', '#27AE60', '#F9E547'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Etoiles dessinees au stylo, comme dans la marge d'un cahier */}
      {stars.map((s) => (
        <motion.div
          key={s.id}
          className="absolute pointer-events-none text-ink"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, opacity: 0.4 }}
          initial={{ opacity: 0, scale: 0, rotate: -30 }}
          animate={{ opacity: 0.4, scale: 1, rotate: 0 }}
          transition={{ delay: 0.4 + s.delay, type: 'spring', stiffness: 200 }}
        >
          <DoodleStar className="w-full h-full" />
        </motion.div>
      ))}

      <motion.h1
        initial={{ opacity: 0, y: -20, rotate: -3 }}
        animate={{ opacity: 1, y: 0, rotate: -1.5 }}
        className="font-display text-5xl font-bold mb-2 text-center"
      >
        Classement final
      </motion.h1>
      <hr className="rule-line w-64 mb-8" />

      <div className="flex items-end justify-center gap-3 sm:gap-5 mb-10 relative">
        {/* "BRAVO !" ecrit a la main au-dessus du gagnant */}
        <motion.span
          initial={{ opacity: 0, scale: 0.5, rotate: -12 }}
          animate={{ opacity: 1, scale: 1, rotate: -8 }}
          transition={{ delay: 0.7, type: 'spring' }}
          className="absolute -top-10 left-1/2 -translate-x-1/2 font-marker text-2xl text-redpen whitespace-nowrap"
        >
          {CHEERS[0]}
        </motion.span>

        {ORDER.map((rank, i) => {
          const player = top3[rank];
          if (!player) return <div key={rank} className="w-20 sm:w-24" />;
          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.18, type: 'spring', stiffness: 180 }}
              className="flex flex-col items-center gap-1.5 w-20 sm:w-28"
            >
              <PlayerDoodle id={player.id} className="w-9 h-9 text-graphite" />
              <span className="font-body text-sm text-center truncate w-full">{player.pseudo}</span>
              <span className="font-display font-bold text-xl text-ink">{player.score} pts</span>

              {/* Marche du podium : une simple boite tracee au crayon */}
              <div
                className={`w-full ${HEIGHTS[rank]} sketch border-graphite flex items-start justify-center pt-1.5`}
                style={{ rotate: `${(rank - 1) * 0.8}deg` }}
              >
                <span className="font-display font-bold text-lg">{LABELS[rank]}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className="card-alt p-4 w-full max-w-sm flex flex-col mb-8">
          {rest.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 py-1.5 border-b border-dashed border-graphite-soft/40">
              <span className="font-display text-graphite-soft w-5">{i + 4}.</span>
              <PlayerDoodle id={p.id} className="w-5 h-5 text-graphite" />
              <span className="flex-1 font-body truncate">{p.pseudo}</span>
              <span className="font-display font-bold text-ink">{p.score}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 justify-center">
        {isHost ? (
          <button type="button" className="btn-primary text-lg" onClick={onReplay}>
            Rejouer
          </button>
        ) : (
          <p className="font-display text-lg text-graphite-soft self-center">
            L&apos;hote peut relancer une partie...
          </p>
        )}
        <button type="button" className="btn-ghost" onClick={onLeave}>
          Quitter
        </button>
      </div>
    </div>
  );
}
