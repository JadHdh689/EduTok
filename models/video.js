// Stores video details, views, likes, and optional links to course/chapter

const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String
  },
  url: {
    type: String,
    required: true,
    maxlength: 255
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  views_count: {
    type: Number,
    default: 0
  },
  duration_seconds: {
    type: Number,
    max: 90,
    required: true
  },
  category: {
    type: String,
    maxlength: 100
  },
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    default: null
  },
  chapter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    default: null
  },
  likes_count: {
    type: Number,
    default: 0
  },
  comments_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

videoSchema.index({ title: 'text', category: 1 });

module.exports = mongoose.model('Video', videoSchema);