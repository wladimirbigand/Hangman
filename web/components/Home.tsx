'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGame } from '../lib/GameContext';
import CreateRoom from './CreateRoom';

/** Une petite potence griffonnee en guise de logo. */
function TinyGallows() {
  return (
    <svg viewBox="0 0 90 90" className="w-24 h-24 text-graphite" style={{ filter: 'url(#sketch-strong)' }} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M 8 84 Q 26 81 42 84" />
        <path d="M 22 84 Q 19 46 24 12" />
        <path d="M 23 12 Q 44 9 60 13" />
        <path d="M 59 13 Q 61 20 59 26" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="text-redpen">
        <circle cx="59" cy="34" r="8" />
        <path d="M 59 42 Q 57 52 60 62" />
        <path d="M 59 46 Q 52 50 47 55" />
        <path d="M 59 46 Q 66 50 71 55" />
        <path d="M 60 62 Q 54 69 50 76" />
        <path d="M 60 62 Q 66 69 69 76" />
      </g>
    </svg>
  );
}

export default function Home() {
  const router = useRouter();
  const { pushToast } = useGame();
  const [view, setView] = useState<'landing' | 'create'>('landing');
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (code.length < 4) {
      pushToast('Entre un code de salle valide.', 'error');
      return;
    }
    router.push(`/room/${code}`);
  };

  if (view === 'create') {
    return <CreateRoom onBack={() => setView('landing')} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="flex justify-center mb-1">
          <TinyGallows />
        </div>
        <h1 className="font-marker text-5xl sm:text-6xl text-graphite -rotate-2">Le Pendu</h1>
        <p className="mt-4 font-display text-2xl text-graphite-soft rotate-1">
          Le jeu du pendu, en direct avec les copains de classe
        </p>
      </motion.div>

      <div className="w-full max-w-md flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="font-display font-bold text-2xl mb-1">Creer une partie</h2>
          <hr className="rule-line mb-3" />
          <p className="font-body text-graphite-soft mb-4">
            Choisis les reglages, invite tes amis avec un simple lien.
          </p>
          <button type="button" className="btn-primary w-full text-lg" onClick={() => setView('create')}>
            Creer une partie
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card-alt p-6"
        >
          <h2 className="font-display font-bold text-2xl mb-1">Rejoindre une partie</h2>
          <hr className="rule-line mb-3" />
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              className="input uppercase tracking-widest text-center font-marker text-2xl"
              placeholder="CODE"
              maxLength={8}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button className="btn-secondary w-full text-lg" type="submit">
              Rejoindre
            </button>
          </form>
        </motion.div>
      </div>

      <p className="mt-10 font-body text-sm text-graphite-soft -rotate-1">
        Fait pour jouer en classe. Aucune inscription requise.
      </p>
    </div>
  );
}
