// Defines the structure and roles of users (learners, creators, admins)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['learner', 'creator'],
    required: true
  },
  is_admin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

userSchema.index({ name: 'text' });
userSchema.index({ email: 1 });
userSchema.index({ is_admin: 1 });

module.exports = mongoose.model('User', userSchema);