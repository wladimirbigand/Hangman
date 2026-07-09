import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import Chat from './Chat';

const CATEGORY_LABELS = {
  melange: 'Melange',
  animaux: 'Animaux',
  pays: 'Pays',
  metiers: 'Metiers',
  nourriture: 'Nourriture',
  films: 'Films',
  jeuxvideo: 'Jeux video',
};
const DIFFICULTY_LABELS = { facile: 'Facile', normal: 'Normal', difficile: 'Difficile' };

export default function Lobby() {
  const { room, myId, startGame, sendChat, leaveRoom, pushToast } = useGame();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const isHost = room.hostId === myId;
  const connectedCount = room.players.filter((p) => p.connected).length;
  const canStart = isHost && connectedCount >= 2;

  const inviteLink = `${window.location.origin}${window.location.pathname}#/room/${room.code}`;

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

  return (
    <div className="min-h-screen px-4 py-8 flex flex-col items-center">
      <div className="w-full max-w-4xl flex flex-col gap-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
              Salle d'attente
            </p>
            <h1 className="font-display text-3xl font-extrabold tracking-widest">{room.code}</h1>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={copyLink}>
              {copied ? 'Copie ✅' : '🔗 Copier le lien'}
            </button>
            <button className="btn-ghost" onClick={leaveRoom}>
              Quitter
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SettingCard label="Categorie" value={CATEGORY_LABELS[room.settings.category]} emoji="📚" />
          <SettingCard label="Difficulte" value={DIFFICULTY_LABELS[room.settings.difficulty]} emoji="🎯" />
          <SettingCard label="Manches" value={room.settings.rounds} emoji="🔁" />
          <SettingCard
            label="Temps/tour"
            value={room.settings.timePerTurn ? `${room.settings.timePerTurn}s` : 'Illimite'}
            emoji="⏱️"
          />
          <SettingCard label="Joueurs max" value={room.settings.maxPlayers} emoji="👥" />
          <SettingCard label="Connectes" value={`${connectedCount}/${room.players.length}`} emoji="🟢" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-display font-bold text-lg mb-4">Joueurs ({room.players.length})</h2>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {room.players.map((p) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 ${
                      p.connected ? 'bg-slate-100 dark:bg-slate-700/50' : 'bg-slate-100/50 dark:bg-slate-700/20 opacity-50'
                    }`}
                  >
                    <span
                      className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.pseudo.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="font-semibold flex-1 truncate">
                      {p.pseudo} {p.id === myId && <span className="text-xs text-slate-400">(toi)</span>}
                    </span>
                    {p.isHost && <span title="Hote">👑</span>}
                    {!p.connected && <span className="text-xs text-red-400">deconnecte</span>}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {isHost ? (
              <button className="btn-primary w-full mt-6 text-lg" disabled={!canStart} onClick={startGame}>
                {canStart ? 'Lancer la partie 🚀' : 'Il faut au moins 2 joueurs'}
              </button>
            ) : (
              <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
                En attente que l'hote lance la partie...
              </p>
            )}
          </div>

          <div className="card p-6 flex flex-col">
            <h2 className="font-display font-bold text-lg mb-4">💬 Chat</h2>
            <Chat messages={room.chat} onSend={sendChat} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingCard({ label, value, emoji }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <span className="text-2xl">{emoji}</span>
      <div>
        <p className="text-xs uppercase font-bold text-slate-400 dark:text-slate-500">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}
