# test_multiple_users.py
# 여러 사용자의 AI 코칭 테스트

import requests
import json

BASE_URL = "http://localhost:8000"

def test_multiple_users():
    """여러 사용자의 AI 코칭 테스트"""
    
    # 테스트할 사용자들
    test_users = [
        "user_001",  # 민수 (50% 성공률)
        "user_002",  # 지영 (76.7% 성공률)
        "user_003",  # 현우 (90% 성공률)
        "user_021",  # 도윤 (26.7% 성공률 - 낮음)
        "user_026",  # 지우 (90% 성공률 - 높음)
    ]
    
    for user_id in test_users:
        print(f"\n{'='*50}")
        
        # 1. 사용자 프로필 조회
        try:
            profile_response = requests.get(f"{BASE_URL}/users/{user_id}/profile")
            profile = profile_response.json()
            
            print(f"👤 사용자: {profile['name']} ({profile['age']}세)")
            print(f"🎯 목표: {profile['workout_goal']}")
            print(f"🎭 성격: {profile['personality_type']}")
            
        except Exception as e:
            print(f"❌ 프로필 조회 실패: {e}")
            continue
        
        # 2. 통계 조회
        try:
            stats_response = requests.get(f"{BASE_URL}/users/{user_id}/stats")
            stats = stats_response.json()
            
            print(f"📊 전체 성공률: {stats['total_success_rate']}%")
            print(f"🔥 연속 성공: {stats['current_streak']}일")
            print(f"📈 최근 7일: {stats['recent_7_days_success']}")
            
        except Exception as e:
            print(f"❌ 통계 조회 실패: {e}")
            continue
        
        # 3. AI 코칭 받기 (다양한 컨디션으로)
        conditions = [2, 3, 4]  # 낮음, 보통, 좋음
        
        for condition in conditions:
            try:
                coaching_request = {"current_condition": condition}
                coaching_response = requests.post(
                    f"{BASE_URL}/users/{user_id}/coaching", 
                    json=coaching_request
                )
                
                if coaching_response.status_code == 200:
                    result = coaching_response.json()
                    
                    print(f"\n🤖 컨디션 {condition}일 때 AI 분석:")
                    print(f"   위험도: {result['analysis']['dropout_risk']}")
                    print(f"   추천 난이도: {result['analysis']['recommended_difficulty']}")
                    print(f"   💬 메시지: {result['ai_message']}")
                    break  # 첫 번째 성공한 컨디션으로만 테스트
                else:
                    print(f"   컨디션 {condition}: {coaching_response.json()['detail']}")
                    
            except Exception as e:
                print(f"   컨디션 {condition} 오류: {e}")

def test_specific_scenarios():
    """특정 시나리오 테스트"""
    
    print(f"\n{'='*60}")
    print("🎯 특별 시나리오 테스트")
    print(f"{'='*60}")
    
    scenarios = [
        ("user_021", "도윤 (26.7% - 포기 위험 높음)", 2),
        ("user_003", "현우 (90% - 성공률 높음)", 4),
        ("user_001", "민수 (50% - 중간)", 3),
    ]
    
    for user_id, description, condition in scenarios:
        print(f"\n📋 시나리오: {description}")
        
        try:
            coaching_request = {"current_condition": condition}
            response = requests.post(f"{BASE_URL}/users/{user_id}/coaching", json=coaching_request)
            
            if response.status_code == 200:
                result = response.json()
                
                print(f"🔍 분석 결과:")
                print(f"   포기 확률: {result['analysis']['dropout_probability']}")
                print(f"   위험도: {result['analysis']['dropout_risk']}")
                print(f"   현재→추천 난이도: {result['analysis']['current_difficulty']}→{result['analysis']['recommended_difficulty']}")
                print(f"   최근 성공률: {result['performance']['success_rate']:.1%}")
                print(f"   연속 성공: {result['performance']['streak']}일")
                print(f"")
                print(f"💬 AI 메시지:")
                print(f"   \"{result['ai_message']}\"")
            else:
                print(f"❌ 오류: {response.json()}")
                
        except Exception as e:
            print(f"❌ 요청 실패: {e}")

if __name__ == "__main__":
    print("🏃‍♂️ 다중 사용자 AI 코칭 테스트 시작")
    
    test_multiple_users()
    test_specific_scenarios()
    
    print(f"\n{'='*60}")
    print("✅ 테스트 완료!")
    print("💡 웹 인터페이스: http://localhost:8000/web")
    print("📚 API 문서: http://localhost:8000/docs")