const mongoose = require('mongoose');

const costumeSchema = new mongoose.Schema({
  costumeId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['head', 'body', 'weapon', 'accessory']
  },
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'rare', 'epic', 'legendary']
  },
  price: {
    type: Number,
    required: true
  },
  statBonus: {
    hp: { type: Number, default: 0 },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    stamina: { type: Number, default: 0 }
  },
  icon: {
    type: String,
    required: true
  },
  unlockLevel: {
    type: Number,
    default: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Costume', costumeSchema);