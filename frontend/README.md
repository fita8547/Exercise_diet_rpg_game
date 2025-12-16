# 워킹 RPG 어드벤처 - 프론트엔드

React + TypeScript + Vite + Tailwind CSS로 제작된 웹 기반 RPG 운동 게임 프론트엔드입니다.

## 주요 기능

### 🏃‍♂️ 위치 기반 운동 추적
- **GPS 자동 추적**: 브라우저 Geolocation API 활용
- **실시간 거리 측정**: Haversine 공식으로 정확한 거리 계산
- **배터리 최적화**: 효율적인 위치 업데이트 간격
- **자동 운동 기록**: 100m마다 서버에 걷기 운동 자동 제출

### ⚔️ RPG 시스템
- **레벨 시스템**: 걸을수록 경험치 획득 및 레벨업
- **능력치 성장**: HP, 공격력, 방어력 자동 증가
- **퀘스트 시스템**: 1km 걷기 등 다양한 도전 과제
- **실시간 피드백**: 즉시 반영되는 성장 시스템

### 🎨 UI/UX 특징
- **노란색 테마**: 일관된 단색 디자인 (그라데이션 없음)
- **모바일 최적화**: 터치 친화적 인터페이스
- **직관적 조작**: 간단한 시작/정지 버튼
- **실시간 상태**: 추적 중 여부 명확 표시

### 🔒 보안 및 안정성
- **로컬 데이터**: 위치 정보는 기기에만 임시 저장
- **JWT 인증**: 안전한 사용자 인증 시스템
- **데이터 검증**: 비정상적 이동 감지 및 차단
- **HTTPS 필수**: 위치 권한을 위한 보안 연결

## 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빠른 개발 서버
- **Tailwind CSS** - 유틸리티 CSS 프레임워크
- **Lucide React** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트

## 로컬 개발 환경

1. **의존성 설치**
```bash
cd frontend
npm install
```

2. **환경 변수 설정**
```bash
cp .env.example .env
# .env 파일에서 백엔드 API URL 설정
```

3. **개발 서버 실행**
```bash
npm run dev
```

4. **브라우저에서 확인**
- http://localhost:3000 접속
- HTTPS 환경에서만 위치 권한 사용 가능

## 배포

### Vercel 배포
1. Vercel에 프로젝트 연결
2. 환경 변수 설정:
   - `VITE_API_URL`: 백엔드 API URL
3. 자동 배포 완료

### 환경 변수
```bash
VITE_API_URL=https://your-backend.railway.app/api
```

## 프로젝트 구조

```
frontend/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── AuthModal.tsx    # 로그인/회원가입 모달
│   │   └── RPGLocationSystem.tsx # 메인 게임 화면
│   ├── hooks/               # 커스텀 훅
│   │   ├── useAuth.ts       # 인증 관리
│   │   └── useLocationTracker.ts # 위치 추적
│   ├── services/            # API 서비스
│   │   └── api.ts           # 백엔드 API 호출
│   ├── types/               # TypeScript 타입 정의
│   │   └── index.ts
│   ├── App.tsx              # 메인 앱 컴포넌트
│   ├── main.tsx             # 앱 진입점
│   └── index.css            # 글로벌 스타일
├── public/                  # 정적 파일
├── index.html               # HTML 템플릿
└── package.json             # 프로젝트 설정
```

## 핵심 컴포넌트

### useLocationTracker Hook
- GPS 위치 추적 관리
- 거리 계산 및 누적
- 자동 운동 기록 제출
- 배터리 최적화

### RPGLocationSystem Component
- 메인 게임 화면
- 캐릭터 스탯 표시
- 퀘스트 진행 상황
- 위치 추적 컨트롤

### AuthModal Component
- 로그인/회원가입 UI
- 폼 검증 및 에러 처리
- JWT 토큰 관리

## 게임 밸런스

- **경험치**: 10m = 1 XP
- **레벨업**: 100 XP = 1 레벨
- **서버 전송**: 100m마다 자동 제출
- **일일 한도**: 최대 10km 측정
- **최소 이동**: 5m 이상만 인정

## 브라우저 호환성

- **Chrome/Edge**: 완전 지원
- **Safari**: iOS 14+ 지원
- **Firefox**: 위치 권한 지원
- **HTTPS 필수**: 위치 API 사용을 위해 필요

## 성능 최적화

- **지연 로딩**: 컴포넌트 분할
- **메모이제이션**: React.memo 활용
- **배터리 절약**: 효율적인 GPS 업데이트
- **로컬 캐싱**: 일일 거리 데이터 저장