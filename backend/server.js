const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const cloudinaryRoutes = require('./routes/cloudinaryRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n- Server running on http://localhost:${PORT}\n`);
});
