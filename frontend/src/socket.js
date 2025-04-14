import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_BACKEND_URL, {
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  withCredentials: true,
  autoConnect: false,
});

socket.on('connect', () => {
  console.log('Connected to Socket.IO server');
});

socket.on('connect_error', (error) => {
  console.error('Socket.IO connection error:', error.message);
});

socket.on('disconnect', () => {
  console.log('Disconnected from Socket.IO server');
});

export default socket;