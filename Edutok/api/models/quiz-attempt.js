// Tracks a user’s quiz submissions and scores

const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  }
}, {
  timestamps: true
});

// Enforce unique attempt per user per quiz
quizAttemptSchema.index({ user_id: 1, quiz_id: 1 }, { unique: true });
quizAttemptSchema.index({ user_id: 1 });
quizAttemptSchema.index({ quiz_id: 1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);