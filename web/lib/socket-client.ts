import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socketInstance: Socket | null = null;

/**
 * Singleton socket.io-client connecte au serveur temps reel externe
 * (Railway/Fly.io/Render...), separe du frontend Next.js/Vercel.
 *
 * On garde les deux transports (polling + websocket, upgrade automatique)
 * plutot que "websocket only" : certains reseaux scolaires bloquent les
 * upgrades WebSocket derriere un proxy, et le long-polling sert de repli fiable.
 */
export function getSocket(): Socket {
  if (typeof window === 'undefined') {
    throw new Error('getSocket() ne doit jamais etre appele pendant le rendu serveur (SSR).');
  }
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 500,
      reconnectionDelayMax: 4000,
    });
  }
  return socketInstance;
}
