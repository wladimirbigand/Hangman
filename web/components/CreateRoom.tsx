'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGame } from '../lib/GameContext';
import type { Category, Difficulty } from '../lib/types';

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'melange', label: 'Melange', emoji: '🎲' },
  { value: 'animaux', label: 'Animaux', emoji: '🐘' },
  { value: 'pays', label: 'Pays', emoji: '🌍' },
  { value: 'metiers', label: 'Metiers', emoji: '👩‍🚒' },
  { value: 'nourriture', label: 'Nourriture', emoji: '🍕' },
  { value: 'films', label: 'Films', emoji: '🎬' },
  { value: 'jeuxvideo', label: 'Jeux video', emoji: '🎮' },
];

const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'facile', label: 'Facile', desc: 'Mots courts, 8 erreurs max' },
  { value: 'normal', label: 'Normal', desc: 'Mots moyens, 6 erreurs max' },
  { value: 'difficile', label: 'Difficile', desc: 'Mots longs, 4 erreurs max' },
];

const ROUNDS_OPTIONS = [1, 3, 5, 10];
const TIMER_OPTIONS = [
  { value: '30', label: '30s' },
  { value: '60', label: '60s' },
  { value: '90', label: '90s' },
  { value: 'none', label: 'Illimite' },
];

export default function CreateRoom({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { createRoom, pushToast } = useGame();
  const [pseudo, setPseudo] = useState('');
  const [category, setCategory] = useState<Category>('melange');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [rounds, setRounds] = useState(3);
  const [timePerTurn, setTimePerTurn] = useState('60');
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pseudo.trim();
    if (clean.length < 2 || clean.length > 15) {
      pushToast('Le pseudo doit contenir entre 2 et 15 caracteres.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await createRoom(
        {
          category,
          difficulty,
          rounds,
          timePerTurn: timePerTurn === 'none' ? null : Number(timePerTurn),
          maxPlayers,
        },
        clean,
      );
      router.push(`/room/${res.code}`);
    } catch (err) {
      pushToast((err as Error).message, 'error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card w-full max-w-2xl p-6 sm:p-8 flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-extrabold">🚀 Nouvelle partie</h1>
          <button type="button" className="btn-ghost text-sm" onClick={onBack}>
            Retour
          </button>
        </div>

        <div>
          <label className="block font-bold mb-2">Ton pseudo</label>
          <input
            className="input"
            placeholder="Ex: Zoe_du_92"
            value={pseudo}
            maxLength={15}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Categorie de mots</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setCategory(c.value)}
                className={`rounded-xl px-3 py-3 text-sm font-bold border-2 transition-all ${
                  category === c.value
                    ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-200'
                    : 'border-transparent bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <div className="text-xl mb-1">{c.emoji}</div>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-bold mb-2">Difficulte</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                type="button"
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`rounded-xl px-3 py-3 text-left border-2 transition-all ${
                  difficulty === d.value
                    ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/40'
                    : 'border-transparent bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <div className="font-bold">{d.label}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-bold mb-2">Nombre de manches</label>
            <div className="flex gap-2">
              {ROUNDS_OPTIONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRounds(r)}
                  className={`flex-1 rounded-xl py-2 font-bold border-2 transition-all ${
                    rounds === r
                      ? 'border-amber-500 bg-amber-100 dark:bg-amber-900/40'
                      : 'border-transparent bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold mb-2">Temps par tour</label>
            <div className="flex gap-2">
              {TIMER_OPTIONS.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setTimePerTurn(t.value)}
                  className={`flex-1 rounded-xl py-2 font-bold border-2 transition-all text-sm ${
                    timePerTurn === t.value
                      ? 'border-green-500 bg-green-100 dark:bg-green-900/40'
                      : 'border-transparent bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block font-bold mb-2">
            Nombre max de joueurs : <span className="text-indigo-500">{maxPlayers}</span>
          </label>
          <input
            type="range"
            min={2}
            max={10}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
        </div>

        <button className="btn-primary w-full text-lg" type="submit" disabled={loading}>
          {loading ? 'Creation...' : 'Creer la salle 🎉'}
        </button>
      </motion.form>
    </div>
  );
}
