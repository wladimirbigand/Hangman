'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../lib/GameContext';
import Chat from './Chat';
import { PlayerDoodle } from './Doodles';
import type { Category, Difficulty } from '../lib/types';

const CATEGORY_LABELS: Record<Category, string> = {
  melange: 'Melange',
  animaux: 'Animaux',
  pays: 'Pays',
  metiers: 'Metiers',
  nourriture: 'Nourriture',
  films: 'Films',
  jeuxvideo: 'Jeux video',
};
const DIFFICULTY_LABELS: Record<Difficulty, string> = { facile: 'Facile', normal: 'Normal', difficile: 'Difficile' };

export default function Lobby() {
  const router = useRouter();
  const { room, myId, startGame, sendChat, leaveRoom, pushToast } = useGame();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const isHost = room.hostId === myId;
  const connectedCount = room.players.filter((p) => p.connected).length;
  const canStart = isHost && connectedCount >= 2;

  const inviteLink = typeof window !== 'undefined' ? `${window.location.origin}/room/${room.code}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      pushToast('Lien copie !', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      pushToast('Impossible de copier le lien.', 'error');
    }
  };

  const handleLeave = () => {
    leaveRoom();
    router.push('/');
  };

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="font-body text-graphite-soft">Salle d&apos;attente — code de la salle :</p>
            <h1 className="font-marker text-4xl tracking-wider text-ink -rotate-1">{room.code}</h1>
          </div>
          <div className="flex gap-2">
            <button type="button" className="btn-secondary" onClick={copyLink}>
              {copied ? 'Copie !' : 'Copier le lien'}
            </button>
            <button type="button" className="btn-ghost" onClick={handleLeave}>
              Quitter
            </button>
          </div>
        </motion.div>

        {/* Les reglages, notes dans la marge comme un resume de cours */}
        <div className="card-alt p-5">
          <h2 className="font-display font-bold text-2xl mb-1">Les regles du jour</h2>
          <hr className="rule-line mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
            <Note label="Categorie" value={CATEGORY_LABELS[room.settings.category]} arrow />
            <Note label="Difficulte" value={DIFFICULTY_LABELS[room.settings.difficulty]} />
            <Note label="Manches" value={room.settings.rounds} />
            <Note label="Temps / tour" value={room.settings.timePerTurn ? `${room.settings.timePerTurn}s` : 'Illimite'} />
            <Note label="Joueurs max" value={room.settings.maxPlayers} />
            <Note label="Connectes" value={`${connectedCount}/${room.players.length}`} arrow />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="card p-6 flex flex-col">
            <h2 className="font-display font-bold text-2xl mb-1">Qui joue ? ({room.players.length})</h2>
            <hr className="rule-line mb-3" />

            {/* Un joueur par ligne du cahier */}
            <div className="flex flex-col">
              <AnimatePresence>
                {room.players.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    style={{ rotate: `${((i % 3) - 1) * 0.3}deg` }}
                    className={`flex items-center gap-3 py-2 border-b border-dashed border-graphite-soft/40 ${
                      p.connected ? '' : 'opacity-40'
                    }`}
                  >
                    <PlayerDoodle id={p.id} className="w-7 h-7 text-graphite" />
                    <span className="font-body flex-1 truncate text-lg">
                      {p.pseudo}
                      {p.id === myId && <span className="text-graphite-soft text-sm"> (toi)</span>}
                    </span>
                    {p.isHost && (
                      <span className="font-display text-sm text-ink" title="Hote">
                        chef
                      </span>
                    )}
                    {!p.connected && <span className="font-body text-sm text-redpen">parti(e)...</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {isHost ? (
              <button type="button" className="btn-primary w-full mt-6 text-xl" disabled={!canStart} onClick={startGame}>
                {canStart ? 'Lancer la partie' : 'Il faut au moins 2 joueurs'}
              </button>
            ) : (
              <p className="mt-6 text-center font-display text-lg text-graphite-soft -rotate-1">
                On attend que le chef lance la partie...
              </p>
            )}
          </div>

          <div className="card-alt p-6 flex flex-col">
            <h2 className="font-display font-bold text-2xl mb-1">Les petits mots</h2>
            <hr className="rule-line mb-3" />
            <Chat messages={room.chat} onSend={sendChat} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Une ligne de note manuscrite, avec sa fleche griffonnee optionnelle. */
function Note({ label, value, arrow = false }: { label: string; value: string | number; arrow?: boolean }) {
  return (
    <div className="flex items-baseline gap-2 font-body">
      <span className="text-graphite-soft">{label}</span>
      {arrow && (
        <svg viewBox="0 0 24 8" className="w-5 h-2 text-graphite-soft" style={{ filter: 'url(#sketch)' }} aria-hidden="true">
          <path d="M 1 4 Q 10 2 20 4" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <path d="M 16 1.5 L 21 4 L 16 6.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
      <span className="font-display font-bold text-lg text-ink">{value}</span>
    </div>
  );
}
