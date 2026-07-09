'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { getSocket } from './socket-client';
import { sounds } from './sounds';
import type {
  CreateRoomParams,
  GameOverPayload,
  GameState,
  RoomSnapshot,
  RoundEndPayload,
  Toast,
  ToastType,
} from './types';

interface Session {
  token: string;
  code: string;
  pseudo: string;
}

const SESSION_KEY = 'pendu_session';

function loadSession(): Session | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function saveSession(session: Session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

interface CreateOrJoinResult {
  code: string;
  token: string;
  room: RoomSnapshot;
}

interface GameContextValue {
  ready: boolean;
  connected: boolean;
  reconnecting: boolean;
  session: Session | null;
  myId: string | null;
  room: RoomSnapshot | null;
  gameState: GameState | null;
  roundEnd: RoundEndPayload | null;
  gameOverData: GameOverPayload | null;
  toasts: Toast[];
  darkMode: boolean;
  createRoom: (params: Omit<CreateRoomParams, 'pseudo'>, pseudo: string) => Promise<CreateOrJoinResult>;
  joinRoom: (code: string, pseudo: string) => Promise<CreateOrJoinResult>;
  tryRejoin: (code: string) => Promise<boolean>;
  startGame: () => void;
  guessLetter: (letter: string) => void;
  guessWord: (word: string) => void;
  sendChat: (text: string) => void;
  leaveRoom: () => void;
  toggleDarkMode: () => void;
  dismissToast: (id: number) => void;
  pushToast: (text: string, type?: ToastType) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

let toastSeq = 0;

export function GameProvider({ children }: { children: React.ReactNode }) {
  // Le socket n'est cree que cote client (voir socket-client.ts), jamais pendant le
  // rendu serveur : on part d'un etat null identique sur SSR et premier rendu client
  // pour eviter tout hydration mismatch, puis on l'instancie dans un effet.
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [room, setRoom] = useState<RoomSnapshot | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [roundEnd, setRoundEnd] = useState<RoundEndPayload | null>(null);
  const [gameOverData, setGameOverData] = useState<GameOverPayload | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  // sessionStorage/localStorage/socket ne sont accessibles qu'apres montage (SSR-safe).
  useEffect(() => {
    setSocket(getSocket());
    setSession(loadSession());
    setDarkMode(localStorage.getItem('pendu_dark') === 'true');
  }, []);

  const pushToast = useCallback((text: string, type: ToastType = 'info') => {
    const id = (toastSeq += 1);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pendu_dark', String(darkMode));
  }, [darkMode]);

  const tryRejoin = useCallback((code: string): Promise<boolean> => {
    const stored = loadSession();
    if (!socket || !stored || stored.code !== code || !stored.token) return Promise.resolve(false);
    return new Promise((resolve) => {
      socket.emit(
        'join-room',
        { code, pseudo: stored.pseudo, token: stored.token },
        (res: { error?: string; token: string; code: string; room: RoomSnapshot }) => {
          if (!res || res.error) {
            clearSession();
            setSession(null);
            resolve(false);
            return;
          }
          setSession({ token: res.token, code: res.code, pseudo: stored.pseudo });
          setRoom(res.room);
          resolve(true);
        },
      );
    });
  }, [socket]);

  useEffect(() => {
    if (!socket) return undefined;

    setConnected(socket.connected);

    const onConnect = () => {
      setConnected(true);
      setReconnecting(false);
      const stored = loadSession();
      if (stored) {
        tryRejoin(stored.code).then((ok) => {
          if (ok) pushToast('Reconnecte a la salle.', 'success');
        });
      }
    };
    const onDisconnect = () => setConnected(false);
    const onReconnectAttempt = () => setReconnecting(true);

    const onRoomUpdate = (payload: RoomSnapshot) => setRoom(payload);

    const onPlayerJoined = ({ pseudo, reconnected }: { pseudo: string; reconnected: boolean }) => {
      pushToast(reconnected ? `${pseudo} est de retour` : `${pseudo} a rejoint la partie`, 'success');
    };
    const onPlayerLeft = ({ pseudo, temporary }: { pseudo: string; temporary: boolean }) => {
      pushToast(temporary ? `${pseudo} s'est deconnecte (30s pour revenir)` : `${pseudo} a quitte la partie`, 'warning');
    };

    const onGameStarted = () => {
      setRoundEnd(null);
      setGameOverData(null);
      pushToast('La partie commence !', 'success');
    };

    const onGameState = (state: GameState) => setGameState(state);

    const onLetterResult = (payload: { error?: string; correct?: boolean }) => {
      if (payload.error) {
        pushToast("Action impossible : ce n'est pas ton tour ou cette lettre a deja ete jouee.", 'warning');
        return;
      }
      if (payload.correct) sounds.correct();
      else sounds.wrong();
    };
    const onWordResult = (payload: { error?: string; correct?: boolean }) => {
      if (payload.error) {
        pushToast("Action impossible : ce n'est pas ton tour.", 'warning');
        return;
      }
      if (payload.correct) sounds.correct();
      else sounds.wrong();
    };

    const onRoundEnd = (payload: RoundEndPayload) => {
      setRoundEnd(payload);
      if (payload.won) sounds.victory();
      else sounds.defeat();
    };

    const onGameOver = (payload: GameOverPayload) => {
      setGameOverData(payload);
      setRoundEnd(null);
    };

    const onNewMessage = (message: RoomSnapshot['chat'][number]) => {
      setRoom((prev) => (prev ? { ...prev, chat: [...prev.chat, message] } : prev));
    };

    const onTick = ({ timeLeft, currentPlayerId }: { timeLeft: number; currentPlayerId: string | null }) => {
      setGameState((prev) => (prev ? { ...prev, timeLeft, currentPlayerId } : prev));
      if (timeLeft <= 5 && timeLeft > 0) sounds.tick();
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('reconnect_attempt', onReconnectAttempt);
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
      socket.off('reconnect_attempt', onReconnectAttempt);
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
  }, [socket, pushToast, tryRejoin]);

  const createRoom = useCallback((params: Omit<CreateRoomParams, 'pseudo'>, pseudo: string): Promise<CreateOrJoinResult> => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Connexion au serveur en cours, reessaie dans un instant.'));
      socket.emit('create-room', { ...params, pseudo }, (res: { error?: string; token: string; code: string; room: RoomSnapshot }) => {
        if (!res || res.error) return reject(new Error(res?.error || 'Erreur inconnue.'));
        const newSession: Session = { token: res.token, code: res.code, pseudo };
        setSession(newSession);
        saveSession(newSession);
        setRoom(res.room);
        resolve(res);
      });
    });
  }, [socket]);

  const joinRoom = useCallback((code: string, pseudo: string): Promise<CreateOrJoinResult> => {
    return new Promise((resolve, reject) => {
      if (!socket) return reject(new Error('Connexion au serveur en cours, reessaie dans un instant.'));
      socket.emit('join-room', { code, pseudo }, (res: { error?: string; token: string; code: string; room: RoomSnapshot }) => {
        if (!res || res.error) return reject(new Error(res?.error || 'Erreur inconnue.'));
        const newSession: Session = { token: res.token, code: res.code, pseudo };
        setSession(newSession);
        saveSession(newSession);
        setRoom(res.room);
        resolve(res);
      });
    });
  }, [socket]);

  const startGame = useCallback(() => socket?.emit('start-game'), [socket]);
  const guessLetter = useCallback((letter: string) => socket?.emit('guess-letter', { letter }), [socket]);
  const guessWord = useCallback((word: string) => socket?.emit('guess-word', { word }), [socket]);
  const sendChat = useCallback((text: string) => socket?.emit('chat-message', { text }), [socket]);

  const leaveRoom = useCallback(() => {
    socket?.emit('leave-room');
    clearSession();
    setSession(null);
    setRoom(null);
    setGameState(null);
    setRoundEnd(null);
    setGameOverData(null);
  }, [socket]);

  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);
  const dismissToast = useCallback((id: number) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);

  const myId = session?.token || null;
  const ready = socket !== null;

  const value = useMemo<GameContextValue>(() => ({
    ready,
    connected,
    reconnecting,
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
  }), [ready, connected, reconnecting, session, myId, room, gameState, roundEnd, gameOverData, toasts, darkMode,
    createRoom, joinRoom, tryRejoin, startGame, guessLetter, guessWord, sendChat, leaveRoom,
    toggleDarkMode, dismissToast, pushToast]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame doit etre utilise dans un GameProvider');
  return ctx;
}
