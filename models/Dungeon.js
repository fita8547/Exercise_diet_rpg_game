const mongoose = require('mongoose');

const dungeonSchema = new mongoose.Schema({
  dungeonId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  regionId: {
    type: String,
    required: true
  },
  requiredLevel: {
    type: Number,
    required: true,
    min: 1
  },
  monsterStats: {
    hp: {
      type: Number,
      required: true,
      min: 1
    },
    attack: {
      type: Number,
      required: true,
      min: 1
    },
    defense: {
      type: Number,
      required: true,
      min: 0
    }
  },
  expReward: {
    type: Number,
    required: true,
    min: 1
  }
});

module.exports = mongoose.model('Dungeon', dungeonSchema);