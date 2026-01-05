# test_api.py
# API 테스트 스크립트

import requests
import json
from datetime import date, timedelta

BASE_URL = "http://localhost:8000"

def test_full_workflow():
    """전체 워크플로우 테스트"""
    
    # 1. 사용자 생성
    user_id = "test_user_001"
    profile_data = {
        "name": "준수",
        "age": 18,
        "workout_goal": "체력향상",
        "personality_type": "도전형"
    }
    
    print("1. 사용자 프로필 생성...")
    response = requests.post(f"{BASE_URL}/users/{user_id}/profile", json=profile_data)
    print(f"응답: {response.json()}")
    
    # 2. 여러 날의 운동 기록 추가 (더미 데이터)
    print("\n2. 운동 기록 추가...")
    
    # 과거 날짜로 더미 데이터 생성 (실제로는 날짜별로 기록해야 하지만 테스트용)
    workout_records = [
        {"workout_completed": True, "difficulty": 2, "duration_minutes": 10, "condition_score": 4},
        {"workout_completed": False, "difficulty": 3, "duration_minutes": 0, "condition_score": 2},
        {"workout_completed": True, "difficulty": 2, "duration_minutes": 8, "condition_score": 3},
        {"workout_completed": True, "difficulty": 3, "duration_minutes": 15, "condition_score": 4},
    ]
    
    # 직접 데이터베이스에 추가 (실제 서비스에서는 날짜별로 기록)
    import sys
    sys.path.append('.')
    from free_ai_coach import WorkoutLog
    
    # 서버의 users_db에 직접 추가하는 방식으로 테스트
    # (실제로는 각 날짜별로 API 호출해야 함)
    
    # 3. 현재 날짜 운동 기록
    today_workout = {
        "workout_completed": True,
        "difficulty": 3,
        "duration_minutes": 12,
        "condition_score": 3
    }
    
    try:
        response = requests.post(f"{BASE_URL}/users/{user_id}/workouts", json=today_workout)
        print(f"오늘 운동 기록: {response.json()}")
    except:
        print("오늘 운동은 이미 기록됨")
    
    # 4. 통계 조회
    print("\n3. 사용자 통계 조회...")
    response = requests.get(f"{BASE_URL}/users/{user_id}/stats")
    print(f"통계: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    # 5. AI 코칭 받기
    print("\n4. AI 코칭 조언...")
    coaching_request = {"current_condition": 3}
    
    try:
        response = requests.post(f"{BASE_URL}/users/{user_id}/coaching", json=coaching_request)
        result = response.json()
        
        print("🤖 AI 코칭 결과:")
        print(f"사용자: {result['user_name']}")
        print(f"포기 위험도: {result['analysis']['dropout_risk']}")
        print(f"추천 난이도: {result['analysis']['recommended_difficulty']}")
        print(f"최근 성공률: {result['performance']['success_rate']:.1%}")
        print(f"연속 성공: {result['performance']['streak']}일")
        print(f"AI 메시지: {result['ai_message']}")
        
    except Exception as e:
        print(f"AI 코칭 오류: {e}")
        # 응답 내용 확인
        try:
            response = requests.post(f"{BASE_URL}/users/{user_id}/coaching", json=coaching_request)
            print(f"응답 상태: {response.status_code}")
            print(f"응답 내용: {response.text}")
        except Exception as e2:
            print(f"요청 자체 실패: {e2}")

if __name__ == "__main__":
    test_full_workflow()