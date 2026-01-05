# create_massive_dummy_data.py
# 30개 사용자 + 각각 30일 운동 기록 생성

import json
import random
from datetime import date, timedelta
from free_ai_coach import UserProfile, WorkoutLog

def create_massive_dummy_data():
    """30명 사용자 x 30일 운동 기록 생성"""
    
    # 한국 이름 리스트
    names = [
        "민수", "지영", "현우", "서연", "준호", "예린", "태민", "소영", "동현", "하은",
        "성민", "유진", "재현", "나영", "승우", "다은", "건우", "채원", "시우", "수빈",
        "도윤", "아린", "준서", "윤서", "하준", "지우", "민준", "서현", "예준", "지민"
    ]
    
    goals = ["체력향상", "다이어트", "근력증가", "스트레스해소", "건강관리"]
    personalities = ["격려형", "도전형", "분석형", "친근형"]
    
    users_db = {}
    
    for i in range(30):
        user_id = f"user_{i+1:03d}"
        name = names[i]
        age = random.randint(14, 19)
        
        # 사용자 프로필 생성
        profile = UserProfile(
            user_id=user_id,
            age=age,
            name=name,
            workout_goal=random.choice(goals),
            personality_type=random.choice(personalities)
        )
        
        # 사용자별 성향 설정 (꾸준함 정도)
        base_consistency = random.uniform(0.3, 0.8)  # 30%~80% 기본 성공률
        condition_tendency = random.randint(2, 4)    # 평균 컨디션
        
        # 30일간 운동 기록 생성
        logs = []
        base_date = date.today() - timedelta(days=29)
        
        streak = 0
        last_fail_days_ago = random.randint(3, 10)
        
        for day in range(30):
            workout_date = base_date + timedelta(days=day)
            
            # 요일 효과 (주말이 조금 더 좋음)
            weekday = workout_date.weekday()
            weekday_bonus = 0.1 if weekday >= 5 else 0
            
            # 컨디션 (평균 주변으로 변동)
            condition = max(1, min(5, condition_tendency + random.randint(-1, 1)))
            
            # 난이도 (streak에 따라 조금씩 증가)
            difficulty = max(1, min(5, 2 + (streak // 5) + random.randint(-1, 1)))
            
            # 성공 확률 계산
            success_prob = (
                base_consistency +
                (condition - 3) * 0.1 +  # 컨디션 효과
                weekday_bonus -
                max(0, difficulty - condition) * 0.15 +  # 난이도가 컨디션보다 높으면 페널티
                (0.05 if last_fail_days_ago <= 1 else 0)  # 최근 실패 페널티
            )
            
            success_prob = max(0.1, min(0.9, success_prob))
            workout_completed = random.random() < success_prob
            
            # 운동 시간 계산
            if workout_completed:
                duration = max(5, difficulty * 3 + condition * 2 + random.randint(-5, 10))
                streak += 1
                last_fail_days_ago = min(last_fail_days_ago + 1, 30)
            else:
                duration = random.randint(0, 5)  # 실패시 짧은 시간 또는 0
                streak = 0
                last_fail_days_ago = 0
            
            log = WorkoutLog(
                user_id=user_id,
                date=workout_date.isoformat(),
                workout_completed=workout_completed,
                difficulty=difficulty,
                duration_minutes=duration,
                condition_score=condition
            )
            logs.append(log)
        
        # 사용자 데이터 저장
        users_db[user_id] = {
            "profile": {
                "user_id": profile.user_id,
                "age": profile.age,
                "name": profile.name,
                "workout_goal": profile.workout_goal,
                "personality_type": profile.personality_type
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
        
        # 통계 출력
        success_count = sum(1 for log in logs if log.workout_completed)
        success_rate = success_count / len(logs)
        
        print(f"✅ {name} ({age}세, {profile.workout_goal}): {success_count}/30일 ({success_rate:.1%})")
    
    # JSON 파일로 저장
    with open("users_db.json", "w", encoding="utf-8") as f:
        json.dump(users_db, f, ensure_ascii=False, indent=2)
    
    print(f"\n🎉 총 {len(users_db)}명의 사용자 데이터 생성 완료!")
    print(f"각 사용자당 30일 운동 기록 (총 {len(users_db) * 30}개 기록)")
    
    # 전체 통계
    total_records = sum(len(data["logs"]) for data in users_db.values())
    total_success = sum(
        sum(1 for log in data["logs"] if log["workout_completed"]) 
        for data in users_db.values()
    )
    
    print(f"전체 성공률: {total_success}/{total_records} ({total_success/total_records:.1%})")

if __name__ == "__main__":
    create_massive_dummy_data()