# Java Spring Boot 서버로 마이그레이션 완료! 🎉

기존 Node.js + Express 서버를 Java Spring Boot로 성공적으로 변환했습니다.

## 🚀 빠른 시작

### 1. Java 서버 실행
```bash
cd java-server
./start.sh
```

### 2. 프론트엔드 실행 (별도 터미널)
```bash
cd frontend
npm run dev
```

## 📋 변경 사항

### ✅ 완료된 기능
- **인증 시스템**: JWT 기반 로그인/회원가입
- **캐릭터 시스템**: 레벨, 경험치, 스탯 관리
- **운동 기록**: 푸시업, 스쿼트, 플랭크, 걷기
- **위치 추적**: GPS 기반 걷기 거리 측정
- **전투 시스템**: 던전 탐험 및 몬스터 전투
- **관리자 계정**: junsu@admin.com / sungo8547!
- **보안**: Spring Security + JWT
- **데이터베이스**: MongoDB 연동

### 🔧 기술 스택 변경
| 기존 (Node.js) | 새로운 (Java) |
|---|---|
| Express.js | Spring Boot 3.2 |
| bcryptjs | Spring Security BCrypt |
| jsonwebtoken | JJWT |
| mongoose | Spring Data MongoDB |
| joi | Bean Validation |

## 🏗️ 프로젝트 구조

```
java-server/
├── src/main/java/com/rpgworkout/
│   ├── RpgWorkoutApplication.java     # 메인 애플리케이션
│   ├── config/                       # 설정 클래스
│   ├── controller/                   # REST 컨트롤러
│   ├── service/                      # 비즈니스 로직
│   ├── repository/                   # 데이터 접근 계층
│   ├── model/                        # 엔티티 모델
│   ├── dto/                          # 데이터 전송 객체
│   ├── security/                     # 보안 설정
│   └── exception/                    # 예외 처리
├── src/main/resources/
│   └── application.yml               # 애플리케이션 설정
├── pom.xml                          # Maven 의존성
└── README.md                        # 상세 문서
```

## 🔑 주요 API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 캐릭터
- `GET /api/character` - 캐릭터 정보
- `POST /api/character/reset` - 캐릭터 초기화

### 운동
- `POST /api/workout` - 운동 기록
- `GET /api/workout/today` - 오늘의 운동
- `GET /api/workout/history` - 운동 히스토리

### 위치
- `POST /api/location` - 위치 업데이트
- `POST /api/location/update` - 걷기 거리 업데이트
- `POST /api/location/reset` - 거리 초기화

### 전투
- `GET /api/battle/dungeons` - 던전 목록
- `POST /api/battle/start` - 전투 시작
- `POST /api/battle/end` - 전투 종료

## 🛠️ 개발 환경 설정

### 필수 요구사항
- **Java 17** 이상
- **Maven 3.6** 이상
- **MongoDB 4.4** 이상

### MongoDB 설치
```bash
# macOS
brew install mongodb-community
brew services start mongodb-community

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb

# Docker
docker run -d -p 27017:27017 mongo
```

## 🎮 게임 기능

모든 기존 게임 기능이 Java 서버에서 동일하게 작동합니다:

- ✅ GPS 기반 걷기 추적
- ✅ 21개 던전 (거리 기반 해금)
- ✅ 레벨업 시스템
- ✅ 전투 시스템
- ✅ 코스튬 상점
- ✅ 랭킹 시스템
- ✅ AI 몸 상태 분석
- ✅ 관리자 대시보드

## 🔍 로그 및 디버깅

Java 서버는 상세한 로그를 제공합니다:
- 사용자 인증 로그
- 운동 기록 로그
- 전투 시스템 로그
- 오류 및 예외 로그

## 🚨 문제 해결

### MongoDB 연결 오류
```bash
# MongoDB 상태 확인
brew services list | grep mongodb

# MongoDB 재시작
brew services restart mongodb-community
```

### 포트 충돌
`java-server/src/main/resources/application.yml`에서 포트 변경:
```yaml
server:
  port: 8080  # 3001 대신 8080 사용
```

## 🎯 다음 단계

1. **Java 서버 실행**: `cd java-server && ./start.sh`
2. **프론트엔드 실행**: `cd frontend && npm run dev`
3. **게임 테스트**: http://localhost:3000
4. **관리자 로그인**: junsu@admin.com / sungo8547!

Java Spring Boot 서버로의 마이그레이션이 완료되었습니다! 🎉