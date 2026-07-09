import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

export default function JoinRoom({ code }) {
  const navigate = useNavigate();
  const { joinRoom } = useGame();
  const [pseudo, setPseudo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
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
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="card w-full max-w-md p-8 flex flex-col gap-5"
      >
        <div className="text-center">
          <div className="text-5xl mb-2">🔑</div>
          <h1 className="font-display text-2xl font-extrabold">Rejoindre la salle</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Code : <span className="font-mono font-bold tracking-widest">{code}</span>
          </p>
        </div>

        <div>
          <label className="block font-bold mb-2">Ton pseudo</label>
          <input
            className="input"
            placeholder="Ex: Zoe_du_92"
            value={pseudo}
            maxLength={15}
            autoFocus
            onChange={(e) => setPseudo(e.target.value)}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-4 py-3 text-sm font-semibold">
            {error}
          </div>
        )}

        <button className="btn-primary w-full text-lg" type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Rejoindre 🎉'}
        </button>
        <button type="button" className="btn-ghost w-full" onClick={() => navigate('/')}>
          Retour a l'accueil
        </button>
      </motion.form>
    </div>
  );
}
