/**
 * AI 몸 상태 분석 API 라우트
 * 체중 우열 판단 없이 게임 플레이 스타일만 분류
 */

const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const aiService = require('../services/aiService');
const Character = require('../models/Character');

const router = express.Router();
router.use(authenticateToken);

/**
 * POST /api/ai/analyze-body
 * 몸 상태 분석 및 플레이 스타일 결정
 */
router.post('/analyze-body', async (req, res) => {
  try {
    const { height, weight, activityLevel, goal } = req.body;
    const userId = req.user._id;

    // 입력 데이터 검증
    if (!height || !weight || !activityLevel || !goal) {
      return res.status(400).json({ 
        error: '모든 정보를 입력해주세요.' 
      });
    }

    if (height < 100 || height > 250) {
      return res.status(400).json({ 
        error: '키는 100cm ~ 250cm 사이로 입력해주세요.' 
      });
    }

    if (weight < 30 || weight > 200) {
      return res.status(400).json({ 
        error: '몸무게는 30kg ~ 200kg 사이로 입력해주세요.' 
      });
    }

    const validActivityLevels = ['low', 'moderate', 'high'];
    const validGoals = ['strength', 'endurance', 'habit', 'maintenance'];

    if (!validActivityLevels.includes(activityLevel)) {
      return res.status(400).json({ 
        error: '유효하지 않은 활동량입니다.' 
      });
    }

    if (!validGoals.includes(goal)) {
      return res.status(400).json({ 
        error: '유효하지 않은 목표입니다.' 
      });
    }

    // AI 분석 실행
    const analysisResult = aiService.analyzeBodyAndDetermineStyle({
      height,
      weight,
      activityLevel,
      goal
    });

    // 캐릭터 정보 업데이트
    const character = await Character.findOne({ userId });
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 플레이 스타일 및 보너스 적용
    character.playStyle = analysisResult.playStyle;
    character.stats.hp += analysisResult.statBonuses.hp;
    character.stats.attack += analysisResult.statBonuses.attack;
    character.stats.defense += analysisResult.statBonuses.defense;
    character.stats.stamina += analysisResult.statBonuses.stamina;
    
    // 분석 날짜 기록
    character.lastAnalysisDate = new Date();
    
    await character.save();

    // 분석 결과 저장 (별도 컬렉션에 저장할 수도 있음)
    const analysisLog = {
      userId,
      analysisDate: new Date(),
      inputData: { height, weight, activityLevel, goal },
      result: analysisResult,
      appliedBonuses: analysisResult.statBonuses
    };

    res.json({
      success: true,
      message: 'AI 분석이 완료되었습니다!',
      analysis: {
        playStyle: analysisResult.playStyle,
        styleName: analysisResult.styleName,
        description: analysisResult.description,
        gameCharacteristics: analysisResult.gameCharacteristics,
        recommendations: analysisResult.recommendations,
        combatStyle: analysisResult.combatStyle
      },
      bonusesApplied: analysisResult.statBonuses,
      updatedStats: {
        hp: character.stats.hp,
        attack: character.stats.attack,
        defense: character.stats.defense,
        stamina: character.stats.stamina
      },
      canReanalyze: false, // 하루에 한 번만 분석 가능
      nextAnalysisAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24시간 후
    });

  } catch (error) {
    console.error('AI 분석 오류:', error);
    res.status(500).json({ error: 'AI 분석에 실패했습니다.' });
  }
});

/**
 * GET /api/ai/current-style
 * 현재 플레이 스타일 조회
 */
router.get('/current-style', async (req, res) => {
  try {
    const userId = req.user._id;
    const character = await Character.findOne({ userId });

    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    if (!character.playStyle) {
      return res.json({
        hasStyle: false,
        message: 'AI 분석을 먼저 진행해주세요.',
        recommendAnalysis: true
      });
    }

    // 현재 스타일 정보 재생성
    const styleInfo = aiService.generateGameCharacteristics({ type: character.playStyle });
    const combatStyle = aiService.getCombatStyle(character.playStyle);
    const recommendations = aiService.generateRecommendations(character.playStyle);

    // 분석 가능 여부 확인 (24시간 제한)
    const canReanalyze = !character.lastAnalysisDate || 
      (Date.now() - character.lastAnalysisDate.getTime()) > 24 * 60 * 60 * 1000;

    res.json({
      hasStyle: true,
      playStyle: character.playStyle,
      styleInfo: {
        name: this.getStyleName(character.playStyle),
        description: this.getStyleDescription(character.playStyle),
        characteristics: styleInfo,
        combatStyle,
        recommendations
      },
      analysisDate: character.lastAnalysisDate,
      canReanalyze,
      nextAnalysisAvailable: canReanalyze ? 
        new Date() : 
        new Date(character.lastAnalysisDate.getTime() + 24 * 60 * 60 * 1000)
    });

  } catch (error) {
    console.error('스타일 조회 오류:', error);
    res.status(500).json({ error: '스타일 정보를 가져올 수 없습니다.' });
  }
});

/**
 * POST /api/ai/daily-update
 * 일일 플레이 스타일 업데이트 (활동 패턴 반영)
 */
router.post('/daily-update', async (req, res) => {
  try {
    const userId = req.user._id;
    const { recentActivity } = req.body; // 최근 활동 데이터

    const character = await Character.findOne({ userId });
    if (!character || !character.playStyle) {
      return res.status(404).json({ 
        error: '캐릭터 또는 플레이 스타일을 찾을 수 없습니다.' 
      });
    }

    // 일일 업데이트 가능 여부 확인
    const lastUpdate = character.lastStyleUpdate || new Date(0);
    const timeSinceUpdate = Date.now() - lastUpdate.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (timeSinceUpdate < oneDayMs) {
      return res.json({
        updated: false,
        message: '하루에 한 번만 업데이트할 수 있습니다.',
        nextUpdateAvailable: new Date(lastUpdate.getTime() + oneDayMs)
      });
    }

    // 스타일 업데이트 (현재는 기본 유지, 향후 확장 가능)
    const updatedStyle = aiService.updateDailyStyle(character.playStyle, recentActivity);
    
    character.playStyle = updatedStyle;
    character.lastStyleUpdate = new Date();
    await character.save();

    res.json({
      updated: true,
      message: '플레이 스타일이 업데이트되었습니다.',
      newStyle: updatedStyle,
      nextUpdateAvailable: new Date(Date.now() + oneDayMs)
    });

  } catch (error) {
    console.error('일일 업데이트 오류:', error);
    res.status(500).json({ error: '스타일 업데이트에 실패했습니다.' });
  }
});

/**
 * 유틸리티 함수들
 */
function getStyleName(playStyle) {
  const names = {
    warrior: '전사형 모험가',
    archer: '궁수형 모험가',
    mage: '마법사형 모험가',
    paladin: '성기사형 모험가'
  };
  return names[playStyle] || '균형형 모험가';
}

function getStyleDescription(playStyle) {
  const descriptions = {
    warrior: '정면 돌파를 선호하는 근접 전투 전문가',
    archer: '신중하고 전략적인 원거리 전투 전문가',
    mage: '지식과 기술을 활용하는 마법 전투 전문가',
    paladin: '균형잡힌 능력의 만능 전투 전문가'
  };
  return descriptions[playStyle] || '모든 상황에 적응하는 균형잡힌 모험가';
}

module.exports = router;