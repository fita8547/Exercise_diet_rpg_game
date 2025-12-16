const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  exp: {
    type: Number,
    default: 0,
    min: 0
  },
  stats: {
    hp: {
      type: Number,
      default: 100,
      min: 1
    },
    attack: {
      type: Number,
      default: 10,
      min: 1
    },
    defense: {
      type: Number,
      default: 5,
      min: 1
    },
    stamina: {
      type: Number,
      default: 50,
      min: 1
    }
  },
  currentRegion: {
    type: String,
    default: 'region_1'
  },
  lastActiveDate: {
    type: Date,
    default: Date.now
  },
  playStyle: {
    type: String,
    enum: ['warrior', 'archer', 'mage', 'paladin'],
    default: null
  },
  encounterGauge: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  lastAnalysisDate: {
    type: Date,
    default: null
  },
  lastStyleUpdate: {
    type: Date,
    default: null
  }
});

// 레벨업 필요 경험치 계산
characterSchema.methods.getRequiredExp = function() {
  return this.level * 100 + (this.level - 1) * 50;
};

// 레벨업 체크 및 처리
characterSchema.methods.checkLevelUp = function() {
  const requiredExp = this.getRequiredExp();
  if (this.exp >= requiredExp) {
    this.level += 1;
    this.exp -= requiredExp;
    
    // 레벨업 시 기본 능력치 증가
    this.stats.hp += 20;
    this.stats.attack += 3;
    this.stats.defense += 2;
    this.stats.stamina += 10;
    
    return true;
  }
  return false;
};

module.exports = mongoose.model('Character', characterSchema);