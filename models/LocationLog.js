const mongoose = require('mongoose');

const locationLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  regionId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 지리적 인덱스
locationLogSchema.index({ latitude: 1, longitude: 1 });
locationLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('LocationLog', locationLogSchema);