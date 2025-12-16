/**
 * RPG 전투 시스템 API 라우트
 * 턴제 전투 + AI 스타일별 전투 특성
 */

const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const battleService = require('../services/battleService');
const Character = require('../models/Character');
const BattleLog = require('../models/BattleLog');

const router = express.Router();
router.use(authenticateToken);

/**
 * POST /api/battle/start
 * 전투 시작
 */
router.post('/start', async (req, res) => {
  try {
    const { monster } = req.body;
    const userId = req.user._id;

    if (!monster) {
      return res.status(400).json({ error: '몬스터 정보가 필요합니다.' });
    }

    // 캐릭터 정보 조회
    const character = await Character.findOne({ userId });
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 플레이어 전투 정보 구성
    const player = {
      id: userId,
      level: character.level,
      hp: character.stats.hp,
      maxHp: character.stats.hp,
      attack: character.stats.attack,
      defense: character.stats.defense,
      stamina: character.stats.stamina,
      playStyle: character.playStyle || 'balanced'
    };

    // 전투 시작
    const battle = battleService.startBattle(userId, player, monster);

    res.json({
      success: true,
      battleId: battle.id,
      battle: {
        id: battle.id,
        player: battle.player,
        monster: battle.monster,
        turn: battle.turn,
        turnCount: battle.turnCount,
        log: battle.log,
        status: battle.status
      },
      message: '전투가 시작되었습니다!'
    });

  } catch (error) {
    console.error('전투 시작 오류:', error);
    res.status(500).json({ error: '전투 시작에 실패했습니다.' });
  }
});

/**
 * POST /api/battle/action
 * 전투 액션 실행
 */
router.post('/action', async (req, res) => {
  try {
    const { battleId, action } = req.body;
    const userId = req.user._id;

    if (!battleId || !action) {
      return res.status(400).json({ 
        error: '전투 ID와 액션 정보가 필요합니다.' 
      });
    }

    // 전투 정보 확인
    const battle = battleService.getBattle(battleId);
    if (!battle) {
      return res.status(404).json({ error: '전투를 찾을 수 없습니다.' });
    }

    if (battle.playerId !== userId.toString()) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    if (battle.status !== 'active') {
      return res.status(400).json({ error: '이미 종료된 전투입니다.' });
    }

    // 캐릭터 정보로 플레이 스타일 확인
    const character = await Character.findOne({ userId });
    const playStyle = character?.playStyle || 'balanced';

    // 액션 처리
    const result = battleService.processBattleAction(battleId, action, playStyle);

    // 전투 종료 시 결과 저장
    if (result.isFinished) {
      const battleResult = battleService.endBattle(battleId);
      
      // 승리 시 경험치 및 레벨업 처리
      if (battleResult.result === 'victory') {
        character.exp += battleResult.expGained;
        
        // 레벨업 체크
        const leveledUp = character.checkLevelUp();
        await character.save();

        // 전투 로그 저장
        const battleLog = new BattleLog({
          userId,
          dungeonId: battle.monster.type, // 몬스터 타입을 던전 ID로 사용
          result: 'win',
          damageDealt: result.actionResult.damage || 0,
          expGained: battleResult.expGained,
          createdAt: new Date()
        });
        await battleLog.save();

        return res.json({
          battleFinished: true,
          result: 'victory',
          battle: result.battle,
          actionResult: result.actionResult,
          rewards: {
            expGained: battleResult.expGained,
            leveledUp,
            newLevel: character.level,
            newStats: character.stats
          },
          log: battleResult.log
        });
      } else {
        // 패배 시
        const battleLog = new BattleLog({
          userId,
          dungeonId: battle.monster.type,
          result: 'lose',
          damageDealt: result.actionResult.damage || 0,
          expGained: 0,
          createdAt: new Date()
        });
        await battleLog.save();

        return res.json({
          battleFinished: true,
          result: 'defeat',
          battle: result.battle,
          actionResult: result.actionResult,
          message: '패배했습니다... 다음에는 더 강해져서 도전하세요!',
          log: battleResult.log
        });
      }
    }

    // 전투 진행 중
    res.json({
      battleFinished: false,
      battle: result.battle,
      actionResult: result.actionResult,
      nextTurn: result.battle.turn,
      availableActions: this.getAvailableActions(playStyle, result.battle.turn)
    });

  } catch (error) {
    console.error('전투 액션 오류:', error);
    res.status(500).json({ error: '전투 액션 처리에 실패했습니다.' });
  }
});

/**
 * GET /api/battle/:battleId
 * 전투 상태 조회
 */
router.get('/:battleId', async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user._id;

    const battle = battleService.getBattle(battleId);
    if (!battle) {
      return res.status(404).json({ error: '전투를 찾을 수 없습니다.' });
    }

    if (battle.playerId !== userId.toString()) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    const character = await Character.findOne({ userId });
    const playStyle = character?.playStyle || 'balanced';

    res.json({
      battle,
      availableActions: this.getAvailableActions(playStyle, battle.turn),
      combatStyle: battleService.getCombatStyle ? 
        battleService.getCombatStyle(playStyle) : null
    });

  } catch (error) {
    console.error('전투 조회 오류:', error);
    res.status(500).json({ error: '전투 정보를 가져올 수 없습니다.' });
  }
});

/**
 * POST /api/battle/end
 * 전투 강제 종료 (도망가기)
 */
router.post('/end', async (req, res) => {
  try {
    const { battleId } = req.body;
    const userId = req.user._id;

    const battle = battleService.getBattle(battleId);
    if (!battle) {
      return res.status(404).json({ error: '전투를 찾을 수 없습니다.' });
    }

    if (battle.playerId !== userId.toString()) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    // 전투 강제 종료
    const battleResult = battleService.endBattle(battleId);

    // 도망가기 로그 저장
    const battleLog = new BattleLog({
      userId,
      dungeonId: battle.monster.type,
      result: 'escape',
      damageDealt: 0,
      expGained: 0,
      createdAt: new Date()
    });
    await battleLog.save();

    res.json({
      success: true,
      result: 'escaped',
      message: '전투에서 도망쳤습니다.',
      log: battleResult ? battleResult.log : ['전투에서 도망쳤습니다.']
    });

  } catch (error) {
    console.error('전투 종료 오류:', error);
    res.status(500).json({ error: '전투 종료에 실패했습니다.' });
  }
});

/**
 * GET /api/battle/history
 * 전투 기록 조회
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 10, offset = 0 } = req.query;

    const battleHistory = await BattleLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const totalBattles = await BattleLog.countDocuments({ userId });
    const wins = await BattleLog.countDocuments({ userId, result: 'win' });
    const losses = await BattleLog.countDocuments({ userId, result: 'lose' });
    const escapes = await BattleLog.countDocuments({ userId, result: 'escape' });

    res.json({
      history: battleHistory,
      statistics: {
        totalBattles,
        wins,
        losses,
        escapes,
        winRate: totalBattles > 0 ? ((wins / totalBattles) * 100).toFixed(1) : 0
      },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: totalBattles,
        hasMore: (parseInt(offset) + parseInt(limit)) < totalBattles
      }
    });

  } catch (error) {
    console.error('전투 기록 조회 오류:', error);
    res.status(500).json({ error: '전투 기록을 가져올 수 없습니다.' });
  }
});

/**
 * 유틸리티 함수들
 */
function getAvailableActions(playStyle, currentTurn) {
  if (currentTurn !== 'player') {
    return [];
  }

  const baseActions = [
    { type: 'attack', name: '공격', description: '기본 공격을 합니다.' },
    { type: 'defend', name: '방어', description: '방어력을 일시적으로 증가시킵니다.' }
  ];

  // AI 스타일별 특수 스킬
  const styleSkills = {
    warrior: [
      { type: 'skill', skillType: 'power_strike', name: '강력한 일격', description: '강력한 공격을 가합니다.' },
      { type: 'skill', skillType: 'berserker', name: '광전사 모드', description: '공격력이 증가합니다.' }
    ],
    archer: [
      { type: 'skill', skillType: 'precise_shot', name: '정확한 사격', description: '높은 명중률의 공격입니다.' },
      { type: 'skill', skillType: 'multi_shot', name: '연속 사격', description: '여러 번 공격합니다.' }
    ],
    mage: [
      { type: 'skill', skillType: 'fireball', name: '화염구', description: '강력한 마법 공격입니다.' },
      { type: 'skill', skillType: 'ice_shard', name: '얼음 창', description: '적을 얼려 공격합니다.' }
    ],
    paladin: [
      { type: 'skill', skillType: 'holy_strike', name: '신성한 일격', description: '신성한 힘으로 공격합니다.' },
      { type: 'skill', skillType: 'heal', name: '치유', description: '체력을 회복합니다.' }
    ]
  };

  return [...baseActions, ...(styleSkills[playStyle] || [])];
}

module.exports = router;