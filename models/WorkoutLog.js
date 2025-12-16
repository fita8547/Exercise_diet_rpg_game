const mongoose = require('mongoose');

const workoutLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['pushup', 'squat', 'plank', 'walk']
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  date: {
    type: String, // YYYY-MM-DD 형식
    required: true
  },
  statGained: {
    hp: { type: Number, default: 0 },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    stamina: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 복합 인덱스: 같은 날짜에 같은 운동 타입은 하나만
workoutLogSchema.index({ userId: 1, type: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('WorkoutLog', workoutLogSchema);