const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/character');
const workoutRoutes = require('./routes/workout');
const locationRoutes = require('./routes/location');
const mapRoutes = require('./routes/map');
const aiRoutes = require('./routes/ai');
const encounterRoutes = require('./routes/encounter');
const battleRoutes = require('./routes/battle');

const app = express();

// 보안 미들웨어
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100 요청
});
app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rpg-workout')
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.error('MongoDB 연결 실패:', err));

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/character', characterRoutes);
app.use('/api/workout', workoutRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/encounter', encounterRoutes);
app.use('/api/battle', battleRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: 'RPG 운동 게임 API 서버' });
});

// 에러 핸들링
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});

module.exports = app;