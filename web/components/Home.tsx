'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../lib/GameContext';
import CreateRoom from './CreateRoom';

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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="text-6xl mb-2">🎪🪢</div>
        <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500">
          Le Pendu
        </h1>
        <p className="mt-3 text-lg text-slate-600 dark:text-slate-300 font-body">
          Le jeu du pendu multijoueur, en direct avec tes copains de classe !
        </p>
      </motion.div>

      <div className="w-full max-w-md flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
            <span>🚀</span> Creer une partie
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Choisis les reglages, invite tes amis avec un simple lien.
          </p>
          <button type="button" className="btn-primary w-full" onClick={() => setView('create')}>
            Creer une partie
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="font-display font-bold text-xl mb-3 flex items-center gap-2">
            <span>🔑</span> Rejoindre une partie
          </h2>
          <form onSubmit={handleJoin} className="flex flex-col gap-3">
            <input
              className="input uppercase tracking-widest text-center font-bold"
              placeholder="CODE DE LA SALLE"
              maxLength={8}
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            />
            <button className="btn-secondary w-full" type="submit">
              Rejoindre
            </button>
          </form>
        </motion.div>
      </div>

      <p className="mt-10 text-xs text-slate-400 dark:text-slate-500">
        Fait pour jouer en classe. Aucune inscription requise.
      </p>
    </div>
  );
}
