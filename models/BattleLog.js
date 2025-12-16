const mongoose = require('mongoose');

const battleLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dungeonId: {
    type: String,
    required: true
  },
  result: {
    type: String,
    required: true,
    enum: ['win', 'lose']
  },
  damageDealt: {
    type: Number,
    required: true,
    min: 0
  },
  expGained: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

battleLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('BattleLog', battleLogSchema);