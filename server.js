// Starts the Express server and listens on the specified port
// Initializes the Express app, middleware, routes, and triggers MongoDB connection

const express = require('express');
const connectDB = require('./api/config/connect-db');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('🎓 Welcome to EduTok Backend');
});

module.exports = app;

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
