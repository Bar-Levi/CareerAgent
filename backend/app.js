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

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/bot-conversations", botConversationRoutes);
app.use("/api/joblistings", jobListingRoutes);
app.use("/api/applicants", applicantsRoutes);
app.use("/api/conversations", conversationRoutes);


module.exports = app;