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

  // Listen for a 'join' event, expecting a primitive user ID
  socket.on("join", (userId) => {
    // Convert the userId to a string (if it isn’t already)
    const key = userId.toString();

    // Save the userId on the socket for later use
    socket.userId = key;
    // (If you need userEmail, you'll have to supply it or query for it here)
    
    // Have the socket join a room identified by the userId
    socket.join(key);
    console.log(`Socket ${socket.id} joined room for user ${key}`);

    // Update the onlineUsers map using the userId as the key
    if (onlineUsers.has(key)) {
      // Retrieve the existing object
      const userData = onlineUsers.get(key);
      // Only add the socket.id if it's not already present
      if (!userData.socketIds.includes(socket.id)) {
        userData.socketIds.push(socket.id);
      }
      // (Objects are mutable, but we update the map anyway)
      onlineUsers.set(key, userData);
    } else {
      // Create a new object for this user (with userEmail as null, or remove if not needed)
      onlineUsers.set(key, {
        userId: key,
        // userEmail: null,  // You can include email if available
        socketIds: [socket.id]
      });
    }

    // Broadcast the updated online users list to all connected clients
    io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
  });

  socket.on("disconnect", () => {
    const key = socket.userId;
    if (key && onlineUsers.has(key)) {
      // Retrieve the current object for the user
      const userData = onlineUsers.get(key);
      // Remove this socket.id from the array
      userData.socketIds = userData.socketIds.filter((id) => id !== socket.id);
      if (userData.socketIds.length === 0) {
        // Remove the user entirely if no sockets remain
        onlineUsers.delete(key);
      } else {
        onlineUsers.set(key, userData);
      }
      // Broadcast the updated online users list
      io.emit("updateOnlineUsers", Array.from(onlineUsers.values()));
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
