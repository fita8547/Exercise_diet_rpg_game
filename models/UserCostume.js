const mongoose = require('mongoose');

const userCostumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  costumeId: {
    type: String,
    required: true
  },
  purchasedAt: {
    type: Date,
    default: Date.now
  },
  isEquipped: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 사용자당 같은 코스튬은 하나만 소유 가능
userCostumeSchema.index({ userId: 1, costumeId: 1 }, { unique: true });

module.exports = mongoose.model('UserCostume', userCostumeSchema);