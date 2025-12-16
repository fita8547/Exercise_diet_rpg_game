const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const LocationLog = require('../models/LocationLog');
const characterService = require('../services/characterService');
const { locationSchema } = require('../utils/validation');
const { getRegionFromCoordinates, calculateDistance } = require('../utils/gameLogic');

const router = express.Router();
router.use(authenticateToken);

// 위치 업데이트
router.post('/', async (req, res) => {
  try {
    const { error } = locationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { latitude, longitude } = req.body;
    const userId = req.user._id;

    // 이전 위치와의 거리 확인 (치트 방지)
    const lastLocation = await LocationLog.findOne({ userId }).sort({ createdAt: -1 });
    if (lastLocation) {
      const distance = calculateDistance(
        lastLocation.latitude, lastLocation.longitude,
        latitude, longitude
      );
      
      // 1시간 내에 100km 이상 이동 시 무시
      const timeDiff = (Date.now() - lastLocation.createdAt.getTime()) / (1000 * 60 * 60);
      if (distance > 100 && timeDiff < 1) {
        return res.status(400).json({ error: '비정상적인 위치 이동이 감지되었습니다.' });
      }
    }

    // 지역 ID 계산
    const regionId = getRegionFromCoordinates(latitude, longitude);

    // 위치 로그 저장
    const locationLog = new LocationLog({
      userId,
      latitude,
      longitude,
      regionId
    });
    await locationLog.save();

    // 캐릭터 지역 업데이트
    const { character, regionChanged } = await characterService.updateRegion(userId, regionId);

    res.json({
      message: regionChanged ? '새로운 지역에 도착했습니다!' : '위치가 업데이트되었습니다.',
      regionId,
      regionChanged,
      character: {
        currentRegion: character.currentRegion
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 현재 지역 정보 조회
router.get('/region/current', async (req, res) => {
  try {
    const character = await characterService.getOrCreateCharacter(req.user._id);
    
    res.json({
      currentRegion: character.currentRegion
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;