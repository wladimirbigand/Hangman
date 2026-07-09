import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import HangmanDrawing from './HangmanDrawing';
import Keyboard from './Keyboard';
import Timer from './Timer';
import Scoreboard from './Scoreboard';
import Podium from './Podium';

const CATEGORY_LABELS = {
  melange: 'Melange', animaux: 'Animaux', pays: 'Pays', metiers: 'Metiers',
  nourriture: 'Nourriture', films: 'Films', jeuxvideo: 'Jeux video',
};

export default function Game() {
  const { room, gameState, roundEnd, gameOverData, myId, guessLetter, guessWord, leaveRoom } = useGame();
  const [wordGuess, setWordGuess] = useState('');
  const [showWordInput, setShowWordInput] = useState(false);

  if (gameOverData) {
    return <Podium classement={gameOverData.classement} onLeave={leaveRoom} />;
  }

  if (!room || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg font-bold animate-pulse">Chargement de la partie...</p>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerId === myId;
  const currentPlayer = room.players.find((p) => p.id === gameState.currentPlayerId);
  const letters = gameState.maskedWord.split(' ');

  const handleWordSubmit = (e) => {
    e.preventDefault();
    const clean = wordGuess.trim();
    if (!clean) return;
    guessWord(clean);
    setWordGuess('');
    setShowWordInput(false);
  };

  return (
    <div className="min-h-screen px-4 py-6 flex flex-col items-center">
      <div className="w-full max-w-5xl flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-display font-extrabold text-xl">
              Manche {gameState.round}/{gameState.totalRounds}
            </span>
            <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-3 py-1 text-xs font-bold">
              {CATEGORY_LABELS[room.settings.category]}
            </span>
            <span className="rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 px-3 py-1 text-xs font-bold uppercase">
              {room.settings.difficulty}
            </span>
          </div>
          <button className="btn-ghost text-sm" onClick={leaveRoom}>Quitter</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 card p-6 flex flex-col gap-5 items-center">
            <HangmanDrawing errors={gameState.errors} maxErrors={gameState.maxErrors} />

            <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400">
              ❌ {gameState.errors}/{gameState.maxErrors} erreurs
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {letters.map((ch, i) => (
                <motion.div
                  key={`${i}-${ch}`}
                  initial={ch !== '_' ? { scale: 0, rotate: -10 } : false}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className={`w-9 h-11 sm:w-11 sm:h-14 flex items-center justify-center rounded-lg font-display font-extrabold text-xl sm:text-2xl border-b-4 ${
                    ch !== '_'
                      ? 'bg-green-100 dark:bg-green-900/40 border-green-400 text-green-700 dark:text-green-300'
                      : 'bg-slate-100 dark:bg-slate-700/50 border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {ch !== '_' ? ch : ''}
                </motion.div>
              ))}
            </div>

            <motion.div
              key={gameState.currentPlayerId}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 ${
                isMyTurn
                  ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 animate-wiggle'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300'
              }`}
            >
              {isMyTurn ? "🎯 C'est ton tour !" : `⏳ Tour de ${currentPlayer?.pseudo || '...'}`}
            </motion.div>

            <Timer timeLeft={gameState.timeLeft} timePerTurn={gameState.timePerTurn} />

            <Keyboard
              guessedLetters={gameState.guessedLetters}
              wrongLetters={gameState.wrongLetters}
              onGuess={guessLetter}
              disabled={!isMyTurn || !gameState.roundActive}
            />

            <AnimatePresence>
              {showWordInput ? (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleWordSubmit}
                  className="flex gap-2 w-full max-w-sm"
                >
                  <input
                    autoFocus
                    className="input"
                    placeholder="Propose le mot entier..."
                    value={wordGuess}
                    onChange={(e) => setWordGuess(e.target.value)}
                  />
                  <button className="btn-secondary" type="submit">Valider</button>
                </motion.form>
              ) : (
                <button
                  type="button"
                  disabled={!isMyTurn || !gameState.roundActive}
                  className="btn-ghost text-sm"
                  onClick={() => setShowWordInput(true)}
                >
                  💡 Deviner le mot entier
                </button>
              )}
            </AnimatePresence>
          </div>

          <div className="card p-5">
            <h2 className="font-display font-bold text-lg mb-3">🏆 Scores</h2>
            <Scoreboard scores={gameState.scores} myId={myId} currentPlayerId={gameState.currentPlayerId} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {roundEnd && !gameOverData && <RoundEndOverlay roundEnd={roundEnd} room={room} />}
      </AnimatePresence>
    </div>
  );
}

function RoundEndOverlay({ roundEnd, room }) {
  const winner = room.players.find((p) => p.id === roundEnd.winnerId);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card p-8 text-center max-w-md w-full"
      >
        <div className="text-6xl mb-3">{roundEnd.won ? '🎉' : '😵'}</div>
        <h2 className="font-display text-2xl font-extrabold mb-2">
          {roundEnd.won ? 'Mot trouve !' : 'Perdu pour cette manche !'}
        </h2>
        <p className="text-lg mb-4">
          Le mot etait : <span className="font-display font-extrabold text-indigo-500">{roundEnd.word}</span>
        </p>
        {roundEnd.won && winner && (
          <p className="font-bold text-green-600 dark:text-green-400 mb-4">
            Bravo {winner.pseudo} ! 🏅
          </p>
        )}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manche {roundEnd.round}/{roundEnd.totalRounds} terminee — la suite arrive...
        </p>
      </motion.div>
    </motion.div>
  );
}
