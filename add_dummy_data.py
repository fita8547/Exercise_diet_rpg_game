# add_dummy_data.py
# 테스트용 더미 데이터 추가

import json
from datetime import date, timedelta
from free_ai_coach import UserProfile, WorkoutLog

def add_dummy_data():
    """테스트용 더미 데이터 추가"""
    
    # 사용자 프로필
    user_profile = UserProfile(
        user_id="test_user_001",
        age=18,
        name="준수",
        workout_goal="체력향상",
        personality_type="도전형"
    )
    
    # 지난 7일간의 운동 기록 생성
    logs = []
    base_date = date.today() - timedelta(days=6)
    
    # 다양한 패턴의 운동 기록
    workout_patterns = [
        (True, 2, 10, 4),   # 성공
        (False, 3, 0, 2),   # 실패
        (True, 2, 8, 3),    # 성공
        (True, 3, 15, 4),   # 성공
        (False, 4, 0, 2),   # 실패
        (True, 2, 12, 3),   # 성공
        (True, 3, 18, 4),   # 성공 (오늘)
    ]
    
    for i, (completed, difficulty, duration, condition) in enumerate(workout_patterns):
        workout_date = base_date + timedelta(days=i)
        log = WorkoutLog(
            user_id="test_user_001",
            date=workout_date.isoformat(),
            workout_completed=completed,
            difficulty=difficulty,
            duration_minutes=duration,
            condition_score=condition
        )
        logs.append(log)
    
    # JSON 파일로 저장
    users_db = {
        "test_user_001": {
            "profile": {
                "user_id": user_profile.user_id,
                "age": user_profile.age,
                "name": user_profile.name,
                "workout_goal": user_profile.workout_goal,
                "personality_type": user_profile.personality_type
            },
            "logs": [
                {
                    "user_id": log.user_id,
                    "date": log.date,
                    "workout_completed": log.workout_completed,
                    "difficulty": log.difficulty,
                    "duration_minutes": log.duration_minutes,
                    "condition_score": log.condition_score
                }
                for log in logs
            ]
        }
    }
    
    with open("users_db.json", "w", encoding="utf-8") as f:
        json.dump(users_db, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 더미 데이터 추가 완료!")
    print(f"사용자: {user_profile.name}")
    print(f"운동 기록: {len(logs)}일")
    
    # 성공률 계산
    success_count = sum(1 for log in logs if log.workout_completed)
    print(f"성공률: {success_count}/{len(logs)} ({success_count/len(logs):.1%})")

if __name__ == "__main__":
    add_dummy_data()