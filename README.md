# 🎮 워킹 RPG 어드벤처 - Exercise Diet RPG Game

걸으면서 레벨업하고 강해지는 웹 기반 RPG 운동 게임!

![RPG Game](https://img.shields.io/badge/Game-RPG-yellow)
![React](https://img.shields.io/badge/React-18.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue)

## 🌟 주요 기능

### 🏃‍♂️ GPS 기반 운동 추적
- **실시간 위치 추적**: 브라우저 Geolocation API 활용
- **정확한 거리 측정**: Haversine 공식으로 이동 거리 계산
- **자동 운동 기록**: 100m마다 서버에 걷기 운동 자동 제출
- **배터리 최적화**: 효율적인 위치 업데이트로 전력 절약

### ⚔️ RPG 게임 시스템
- **실시간 성장**: 10m = 1 경험치, 걸을수록 레벨업
- **캐릭터 스탯**: HP, 공격력, 방어력 자동 증가
- **턴제 전투**: 던전 몬스터와의 전략적 전투
- **몬스터 조우**: 걷기 중 랜덤 몬스터 조우 시스템

### 🧠 AI 몸 상태 분석
- **윤리적 분석**: 체중 우열 판단 없이 상태 유형만 분류
- **4가지 플레이 스타일**: 전사형, 마법사형, 궁수형, 성기사형
- **맞춤형 보너스**: 개인별 능력치 보너스 제공
- **개인화 추천**: AI 기반 운동 및 게임 스타일 추천

### 🗺️ 시각적 게임 맵
- **5x5 그리드 맵**: 주변 지역 시각화
- **실시간 표시**: 몬스터, 던전, 보물 위치 표시
- **조우 게이지**: 몬스터 조우 확률 실시간 표시
- **목표 안내**: 다음 목표까지의 거리와 방향 안내

## 🚀 빠른 시작

### 개발 환경 실행

1. **저장소 클론**
```bash
git clone https://github.com/fita8547/Exercise_diet_rpg_game.git
cd Exercise_diet_rpg_game
```

2. **백엔드 실행**
```bash
npm install
npm run dev:memory  # MongoDB 없이 메모리 DB 사용
```

3. **프론트엔드 실행** (새 터미널)
```bash
cd frontend
npm install
npm run dev
```

4. **브라우저에서 접속**
- http://localhost:3000 접속
- "🎮 데모로 바로 시작" 클릭
- 위치 권한 허용 후 게임 시작!

### 배포 환경

#### 백엔드 (Railway)
```bash
# MongoDB 연결 후
npm run seed  # 던전 데이터 생성
npm start     # 프로덕션 서버 실행
```

#### 프론트엔드 (Vercel)
```bash
cd frontend
npm run build
# Vercel에 자동 배포
```

## 🎯 게임 플레이 가이드

### 기본 플레이
1. **AI 분석**: 키, 몸무게, 활동량, 목표 입력으로 플레이 스타일 분석
2. **걷기 시작**: GPS 추적 시작하여 실제 걷기로 경험치 획득
3. **몬스터 조우**: 조우 게이지 100% 달성 시 랜덤 몬스터 등장
4. **던전 탐험**: 레벨에 맞는 던전에서 강력한 몬스터와 전투
5. **캐릭터 성장**: 레벨업으로 능력치 증가 및 새로운 던전 해금

### 플레이 스타일별 특징
- **⚔️ 전사형**: 높은 공격력과 방어력, 근접 전투 특화
- **🏹 궁수형**: 높은 스태미나와 회피력, 지구력 중심
- **🔮 마법사형**: 균형잡힌 능력치, 습관 형성에 특화
- **🛡️ 성기사형**: 만능형 능력치, 모든 상황에 적응

## 🛠️ 기술 스택

### 프론트엔드
- **React 18** + **TypeScript** - 타입 안전한 UI 개발
- **Vite** - 빠른 개발 서버 및 빌드
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Lucide React** - 일관된 아이콘 시스템
- **Axios** - HTTP 클라이언트

### 백엔드
- **Node.js** + **Express** - 웹 서버
- **MongoDB** + **Mongoose** - 데이터베이스
- **JWT** - 사용자 인증
- **bcryptjs** - 비밀번호 해싱
- **Helmet** + **CORS** - 보안 미들웨어

### 배포
- **Vercel** - 프론트엔드 배포
- **Railway** - 백엔드 배포
- **MongoDB Atlas** - 클라우드 데이터베이스

## 📱 지원 환경

- **브라우저**: Chrome, Safari, Firefox, Edge (최신 버전)
- **모바일**: iOS 14+, Android 8+ 브라우저
- **HTTPS 필수**: 위치 API 사용을 위해 보안 연결 필요

## 🔒 보안 및 개인정보

- **위치 정보**: 기기에만 임시 저장, 서버에는 지역 ID만 전송
- **개인 데이터**: JWT 토큰 기반 인증, bcrypt 해싱
- **AI 분석**: 체중 우열 판단 없는 윤리적 분석
- **데이터 보호**: 모든 민감 정보 암호화 저장

## 🎮 게임 밸런스

### 경험치 시스템
- **걷기**: 10m = 1 XP
- **던전 전투**: 25~300 XP (던전별 차등)
- **레벨업**: 레벨 N → N+1 = N × 100 XP

### 능력치 증가
- **레벨업**: HP +20, 공격력 +3, 방어력 +2, 스태미나 +10
- **AI 보너스**: 플레이 스타일별 추가 보너스
- **운동 보너스**: 팔굽혀펴기(공격력), 스쿼트(방어력), 플랭크(스태미나), 걷기(HP)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 질문이나 제안사항이 있으시면 이슈를 생성해 주세요.

---

**🎯 목표**: 재미있는 게임을 통해 건강한 운동 습관을 만들어보세요!
**🏃‍♂️ 시작**: 지금 바로 걸으면서 레벨업하는 모험을 시작하세요!