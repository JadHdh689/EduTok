// Describes a course and its relationship to a creator

const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String
  },
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

courseSchema.index({ title: 'text' });
courseSchema.index({ creator_id: 1 });

module.exports = mongoose.model('Course', courseSchema);