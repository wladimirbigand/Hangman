'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ROWS = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'];

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
    <div className="flex flex-col gap-2 items-center">
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
                whileTap={!isUsed && !disabled ? { scale: 0.85 } : {}}
                disabled={isUsed || disabled}
                onClick={() => onGuess(letter)}
                className={`w-8 h-10 sm:w-10 sm:h-12 rounded-lg font-display font-bold text-sm sm:text-base flex items-center justify-center transition-colors border-b-4 ${
                  isCorrect
                    ? 'bg-green-400 border-green-600 text-white'
                    : isWrong
                    ? 'bg-red-300 border-red-500 text-white opacity-60'
                    : disabled
                    ? 'bg-slate-100 dark:bg-slate-700/40 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                    : 'bg-white dark:bg-slate-700 border-indigo-200 dark:border-slate-600 hover:bg-indigo-50 dark:hover:bg-slate-600 active:translate-y-0.5'
                }`}
              >
                {letter}
              </motion.button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
