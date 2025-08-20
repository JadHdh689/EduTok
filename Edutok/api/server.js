const express = require('express');
const connectDB = require('./config/connect-db');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const videoRoutes = require('./routes/videos'); // ✅ add videos routes
app.use('/api/videos', videoRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('🎓 Welcome to EduTok Backend');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

module.exports = app;
