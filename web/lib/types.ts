export type Category = 'melange' | 'animaux' | 'pays' | 'metiers' | 'nourriture' | 'films' | 'jeuxvideo';
export type Difficulty = 'facile' | 'normal' | 'difficile';
export type RoomStatus = 'lobby' | 'playing' | 'roundend' | 'gameover';

export interface RoomSettings {
  category: Category;
  difficulty: Difficulty;
  rounds: number;
  timePerTurn: number | null;
  maxPlayers: number;
}

export interface Player {
  id: string;
  pseudo: string;
  color: string;
  score: number;
  connected: boolean;
  isHost?: boolean;
}

export interface ScoreEntry {
  id: string;
  pseudo: string;
  color: string;
  score: number;
  connected: boolean;
}

export interface ChatMessage {
  id: string;
  pseudo: string;
  color: string;
  text: string;
  at: number;
}

export interface RoomSnapshot {
  code: string;
  settings: RoomSettings;
  players: Player[];
  hostId: string | null;
  status: RoomStatus;
  chat: ChatMessage[];
}

export interface GameState {
  maskedWord: string;
  wordLength: number;
  errors: number;
  maxErrors: number;
  wrongLetters: string[];
  guessedLetters: string[];
  currentPlayerId: string | null;
  round: number;
  totalRounds: number;
  timeLeft: number | null;
  timePerTurn: number | null;
  roundActive: boolean;
  scores: ScoreEntry[];
}

export interface RoundEndPayload {
  word: string;
  won: boolean;
  winnerId: string | null;
  round: number;
  totalRounds: number;
  roundScores: { id: string; points: number }[];
  scores: ScoreEntry[];
  isGameOver: boolean;
  /** Horodatage serveur (ms) du demarrage automatique de la manche suivante. Absent si la partie est finie. */
  nextRoundAt?: number;
}

export interface GameOverPayload {
  classement: ScoreEntry[];
}

export interface CreateRoomAck {
  code: string;
  token: string;
  room: RoomSnapshot;
  error?: string;
}

export interface JoinRoomAck {
  code: string;
  token: string;
  room: RoomSnapshot;
  error?: string;
}

export interface CreateRoomParams {
  pseudo: string;
  category: Category;
  difficulty: Difficulty;
  rounds: number;
  timePerTurn: number | null;
  maxPlayers: number;
}

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: number;
  text: string;
  type: ToastType;
}
