// app.js
const express = require('express');
const connectDB = require('./config/connectDB');
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
