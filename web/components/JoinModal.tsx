'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useGame } from '../lib/GameContext';

export default function JoinModal({ code }: { code: string }) {
  const router = useRouter();
  const { joinRoom } = useGame();
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pseudo.trim();
    if (clean.length < 2 || clean.length > 15) {
      setError('Le pseudo doit contenir entre 2 et 15 caracteres.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await joinRoom(code, clean);
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.form
        initial={{ opacity: 0, scale: 0.92, y: 20, rotate: -2 }}
        animate={{ opacity: 1, scale: 1, y: 0, rotate: -0.8 }}
        onSubmit={handleSubmit}
        className="card w-full max-w-md p-8 flex flex-col gap-5"
      >
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold">Rejoindre la salle</h1>
          <hr className="rule-line my-3" />
          <p className="font-body text-graphite-soft">
            Code : <span className="font-marker text-2xl text-ink tracking-wider ml-1">{code}</span>
          </p>
        </div>

        <div>
          <label className="block font-display text-xl mb-2">Ton pseudo</label>
          <input
            className="input"
            placeholder="Ex: Zoe_du_92"
            value={pseudo}
            maxLength={15}
            autoFocus
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>

        {/* Remarque du prof dans la marge */}
        {error && (
          <p className="circled-red font-body text-redpen px-4 py-2 -rotate-1">{error}</p>
        )}

        <button className="btn-primary w-full text-lg" type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Rejoindre'}
        </button>
        <button type="button" className="btn-ghost w-full" onClick={() => router.push('/')}>
          Retour a l&apos;accueil
        </button>
      </motion.form>
    </div>
  );
}
