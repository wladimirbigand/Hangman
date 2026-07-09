'use strict';

const crypto = require('crypto');
const { GameEngine } = require('./GameEngine');

const AVATAR_COLORS = [
  '#F94144', '#F3722C', '#F8961E', '#F9C74F', '#90BE6D',
  '#43AA8B', '#4D908E', '#577590', '#277DA1', '#9B5DE5',
  '#F15BB5', '#00BBF9', '#00F5D4', '#FB5607', '#3A86FF',
];

const RECONNECT_GRACE_MS = 30000;

function colorForIndex(index) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

/**
 * Room porte la logique "salle" : joueurs, hote, chat, parametres,
 * cycle de vie lobby -> partie -> fin. Le gameplay lettre-a-lettre est
 * delegue a une instance de GameEngine creee au lancement de la partie.
 *
 * Les joueurs sont identifies par un `token` stable (pas le socket.id, qui
 * change a chaque reconnexion) afin de pouvoir les reconnecter proprement
 * pendant les 30s de grace apres une deconnexion.
 */
class Room {
  constructor(code, settings) {
    this.code = code;
    this.settings = settings;
    this.players = new Map(); // token -> player
    this.hostToken = null;
    this.status = 'lobby'; // lobby | playing | gameover
    this.chat = [];
    this.engine = null;
    this.disconnectTimers = new Map();
    this.createdAt = Date.now();
    this.playerCounter = 0;
  }

  pseudoTaken(pseudo) {
    const lower = pseudo.toLowerCase();
    return [...this.players.values()].some((p) => p.connected && p.pseudo.toLowerCase() === lower);
  }

  isFull() {
    return this.getConnectedPlayerIds().length >= this.settings.maxPlayers;
  }

  addPlayer(socketId, pseudo) {
    const token = crypto.randomBytes(16).toString('hex');
    const player = {
      token,
      socketId,
      pseudo,
      color: colorForIndex(this.playerCounter),
      score: 0,
      connected: true,
      joinedAt: Date.now(),
    };
    this.playerCounter += 1;
    this.players.set(token, player);
    if (!this.hostToken) this.hostToken = token;
    return player;
  }

  getByToken(token) {
    return this.players.get(token);
  }

  getBySocketId(socketId) {
    return [...this.players.values()].find((p) => p.socketId === socketId);
  }

  removePlayerPermanently(token) {
    this.players.delete(token);
    this.clearDisconnectTimer(token);
    if (this.engine) this.engine.removePlayerFromTurnOrder(token);
    if (this.hostToken === token) this.reassignHost();
  }

  markDisconnected(token) {
    const player = this.players.get(token);
    if (!player) return;
    player.connected = false;
    player.socketId = null;
  }

  reconnectPlayer(token, newSocketId) {
    const player = this.players.get(token);
    if (!player) return null;
    player.socketId = newSocketId;
    player.connected = true;
    this.clearDisconnectTimer(token);
    return player;
  }

  findPlayerByPseudo(pseudo) {
    const lower = pseudo.toLowerCase();
    return [...this.players.values()].find((p) => p.pseudo.toLowerCase() === lower);
  }

  clearDisconnectTimer(token) {
    const t = this.disconnectTimers.get(token);
    if (t) {
      clearTimeout(t);
      this.disconnectTimers.delete(token);
    }
  }

  reassignHost() {
    const next = [...this.players.values()].find((p) => p.connected);
    this.hostToken = next ? next.token : null;
  }

  getConnectedPlayerIds() {
    return [...this.players.values()].filter((p) => p.connected).map((p) => p.token);
  }

  canStart() {
    return this.status === 'lobby' && this.getConnectedPlayerIds().length >= 2;
  }

  startGame() {
    this.status = 'playing';
    this.engine = new GameEngine(this);
    return this.engine.startNextRound();
  }

  toPublicPlayers() {
    return [...this.players.values()]
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map((p) => ({
        id: p.token,
        pseudo: p.pseudo,
        color: p.color,
        score: p.score,
        connected: p.connected,
        isHost: p.token === this.hostToken,
      }));
  }

  toScoreboard() {
    return this.toPublicPlayers()
      .map(({ id, pseudo, color, score, connected }) => ({ id, pseudo, color, score, connected }))
      .sort((a, b) => b.score - a.score);
  }

  toSettingsView() {
    return { ...this.settings };
  }

  addChatMessage(token, text) {
    const player = this.players.get(token);
    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      pseudo: player ? player.pseudo : 'Inconnu',
      color: player ? player.color : '#999999',
      text,
      at: Date.now(),
    };
    this.chat.push(message);
    if (this.chat.length > 100) this.chat.shift();
    return message;
  }

  isEmpty() {
    return this.players.size === 0;
  }
}

module.exports = { Room, RECONNECT_GRACE_MS };
