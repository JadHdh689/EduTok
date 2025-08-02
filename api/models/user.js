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
    default: 'learner'
  },

  is_admin: {
    type: Boolean,
    default: false
  },

  is_verified: {
    type: Boolean,
    default: false
  },

  preferences: [String],

  otp_code: String,

  otp_expires_at: Date

}, {
  timestamps: true
});

// Indexes
userSchema.index({ name: 'text' });
userSchema.index({ email: 1 });
userSchema.index({ is_admin: 1 });

module.exports = mongoose.model('User', userSchema);
