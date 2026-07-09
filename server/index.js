'use strict';

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const { Room, RECONNECT_GRACE_MS } = require('./game/Room');
const { CATEGORY_LABELS } = require('./game/WordBank');
const { generateUniqueRoomCode } = require('./utils/generateCode');

const PORT = process.env.PORT || 3001;
const IS_PROD = process.env.NODE_ENV === 'production';

// Ce serveur est deploye a part (Railway/Fly.io/Render/VPS...) et sert
// uniquement l'API temps reel : le frontend Next.js (deploye sur Vercel)
// s'y connecte en cross-origin via socket.io-client. CLIENT_ORIGIN liste les
// origines autorisees (Vercel + previews + local dev), separees par des
// virgules ; a defaut, tout est autorise (pratique en dev, a restreindre en prod).
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const corsOptions = allowedOrigins.length > 0 ? { origin: allowedOrigins } : { origin: '*' };

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: corsOptions,
});

/** @type {Map<string, Room>} */
const rooms = new Map();

// socket.id -> { code, token } pour retrouver rapidement la salle/le joueur d'un socket
const socketIndex = new Map();

const VALID_CATEGORIES = new Set([...Object.keys(CATEGORY_LABELS)]);
const VALID_DIFFICULTIES = new Set(['facile', 'normal', 'difficile']);
const VALID_ROUNDS = new Set([1, 3, 5, 10]);
const VALID_TIMERS = new Set([null, 30, 60, 90]);

function log(...args) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size, uptime: process.uptime() });
});

function sanitizeSettings(raw = {}) {
  const category = VALID_CATEGORIES.has(raw.category) ? raw.category : 'melange';
  const difficulty = VALID_DIFFICULTIES.has(raw.difficulty) ? raw.difficulty : 'normal';
  const rounds = VALID_ROUNDS.has(Number(raw.rounds)) ? Number(raw.rounds) : 3;
  const timePerTurn = VALID_TIMERS.has(raw.timePerTurn === null ? null : Number(raw.timePerTurn))
    ? (raw.timePerTurn === null || raw.timePerTurn === undefined ? null : Number(raw.timePerTurn))
    : null;
  let maxPlayers = Number(raw.maxPlayers);
  if (!Number.isFinite(maxPlayers) || maxPlayers < 2) maxPlayers = 8;
  if (maxPlayers > 10) maxPlayers = 10;
  return { category, difficulty, rounds, timePerTurn, maxPlayers };
}

function sanitizePseudo(raw) {
  return String(raw || '').trim().slice(0, 15);
}

function isValidPseudo(pseudo) {
  return pseudo.length >= 2 && pseudo.length <= 15;
}

function roomSnapshot(room) {
  return {
    code: room.code,
    settings: room.toSettingsView(),
    players: room.toPublicPlayers(),
    hostId: room.hostToken,
    status: room.status,
    chat: room.chat,
  };
}

function broadcastRoomUpdate(room) {
  io.to(room.code).emit('room-update', roomSnapshot(room));
}

function attachEngineCallbacks(room) {
  const { engine } = room;
  engine.onTick = (timeLeft) => {
    io.to(room.code).emit('tick', { timeLeft, currentPlayerId: engine.getCurrentPlayerId() });
  };
  engine.onTimeout = () => {
    const result = engine.handleTimeout();
    if (!result) return;
    if (result.roundEnd) {
      handleRoundEnd(room, result.roundEnd);
    } else {
      io.to(room.code).emit('game-state', result.state);
    }
  };
}

function handleRoundEnd(room, roundEnd) {
  room.status = 'roundend';
  room.lastRoundEnd = roundEnd; // permet de rattraper un joueur qui se reconnecte pendant/apres cette manche
  io.to(room.code).emit('round-end', roundEnd);
  broadcastRoomUpdate(room);

  if (roundEnd.isGameOver) {
    room.status = 'gameover';
    io.to(room.code).emit('game-over', { classement: room.toScoreboard() });
    return;
  }

  setTimeout(() => {
    if (!rooms.has(room.code) || room.status !== 'roundend') return;
    room.status = 'playing';
    const state = room.engine.startNextRound();
    io.to(room.code).emit('game-state', state);
  }, 4000);
}

function leaveRoomInternal(socket, code) {
  const room = rooms.get(code);
  if (!room) return;
  const player = room.getBySocketId(socket.id);
  if (!player) return;

  room.removePlayerPermanently(player.token);
  socketIndex.delete(socket.id);
  socket.leave(code);

  if (room.isEmpty()) {
    if (room.engine) room.engine.stop();
    rooms.delete(code);
    log(`Salle ${code} supprimee (vide)`);
    return;
  }

  io.to(code).emit('player-left', { pseudo: player.pseudo, id: player.token });
  broadcastRoomUpdate(room);
}

io.on('connection', (socket) => {
  log('Connexion socket', socket.id);

  socket.on('create-room', (params = {}, callback) => {
    try {
      const pseudo = sanitizePseudo(params.pseudo);
      if (!isValidPseudo(pseudo)) {
        return callback && callback({ error: 'Le pseudo doit contenir entre 2 et 15 caracteres.' });
      }
      const settings = sanitizeSettings(params);
      const code = generateUniqueRoomCode(new Set(rooms.keys()));
      const room = new Room(code, settings);
      rooms.set(code, room);

      const player = room.addPlayer(socket.id, pseudo);
      socketIndex.set(socket.id, { code, token: player.token });
      socket.join(code);

      log(`Salle creee ${code} par ${pseudo}`);
      callback && callback({ code, token: player.token, room: roomSnapshot(room) });
      io.to(code).emit('room-created', { code });
      broadcastRoomUpdate(room);
    } catch (err) {
      log('Erreur create-room', err);
      callback && callback({ error: 'Impossible de creer la salle.' });
    }
  });

  socket.on('join-room', (params = {}, callback) => {
    try {
      const code = String(params.code || '').trim().toUpperCase();
      const pseudo = sanitizePseudo(params.pseudo);
      const token = params.token || null;
      const room = rooms.get(code);

      if (!room) {
        return callback && callback({ error: "Cette salle n'existe pas." });
      }

      if (token && room.getByToken(token)) {
        const existing = room.getByToken(token);
        room.reconnectPlayer(token, socket.id);
        socketIndex.set(socket.id, { code, token });
        socket.join(code);
        log(`Reconnexion de ${existing.pseudo} dans ${code}`);
        callback && callback({ code, token, room: roomSnapshot(room) });
        io.to(code).emit('player-joined', { pseudo: existing.pseudo, id: token, reconnected: true });
        broadcastRoomUpdate(room);

        // Rattrape le joueur reconnecte sur le bon ecran selon l'etat actuel de la
        // salle (sinon il reste bloque sur le dernier etat de jeu recu avant sa coupure).
        if (room.status === 'gameover') {
          socket.emit('game-over', { classement: room.toScoreboard() });
        } else if (room.status === 'roundend' && room.lastRoundEnd) {
          socket.emit('round-end', room.lastRoundEnd);
        } else if (room.engine) {
          socket.emit('game-state', room.engine.getPublicState());
        }
        return;
      }

      if (!isValidPseudo(pseudo)) {
        return callback && callback({ error: 'Le pseudo doit contenir entre 2 et 15 caracteres.' });
      }
      if (room.status !== 'lobby') {
        return callback && callback({ error: 'La partie a deja commence.' });
      }
      if (room.isFull()) {
        return callback && callback({ error: 'Cette salle est pleine.' });
      }
      if (room.pseudoTaken(pseudo)) {
        return callback && callback({ error: 'Ce pseudo est deja pris dans cette salle.' });
      }

      const player = room.addPlayer(socket.id, pseudo);
      socketIndex.set(socket.id, { code, token: player.token });
      socket.join(code);

      log(`${pseudo} a rejoint la salle ${code}`);
      callback && callback({ code, token: player.token, room: roomSnapshot(room) });
      io.to(code).emit('player-joined', { pseudo: player.pseudo, id: player.token, reconnected: false });
      broadcastRoomUpdate(room);
    } catch (err) {
      log('Erreur join-room', err);
      callback && callback({ error: 'Impossible de rejoindre la salle.' });
    }
  });

  socket.on('start-game', () => {
    const entry = socketIndex.get(socket.id);
    if (!entry) return;
    const room = rooms.get(entry.code);
    if (!room) return;
    if (room.hostToken !== entry.token) return;
    if (!room.canStart()) return;

    const state = room.startGame();
    attachEngineCallbacks(room);
    log(`Partie lancee dans ${room.code}`);
    io.to(room.code).emit('game-started', { settings: room.toSettingsView() });
    io.to(room.code).emit('game-state', state);
    broadcastRoomUpdate(room);
  });

  socket.on('guess-letter', ({ letter } = {}) => {
    const entry = socketIndex.get(socket.id);
    if (!entry) return;
    const room = rooms.get(entry.code);
    if (!room || !room.engine) return;

    const result = room.engine.guessLetter(entry.token, letter);
    if (result.error) {
      socket.emit('letter-result', { error: result.error });
      return;
    }
    io.to(room.code).emit('letter-result', {
      letter: result.letter,
      correct: result.correct,
      playerId: entry.token,
    });
    if (result.roundEnd) {
      handleRoundEnd(room, result.roundEnd);
    } else {
      io.to(room.code).emit('game-state', result.state);
    }
  });

  socket.on('guess-word', ({ word } = {}) => {
    const entry = socketIndex.get(socket.id);
    if (!entry) return;
    const room = rooms.get(entry.code);
    if (!room || !room.engine) return;

    const result = room.engine.guessWord(entry.token, word);
    if (result.error) {
      socket.emit('word-result', { error: result.error });
      return;
    }
    io.to(room.code).emit('word-result', {
      word: result.correct ? result.word : null,
      correct: result.correct,
      playerId: entry.token,
      attempt: word,
    });
    if (result.roundEnd) {
      handleRoundEnd(room, result.roundEnd);
    } else {
      io.to(room.code).emit('game-state', result.state);
    }
  });

  socket.on('chat-message', ({ text } = {}) => {
    const entry = socketIndex.get(socket.id);
    if (!entry) return;
    const room = rooms.get(entry.code);
    if (!room) return;
    const clean = String(text || '').trim().slice(0, 300);
    if (!clean) return;
    const message = room.addChatMessage(entry.token, clean);
    io.to(room.code).emit('new-message', message);
  });

  socket.on('leave-room', () => {
    const entry = socketIndex.get(socket.id);
    if (!entry) return;
    leaveRoomInternal(socket, entry.code);
  });

  socket.on('disconnect', () => {
    const entry = socketIndex.get(socket.id);
    if (!entry) return;
    const room = rooms.get(entry.code);
    if (!room) return;
    const player = room.getByToken(entry.token);
    if (!player) return;

    room.markDisconnected(entry.token);
    socketIndex.delete(socket.id);
    log(`${player.pseudo} deconnecte de ${room.code}, delai de grace 30s`);
    io.to(room.code).emit('player-left', { pseudo: player.pseudo, id: entry.token, temporary: true });
    broadcastRoomUpdate(room);

    const timer = setTimeout(() => {
      const stillThere = room.getByToken(entry.token);
      if (!stillThere || stillThere.connected) return;
      room.removePlayerPermanently(entry.token);
      log(`${player.pseudo} retire definitivement de ${room.code} (timeout reconnexion)`);
      if (room.isEmpty()) {
        if (room.engine) room.engine.stop();
        rooms.delete(room.code);
        log(`Salle ${room.code} supprimee (vide)`);
        return;
      }
      io.to(room.code).emit('player-left', { pseudo: player.pseudo, id: entry.token, temporary: false });
      broadcastRoomUpdate(room);
    }, RECONNECT_GRACE_MS);
    room.disconnectTimers.set(entry.token, timer);
  });
});

server.listen(PORT, () => {
  log(`Serveur du Pendu multijoueur demarre sur le port ${PORT} (${IS_PROD ? 'production' : 'developpement'})`);
  log(`Origines autorisees (CORS) : ${allowedOrigins.length ? allowedOrigins.join(', ') : 'toutes (*)'}`);
});
