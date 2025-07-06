// Logs which videos a user has watched

const mongoose = require('mongoose');

const watchedVideoSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate watches
watchedVideoSchema.index({ user_id: 1, video_id: 1 }, { unique: true });

module.exports = mongoose.model('WatchedVideo', watchedVideoSchema);
