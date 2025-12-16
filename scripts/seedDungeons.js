const mongoose = require('mongoose');
const Dungeon = require('../models/Dungeon');
require('dotenv').config();

const dungeons = [
  // 초급 던전 (레벨 1-10)
  {
    dungeonId: 'goblin_cave_1',
    name: '고블린 동굴',
    regionId: 'region_9_9',
    requiredLevel: 1,
    monsterStats: { hp: 50, attack: 8, defense: 2 },
    expReward: 25,
    difficulty: 'easy',
    bossType: 'goblin'
  },
  {
    dungeonId: 'slime_forest_1',
    name: '슬라임 숲',
    regionId: 'region_8_9',
    requiredLevel: 1,
    monsterStats: { hp: 30, attack: 5, defense: 1 },
    expReward: 15,
    difficulty: 'easy',
    bossType: 'spider'
  },
  {
    dungeonId: 'orc_fortress_1',
    name: '오크 요새',
    regionId: 'region_9_9',
    requiredLevel: 3,
    monsterStats: { hp: 120, attack: 15, defense: 5 },
    expReward: 75,
    difficulty: 'normal',
    bossType: 'orc'
  },
  {
    dungeonId: 'skeleton_tomb_1',
    name: '해골 무덤',
    regionId: 'region_10_9',
    requiredLevel: 5,
    monsterStats: { hp: 200, attack: 25, defense: 8 },
    expReward: 150,
    difficulty: 'normal',
    bossType: 'skeleton'
  },
  {
    dungeonId: 'wolf_den_1',
    name: '늑대 굴',
    regionId: 'region_8_8',
    requiredLevel: 4,
    monsterStats: { hp: 150, attack: 20, defense: 3 },
    expReward: 100,
    difficulty: 'normal',
    bossType: 'wolf'
  },
  {
    dungeonId: 'troll_bridge_1',
    name: '트롤 다리',
    regionId: 'region_10_10',
    requiredLevel: 8,
    monsterStats: { hp: 300, attack: 35, defense: 12 },
    expReward: 200,
    difficulty: 'hard',
    bossType: 'troll'
  },

  // 중급 던전 (레벨 10-25)
  {
    dungeonId: 'minotaur_labyrinth_1',
    name: '미노타우로스 미궁',
    regionId: 'region_9_8',
    requiredLevel: 12,
    monsterStats: { hp: 400, attack: 40, defense: 15 },
    expReward: 350,
    difficulty: 'hard',
    bossType: 'minotaur'
  },
  {
    dungeonId: 'assassin_hideout_1',
    name: '암살자 은신처',
    regionId: 'region_8_10',
    requiredLevel: 15,
    monsterStats: { hp: 300, attack: 55, defense: 8 },
    expReward: 400,
    difficulty: 'hard',
    bossType: 'assassin'
  },
  {
    dungeonId: 'wizard_tower_1',
    name: '마법사의 탑',
    regionId: 'region_10_8',
    requiredLevel: 18,
    monsterStats: { hp: 350, attack: 60, defense: 10 },
    expReward: 500,
    difficulty: 'very_hard',
    bossType: 'wizard'
  },
  {
    dungeonId: 'giant_mountain_1',
    name: '거인의 산',
    regionId: 'region_7_9',
    requiredLevel: 20,
    monsterStats: { hp: 600, attack: 45, defense: 20 },
    expReward: 600,
    difficulty: 'very_hard',
    bossType: 'giant'
  },

  // 고급 던전 (레벨 25-50) - 중급 보스
  {
    dungeonId: 'young_dragon_lair_1',
    name: '어린 드래곤의 둥지',
    regionId: 'region_9_7',
    requiredLevel: 25,
    monsterStats: { hp: 800, attack: 70, defense: 25 },
    expReward: 1000,
    difficulty: 'very_hard',
    bossType: 'dragon_young'
  },
  {
    dungeonId: 'vampire_castle_1',
    name: '뱀파이어 성',
    regionId: 'region_11_9',
    requiredLevel: 30,
    monsterStats: { hp: 750, attack: 65, defense: 20 },
    expReward: 1200,
    difficulty: 'very_hard',
    bossType: 'vampire_lord'
  },
  {
    dungeonId: 'phoenix_nest_1',
    name: '불사조의 둥지',
    regionId: 'region_9_11',
    requiredLevel: 35,
    monsterStats: { hp: 700, attack: 80, defense: 18 },
    expReward: 1500,
    difficulty: 'nightmare',
    bossType: 'phoenix'
  },
  {
    dungeonId: 'kraken_depths_1',
    name: '크라켄의 심연',
    regionId: 'region_7_7',
    requiredLevel: 40,
    monsterStats: { hp: 900, attack: 75, defense: 30 },
    expReward: 1800,
    difficulty: 'nightmare',
    bossType: 'kraken'
  },

  // 최종 던전 (레벨 50+) - 절대 못 깨는 보스들
  {
    dungeonId: 'ancient_dragon_sanctum',
    name: '고대 드래곤 성역',
    regionId: 'region_5_5',
    requiredLevel: 50,
    monsterStats: { hp: 2000, attack: 150, defense: 50 },
    expReward: 5000,
    difficulty: 'nightmare',
    bossType: 'ancient_dragon',
    isLegendary: true
  },
  {
    dungeonId: 'demon_king_throne',
    name: '마왕의 왕좌',
    regionId: 'region_15_15',
    requiredLevel: 60,
    monsterStats: { hp: 2500, attack: 180, defense: 60 },
    expReward: 8000,
    difficulty: 'nightmare',
    bossType: 'demon_king',
    isLegendary: true
  },
  {
    dungeonId: 'war_god_arena',
    name: '전쟁신의 투기장',
    regionId: 'region_1_1',
    requiredLevel: 70,
    monsterStats: { hp: 3000, attack: 200, defense: 70 },
    expReward: 12000,
    difficulty: 'nightmare',
    bossType: 'god_of_war',
    isLegendary: true
  },
  {
    dungeonId: 'void_lord_dimension',
    name: '공허군주의 차원',
    regionId: 'region_20_20',
    requiredLevel: 80,
    monsterStats: { hp: 3500, attack: 220, defense: 80 },
    expReward: 15000,
    difficulty: 'nightmare',
    bossType: 'void_lord',
    isLegendary: true
  },
  {
    dungeonId: 'chaos_emperor_palace',
    name: '혼돈황제의 궁전',
    regionId: 'region_25_25',
    requiredLevel: 90,
    monsterStats: { hp: 4000, attack: 250, defense: 90 },
    expReward: 20000,
    difficulty: 'nightmare',
    bossType: 'chaos_emperor',
    isLegendary: true
  },
  {
    dungeonId: 'infinity_beast_realm',
    name: '무한야수의 영역',
    regionId: 'region_50_50',
    requiredLevel: 100,
    monsterStats: { hp: 5000, attack: 300, defense: 100 },
    expReward: 50000,
    difficulty: 'nightmare',
    bossType: 'infinity_beast',
    isLegendary: true,
    description: '전설 속에서만 존재한다는 궁극의 던전. 아무도 클리어한 적이 없다.'
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