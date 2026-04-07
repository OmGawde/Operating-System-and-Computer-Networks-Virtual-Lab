const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  nickname: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  totalPossible: {
    type: Number,
    required: true,
    default: 0
  },
  accuracy: {
    type: Number,
    default: 0
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
