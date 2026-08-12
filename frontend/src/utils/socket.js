import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = () => {
  if (socket) return socket;
  
  const token = localStorage.getItem('staynest_token');
  
  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    withCredentials: true,
    autoConnect: true,
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) return initializeSocket();
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
