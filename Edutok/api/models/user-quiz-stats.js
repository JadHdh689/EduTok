// Precomputed stats: attempts and average score per course per user

const mongoose = require('mongoose');

const userQuizStatsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  total_attempts: {
    type: Number,
    default: 0
  },
  avg_score: {
    type: mongoose.Schema.Types.Decimal128,
    default: 0.0
  }
}, {
  timestamps: true
});

// Enforce one record per user-course pair
userQuizStatsSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

module.exports = mongoose.model('UserQuizStats', userQuizStatsSchema);