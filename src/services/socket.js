import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL
    ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')
    : 'http://localhost:5000');

let socket = null;

export function getClientSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1500,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log('[Client WS] Connected to backend WebSocket. Socket ID:', socket.id);
      
      try {
        const savedUser = JSON.parse(localStorage.getItem('aura_client_user') || '{}');
        const userId = savedUser.id || savedUser.clerk_user_id || savedUser.clerkId;
        if (userId) {
          socket.emit('join:user', userId);
        }
      } catch {}
    });

    socket.on('disconnect', (reason) => {
      console.log('[Client WS] Disconnected:', reason);
    });
  }

  return socket;
}

export function joinCustomerRoom(userId) {
  const s = getClientSocket();
  if (s && userId) {
    s.emit('join:user', userId);
  }
}

export function joinOrderTracking(orderId) {
  const s = getClientSocket();
  if (s && orderId) {
    s.emit('join:order', orderId);
  }
}

export function subscribeClientSocket(event, callback) {
  const s = getClientSocket();
  s.on(event, callback);

  return () => {
    s.off(event, callback);
  };
}

export default {
  getClientSocket,
  joinCustomerRoom,
  joinOrderTracking,
  subscribeClientSocket,
};
