# 🔧 개발 가이드

## 로컬 개발 환경 설정

### 필수 요구사항
- Python 3.9+
- pip 또는 conda

### 빠른 시작
```bash
# 1. 저장소 클론
git clone https://github.com/fita8547/Exercise_diet_rpg_game.git
cd Exercise_diet_rpg_game

# 2. 가상환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scriptsctivate

# 3. 의존성 설치
pip install -r requirements.txt

# 4. ML 모델 학습
python ai.py

# 5. 서버 실행
python main.py
```

## 주요 명령어
- `python chat_interface.py` - 실시간 채팅 테스트
- `python test_multiple_users.py` - 다중 사용자 시나리오 테스트
- `python create_massive_dummy_data.py` - 더미 데이터 재생성

## API 엔드포인트
- `GET /` - 서버 상태 확인
- `POST /users/{user_id}/profile` - 사용자 프로필 생성
- `POST /users/{user_id}/workouts` - 운동 기록 추가
- `POST /users/{user_id}/coaching` - AI 코칭 받기
- `GET /web` - 웹 인터페이스

## 개발 팁
1. 코드 수정 후 서버 재시작 필요
2. ML 모델 재학습시 `dropout_model.pkl` 삭제 후 `python ai.py` 실행
3. 새로운 사용자 데이터 추가시 `users_db.json` 수정
