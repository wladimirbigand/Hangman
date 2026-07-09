'use strict';

const { pickWord } = require('./WordBank');

const DIFFICULTY_MAX_ERRORS = {
  facile: 8,
  normal: 6,
  difficile: 4,
};

const POINTS_PER_LETTER = 10;
const POINTS_FINISH_BONUS = 50;
const POINTS_PER_ERROR = -5;

function normalizeGuess(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .trim();
}

/**
 * GameEngine porte l'etat d'une partie en cours pour une Room : mots,
 * manches, tours des joueurs, erreurs et scores. Il ne connait pas
 * socket.io — il expose des callbacks (onTick / onTimeout) que la couche
 * reseau (index.js) branche pour diffuser les mises a jour.
 */
class GameEngine {
  constructor(room) {
    this.room = room;
    this.totalRounds = room.settings.rounds;
    this.maxErrors = DIFFICULTY_MAX_ERRORS[room.settings.difficulty] || DIFFICULTY_MAX_ERRORS.normal;
    this.timePerTurn = room.settings.timePerTurn || null;

    this.currentRoundNumber = 0;
    this.usedWords = [];
    this.word = '';
    this.guessedLetters = new Set();
    this.wrongLetters = new Set();
    this.errors = 0;
    this.turnOrder = [];
    this.currentTurnIdx = 0;
    this.roundActive = false;
    this.timeLeft = 0;
    this.timer = null;
    this.roundScores = new Map();

    this.onTick = null;
    this.onTimeout = null;
  }

  get isGameOver() {
    return this.currentRoundNumber >= this.totalRounds && !this.roundActive;
  }

  startNextRound() {
    this.clearTimer();
    this.currentRoundNumber += 1;
    this.word = pickWord(this.room.settings.category, this.room.settings.difficulty, this.usedWords);
    this.usedWords.push(this.word);
    this.guessedLetters = new Set();
    this.wrongLetters = new Set();
    this.errors = 0;
    this.roundScores = new Map();
    this.roundActive = true;
    this.turnOrder = this.room.getConnectedPlayerIds();
    this.currentTurnIdx = 0;

    this.startTurnTimer();
    return this.getPublicState();
  }

  getCurrentPlayerId() {
    return this.turnOrder.length ? this.turnOrder[this.currentTurnIdx] : null;
  }

  isPlayerActive(id) {
    const p = this.room.players.get(id);
    return Boolean(p && p.connected);
  }

  startTurnTimer() {
    this.clearTimer();
    if (!this.timePerTurn) return;
    this.timeLeft = this.timePerTurn;
    this.timer = setInterval(() => {
      this.timeLeft -= 1;
      if (this.timeLeft <= 0) {
        this.clearTimer();
        if (this.onTimeout) this.onTimeout();
      } else if (this.onTick) {
        this.onTick(this.timeLeft);
      }
    }, 1000);
  }

  clearTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  }

  stop() {
    this.clearTimer();
    this.roundActive = false;
  }

  addScore(playerId, points) {
    const player = this.room.players.get(playerId);
    if (player) player.score += points;
    this.roundScores.set(playerId, (this.roundScores.get(playerId) || 0) + points);
  }

  speedBonus() {
    if (!this.timePerTurn) return 0;
    return Math.round((this.timeLeft / this.timePerTurn) * 20);
  }

  isWordFullyRevealed() {
    return [...this.word].every((ch) => this.guessedLetters.has(ch));
  }

  advanceTurn() {
    if (!this.turnOrder.length) return;
    let attempts = 0;
    do {
      this.currentTurnIdx = (this.currentTurnIdx + 1) % this.turnOrder.length;
      attempts += 1;
    } while (!this.isPlayerActive(this.turnOrder[this.currentTurnIdx]) && attempts <= this.turnOrder.length);
    this.startTurnTimer();
  }

  guessLetter(playerId, rawLetter) {
    if (!this.roundActive) return { error: 'ROUND_INACTIVE' };
    if (this.getCurrentPlayerId() !== playerId) return { error: 'NOT_YOUR_TURN' };

    const letter = normalizeGuess(rawLetter);
    if (!letter || letter.length !== 1 || !/^[A-Z]$/.test(letter)) {
      return { error: 'INVALID_LETTER' };
    }
    if (this.guessedLetters.has(letter) || this.wrongLetters.has(letter)) {
      return { error: 'ALREADY_GUESSED' };
    }

    if (this.word.includes(letter)) {
      this.guessedLetters.add(letter);
      let points = POINTS_PER_LETTER + this.speedBonus();
      const finished = this.isWordFullyRevealed();
      if (finished) points += POINTS_FINISH_BONUS;
      this.addScore(playerId, points);

      if (finished) {
        return { correct: true, letter, roundEnd: this.finishRound(playerId, true) };
      }
      this.advanceTurn();
      return { correct: true, letter, state: this.getPublicState() };
    }

    this.wrongLetters.add(letter);
    this.errors += 1;
    this.addScore(playerId, POINTS_PER_ERROR);

    if (this.errors >= this.maxErrors) {
      return { correct: false, letter, roundEnd: this.finishRound(null, false) };
    }
    this.advanceTurn();
    return { correct: false, letter, state: this.getPublicState() };
  }

  guessWord(playerId, rawWord) {
    if (!this.roundActive) return { error: 'ROUND_INACTIVE' };
    if (this.getCurrentPlayerId() !== playerId) return { error: 'NOT_YOUR_TURN' };

    const guess = normalizeGuess(rawWord);
    if (!guess) return { error: 'INVALID_WORD' };

    if (guess === this.word) {
      const remaining = [...this.word].filter((ch) => !this.guessedLetters.has(ch));
      const uniqueRemaining = [...new Set(remaining)];
      [...this.word].forEach((ch) => this.guessedLetters.add(ch));
      const points = uniqueRemaining.length * POINTS_PER_LETTER + POINTS_FINISH_BONUS + this.speedBonus();
      this.addScore(playerId, points);
      return { correct: true, word: this.word, roundEnd: this.finishRound(playerId, true) };
    }

    this.errors += 2;
    this.addScore(playerId, POINTS_PER_ERROR * 2);
    if (this.errors >= this.maxErrors) {
      return { correct: false, roundEnd: this.finishRound(null, false) };
    }
    this.advanceTurn();
    return { correct: false, state: this.getPublicState() };
  }

  handleTimeout() {
    if (!this.roundActive) return null;
    const skippedPlayerId = this.getCurrentPlayerId();
    this.errors += 1;
    if (skippedPlayerId) this.addScore(skippedPlayerId, POINTS_PER_ERROR);

    if (this.errors >= this.maxErrors) {
      return { timedOut: true, skippedPlayerId, roundEnd: this.finishRound(null, false) };
    }
    this.advanceTurn();
    return { timedOut: true, skippedPlayerId, state: this.getPublicState() };
  }

  finishRound(winnerId, won) {
    this.clearTimer();
    this.roundActive = false;
    return {
      word: this.word,
      won,
      winnerId,
      round: this.currentRoundNumber,
      totalRounds: this.totalRounds,
      roundScores: [...this.roundScores.entries()].map(([id, pts]) => ({ id, points: pts })),
      scores: this.room.toScoreboard(),
      isGameOver: this.currentRoundNumber >= this.totalRounds,
    };
  }

  removePlayerFromTurnOrder(playerId) {
    const idx = this.turnOrder.indexOf(playerId);
    if (idx === -1) return;
    const wasCurrent = idx === this.currentTurnIdx;
    this.turnOrder.splice(idx, 1);
    if (!this.turnOrder.length) {
      this.currentTurnIdx = 0;
      return;
    }
    if (idx < this.currentTurnIdx) {
      this.currentTurnIdx -= 1;
    } else if (wasCurrent) {
      this.currentTurnIdx %= this.turnOrder.length;
      if (this.roundActive && !this.isPlayerActive(this.turnOrder[this.currentTurnIdx])) {
        this.advanceTurn();
      } else if (this.roundActive) {
        this.startTurnTimer();
      }
    }
  }

  getMaskedWord() {
    return [...this.word].map((ch) => (this.guessedLetters.has(ch) ? ch : '_')).join(' ');
  }

  getPublicState() {
    return {
      maskedWord: this.getMaskedWord(),
      wordLength: this.word.length,
      errors: this.errors,
      maxErrors: this.maxErrors,
      wrongLetters: [...this.wrongLetters],
      guessedLetters: [...this.guessedLetters],
      currentPlayerId: this.getCurrentPlayerId(),
      round: this.currentRoundNumber,
      totalRounds: this.totalRounds,
      timeLeft: this.timePerTurn ? this.timeLeft : null,
      timePerTurn: this.timePerTurn,
      roundActive: this.roundActive,
      scores: this.room.toScoreboard(),
    };
  }
}

module.exports = { GameEngine, DIFFICULTY_MAX_ERRORS, normalizeGuess };
