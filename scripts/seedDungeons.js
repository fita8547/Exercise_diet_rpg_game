const mongoose = require('mongoose');
const Dungeon = require('../models/Dungeon');
require('dotenv').config();

const dungeons = [
  {
    dungeonId: 'goblin_cave_1',
    name: '고블린 동굴',
    regionId: 'region_9_9', // 서울 근처
    requiredLevel: 1,
    monsterStats: { hp: 50, attack: 8, defense: 2 },
    expReward: 25
  },
  {
    dungeonId: 'orc_fortress_1',
    name: '오크 요새',
    regionId: 'region_9_9',
    requiredLevel: 3,
    monsterStats: { hp: 120, attack: 15, defense: 5 },
    expReward: 75
  },
  {
    dungeonId: 'dragon_lair_1',
    name: '드래곤 둥지',
    regionId: 'region_9_9',
    requiredLevel: 10,
    monsterStats: { hp: 500, attack: 50, defense: 20 },
    expReward: 300
  },
  {
    dungeonId: 'slime_forest_1',
    name: '슬라임 숲',
    regionId: 'region_8_9',
    requiredLevel: 1,
    monsterStats: { hp: 30, attack: 5, defense: 1 },
    expReward: 15
  },
  {
    dungeonId: 'skeleton_tomb_1',
    name: '해골 무덤',
    regionId: 'region_10_9',
    requiredLevel: 5,
    monsterStats: { hp: 200, attack: 25, defense: 8 },
    expReward: 150
  }
];

async function seedDungeons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rpg-workout');
    
    // 기존 던전 데이터 삭제
    await Dungeon.deleteMany({});
    
    // 새 던전 데이터 삽입
    await Dungeon.insertMany(dungeons);
    
    console.log('던전 데이터 시딩 완료!');
    console.log(`${dungeons.length}개의 던전이 생성되었습니다.`);
    
    process.exit(0);
  } catch (error) {
    console.error('시딩 중 오류 발생:', error);
    process.exit(1);
  }
}

seedDungeons();