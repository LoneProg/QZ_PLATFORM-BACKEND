const mongoose = require('mongoose');

const waitlistSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  }
});

const Waitlist = mongoose.model('Waitlist', waitlistSchema);
module.exports = Waitlist;
