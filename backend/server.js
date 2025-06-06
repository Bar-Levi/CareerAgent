const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');
const personalDetailsRoutes = require('./routes/jobSeekerPersonalDetailsRoutes');
const recruiterPersonalDetailsRoutes = require('./routes/recruiterPersonalDetailsRoutes');
const bodyParser = require("body-parser");
const aiRoutes = require('./routes/aiRoutes');
const botConversationRoutes = require("./routes/botConversationRoutes");
const jobListingRoutes = require("./routes/jobListingRoutes");
const applicantsRoutes = require('./routes/applicantRoutes');
const conversationRoutes = require("./routes/conversationRoutes");
const mailNotificationRoutes = require("./routes/mailNotificationsRoutes");
const interviewRoutes = require('./routes/interviewRoutes');
const saveJobListingRoutes = require('./routes/saveJobListingRoutes');
const contactRoutes = require('./routes/contactRoutes');

require('./tasks/cleanupTokens');

// Load environment variables and connect to DB
dotenv.config();
connectDB();

// Initialize Express app
const app = express();
app.set('trust proxy', 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.BACKEND_URL,
  'https://careeragent-icnn.onrender.com',
  'https://careeragent-ai.online'
];

// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());

// Routes
// Create health route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running' });
});
app.use('/api/auth', authRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/personal', personalDetailsRoutes);
app.use('/api/recruiter-personal', recruiterPersonalDetailsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);
app.use("/api/bot-conversations", botConversationRoutes);
app.use("/api/joblistings", jobListingRoutes);
app.use("/api/applicants", applicantsRoutes);
app.use("/api/conversations", conversationRoutes);
app.use('/api/mailNotifications', mailNotificationRoutes);
app.use("/api/interviews", interviewRoutes);
app.use('/api/jobseeker', saveJobListingRoutes);

// Create HTTP server and integrate Socket.IO
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");
const { markMessagesAsReadInternal } = require('./controllers/conversationController');

// Update Socket.IO configuration with more specific settings
const io = socketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
  },
  transports: ['websocket', 'polling'], // Add explicit transports
  path: '/socket.io/', // Explicit path
  allowEIO3: true, // Allow Engine.IO version 3
  pingTimeout: 60000, // Increase ping timeout
  pingInterval: 25000, // Increase ping interval
});

const onlineUsers = new Map();

// Store the io instance in app locals so controllers can access it if needed
app.set("io", io);

// Add a middleware to log connection attempts
io.use((socket, next) => {
  console.log('Connection attempt from origin:', socket.handshake.headers.origin);
  next();
});

// Update the connection handler with better error handling
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id, "from:", socket.handshake.headers.origin);

  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });

  // Listen for a 'join' event, expecting a primitive user ID
  socket.on("join", (userId) => {
    const key = userId.toString();

    // Save the userId on the socket for later use
    socket.userId = key;
    
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

  // Listen for "messagesRead" events from the client.
  socket.on("messagesRead", async ({ conversationId, readerId }) => {
    console.log(`\nReceived messagesRead for conversation ${conversationId} from reader ${readerId}`);
    try {
      const { participantToUpdateId } = await markMessagesAsReadInternal(conversationId, readerId);
      // Notify the other participant that messages have been read.
      io.to(participantToUpdateId.toString()).emit("updateReadMessages", conversationId);
      console.log(`Emitted updateReadMessages to room ${participantToUpdateId}`);
    } catch (error) {
      console.error("Error handling messagesRead event:", error);
    }
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
