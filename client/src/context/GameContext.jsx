import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getSocket } from '../hooks/useSocket';
import { sounds } from '../utils/sounds';

const GameContext = createContext(null);

const SESSION_KEY = 'pendu_session';

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

let toastSeq = 0;

export function GameProvider({ children }) {
  const socket = useRef(getSocket()).current;
  const [connected, setConnected] = useState(socket.connected);
  const [session, setSession] = useState(loadSession());
  const [room, setRoom] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [roundEnd, setRoundEnd] = useState(null);
  const [gameOverData, setGameOverData] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('pendu_dark') === 'true');

  const pushToast = useCallback((text, type = 'info') => {
    const id = toastSeq += 1;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pendu_dark', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onRoomUpdate = (payload) => setRoom(payload);

    const onPlayerJoined = ({ pseudo, reconnected }) => {
      pushToast(reconnected ? `${pseudo} est de retour` : `${pseudo} a rejoint la partie`, 'success');
    };
    const onPlayerLeft = ({ pseudo, temporary }) => {
      pushToast(temporary ? `${pseudo} s'est deconnecte (30s pour revenir)` : `${pseudo} a quitte la partie`, 'warning');
    };

    const onGameStarted = () => {
      setRoundEnd(null);
      setGameOverData(null);
      pushToast('La partie commence !', 'success');
    };

    const onGameState = (state) => setGameState(state);

    const onLetterResult = (payload) => {
      if (payload.error) {
        pushToast('Action impossible : ce n\'est pas ton tour ou cette lettre a deja ete jouee.', 'warning');
        return;
      }
      if (payload.correct) sounds.correct();
      else sounds.wrong();
    };
    const onWordResult = (payload) => {
      if (payload.error) {
        pushToast('Action impossible : ce n\'est pas ton tour.', 'warning');
        return;
      }
      if (payload.correct) sounds.correct();
      else sounds.wrong();
    };

    const onRoundEnd = (payload) => {
      setRoundEnd(payload);
      if (payload.won) sounds.victory();
      else sounds.defeat();
    };

    const onGameOver = (payload) => {
      setGameOverData(payload);
      setRoundEnd(null);
    };

    const onNewMessage = (message) => {
      setRoom((prev) => (prev ? { ...prev, chat: [...prev.chat, message] } : prev));
    };

    const onTick = ({ timeLeft, currentPlayerId }) => {
      setGameState((prev) => (prev ? { ...prev, timeLeft, currentPlayerId } : prev));
      if (timeLeft <= 5 && timeLeft > 0) sounds.tick();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('room-update', onRoomUpdate);
    socket.on('player-joined', onPlayerJoined);
    socket.on('player-left', onPlayerLeft);
    socket.on('game-started', onGameStarted);
    socket.on('game-state', onGameState);
    socket.on('letter-result', onLetterResult);
    socket.on('word-result', onWordResult);
    socket.on('round-end', onRoundEnd);
    socket.on('game-over', onGameOver);
    socket.on('new-message', onNewMessage);
    socket.on('tick', onTick);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('room-update', onRoomUpdate);
      socket.off('player-joined', onPlayerJoined);
      socket.off('player-left', onPlayerLeft);
      socket.off('game-started', onGameStarted);
      socket.off('game-state', onGameState);
      socket.off('letter-result', onLetterResult);
      socket.off('word-result', onWordResult);
      socket.off('round-end', onRoundEnd);
      socket.off('game-over', onGameOver);
      socket.off('new-message', onNewMessage);
      socket.off('tick', onTick);
    };
  }, [socket, pushToast]);

  const createRoom = useCallback((params, pseudo) => {
    return new Promise((resolve, reject) => {
      socket.emit('create-room', { ...params, pseudo }, (res) => {
        if (!res || res.error) return reject(new Error(res?.error || 'Erreur inconnue.'));
        const newSession = { token: res.token, code: res.code, pseudo };
        setSession(newSession);
        saveSession(newSession);
        setRoom(res.room);
        resolve(res);
      });
    });
  }, [socket]);

  const joinRoom = useCallback((code, pseudo) => {
    return new Promise((resolve, reject) => {
      socket.emit('join-room', { code, pseudo }, (res) => {
        if (!res || res.error) return reject(new Error(res?.error || 'Erreur inconnue.'));
        const newSession = { token: res.token, code: res.code, pseudo };
        setSession(newSession);
        saveSession(newSession);
        setRoom(res.room);
        resolve(res);
      });
    });
  }, [socket]);

  const tryRejoin = useCallback((code) => {
    const stored = loadSession();
    if (!stored || stored.code !== code || !stored.token) return Promise.resolve(false);
    return new Promise((resolve) => {
      socket.emit('join-room', { code, pseudo: stored.pseudo, token: stored.token }, (res) => {
        if (!res || res.error) {
          clearSession();
          setSession(null);
          resolve(false);
          return;
        }
        setSession({ token: res.token, code: res.code, pseudo: stored.pseudo });
        setRoom(res.room);
        resolve(true);
      });
    });
  }, [socket]);

  const startGame = useCallback(() => socket.emit('start-game'), [socket]);
  const guessLetter = useCallback((letter) => socket.emit('guess-letter', { letter }), [socket]);
  const guessWord = useCallback((word) => socket.emit('guess-word', { word }), [socket]);
  const sendChat = useCallback((text) => socket.emit('chat-message', { text }), [socket]);

  const leaveRoom = useCallback(() => {
    socket.emit('leave-room');
    clearSession();
    setSession(null);
    setRoom(null);
    setGameState(null);
    setRoundEnd(null);
    setGameOverData(null);
  }, [socket]);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);
  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const myId = session?.token || null;

  const value = useMemo(() => ({
    socket,
    connected,
    session,
    myId,
    room,
    gameState,
    roundEnd,
    gameOverData,
    toasts,
    darkMode,
    createRoom,
    joinRoom,
    tryRejoin,
    startGame,
    guessLetter,
    guessWord,
    sendChat,
    leaveRoom,
    toggleDarkMode,
    dismissToast,
    pushToast,
  }), [socket, connected, session, myId, room, gameState, roundEnd, gameOverData, toasts, darkMode,
    createRoom, joinRoom, tryRejoin, startGame, guessLetter, guessWord, sendChat, leaveRoom,
    toggleDarkMode, dismissToast, pushToast]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame doit etre utilise dans un GameProvider');
  return ctx;
}
