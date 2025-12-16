const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const characterService = require('../services/characterService');

const router = express.Router();

// 모든 라우트에 인증 미들웨어 적용
router.use(authenticateToken);

// 캐릭터 정보 조회
router.get('/', async (req, res) => {
  try {
    const character = await characterService.getOrCreateCharacter(req.user._id);
    
    res.json({
      character: {
        level: character.level,
        exp: character.exp,
        requiredExp: character.getRequiredExp(),
        stats: character.stats,
        currentRegion: character.currentRegion,
        lastActiveDate: character.lastActiveDate
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;