'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../lib/GameContext';
import HangmanDrawing from './HangmanDrawing';
import Keyboard from './Keyboard';
import Timer from './Timer';
import Scoreboard from './Scoreboard';
import Podium from './Podium';
import type { Category, RoomSnapshot, RoundEndPayload } from '../lib/types';

const CATEGORY_LABELS: Record<Category, string> = {
  melange: 'Melange', animaux: 'Animaux', pays: 'Pays', metiers: 'Metiers',
  nourriture: 'Nourriture', films: 'Films', jeuxvideo: 'Jeux video',
};

/** Trait de crayon legerement ondule, sous chaque lettre du mot. */
function PencilDash() {
  return (
    <svg viewBox="0 0 40 6" className="w-full h-1.5 text-graphite" style={{ filter: 'url(#sketch)' }} aria-hidden="true">
      <path d="M 2 4 Q 12 2.2 20 3.6 T 38 3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Game() {
  const router = useRouter();
  const { room, gameState, roundEnd, gameOverData, myId, guessLetter, guessWord, leaveRoom, restartGame, nextRound } =
    useGame();
  const [wordGuess, setWordGuess] = useState('');
  const [showWordInput, setShowWordInput] = useState(false);

  const handleLeave = () => {
    leaveRoom();
    router.push('/');
  };

  if (gameOverData) {
    const isHost = room?.hostId === myId;
    return (
      <Podium
        classement={gameOverData.classement}
        isHost={isHost}
        onReplay={restartGame}
        onLeave={handleLeave}
      />
    );
  }

  if (!room || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-display text-2xl animate-pulse">Chargement de la partie...</p>
      </div>
    );
  }

  const isMyTurn = gameState.currentPlayerId === myId;
  const isHost = room.hostId === myId;
  const currentPlayer = room.players.find((p) => p.id === gameState.currentPlayerId);
  const letters = gameState.maskedWord.split(' ');

  const handleWordSubmit = (e: React.FormEvent) => {
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
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-display font-bold text-2xl">
              Manche {gameState.round}/{gameState.totalRounds}
            </span>
            <span className="font-body text-sm highlight -rotate-1">{CATEGORY_LABELS[room.settings.category]}</span>
            <span className="font-body text-sm text-redpen underline decoration-wavy underline-offset-4">
              {room.settings.difficulty}
            </span>
          </div>
          <button type="button" className="btn-ghost text-sm" onClick={handleLeave}>
            Quitter
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="card lg:col-span-2 p-6 flex flex-col gap-5 items-center">
            <HangmanDrawing errors={gameState.errors} maxErrors={gameState.maxErrors} />

            <div className="font-body text-redpen">
              {gameState.errors}/{gameState.maxErrors} erreurs
            </div>

            {/* Le mot : un trait de crayon par lettre, l'encre bleue par-dessus. */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {letters.map((ch, i) => (
                <div key={`${i}-${ch}`} className="w-8 sm:w-10 flex flex-col items-center">
                  <div className="h-12 sm:h-14 flex items-end justify-center">
                    {ch !== '_' && (
                      <motion.span
                        initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
                        animate={{ opacity: 1, scale: 1, rotate: (i % 3) - 1 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 14 }}
                        className="font-marker text-3xl sm:text-4xl text-ink leading-none"
                      >
                        {ch}
                      </motion.span>
                    )}
                  </div>
                  <PencilDash />
                </div>
              ))}
            </div>

            <motion.div
              key={gameState.currentPlayerId ?? 'none'}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`font-display text-xl px-3 py-1 ${
                isMyTurn ? 'highlight text-graphite animate-wiggle' : 'text-graphite-soft'
              }`}
            >
              {isMyTurn ? "A toi de jouer !" : `Au tour de ${currentPlayer?.pseudo || '...'}`}
            </motion.div>

            <Timer timeLeft={gameState.timeLeft} timePerTurn={gameState.timePerTurn} />

            <Keyboard
              guessedLetters={gameState.guessedLetters}
              wrongLetters={gameState.wrongLetters}
              onGuess={guessLetter}
              disabled={!isMyTurn || !gameState.roundActive}
            />

            <AnimatePresence mode="wait">
              {showWordInput ? (
                <motion.form
                  key="word-input"
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
                  <button className="btn-primary" type="submit">Valider</button>
                </motion.form>
              ) : (
                <button
                  key="word-toggle"
                  type="button"
                  disabled={!isMyTurn || !gameState.roundActive}
                  className="btn-ghost text-sm"
                  onClick={() => setShowWordInput(true)}
                >
                  Deviner le mot entier
                </button>
              )}
            </AnimatePresence>
          </div>

          <div className="card-alt p-5">
            <h2 className="font-display font-bold text-2xl mb-1">Les scores</h2>
            <hr className="rule-line mb-2" />
            <Scoreboard scores={gameState.scores} myId={myId} currentPlayerId={gameState.currentPlayerId} />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {roundEnd && !gameOverData && (
          <RoundEndOverlay roundEnd={roundEnd} room={room} isHost={isHost} onContinue={nextRound} />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compte a rebours affiche entre deux manches. Le serveur reste maitre : il
 * enchaine tout seul a `nextRoundAt` et l'ecran se ferme a la reception du
 * `game-state` suivant. Ce compteur n'est qu'un affichage, et l'hote peut
 * ecourter l'attente via "Continuer" (event `next-round`).
 */
function useCountdown(target?: number) {
  const [left, setLeft] = useState(() => (target ? Math.max(0, Math.ceil((target - Date.now()) / 1000)) : 0));

  useEffect(() => {
    if (!target) return undefined;
    const tick = () => setLeft(Math.max(0, Math.ceil((target - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [target]);

  return left;
}

function RoundEndOverlay({
  roundEnd,
  room,
  isHost,
  onContinue,
}: {
  roundEnd: RoundEndPayload;
  room: RoomSnapshot;
  isHost: boolean;
  onContinue: () => void;
}) {
  const winner = room.players.find((p) => p.id === roundEnd.winnerId);
  const secondsLeft = useCountdown(roundEnd.nextRoundAt);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: -0.6 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="card p-8 text-center max-w-md w-full"
      >
        <h2 className="font-display text-4xl font-bold mb-1">
          {roundEnd.won ? 'Trouve !' : 'Rate...'}
        </h2>
        <hr className="rule-line my-3" />

        <p className="font-body text-lg mb-3">
          Le mot etait <span className="font-marker text-2xl text-ink ml-1">{roundEnd.word}</span>
        </p>

        {roundEnd.won && winner && (
          <p className="font-display text-2xl text-greenpen mb-3 -rotate-1">Bravo {winner.pseudo} !</p>
        )}

        <p className="font-body text-graphite-soft">
          Manche {roundEnd.round}/{roundEnd.totalRounds} terminee
        </p>

        <div className="mt-5 flex flex-col items-center gap-3">
          <p className="font-display text-xl">
            Prochaine manche dans{' '}
            <span key={secondsLeft} className="inline-block font-marker text-3xl text-redpen animate-scribbleIn">
              {secondsLeft}
            </span>
          </p>

          {isHost ? (
            <button type="button" className="btn-primary" onClick={onContinue}>
              Continuer maintenant
            </button>
          ) : (
            <p className="font-body text-sm text-graphite-soft">L&apos;hote peut passer l&apos;attente.</p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
