require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');

// 모델 import
const User = require('./models/User');
const Character = require('./models/Character');
const WorkoutLog = require('./models/WorkoutLog');
const LocationLog = require('./models/LocationLog');
const BattleLog = require('./models/BattleLog');
const Costume = require('./models/Costume');
const UserCostume = require('./models/UserCostume');

// 서비스 import
const battleService = require('./services/battleService');
const aiService = require('./services/aiService');
const characterService = require('./services/characterService');
const mapService = require('./services/mapService');

const app = express();

// 환경 변수 설정
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rpg-workout';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key';

// MongoDB 연결
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB 연결 성공');
  createAdminAccount();
})
.catch((error) => {
  console.error('❌ MongoDB 연결 실패:', error);
  console.log('💡 MongoDB가 실행되지 않았을 수 있습니다. 로컬에서 MongoDB를 시작해주세요.');
  console.log('   - macOS: brew services start mongodb-community');
  console.log('   - 또는 Docker: docker run -d -p 27017:27017 mongo');
  process.exit(1);
});

// 보안 미들웨어
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100 요청
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// JWT 미들웨어
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '액세스 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: '토큰이 유효하지 않습니다.' });
  }
};

// 관리자 계정 생성
const createAdminAccount = async () => {
  try {
    const adminEmail = 'junsu';
    const adminPassword = 'sungo8547!';
    
    // 기존 관리자 계정 확인
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('🔑 관리자 계정이 이미 존재합니다.');
      return;
    }
    
    // 관리자 계정 생성
    const adminUser = new User({
      email: adminEmail,
      password: adminPassword,
      isAdmin: true
    });
    
    await adminUser.save();
    
    // 관리자 캐릭터 생성
    const adminCharacter = new Character({
      userId: adminUser._id,
      level: 100,
      exp: 999999,
      stats: {
        hp: 5000,
        attack: 500,
        defense: 300,
        stamina: 1000
      },
      currentRegion: 'admin_region',
      playStyle: 'warrior'
    });
    
    await adminCharacter.save();
    
    console.log('🔑 관리자 계정이 생성되었습니다:');
    console.log('   ID: junsu');
    console.log('   PW: sungo8547!');
    console.log('   isAdmin: true');
    console.log('   레벨: 100');
    console.log('   모든 던전 접근 가능');
  } catch (error) {
    console.error('관리자 계정 생성 실패:', error);
  }
};

// 던전 데이터
const dungeons = [
  // 초급 던전 (레벨 1-10)
  {
    dungeonId: 'goblin_cave_1',
    name: '고블린 동굴',
    regionId: 'region_9_9',
    requiredLevel: 1,
    requiredWalkTime: 0, // 분 단위
    requiredDistance: 0, // 미터 단위
    monsterStats: { hp: 50, attack: 8, defense: 2 },
    expReward: 25,
    difficulty: 'easy',
    bossType: 'goblin'
  },
  {
    dungeonId: 'slime_forest_1',
    name: '슬라임 숲',
    regionId: 'region_8_8',
    requiredLevel: 1,
    requiredWalkTime: 5,
    requiredDistance: 400,
    monsterStats: { hp: 30, attack: 5, defense: 1 },
    expReward: 15,
    difficulty: 'easy',
    bossType: 'spider'
  },
  {
    dungeonId: 'orc_fortress_1',
    name: '오크 요새',
    regionId: 'region_7_7',
    requiredLevel: 3,
    requiredWalkTime: 10,
    requiredDistance: 800,
    monsterStats: { hp: 120, attack: 15, defense: 5 },
    expReward: 75,
    difficulty: 'normal',
    bossType: 'orc'
  },
  {
    dungeonId: 'skeleton_tomb_1',
    name: '해골 무덤',
    regionId: 'region_6_6',
    requiredLevel: 5,
    requiredWalkTime: 15,
    requiredDistance: 1200,
    monsterStats: { hp: 200, attack: 25, defense: 8 },
    expReward: 150,
    difficulty: 'normal',
    bossType: 'skeleton'
  },
  {
    dungeonId: 'wolf_den_1',
    name: '늑대 굴',
    regionId: 'region_5_5',
    requiredLevel: 4,
    requiredWalkTime: 12,
    requiredDistance: 1000,
    monsterStats: { hp: 150, attack: 20, defense: 3 },
    expReward: 100,
    difficulty: 'normal',
    bossType: 'wolf'
  },
  {
    dungeonId: 'troll_bridge_1',
    name: '트롤 다리',
    regionId: 'region_4_4',
    requiredLevel: 8,
    requiredWalkTime: 25,
    requiredDistance: 2000,
    monsterStats: { hp: 300, attack: 35, defense: 12 },
    expReward: 200,
    difficulty: 'hard',
    bossType: 'troll'
  },
  
  // 중급 던전 (레벨 10-25)
  {
    dungeonId: 'minotaur_labyrinth_1',
    name: '미노타우로스 미궁',
    regionId: 'region_3_3',
    requiredLevel: 12,
    requiredWalkTime: 35,
    requiredDistance: 2800,
    monsterStats: { hp: 400, attack: 40, defense: 15 },
    expReward: 350,
    difficulty: 'hard',
    bossType: 'minotaur'
  },
  {
    dungeonId: 'assassin_hideout_1',
    name: '암살자 은신처',
    regionId: 'region_2_2',
    requiredLevel: 15,
    requiredWalkTime: 45,
    requiredDistance: 3600,
    monsterStats: { hp: 300, attack: 55, defense: 8 },
    expReward: 400,
    difficulty: 'hard',
    bossType: 'assassin'
  },
  {
    dungeonId: 'wizard_tower_1',
    name: '마법사의 탑',
    regionId: 'region_1_2',
    requiredLevel: 18,
    requiredWalkTime: 60,
    requiredDistance: 4800,
    monsterStats: { hp: 350, attack: 60, defense: 10 },
    expReward: 500,
    difficulty: 'very_hard',
    bossType: 'wizard'
  },
  {
    dungeonId: 'giant_mountain_1',
    name: '거인의 산',
    regionId: 'region_2_1',
    requiredLevel: 20,
    requiredWalkTime: 90,
    requiredDistance: 7200,
    monsterStats: { hp: 600, attack: 45, defense: 20 },
    expReward: 600,
    difficulty: 'very_hard',
    bossType: 'giant'
  },
  
  // 고급 던전 (레벨 25-50) - 중급 보스
  {
    dungeonId: 'young_dragon_lair_1',
    name: '어린 드래곤의 둥지',
    regionId: 'region_10_10',
    requiredLevel: 25,
    requiredWalkTime: 120,
    requiredDistance: 9600,
    monsterStats: { hp: 800, attack: 70, defense: 25 },
    expReward: 1000,
    difficulty: 'very_hard',
    bossType: 'dragon_young'
  },
  {
    dungeonId: 'vampire_castle_1',
    name: '뱀파이어 성',
    regionId: 'region_11_11',
    requiredLevel: 30,
    requiredWalkTime: 180,
    requiredDistance: 14400,
    monsterStats: { hp: 750, attack: 65, defense: 20 },
    expReward: 1200,
    difficulty: 'very_hard',
    bossType: 'vampire_lord'
  },
  {
    dungeonId: 'phoenix_nest_1',
    name: '불사조의 둥지',
    regionId: 'region_12_12',
    requiredLevel: 35,
    requiredWalkTime: 240,
    requiredDistance: 19200,
    monsterStats: { hp: 700, attack: 80, defense: 18 },
    expReward: 1500,
    difficulty: 'nightmare',
    bossType: 'phoenix'
  },
  {
    dungeonId: 'kraken_depths_1',
    name: '크라켄의 심연',
    regionId: 'region_13_13',
    requiredLevel: 40,
    requiredWalkTime: 300,
    requiredDistance: 24000,
    monsterStats: { hp: 900, attack: 75, defense: 30 },
    expReward: 1800,
    difficulty: 'nightmare',
    bossType: 'kraken'
  },
  
  // 전설 던전 (레벨 50-100) - 최종 보스
  {
    dungeonId: 'ancient_dragon_sanctum',
    name: '고대 드래곤 성역',
    regionId: 'region_50_50',
    requiredLevel: 50,
    requiredWalkTime: 600,
    requiredDistance: 48000,
    monsterStats: { hp: 2000, attack: 150, defense: 50 },
    expReward: 5000,
    difficulty: 'nightmare',
    bossType: 'ancient_dragon',
    isLegendary: true,
    description: '전설 속의 고대 드래곤이 잠들어 있는 성역'
  },
  {
    dungeonId: 'demon_king_throne',
    name: '마왕의 왕좌',
    regionId: 'region_40_40',
    requiredLevel: 60,
    requiredWalkTime: 1200,
    requiredDistance: 96000,
    monsterStats: { hp: 2500, attack: 180, defense: 60 },
    expReward: 8000,
    difficulty: 'nightmare',
    bossType: 'demon_king',
    isLegendary: true,
    description: '지옥의 마왕이 군림하는 어둠의 왕좌'
  },
  {
    dungeonId: 'war_god_arena',
    name: '전쟁신의 투기장',
    regionId: 'region_1_1',
    requiredLevel: 70,
    requiredWalkTime: 2400,
    requiredDistance: 192000,
    monsterStats: { hp: 5000, attack: 350, defense: 120 },
    expReward: 12000,
    difficulty: 'nightmare',
    bossType: 'god_of_war',
    isLegendary: true,
    description: '전쟁의 신이 직접 상대하는 신성한 투기장 - 절대적 강자'
  },
  {
    dungeonId: 'void_lord_dimension',
    name: '공허군주의 차원',
    regionId: 'region_20_20',
    requiredLevel: 80,
    requiredWalkTime: 3600,
    requiredDistance: 288000,
    monsterStats: { hp: 6000, attack: 400, defense: 140 },
    expReward: 15000,
    difficulty: 'nightmare',
    bossType: 'void_lord',
    isLegendary: true,
    description: '공허의 군주가 지배하는 무의 차원 - 현실을 초월한 존재'
  },
  {
    dungeonId: 'chaos_emperor_palace',
    name: '혼돈황제의 궁전',
    regionId: 'region_25_25',
    requiredLevel: 90,
    requiredWalkTime: 4800,
    requiredDistance: 384000,
    monsterStats: { hp: 8000, attack: 450, defense: 160 },
    expReward: 20000,
    difficulty: 'nightmare',
    bossType: 'chaos_emperor',
    isLegendary: true,
    description: '혼돈의 황제가 현실을 왜곡시키는 궁전 - 질서의 파괴자'
  },
  {
    dungeonId: 'infinity_beast_realm',
    name: '무한야수의 영역',
    regionId: 'region_50_50',
    requiredLevel: 100,
    requiredWalkTime: 6000,
    requiredDistance: 480000,
    monsterStats: { hp: 10000, attack: 500, defense: 200 },
    expReward: 50000,
    difficulty: 'nightmare',
    bossType: 'infinity_beast',
    isLegendary: true,
    description: '전설 속에서만 존재한다는 궁극의 던전 - 무한의 힘을 가진 야수'
  }
];

// 코스튬 데이터
const costumes = [
  // 머리 장비
  {
    costumeId: 'warrior_helmet',
    name: '전사의 투구',
    description: '강철로 만든 견고한 투구',
    category: 'head',
    rarity: 'common',
    price: 50,
    statBonus: { hp: 10, defense: 5 },
    icon: '⛑️',
    unlockLevel: 1
  },
  {
    costumeId: 'mage_hat',
    name: '마법사의 모자',
    description: '마력이 깃든 신비한 모자',
    category: 'head',
    rarity: 'rare',
    price: 150,
    statBonus: { attack: 8, stamina: 10 },
    icon: '🎩',
    unlockLevel: 5
  },
  {
    costumeId: 'crown_of_kings',
    name: '왕의 왕관',
    description: '전설의 왕이 착용했던 황금 왕관',
    category: 'head',
    rarity: 'legendary',
    price: 1000,
    statBonus: { hp: 50, attack: 20, defense: 15 },
    icon: '👑',
    unlockLevel: 20
  },

  // 몸 장비
  {
    costumeId: 'leather_armor',
    name: '가죽 갑옷',
    description: '유연하고 가벼운 가죽 갑옷',
    category: 'body',
    rarity: 'common',
    price: 80,
    statBonus: { hp: 15, defense: 8 },
    icon: '🦺',
    unlockLevel: 1
  },
  {
    costumeId: 'steel_armor',
    name: '강철 갑옷',
    description: '단단한 강철로 만든 중갑',
    category: 'body',
    rarity: 'rare',
    price: 250,
    statBonus: { hp: 30, defense: 20 },
    icon: '🛡️',
    unlockLevel: 8
  },
  {
    costumeId: 'dragon_scale_armor',
    name: '드래곤 비늘 갑옷',
    description: '고대 드래곤의 비늘로 만든 전설의 갑옷',
    category: 'body',
    rarity: 'legendary',
    price: 1500,
    statBonus: { hp: 80, defense: 40, attack: 10 },
    icon: '🐲',
    unlockLevel: 25
  },

  // 무기
  {
    costumeId: 'iron_sword',
    name: '철검',
    description: '날카로운 철로 만든 검',
    category: 'weapon',
    rarity: 'common',
    price: 60,
    statBonus: { attack: 12 },
    icon: '⚔️',
    unlockLevel: 1
  },
  {
    costumeId: 'magic_staff',
    name: '마법 지팡이',
    description: '마력을 증폭시키는 신비한 지팡이',
    category: 'weapon',
    rarity: 'rare',
    price: 200,
    statBonus: { attack: 18, stamina: 15 },
    icon: '🪄',
    unlockLevel: 6
  },
  {
    costumeId: 'excalibur',
    name: '엑스칼리버',
    description: '전설의 성검, 선택받은 자만이 사용할 수 있다',
    category: 'weapon',
    rarity: 'legendary',
    price: 2000,
    statBonus: { attack: 50, hp: 30, defense: 10 },
    icon: '🗡️',
    unlockLevel: 30
  },

  // 액세서리
  {
    costumeId: 'power_ring',
    name: '힘의 반지',
    description: '착용자의 힘을 증가시키는 마법 반지',
    category: 'accessory',
    rarity: 'rare',
    price: 120,
    statBonus: { attack: 10, stamina: 5 },
    icon: '💍',
    unlockLevel: 3
  },
  {
    costumeId: 'health_amulet',
    name: '생명의 부적',
    description: '생명력을 크게 증가시키는 신성한 부적',
    category: 'accessory',
    rarity: 'epic',
    price: 400,
    statBonus: { hp: 40, defense: 12 },
    icon: '🔮',
    unlockLevel: 12
  },
  {
    costumeId: 'infinity_pendant',
    name: '무한의 펜던트',
    description: '모든 능력을 극대화하는 전설의 펜던트',
    category: 'accessory',
    rarity: 'legendary',
    price: 3000,
    statBonus: { hp: 100, attack: 30, defense: 25, stamina: 50 },
    icon: '✨',
    unlockLevel: 50
  }
];

// ==================== 인증 라우트 ====================

// 회원가입
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력 검증
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: '비밀번호는 최소 6자 이상이어야 합니다.' });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
    }

    // 사용자 생성
    const user = new User({ email, password });
    await user.save();

    // 기본 캐릭터 생성
    const character = new Character({
      userId: user._id,
      level: 1,
      exp: 0,
      stats: {
        hp: 100,
        attack: 10,
        defense: 5,
        stamina: 50
      },
      currentRegion: 'region_9_9'
    });
    await character.save();

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('회원가입 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 로그인
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 입력 검증
    if (!email || !password) {
      return res.status(400).json({ error: '이메일과 비밀번호를 입력해주세요.' });
    }

    // 사용자 찾기
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 비밀번호 확인
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
    }

    // 마지막 로그인 시간 업데이트
    user.lastLoginAt = new Date();
    await user.save();

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: '로그인 성공',
      token,
      user: {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error('로그인 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// ==================== 캐릭터 라우트 ====================

// 캐릭터 정보 조회
app.get('/api/character', authenticateToken, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    res.json({
      character: {
        level: character.level,
        exp: character.exp,
        requiredExp: character.getRequiredExp(),
        stats: character.stats,
        currentRegion: character.currentRegion,
        lastActiveDate: character.lastActiveDate,
        playStyle: character.playStyle,
        encounterGauge: character.encounterGauge
      }
    });
  } catch (error) {
    console.error('캐릭터 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// ==================== 던전 라우트 ====================

// 던전 목록 조회
app.get('/api/battle/dungeons', authenticateToken, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 관리자는 모든 던전을 볼 수 있음
    const isAdmin = req.user.isAdmin === true;
    
    // 모든 던전을 보여주되, 걷기 거리를 기준으로 잠금 해제
    const userWalkDistance = character.totalWalkDistance || 0; // 미터 단위
    
    console.log('🏰 던전 API 호출:');
    console.log('   사용자 ID:', req.user._id);
    console.log('   사용자 이메일:', req.user.email);
    console.log('   관리자 여부:', req.user.isAdmin);
    console.log('   캐릭터 레벨:', character.level);
    console.log('   총 걸은 거리:', userWalkDistance, 'm');
    console.log('   총 던전 수:', dungeons.length);

    res.json({
      currentRegion: character.currentRegion,
      totalWalkDistance: userWalkDistance,
      dungeons: dungeons.map(d => {
        // 관리자는 모든 던전 접근 가능
        // 일반 사용자는 걸은 거리를 기준으로 잠금 해제
        const canEnter = isAdmin || userWalkDistance >= (d.requiredDistance || 0);
        
        console.log(`   던전 ${d.name}: canEnter=${canEnter} (관리자=${isAdmin}, 걸은거리=${userWalkDistance}>=${d.requiredDistance || 0})`);
        
        return {
          dungeonId: d.dungeonId,
          name: d.name,
          requiredLevel: d.requiredLevel,
          requiredDistance: d.requiredDistance || 0,
          requiredWalkTime: d.requiredWalkTime || 0,
          monsterStats: d.monsterStats,
          expReward: d.expReward,
          difficulty: d.difficulty,
          bossType: d.bossType,
          isLegendary: d.isLegendary,
          description: d.description,
          canEnter
        };
      })
    });
  } catch (error) {
    console.error('던전 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// ==================== 운동 라우트 ====================

// 운동 기록 저장
app.post('/api/workout', authenticateToken, async (req, res) => {
  try {
    const { type, amount, distance, duration } = req.body;

    const workoutLog = new WorkoutLog({
      userId: req.user._id,
      type,
      amount,
      distance: distance || 0,
      duration: duration || 0,
      date: new Date()
    });

    await workoutLog.save();

    // 캐릭터 경험치 및 걷기 거리 업데이트
    const character = await Character.findOne({ userId: req.user._id });
    if (character) {
      const expGained = Math.floor(amount / 10); // 10m당 1 경험치
      character.exp += expGained;
      
      // 총 걸은 거리 업데이트 (걷기 운동인 경우)
      if (type === 'walk' && distance) {
        character.totalWalkDistance = (character.totalWalkDistance || 0) + distance;
        character.totalWalkTime = (character.totalWalkTime || 0) + (duration || 0);
      }
      
      // 레벨업 체크
      const leveledUp = character.checkLevelUp();
      character.lastActiveDate = new Date();
      
      await character.save();

      res.json({
        message: '운동 기록이 저장되었습니다.',
        expGained,
        leveledUp,
        character: {
          level: character.level,
          exp: character.exp,
          requiredExp: character.getRequiredExp(),
          stats: character.stats,
          totalWalkDistance: character.totalWalkDistance,
          totalWalkTime: character.totalWalkTime
        }
      });
    } else {
      res.json({ message: '운동 기록이 저장되었습니다.' });
    }
  } catch (error) {
    console.error('운동 기록 저장 오료:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// ==================== 위치 추적 라우트 ====================

// 위치 업데이트 및 걷기 거리 추적
app.post('/api/location/update', authenticateToken, async (req, res) => {
  try {
    const { distance, duration } = req.body;
    
    if (!distance || distance <= 0) {
      return res.status(400).json({ error: '유효한 거리 정보가 필요합니다.' });
    }

    // 캐릭터 걷기 거리 업데이트
    const character = await Character.findOne({ userId: req.user._id });
    if (character) {
      character.totalWalkDistance = (character.totalWalkDistance || 0) + distance;
      character.totalWalkTime = (character.totalWalkTime || 0) + (duration || 0);
      character.lastActiveDate = new Date();
      
      await character.save();

      console.log(`🚶 사용자 ${req.user.email} 걷기 업데이트: +${distance}m (총 ${character.totalWalkDistance}m)`);

      res.json({
        message: '위치가 업데이트되었습니다.',
        totalWalkDistance: character.totalWalkDistance,
        totalWalkTime: character.totalWalkTime
      });
    } else {
      res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('위치 업데이트 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 걷기 거리 초기화
app.post('/api/location/reset', authenticateToken, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 걷기 거리와 시간 초기화
    character.totalWalkDistance = 0;
    character.totalWalkTime = 0;
    character.lastActiveDate = new Date();
    
    await character.save();
    
    console.log(`🔄 걷기 거리 초기화 완료: ${req.user.email}`);
    
    res.json({
      message: '걷기 거리가 초기화되었습니다.',
      totalWalkDistance: 0,
      totalWalkTime: 0
    });
  } catch (error) {
    console.error('걷기 거리 초기화 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// ==================== 조우 라우트 ====================

// 몬스터 조우 게이지 조회
app.get('/api/encounter/gauge', authenticateToken, async (req, res) => {
  try {
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    res.json({
      currentGauge: character.encounterGauge
    });
  } catch (error) {
    console.error('조우 게이지 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 몬스터 조우 체크
app.post('/api/encounter/check', authenticateToken, async (req, res) => {
  try {
    const { movementDistance } = req.body;
    const character = await Character.findOne({ userId: req.user._id });
    
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 조우 게이지 증가 (100m당 10 증가)
    const gaugeIncrease = Math.floor(movementDistance / 100) * 10;
    character.encounterGauge = Math.min(100, character.encounterGauge + gaugeIncrease);

    let encounterTriggered = false;
    let monster = null;

    // 100% 달성 시 랜덤 조우
    if (character.encounterGauge >= 100) {
      encounterTriggered = true;
      character.encounterGauge = 0;
      
      // 랜덤 몬스터 생성
      const monsters = [
        { name: '들쥐', level: 1, hp: 30, attack: 5, defense: 1 },
        { name: '고블린', level: 2, hp: 50, attack: 8, defense: 2 },
        { name: '늑대', level: 3, hp: 80, attack: 12, defense: 4 }
      ];
      monster = monsters[Math.floor(Math.random() * monsters.length)];
    }

    await character.save();

    res.json({
      encounterGauge: character.encounterGauge,
      encounterTriggered,
      monster
    });
  } catch (error) {
    console.error('조우 체크 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// ==================== AI 분석 라우트 ====================

// AI 몸 상태 분석
app.post('/api/ai/analyze', authenticateToken, async (req, res) => {
  try {
    const { height, weight, activityLevel, goal } = req.body;
    
    // AI 분석 로직 (간단한 예시)
    const bmi = weight / ((height / 100) ** 2);
    let playStyle = 'warrior';
    let recommendations = [];
    
    if (bmi < 18.5) {
      playStyle = 'archer';
      recommendations = ['체중 증가를 위한 근력 운동', '단백질 섭취 늘리기'];
    } else if (bmi > 25) {
      playStyle = 'mage';
      recommendations = ['유산소 운동 중심', '칼로리 조절'];
    } else {
      playStyle = 'paladin';
      recommendations = ['균형잡힌 운동', '꾸준한 활동 유지'];
    }

    const result = {
      bodyType: playStyle,
      playStyle: `${playStyle} - 당신에게 맞는 스타일`,
      recommendations,
      statBonus: {
        hp: 10,
        attack: 5,
        defense: 3,
        stamina: 8
      }
    };

    // 캐릭터 플레이 스타일 업데이트
    const character = await Character.findOne({ userId: req.user._id });
    if (character) {
      character.playStyle = playStyle;
      character.lastAnalysisDate = new Date();
      await character.save();
    }

    res.json(result);
  } catch (error) {
    console.error('AI 분석 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// ==================== 코스튬 상점 라우트 ====================

// 코스튬 목록 조회
app.get('/api/costumes', authenticateToken, async (req, res) => {
  try {
    console.log('🛍️ 코스튬 목록 조회 요청:', req.user.email);
    
    const character = await Character.findOne({ userId: req.user._id });
    if (!character) {
      console.log('❌ 캐릭터를 찾을 수 없음:', req.user._id);
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    console.log('👤 캐릭터 정보:', { level: character.level, coins: character.coins });
    console.log('🎽 전체 코스튬 수:', costumes.length);

    // 사용자가 소유한 코스튬 목록
    const userCostumes = await UserCostume.find({ userId: req.user._id });
    const ownedCostumeIds = userCostumes.map(uc => uc.costumeId);
    console.log('🎒 소유한 코스튬:', ownedCostumeIds);

    // 레벨에 따라 해금된 코스튬만 표시
    const availableCostumes = costumes
      .filter(costume => costume.unlockLevel <= character.level)
      .map(costume => ({
        ...costume,
        isOwned: ownedCostumeIds.includes(costume.costumeId),
        isEquipped: character.equippedCostumes[costume.category] === costume.costumeId
      }));

    console.log('✅ 사용 가능한 코스튬 수:', availableCostumes.length);

    res.json({
      costumes: availableCostumes,
      coins: character.coins,
      equippedCostumes: character.equippedCostumes
    });
  } catch (error) {
    console.error('❌ 코스튬 목록 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 코스튬 구매
app.post('/api/costumes/purchase', authenticateToken, async (req, res) => {
  try {
    const { costumeId } = req.body;
    
    const character = await Character.findOne({ userId: req.user._id });
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    const costume = costumes.find(c => c.costumeId === costumeId);
    if (!costume) {
      return res.status(404).json({ error: '코스튬을 찾을 수 없습니다.' });
    }

    // 레벨 체크
    if (character.level < costume.unlockLevel) {
      return res.status(400).json({ error: `레벨 ${costume.unlockLevel} 이상이어야 구매할 수 있습니다.` });
    }

    // 이미 소유 중인지 체크
    const existingCostume = await UserCostume.findOne({ userId: req.user._id, costumeId });
    if (existingCostume) {
      return res.status(400).json({ error: '이미 소유한 코스튬입니다.' });
    }

    // 코인 체크
    if (character.coins < costume.price) {
      return res.status(400).json({ error: '코인이 부족합니다.' });
    }

    // 구매 처리
    character.coins -= costume.price;
    await character.save();

    const userCostume = new UserCostume({
      userId: req.user._id,
      costumeId: costumeId
    });
    await userCostume.save();

    console.log(`👕 코스튬 구매: ${req.user.email} - ${costume.name} (${costume.price} 코인)`);

    res.json({
      message: '코스튬을 구매했습니다!',
      remainingCoins: character.coins,
      costume: costume
    });
  } catch (error) {
    console.error('코스튬 구매 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 코스튬 장착/해제
app.post('/api/costumes/equip', authenticateToken, async (req, res) => {
  try {
    const { costumeId, action } = req.body; // action: 'equip' or 'unequip'
    
    const character = await Character.findOne({ userId: req.user._id });
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    const costume = costumes.find(c => c.costumeId === costumeId);
    if (!costume) {
      return res.status(404).json({ error: '코스튬을 찾을 수 없습니다.' });
    }

    // 소유 여부 체크
    const userCostume = await UserCostume.findOne({ userId: req.user._id, costumeId });
    if (!userCostume) {
      return res.status(400).json({ error: '소유하지 않은 코스튬입니다.' });
    }

    if (action === 'equip') {
      // 기존 장착 아이템 해제
      character.equippedCostumes[costume.category] = costumeId;
      
      // 스탯 재계산 (장착된 모든 코스튬의 보너스 적용)
      await updateCharacterStats(character);
      
      console.log(`👕 코스튬 장착: ${req.user.email} - ${costume.name}`);
    } else if (action === 'unequip') {
      character.equippedCostumes[costume.category] = null;
      
      // 스탯 재계산
      await updateCharacterStats(character);
      
      console.log(`👕 코스튬 해제: ${req.user.email} - ${costume.name}`);
    }

    await character.save();

    res.json({
      message: action === 'equip' ? '코스튬을 장착했습니다!' : '코스튬을 해제했습니다!',
      equippedCostumes: character.equippedCostumes,
      stats: character.stats
    });
  } catch (error) {
    console.error('코스튬 장착/해제 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 랭킹 조회
app.get('/api/ranking', authenticateToken, async (req, res) => {
  try {
    const { type = 'level' } = req.query; // level, walkDistance, coins
    
    let sortField = {};
    switch (type) {
      case 'level':
        sortField = { level: -1, exp: -1 };
        break;
      case 'walkDistance':
        sortField = { totalWalkDistance: -1 };
        break;
      case 'coins':
        sortField = { coins: -1 };
        break;
      default:
        sortField = { level: -1, exp: -1 };
    }

    const rankings = await Character.find()
      .populate('userId', 'email')
      .sort(sortField)
      .limit(50)
      .select('level exp totalWalkDistance coins userId equippedCostumes');

    const formattedRankings = rankings.map((char, index) => ({
      rank: index + 1,
      email: char.userId.email.replace(/(.{3}).*(@.*)/, '$1***$2'), // 이메일 마스킹
      level: char.level,
      exp: char.exp,
      totalWalkDistance: char.totalWalkDistance || 0,
      coins: char.coins || 0,
      equippedCostumes: char.equippedCostumes
    }));

    res.json({
      rankings: formattedRankings,
      type: type
    });
  } catch (error) {
    console.error('랭킹 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 캐릭터 스탯 업데이트 함수 (코스튬 보너스 적용)
async function updateCharacterStats(character) {
  // 기본 스탯 계산
  const baseStats = {
    hp: 100 + (character.level - 1) * 20,
    attack: 10 + (character.level - 1) * 5,
    defense: 5 + (character.level - 1) * 3,
    stamina: 50 + (character.level - 1) * 10
  };

  // 장착된 코스튬의 보너스 적용
  let totalBonus = { hp: 0, attack: 0, defense: 0, stamina: 0 };
  
  for (const category in character.equippedCostumes) {
    const costumeId = character.equippedCostumes[category];
    if (costumeId) {
      const costume = costumes.find(c => c.costumeId === costumeId);
      if (costume && costume.statBonus) {
        totalBonus.hp += costume.statBonus.hp || 0;
        totalBonus.attack += costume.statBonus.attack || 0;
        totalBonus.defense += costume.statBonus.defense || 0;
        totalBonus.stamina += costume.statBonus.stamina || 0;
      }
    }
  }

  // 최종 스탯 적용
  character.stats = {
    hp: baseStats.hp + totalBonus.hp,
    attack: baseStats.attack + totalBonus.attack,
    defense: baseStats.defense + totalBonus.defense,
    stamina: baseStats.stamina + totalBonus.stamina
  };
}

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📊 MongoDB 연결: ${MONGODB_URI}`);
});

module.exports = app;