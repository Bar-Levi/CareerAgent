const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');
const bodyParser = require("body-parser");
const aiRoutes = require('./routes/aiRoutes');
const conversationRoutes = require("./routes/conversationRoutes");
const jobListingRoutes = require("./routes/jobListingRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);
app.use('/api/ai', aiRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/job-listing", jobListingRoutes);

module.exports = app;