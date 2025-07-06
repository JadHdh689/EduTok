// Tracks followers and the creators they follow

const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  follower_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creator_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate subscriptions
subscriptionSchema.index({ follower_id: 1, creator_id: 1 }, { unique: true });

module.exports = mongoose.model('Subscription', subscriptionSchema);
