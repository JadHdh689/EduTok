const express = require('express');
const router = express.Router();
//const { verifyToken } = require('../middleware/authMiddleware');
const Video = require('../models/Video');

// ✅ Get saved videos
router.get('/saved', async (req, res) => {
  try {
    const videos = await Video.find({ _id: { $in: req.user.savedVideos } });
    res.json({ videos });
  } catch {
    res.status(500).json({ error: 'Failed to fetch saved videos' });
  }
});

// ✅ Get my videos (if creator)
router.get('/mine', async (req, res) => {
  try {
    const videos = await Video.find({ creator: req.user.id });
    res.json({ videos });
  } catch {
    res.status(500).json({ error: 'Failed to fetch my videos' });
  }
});

// ✅ Get favorite videos
router.get('/favorites', async (req, res) => {
  try {
    const videos = await Video.find({ _id: { $in: req.user.favoriteVideos } });
    res.json({ videos });
  } catch {
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

module.exports = router;
