import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';

const MEDALS = ['🥇', '🥈', '🥉'];
const HEIGHTS = ['h-40', 'h-28', 'h-20'];
const ORDER = [1, 0, 2]; // affichage podium: 2e, 1er, 3e

export default function Podium({ classement, onLeave, onBackToLobby, isHost }) {
  const top3 = classement.slice(0, 3);
  const rest = classement.slice(3);

  useEffect(() => {
    const duration = 2000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: ['#6366f1', '#f59e0b', '#a855f7'] });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: ['#6366f1', '#f59e0b', '#a855f7'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-4xl font-extrabold mb-8 text-center"
      >
        🏆 Classement final
      </motion.h1>

      <div className="flex items-end justify-center gap-4 mb-10">
        {ORDER.map((rank, i) => {
          const player = top3[rank];
          if (!player) return <div key={rank} className="w-24" />;
          return (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, type: 'spring' }}
              className="flex flex-col items-center gap-2 w-24 sm:w-28"
            >
              <div className="text-3xl">{MEDALS[rank]}</div>
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: player.color }}
              >
                {player.pseudo.slice(0, 2).toUpperCase()}
              </span>
              <span className="font-bold text-sm text-center truncate w-full">{player.pseudo}</span>
              <span className="font-display font-extrabold text-indigo-600 dark:text-indigo-300">
                {player.score} pts
              </span>
              <div
                className={`w-full ${HEIGHTS[rank]} rounded-t-xl bg-gradient-to-t from-indigo-400 to-purple-400 dark:from-indigo-600 dark:to-purple-600`}
              />
            </motion.div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className="card p-4 w-full max-w-sm flex flex-col gap-2 mb-8">
          {rest.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 px-2 py-1">
              <span className="text-xs font-bold text-slate-400 w-4">{i + 4}</span>
              <span
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ backgroundColor: p.color }}
              >
                {p.pseudo.slice(0, 2).toUpperCase()}
              </span>
              <span className="flex-1 text-sm font-semibold truncate">{p.pseudo}</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-300">{p.score}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button className="btn-primary" onClick={onLeave}>
          Retour a l'accueil
        </button>
      </div>
    </div>
  );
}
