'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGame } from '../lib/GameContext';
import type { Category, Difficulty } from '../lib/types';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'melange', label: 'Melange' },
  { value: 'animaux', label: 'Animaux' },
  { value: 'pays', label: 'Pays' },
  { value: 'metiers', label: 'Metiers' },
  { value: 'nourriture', label: 'Nourriture' },
  { value: 'films', label: 'Films' },
  { value: 'jeuxvideo', label: 'Jeux video' },
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

/** Une option cochee est entouree au crayon, pas remplie de couleur. */
function optionClass(selected: boolean) {
  return selected
    ? 'circled !border-ink text-ink font-bold'
    : 'sketch border-graphite-soft/60 text-graphite hover:bg-highlighter/50';
}

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
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-4xl font-bold -rotate-1">Nouvelle partie</h1>
          <button type="button" className="btn-ghost text-sm" onClick={onBack}>
            Retour
          </button>
        </div>
        <hr className="rule-line" />

        <div>
          <label className="block font-display text-xl mb-2">Ton pseudo</label>
          <input
            className="input"
            placeholder="Ex: Zoe_du_92"
            value={pseudo}
            maxLength={15}
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-display text-xl mb-2">Categorie de mots</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {CATEGORIES.map((c, i) => (
              <button
                type="button"
                key={c.value}
                onClick={() => setCategory(c.value)}
                style={{ rotate: `${((i % 3) - 1) * 0.5}deg` }}
                className={`px-3 py-2.5 font-body transition-colors ${optionClass(category === c.value)}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block font-display text-xl mb-2">Difficulte</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {DIFFICULTIES.map((d) => (
              <button
                type="button"
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`px-3 py-2.5 text-left transition-colors ${optionClass(difficulty === d.value)}`}
              >
                <div className="font-display text-lg">{d.label}</div>
                <div className="font-body text-sm text-graphite-soft">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block font-display text-xl mb-2">Nombre de manches</label>
            <div className="flex gap-2.5">
              {ROUNDS_OPTIONS.map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRounds(r)}
                  className={`flex-1 py-2 font-display text-lg transition-colors ${optionClass(rounds === r)}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-display text-xl mb-2">Temps par tour</label>
            <div className="flex gap-2.5">
              {TIMER_OPTIONS.map((t) => (
                <button
                  type="button"
                  key={t.value}
                  onClick={() => setTimePerTurn(t.value)}
                  className={`flex-1 py-2 font-body text-sm transition-colors ${optionClass(timePerTurn === t.value)}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block font-display text-xl mb-2">
            Nombre max de joueurs : <span className="font-marker text-ink text-2xl ml-1">{maxPlayers}</span>
          </label>
          <input
            type="range"
            min={2}
            max={10}
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(Number(e.target.value))}
            className="w-full accent-[color:var(--ink)]"
          />
        </div>

        <button className="btn-primary w-full text-xl" type="submit" disabled={loading}>
          {loading ? 'Creation...' : 'Creer la salle'}
        </button>
      </motion.form>
    </div>
  );
}
