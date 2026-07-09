import { io } from 'socket.io-client';

let socketInstance = null;

/**
 * Socket.io singleton partage par toute l'app. En dev, Vite proxie
 * /socket.io vers le serveur (voir vite.config.js) ; en prod le client
 * est servi par le meme serveur Express donc l'origine est identique.
 */
export function getSocket() {
  if (!socketInstance) {
    socketInstance = io({
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });
  }
  return socketInstance;
}
