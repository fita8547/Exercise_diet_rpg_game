const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

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

// 메모리 내 데이터 저장소 (개발용)
const users = new Map();
const characters = new Map();
const encounterGauges = new Map();
const aiAnalysisResults = new Map();
const workoutLogs = new Map();
const locationLogs = new Map();
const battleLogs = new Map();

// 던전 데이터
const dungeons = [
  {
    dungeonId: 'goblin_cave_1',
    name: '고블린 동굴',
    regionId: 'region_9_9',
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
  }
];

// JWT 미들웨어
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '액세스 토큰이 필요합니다.' });
  }

  try {
    const decoded = jwt.verify(token, 'dev-secret-key');
    const user = users.get(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: '토큰이 유효하지 않습니다.' });
  }
};

// 유틸리티 함수들
const getTodayString = () => new Date().toISOString().split('T')[0];

const calculateStatGain = (type, amount) => {
  const statGain = { hp: 0, attack: 0, defense: 0, stamina: 0 };
  const maxGains = { hp: 20, attack: 10, defense: 10, stamina: 15 };
  
  switch (type) {
    case 'pushup':
      statGain.attack = Math.min(Math.floor(amount / 5), maxGains.attack);
      break;
    case 'squat':
      statGain.defense = Math.min(Math.floor(amount / 7), maxGains.defense);
      break;
    case 'plank':
      statGain.stamina = Math.min(Math.floor(amount / 15), maxGains.stamina);
      break;
    case 'walk':
      statGain.hp = Math.min(Math.floor(amount / 200), maxGains.hp);
      break;
  }
  
  return statGain;
};

const getRegionFromCoordinates = (latitude, longitude) => {
  const latGrid = Math.floor((latitude + 90) / 10);
  const lngGrid = Math.floor((longitude + 180) / 20);
  return `region_${latGrid}_${lngGrid}`;
};

// 인증 라우트
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (Array.from(users.values()).find(u => u.email === email)) {
      return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = Date.now().toString();
    
    const user = {
      id: userId,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.set(userId, user);

    // 기본 캐릭터 생성
    const character = {
      userId,
      level: 1,
      exp: 0,
      stats: { hp: 100, attack: 10, defense: 5, stamina: 50 },
      currentRegion: 'region_9_9',
      lastActiveDate: new Date(),
      playStyle: null,
      encounterGauge: 0,
      lastAnalysisDate: null,
      lastStyleUpdate: null
    };
    characters.set(userId, character);

    const token = jwt.sign({ userId }, 'dev-secret-key', { expiresIn: '7d' });

    res.status(201).json({
      message: '회원가입이 완료되었습니다.',
      token,
      user: { id: userId, email }
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '이메일 또는 비밀번호가 잘못되었습니다.' });
    }

    const token = jwt.sign({ userId: user.id }, 'dev-secret-key', { expiresIn: '7d' });

    res.json({
      message: '로그인 성공',
      token,
      user: { id: user.id, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// 캐릭터 라우트
app.get('/api/character', authenticateToken, (req, res) => {
  try {
    const character = characters.get(req.user.id);
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    const requiredExp = character.level * 100 + (character.level - 1) * 50;

    res.json({
      character: {
        level: character.level,
        exp: character.exp,
        requiredExp,
        stats: character.stats,
        currentRegion: character.currentRegion,
        lastActiveDate: character.lastActiveDate
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 운동 라우트
app.post('/api/workout', authenticateToken, (req, res) => {
  try {
    const { type, amount } = req.body;
    const userId = req.user.id;
    const today = getTodayString();

    // 오늘 이미 같은 운동을 했는지 확인
    const workoutKey = `${userId}_${type}_${today}`;
    if (workoutLogs.has(workoutKey)) {
      return res.status(400).json({ error: '오늘 이미 해당 운동을 기록했습니다.' });
    }

    // 능력치 증가 계산
    const statGained = calculateStatGain(type, amount);

    // 운동 로그 저장
    workoutLogs.set(workoutKey, {
      userId,
      type,
      amount,
      date: today,
      statGained,
      createdAt: new Date()
    });

    // 캐릭터 능력치 업데이트
    const character = characters.get(userId);
    if (character) {
      character.stats.hp += statGained.hp;
      character.stats.attack += statGained.attack;
      character.stats.defense += statGained.defense;
      character.stats.stamina += statGained.stamina;
      character.lastActiveDate = new Date();

      // 경험치 추가 (운동별로 다른 경험치)
      const expGain = type === 'walk' ? Math.floor(amount / 10) : amount;
      character.exp += expGain;

      // 레벨업 체크
      const requiredExp = character.level * 100 + (character.level - 1) * 50;
      if (character.exp >= requiredExp) {
        character.level += 1;
        character.exp -= requiredExp;
        character.stats.hp += 20;
        character.stats.attack += 3;
        character.stats.defense += 2;
        character.stats.stamina += 10;
      }

      characters.set(userId, character);
    }

    res.json({
      message: '운동이 기록되었습니다.',
      workout: { type, amount, statGained },
      character: {
        level: character.level,
        stats: character.stats
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/workout/today', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const today = getTodayString();

    const todayWorkouts = Array.from(workoutLogs.values())
      .filter(w => w.userId === userId && w.date === today);

    res.json({
      date: today,
      workouts: todayWorkouts.map(w => ({
        type: w.type,
        amount: w.amount,
        statGained: w.statGained
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 위치 라우트
app.post('/api/location', authenticateToken, (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;

    const regionId = getRegionFromCoordinates(latitude, longitude);

    // 위치 로그 저장
    const locationKey = `${userId}_${Date.now()}`;
    locationLogs.set(locationKey, {
      userId,
      latitude,
      longitude,
      regionId,
      createdAt: new Date()
    });

    // 캐릭터 지역 업데이트
    const character = characters.get(userId);
    const oldRegion = character.currentRegion;
    character.currentRegion = regionId;
    character.lastActiveDate = new Date();
    characters.set(userId, character);

    res.json({
      message: oldRegion !== regionId ? '새로운 지역에 도착했습니다!' : '위치가 업데이트되었습니다.',
      regionId,
      regionChanged: oldRegion !== regionId,
      character: { currentRegion: character.currentRegion }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/location/region/current', authenticateToken, (req, res) => {
  try {
    const character = characters.get(req.user.id);
    res.json({ currentRegion: character.currentRegion });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 전투 라우트
app.get('/api/battle/dungeons', authenticateToken, (req, res) => {
  try {
    const character = characters.get(req.user.id);
    const regionDungeons = dungeons.filter(d => d.regionId === character.currentRegion);

    res.json({
      currentRegion: character.currentRegion,
      dungeons: regionDungeons.map(d => ({
        dungeonId: d.dungeonId,
        name: d.name,
        requiredLevel: d.requiredLevel,
        monsterStats: d.monsterStats,
        expReward: d.expReward,
        canEnter: character.level >= d.requiredLevel
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/battle/start', authenticateToken, (req, res) => {
  try {
    const { dungeonId } = req.body;
    const userId = req.user.id;
    const character = characters.get(userId);
    const dungeon = dungeons.find(d => d.dungeonId === dungeonId);

    if (!dungeon) {
      return res.status(404).json({ error: '던전을 찾을 수 없습니다.' });
    }

    if (character.level < dungeon.requiredLevel) {
      return res.status(400).json({ error: `레벨 ${dungeon.requiredLevel} 이상 필요합니다.` });
    }

    // 간단한 전투 시뮬레이션
    const playerPower = character.stats.attack + character.stats.defense;
    const monsterPower = dungeon.monsterStats.attack + dungeon.monsterStats.defense;
    const result = playerPower > monsterPower ? 'win' : 'lose';
    const expGained = result === 'win' ? dungeon.expReward : 0;

    // 전투 로그 저장
    const battleKey = `${userId}_${Date.now()}`;
    battleLogs.set(battleKey, {
      userId,
      dungeonId,
      result,
      damageDealt: character.stats.attack,
      expGained,
      createdAt: new Date()
    });

    // 승리 시 경험치 추가
    let leveledUp = false;
    if (result === 'win') {
      character.exp += expGained;
      const requiredExp = character.level * 100 + (character.level - 1) * 50;
      if (character.exp >= requiredExp) {
        character.level += 1;
        character.exp -= requiredExp;
        character.stats.hp += 20;
        character.stats.attack += 3;
        character.stats.defense += 2;
        character.stats.stamina += 10;
        leveledUp = true;
      }
      characters.set(userId, character);
    }

    res.json({
      battle: {
        result,
        damageDealt: character.stats.attack,
        expGained
      },
      levelUp: leveledUp ? {
        leveledUp: true,
        newLevel: character.level,
        newStats: character.stats
      } : null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// AI 분석 라우트
app.post('/api/ai/analyze', authenticateToken, (req, res) => {
  try {
    const { height, weight, activityLevel, goal } = req.body;
    const userId = req.user.id;

    // 간단한 AI 분석 로직
    const bmi = weight / ((height / 100) ** 2);
    
    let bodyType = 'paladin';
    let playStyle = '성기사형 - 균형잡힌 올라운더';
    let recommendations = [
      '모든 종류의 운동에서 안정적인 성과를 보입니다',
      '팀 플레이와 개인 플레이 모두 뛰어납니다',
      '지속 가능한 건강한 라이프스타일을 추구합니다'
    ];
    let statBonus = { hp: 15, attack: 10, defense: 10, stamina: 15 };

    // 목표에 따른 플레이 스타일 결정
    if (goal === 'strength') {
      bodyType = 'warrior';
      playStyle = '전사형 - 근력 중심의 강력한 모험가';
      recommendations = [
        '근력 운동 퀘스트에서 추가 보상을 받습니다',
        '던전에서 높은 공격력을 발휘할 수 있습니다',
        '무거운 장비를 착용할 수 있는 체력을 가지고 있습니다'
      ];
      statBonus = { hp: 20, attack: 15, defense: 10, stamina: 5 };
    } else if (goal === 'endurance') {
      bodyType = 'archer';
      playStyle = '궁수형 - 지구력과 정확성의 달인';
      recommendations = [
        '걷기와 유산소 운동에서 뛰어난 성과를 보입니다',
        '장거리 이동 시 스태미나 소모가 적습니다',
        '연속 전투에서 지속력을 발휘합니다'
      ];
      statBonus = { hp: 10, attack: 5, defense: 5, stamina: 25 };
    } else if (goal === 'habit') {
      bodyType = 'mage';
      playStyle = '마법사형 - 지혜로운 습관의 마스터';
      recommendations = [
        '꾸준한 활동으로 마법력(경험치)을 축적합니다',
        '작은 운동도 큰 효과로 변환시킵니다',
        '규칙적인 패턴으로 안정적인 성장을 이룹니다'
      ];
      statBonus = { hp: 15, attack: 10, defense: 15, stamina: 10 };
    }

    // 활동량에 따른 보너스 조정
    const activityMultiplier = {
      low: 0.8,
      moderate: 1.0,
      high: 1.2
    }[activityLevel] || 1.0;

    Object.keys(statBonus).forEach(key => {
      statBonus[key] = Math.floor(statBonus[key] * activityMultiplier);
    });

    const result = {
      bodyType,
      playStyle,
      recommendations,
      statBonus
    };

    // 결과 저장
    aiAnalysisResults.set(userId, result);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 몬스터 조우 API
app.post('/api/encounter/check', authenticateToken, (req, res) => {
  try {
    const { movementDistance } = req.body;
    const userId = req.user.id;
    
    if (!movementDistance || movementDistance < 0) {
      return res.status(400).json({ error: '유효한 이동 거리를 입력해주세요.' });
    }

    // 현재 조우 게이지 가져오기
    let currentGauge = encounterGauges.get(userId) || 0;
    
    // 거리에 따른 게이지 증가 (10m당 1포인트)
    const gaugeIncrease = Math.floor(movementDistance / 10);
    const newGauge = Math.min(100, currentGauge + gaugeIncrease);
    
    encounterGauges.set(userId, newGauge);

    if (newGauge >= 100) {
      // 몬스터 조우 발생
      encounterGauges.set(userId, 0); // 게이지 리셋
      
      const character = characters.get(userId);
      const playerLevel = character ? character.level : 1;
      
      // 랜덤 몬스터 생성
      const monsters = [
        { name: '들쥐', level: 1, hp: 30, attack: 5, defense: 1 },
        { name: '고블린', level: 2, hp: 50, attack: 8, defense: 2 },
        { name: '늑대', level: 3, hp: 80, attack: 12, defense: 4 },
        { name: '오크', level: 4, hp: 120, attack: 15, defense: 6 }
      ];
      
      const availableMonsters = monsters.filter(m => m.level <= playerLevel + 1);
      const monster = availableMonsters[Math.floor(Math.random() * availableMonsters.length)];
      
      res.json({
        encounterTriggered: true,
        monster,
        message: `${monster.name}이(가) 나타났다!`,
        encounterGauge: 0
      });
    } else {
      res.json({
        encounterTriggered: false,
        encounterGauge: newGauge,
        message: `조우 게이지: ${newGauge}/100`,
        progress: `${newGauge}/100`
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 조우 게이지 조회
app.get('/api/encounter/gauge', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const encounterGauge = encounterGauges.get(userId) || 0;
    
    res.json({
      currentGauge: encounterGauge,
      maxGauge: 100,
      progress: `${encounterGauge}/100`,
      percentage: encounterGauge
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'RPG 운동 게임 API 서버 (개발 모드)',
    users: users.size,
    characters: characters.size,
    encounters: encounterGauges.size
  });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`개발 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log('메모리 내 데이터베이스를 사용합니다.');
});

module.exports = app;