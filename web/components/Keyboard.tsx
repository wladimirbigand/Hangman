'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ROWS = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'];

// Chaque touche penche un peu differemment : rien n'est aligne dans un cahier.
function tiltFor(letter: string) {
  return ((letter.charCodeAt(0) % 5) - 2) * 0.7;
}

export default function Keyboard({
  guessedLetters,
  wrongLetters,
  onGuess,
  disabled,
}: {
  guessedLetters: string[];
  wrongLetters: string[];
  onGuess: (letter: string) => void;
  disabled: boolean;
}) {
  const guessedSet = new Set(guessedLetters);
  const wrongSet = new Set(wrongLetters);

  return (
    <div className="flex flex-col gap-1.5 items-center">
      {ROWS.map((row, i) => (
        <div key={i} className="flex gap-1.5">
          {row.split('').map((letter) => {
            const isCorrect = guessedSet.has(letter);
            const isWrong = wrongSet.has(letter);
            const isUsed = isCorrect || isWrong;

            return (
              <motion.button
                key={letter}
                type="button"
                whileTap={!isUsed && !disabled ? { y: 2, rotate: 0 } : {}}
                disabled={isUsed || disabled}
                onClick={() => onGuess(letter)}
                style={{ rotate: `${tiltFor(letter)}deg` }}
                className={`relative w-8 h-10 sm:w-10 sm:h-12 font-display text-lg sm:text-xl font-bold
                  flex items-center justify-center bg-transparent
                  ${
                    isCorrect
                      ? 'circled text-greenpen'
                      : isWrong
                      ? 'circled-red text-redpen opacity-70'
                      : disabled
                      ? 'sketch border-graphite-soft text-graphite-soft opacity-45'
                      : 'sketch text-graphite hover:bg-highlighter/60'
                  }`}
              >
                {letter}

                {/* Barre rouge du prof sur une lettre fausse */}
                {isWrong && (
                  <svg
                    viewBox="0 0 40 40"
                    className="absolute inset-0 w-full h-full text-redpen pointer-events-none"
                    style={{ filter: 'url(#sketch)' }}
                  >
                    <path
                      d="M 6 33 Q 20 20 34 7"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {/* Annotation du prof : ✓ pour juste, ✗ pour faux */}
                {isUsed && (
                  <span
                    className={`absolute -top-2 -right-1.5 text-[11px] font-marker leading-none ${
                      isCorrect ? 'text-greenpen' : 'text-redpen'
                    }`}
                    style={{ rotate: '-12deg' }}
                    aria-hidden="true"
                  >
                    {isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
