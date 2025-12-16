/**
 * 몬스터 조우 및 전투 시스템 API 라우트
 */

const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const battleService = require('../services/battleService');
const Character = require('../models/Character');

const router = express.Router();
router.use(authenticateToken);

/**
 * POST /api/encounter/check
 * 이동 거리 기반 몬스터 조우 확인
 */
router.post('/check', async (req, res) => {
  try {
    const { movementDistance } = req.body; // 미터 단위
    const userId = req.user._id;

    if (!movementDistance || movementDistance < 0) {
      return res.status(400).json({ 
        error: '유효한 이동 거리를 입력해주세요.' 
      });
    }

    // 캐릭터 정보 조회
    const character = await Character.findOne({ userId });
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    const playStyle = character.playStyle || 'balanced';
    const currentGauge = character.encounterGauge || 0;

    // 몬스터 조우 확인
    const encounterResult = battleService.checkMonsterEncounter(
      movementDistance, 
      playStyle, 
      currentGauge
    );

    // 조우 게이지 업데이트
    character.encounterGauge = encounterResult.newGauge;
    character.lastActiveDate = new Date();
    await character.save();

    if (encounterResult.encounterTriggered) {
      // 몬스터 조우 발생
      res.json({
        encounterTriggered: true,
        monster: encounterResult.monster,
        message: encounterResult.message,
        encounterGauge: 0,
        battleReady: true
      });
    } else {
      // 조우 없음, 게이지만 증가
      res.json({
        encounterTriggered: false,
        encounterGauge: encounterResult.newGauge,
        message: encounterResult.message,
        progress: `${encounterResult.newGauge}/100`,
        nextEncounterEstimate: Math.ceil((100 - encounterResult.newGauge) * 10) // 대략적인 필요 거리
      });
    }

  } catch (error) {
    console.error('조우 확인 오류:', error);
    res.status(500).json({ error: '조우 확인에 실패했습니다.' });
  }
});

/**
 * POST /api/encounter/force-encounter
 * 강제 몬스터 조우 (테스트용 또는 특별 이벤트)
 */
router.post('/force-encounter', async (req, res) => {
  try {
    const userId = req.user._id;
    const { monsterType, monsterLevel } = req.body;

    const character = await Character.findOne({ userId });
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    const playStyle = character.playStyle || 'balanced';
    
    let monster;
    if (monsterType && monsterLevel) {
      // 특정 몬스터 생성
      monster = battleService.createMonster(monsterType, monsterLevel);
    } else {
      // 랜덤 몬스터 생성
      monster = battleService.generateRandomMonster(playStyle, character.level);
    }

    // 조우 게이지 리셋
    character.encounterGauge = 0;
    await character.save();

    res.json({
      encounterTriggered: true,
      monster,
      message: `${monster.name}이(가) 갑자기 나타났다!`,
      encounterType: 'forced',
      battleReady: true
    });

  } catch (error) {
    console.error('강제 조우 오류:', error);
    res.status(500).json({ error: '강제 조우에 실패했습니다.' });
  }
});

/**
 * GET /api/encounter/gauge
 * 현재 조우 게이지 조회
 */
router.get('/gauge', async (req, res) => {
  try {
    const userId = req.user._id;
    const character = await Character.findOne({ userId });

    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    const encounterGauge = character.encounterGauge || 0;
    const playStyle = character.playStyle || 'balanced';
    
    // 스타일별 조우 확률 정보
    const encounterInfo = {
      currentGauge: encounterGauge,
      maxGauge: 100,
      progress: `${encounterGauge}/100`,
      percentage: encounterGauge,
      playStyle,
      styleMultiplier: battleService.getEncounterMultiplier(playStyle),
      estimatedDistance: Math.ceil((100 - encounterGauge) * 10), // 대략적인 필요 거리
      description: this.getEncounterDescription(playStyle)
    };

    res.json(encounterInfo);

  } catch (error) {
    console.error('게이지 조회 오류:', error);
    res.status(500).json({ error: '게이지 정보를 가져올 수 없습니다.' });
  }
});

/**
 * POST /api/encounter/reset-gauge
 * 조우 게이지 리셋 (관리자 또는 특별 아이템 사용)
 */
router.post('/reset-gauge', async (req, res) => {
  try {
    const userId = req.user._id;
    const character = await Character.findOne({ userId });

    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    character.encounterGauge = 0;
    await character.save();

    res.json({
      success: true,
      message: '조우 게이지가 리셋되었습니다.',
      newGauge: 0
    });

  } catch (error) {
    console.error('게이지 리셋 오류:', error);
    res.status(500).json({ error: '게이지 리셋에 실패했습니다.' });
  }
});

/**
 * 유틸리티 함수
 */
function getEncounterDescription(playStyle) {
  const descriptions = {
    warrior: '적극적으로 전투를 추구하여 몬스터 조우 확률이 높습니다.',
    archer: '신중하게 이동하여 몬스터 조우 확률이 낮습니다.',
    mage: '균형잡힌 탐험으로 보통의 조우 확률을 가집니다.',
    paladin: '안정적인 탐험으로 약간 높은 조우 확률을 가집니다.'
  };
  return descriptions[playStyle] || '균형잡힌 조우 확률을 가집니다.';
}

module.exports = router;