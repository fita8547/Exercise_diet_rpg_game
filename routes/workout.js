const express = require('express');
const { authenticateToken } = require('../middlewares/auth');
const WorkoutLog = require('../models/WorkoutLog');
const characterService = require('../services/characterService');
const { workoutSchema } = require('../utils/validation');
const { calculateStatGain, getTodayString } = require('../utils/gameLogic');

const router = express.Router();
router.use(authenticateToken);

// 운동 기록 추가
router.post('/', async (req, res) => {
  try {
    const { error } = workoutSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { type, amount } = req.body;
    const userId = req.user._id;
    const today = getTodayString();

    // 오늘 이미 같은 운동을 했는지 확인
    const existingWorkout = await WorkoutLog.findOne({ userId, type, date: today });
    if (existingWorkout) {
      return res.status(400).json({ error: '오늘 이미 해당 운동을 기록했습니다.' });
    }

    // 능력치 증가 계산
    const statGained = calculateStatGain(type, amount);

    // 운동 로그 저장
    const workoutLog = new WorkoutLog({
      userId,
      type,
      amount,
      date: today,
      statGained
    });
    await workoutLog.save();

    // 캐릭터 능력치 업데이트
    const character = await characterService.updateStats(userId, statGained);

    res.json({
      message: '운동이 기록되었습니다.',
      workout: {
        type,
        amount,
        statGained
      },
      character: {
        level: character.level,
        stats: character.stats
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: '오늘 이미 해당 운동을 기록했습니다.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// 오늘의 운동 기록 조회
router.get('/today', async (req, res) => {
  try {
    const userId = req.user._id;
    const today = getTodayString();

    const todayWorkouts = await WorkoutLog.find({ userId, date: today });

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

module.exports = router;