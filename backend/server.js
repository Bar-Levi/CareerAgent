// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');
const bodyParser = require("body-parser");
const aiRoutes = require('./routes/aiRoutes');
const botConversationRoutes = require("./routes/botConversationRoutes");
const jobListingRoutes = require("./routes/jobListingRoutes");
const applicantsRoutes = require('./routes/applicantRoutes');
const conversationRoutes = require("./routes/conversationRoutes");
require('./tasks/cleanupTokens');

// Load environment variables and connect to DB
dotenv.config();
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/bot-conversations", botConversationRoutes);
app.use("/api/joblistings", jobListingRoutes);
app.use("/api/applicants", applicantsRoutes);
app.use("/api/conversations", conversationRoutes);

// Create HTTP server and integrate Socket.IO
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust CORS settings as needed
    methods: ["GET", "POST"]
  }
});

// In-memory Map to store online users
// Key: user ID, Value: array of socket IDs (to support multiple connections per user)
const onlineUsers = new Map();

// Store the io instance in app locals so controllers can access it if needed
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Listen for a 'join' event to add the socket to a room and update onlineUsers Map
  socket.on("join", (userId) => {
    // Save the user ID on the socket for later use
    socket.userId = userId;

    // Update the onlineUsers map
    if (onlineUsers.has(userId)) {
      onlineUsers.get(userId).push(socket.id);
    } else {
      onlineUsers.set(userId, [socket.id]);
    }

    console.log(`Socket ${socket.id} joined room for user ${userId}`);

    // Broadcast the updated online users list to all connected clients
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });

  // On disconnect, remove the socket from the map and broadcast updated list if needed
  socket.on("disconnect", () => {
    const userId = socket.userId;
    if (userId) {
      const sockets = onlineUsers.get(userId) || [];
      const updatedSockets = sockets.filter(id => id !== socket.id);
      if (updatedSockets.length > 0) {
        onlineUsers.set(userId, updatedSockets);
      } else {
        onlineUsers.delete(userId);
      }
      console.log(`Socket ${socket.id} for user ${userId} disconnected.`);
      // Emit updated online users list
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    }
    console.log("Client disconnected:", socket.id);
  });
});

// Define the port and start listening only if run directly
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n- Server running on http://localhost:${PORT}\n`);
  });
}

module.exports = { app, server };
