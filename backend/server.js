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
const socketIo = require("socket.io");

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust CORS settings as needed
    methods: ["GET", "POST"]
  }
});

// Store the io instance in app locals so that you can access it in your controllers
app.set("io", io);

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Example: listen for a 'join' event to add socket to a room
  socket.on("join", (room) => {
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Define the port and start listening
const PORT = process.env.PORT || 5000;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n- Server running on http://localhost:${PORT}\n`);
  });
}


module.exports = app;
