// socket.js
import { io } from "socket.io-client";

// Replace the URL with your server's URL (or use an environment variable)
const socket = io(process.env.REACT_APP_BACKEND_URL, {
  autoConnect: false, // Optionally, you can disable auto-connect and connect manually later
});

export default socket;
