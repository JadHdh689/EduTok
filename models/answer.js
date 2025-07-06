// Contains answer choices with a flag for the correct answer

const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  is_correct: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Answer', answerSchema);
