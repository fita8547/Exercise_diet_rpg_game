# RPG Workout Backend (Java Spring Boot)

웹 기반 RPG 운동 게임의 Java Spring Boot 백엔드 서버입니다.

## 기술 스택

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** (JWT 인증)
- **Spring Data MongoDB**
- **Maven**
- **MongoDB**

## 주요 기능

- 🔐 JWT 기반 사용자 인증/인가
- 👤 캐릭터 시스템 (레벨, 경험치, 스탯)
- 🏃‍♂️ 운동 기록 및 추적
- 📍 GPS 위치 기반 걷기 거리 측정
- ⚔️ 던전 전투 시스템
- 🏆 랭킹 시스템
- 👕 코스튬 상점
- 👑 관리자 시스템

## 설치 및 실행

### 1. 사전 요구사항

- Java 17 이상
- Maven 3.6 이상
- MongoDB 4.4 이상

### 2. MongoDB 설치 및 실행

```bash
# macOS (Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Ubuntu
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### 3. 프로젝트 빌드 및 실행

```bash
# 프로젝트 클론 후 java-server 디렉토리로 이동
cd java-server

# 의존성 설치 및 빌드
mvn clean install

# 애플리케이션 실행
mvn spring-boot:run

# 또는 JAR 파일로 실행
java -jar target/rpg-workout-backend-1.0.0.jar
```

### 4. 환경 변수 설정

`application.yml` 파일을 수정하거나 환경 변수를 설정하세요:

```bash
export MONGODB_URI=mongodb://localhost:27017/rpg-workout
export JWT_SECRET=your-super-secret-jwt-key
```

## API 엔드포인트

### 인증
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인

### 캐릭터
- `GET /api/character` - 캐릭터 정보 조회
- `POST /api/character/reset` - 캐릭터 초기화

### 운동
- `POST /api/workout` - 운동 기록
- `GET /api/workout/today` - 오늘의 운동 기록
- `GET /api/workout/history` - 운동 기록 히스토리

### 위치
- `POST /api/location` - 위치 업데이트
- `POST /api/location/update` - 걷기 거리 업데이트
- `POST /api/location/reset` - 걷기 거리 초기화

### 전투
- `GET /api/battle/dungeons` - 던전 목록
- `POST /api/battle/start` - 전투 시작
- `POST /api/battle/end` - 전투 종료
- `GET /api/battle/history` - 전투 기록

## 기본 관리자 계정

- **이메일**: junsu@admin.com
- **비밀번호**: sungo8547!
- **레벨**: 100
- **특권**: 모든 던전 접근 가능

## 개발 모드

개발 중에는 다음과 같이 실행할 수 있습니다:

```bash
# 개발 모드로 실행 (자동 재시작)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 또는 IDE에서 RpgWorkoutApplication.java 실행
```

## 로그 확인

애플리케이션 로그는 콘솔에 출력되며, 다음과 같은 정보를 포함합니다:

- 사용자 인증 및 권한 확인
- 운동 기록 및 캐릭터 업데이트
- 전투 시스템 동작
- 오류 및 예외 처리

## 프론트엔드 연동

이 서버는 React 프론트엔드와 연동됩니다:

1. 프론트엔드에서 `http://localhost:3001/api`로 API 요청
2. JWT 토큰을 `Authorization: Bearer <token>` 헤더에 포함
3. CORS 설정으로 `localhost:3000`에서의 요청 허용

## 문제 해결

### MongoDB 연결 오류
```bash
# MongoDB 상태 확인
brew services list | grep mongodb  # macOS
sudo systemctl status mongodb      # Ubuntu

# MongoDB 재시작
brew services restart mongodb-community  # macOS
sudo systemctl restart mongodb           # Ubuntu
```

### 포트 충돌
기본 포트 3001이 사용 중인 경우 `application.yml`에서 변경:
```yaml
server:
  port: 8080
```

## 라이센스

MIT License