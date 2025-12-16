/**
 * 지도 시스템 API 라우트
 * GPS → 게임 그리드 변환 및 지역 콘텐츠 관리
 */

const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const mapService = require('../services/mapService');
const Character = require('../models/Character');
const LocationLog = require('../models/LocationLog');

const router = express.Router();
router.use(authenticateToken);

/**
 * POST /api/map/update-location
 * GPS 위치 업데이트 및 게임 그리드 변환
 */
router.post('/update-location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    // GPS → 그리드 변환
    const gridData = mapService.convertToGrid(latitude, longitude);
    
    // 캐릭터 정보 조회
    const character = await Character.findOne({ userId });
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 위치 로그 저장 (좌표는 저장하지 않고 그리드만)
    const locationLog = new LocationLog({
      userId,
      latitude: 0, // 실제 좌표 대신 0으로 저장
      longitude: 0,
      regionId: gridData.cellId,
      createdAt: new Date()
    });
    await locationLog.save();

    // 캐릭터 현재 지역 업데이트
    const oldRegion = character.currentRegion;
    character.currentRegion = gridData.cellId;
    character.lastActiveDate = new Date();
    await character.save();

    // 5x5 맵 생성 (AI 스타일 반영)
    const playStyle = character.playStyle || 'balanced';
    const gameMap = mapService.generateMap(gridData.gridX, gridData.gridY, playStyle);
    
    // 다음 목표 찾기
    const nextTarget = mapService.findNearestTarget(gameMap);

    res.json({
      success: true,
      gridPosition: {
        x: gridData.gridX,
        y: gridData.gridY,
        cellId: gridData.cellId
      },
      map: gameMap,
      nextTarget,
      regionChanged: oldRegion !== gridData.cellId,
      message: oldRegion !== gridData.cellId ? 
        '새로운 지역에 도착했습니다!' : 
        '위치가 업데이트되었습니다.'
    });

  } catch (error) {
    console.error('위치 업데이트 오류:', error);
    res.status(500).json({ error: '위치 업데이트에 실패했습니다.' });
  }
});

/**
 * GET /api/map/current-grid
 * 현재 그리드 맵 조회
 */
router.get('/current-grid', async (req, res) => {
  try {
    const userId = req.user._id;
    const character = await Character.findOne({ userId });
    
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 현재 위치 기준 맵 생성
    const playStyle = character.playStyle || 'balanced';
    const gameMap = mapService.generateMap(2, 2, playStyle); // 중앙 위치
    const nextTarget = mapService.findNearestTarget(gameMap);

    res.json({
      currentRegion: character.currentRegion,
      map: gameMap,
      nextTarget,
      playStyle
    });

  } catch (error) {
    console.error('맵 조회 오류:', error);
    res.status(500).json({ error: '맵 정보를 가져올 수 없습니다.' });
  }
});

/**
 * GET /api/map/next-target
 * 다음 목표 정보 조회
 */
router.get('/next-target', async (req, res) => {
  try {
    const userId = req.user._id;
    const character = await Character.findOne({ userId });
    
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    const playStyle = character.playStyle || 'balanced';
    const gameMap = mapService.generateMap(2, 2, playStyle);
    const nextTarget = mapService.findNearestTarget(gameMap);

    if (!nextTarget) {
      return res.json({
        hasTarget: false,
        message: '근처에 목표가 없습니다. 더 이동해보세요!'
      });
    }

    res.json({
      hasTarget: true,
      target: {
        type: nextTarget.type,
        name: nextTarget.content?.name || `${nextTarget.type} 지역`,
        distance: nextTarget.realDistanceMeters,
        direction: nextTarget.direction,
        level: nextTarget.content?.level || 1,
        reward: nextTarget.content?.expReward || 0
      },
      guidance: {
        message: `${nextTarget.direction}으로 약 ${nextTarget.realDistanceMeters}m 이동하세요`,
        icon: nextTarget.type === 'monster' ? '⚔️' : '🏰'
      }
    });

  } catch (error) {
    console.error('목표 조회 오류:', error);
    res.status(500).json({ error: '목표 정보를 가져올 수 없습니다.' });
  }
});

/**
 * POST /api/map/explore-cell
 * 특정 셀 탐험 (도달했을 때)
 */
router.post('/explore-cell', async (req, res) => {
  try {
    const { cellId } = req.body;
    const userId = req.user._id;

    const character = await Character.findOne({ userId });
    if (!character) {
      return res.status(404).json({ error: '캐릭터를 찾을 수 없습니다.' });
    }

    // 셀 내용 생성
    const playStyle = character.playStyle || 'balanced';
    const [x, y] = cellId.split('_').map(Number);
    const cellContent = mapService.determineCellType(x, y, playStyle, false);

    let result = {
      cellId,
      explored: true,
      content: cellContent
    };

    // 셀 타입별 처리
    switch (cellContent.type) {
      case 'treasure':
        // 보물 발견
        const expGain = cellContent.content.value;
        character.exp += expGain;
        
        // 레벨업 체크
        const leveledUp = character.checkLevelUp();
        await character.save();

        result.reward = {
          type: 'experience',
          amount: expGain,
          leveledUp,
          newLevel: character.level
        };
        break;

      case 'safe':
        // 안전 지역 - 체력 회복
        const healAmount = Math.floor(character.stats.hp * 0.1);
        character.stats.hp = Math.min(
          character.stats.hp + healAmount,
          character.stats.hp + 50 // 최대 체력 제한
        );
        await character.save();

        result.reward = {
          type: 'healing',
          amount: healAmount
        };
        break;

      default:
        result.reward = null;
    }

    res.json(result);

  } catch (error) {
    console.error('셀 탐험 오류:', error);
    res.status(500).json({ error: '탐험에 실패했습니다.' });
  }
});

module.exports = router;