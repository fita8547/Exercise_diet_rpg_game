# chat_interface.py
# 실시간 AI 코치 채팅 인터페이스

import requests
import json
from datetime import date, timedelta
from free_ai_coach import UserProfile, WorkoutLog, SmartFitnessCoach
import os

class RealTimeAICoach:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        
        # 로컬 AI 모델 로드 (서버 없이도 작동)
        if os.path.exists("dropout_model.pkl"):
            self.local_coach = SmartFitnessCoach("dropout_model.pkl")
        else:
            self.local_coach = None
            print("❌ ML 모델을 찾을 수 없습니다. ai.py를 먼저 실행해주세요.")
    
    def analyze_user_input(self, user_input: str) -> dict:
        """사용자 입력을 분석해서 운동 상황 파악"""
        
        print(f"\n🤖 AI가 당신의 상황을 분석 중...")
        print(f"입력: \"{user_input}\"")
        
        # 키워드 기반 상황 분석
        analysis = {
            "workout_completed": None,
            "difficulty": 3,
            "duration_minutes": 10,
            "condition_score": 3,
            "emotional_state": "neutral",
            "confidence": 0.7
        }
        
        user_input_lower = user_input.lower()
        
        # 운동 완료 여부 판단
        success_keywords = ["했어", "완료", "성공", "끝냈어", "다했어", "운동했어"]
        fail_keywords = ["못했어", "실패", "포기", "안했어", "빼먹었어", "그만뒀어"]
        
        if any(word in user_input_lower for word in fail_keywords):
            analysis["workout_completed"] = False
        elif any(word in user_input_lower for word in success_keywords):
            analysis["workout_completed"] = True
        
        # 난이도 추정
        hard_keywords = ["힘들", "어려", "빡세", "죽겠", "너무"]
        easy_keywords = ["쉬", "가볍", "간단", "적당"]
        
        if any(word in user_input_lower for word in hard_keywords):
            analysis["difficulty"] = 4
        elif any(word in user_input_lower for word in easy_keywords):
            analysis["difficulty"] = 2
        
        # 컨디션 추정
        good_condition = ["좋", "괜찮", "컨디션", "최고", "완벽"]
        bad_condition = ["피곤", "아파", "힘들", "안좋", "최악", "몸살"]
        
        if any(word in user_input_lower for word in good_condition):
            analysis["condition_score"] = 4
        elif any(word in user_input_lower for word in bad_condition):
            analysis["condition_score"] = 2
        
        # 감정 상태
        positive_emotions = ["기분좋", "뿌듯", "성취", "자신감", "행복"]
        negative_emotions = ["우울", "스트레스", "짜증", "포기하고싶", "의욕없"]
        
        if any(word in user_input_lower for word in positive_emotions):
            analysis["emotional_state"] = "positive"
        elif any(word in user_input_lower for word in negative_emotions):
            analysis["emotional_state"] = "negative"
        
        # 시간 추정
        time_keywords = {
            "5분": 5, "10분": 10, "15분": 15, "20분": 20, "30분": 30,
            "한시간": 60, "1시간": 60, "두시간": 120
        }
        
        for time_word, minutes in time_keywords.items():
            if time_word in user_input_lower:
                analysis["duration_minutes"] = minutes
                break
        
        return analysis
    
    def get_similar_user_pattern(self, analysis: dict) -> dict:
        """기존 30명 데이터에서 유사한 패턴 찾기"""
        
        # 서버에서 모든 사용자 통계 가져오기
        try:
            similar_patterns = []
            
            # 몇 명의 대표 사용자 패턴 확인
            test_users = ["user_001", "user_002", "user_003", "user_021", "user_026"]
            
            for user_id in test_users:
                try:
                    response = requests.get(f"{self.base_url}/users/{user_id}/stats")
                    if response.status_code == 200:
                        stats = response.json()
                        similar_patterns.append({
                            "user_id": user_id,
                            "name": stats["user_name"],
                            "success_rate": stats["total_success_rate"],
                            "streak": stats["current_streak"]
                        })
                except:
                    continue
            
            # 현재 상황과 가장 유사한 패턴 찾기
            if analysis["workout_completed"] is False or analysis["condition_score"] <= 2:
                # 어려운 상황 - 낮은 성공률 사용자 참조
                similar_user = min(similar_patterns, key=lambda x: x["success_rate"])
            else:
                # 좋은 상황 - 높은 성공률 사용자 참조
                similar_user = max(similar_patterns, key=lambda x: x["success_rate"])
            
            return similar_user
            
        except Exception as e:
            print(f"유사 패턴 분석 오류: {e}")
            return {"name": "평균 사용자", "success_rate": 60.0, "streak": 2}
    
    def generate_personalized_advice(self, analysis: dict, similar_pattern: dict) -> str:
        """개인화된 조언 생성"""
        
        # 임시 사용자 프로필 생성
        temp_profile = UserProfile(
            user_id="temp_user",
            age=17,
            name="사용자",
            workout_goal="체력향상",
            personality_type="격려형"
        )
        
        # 임시 운동 기록 생성 (분석 결과 기반)
        recent_logs = []
        base_date = date.today()
        
        # 유사 패턴 기반으로 가상의 최근 기록 생성
        success_rate = similar_pattern["success_rate"] / 100
        
        for i in range(7):
            workout_date = (base_date - timedelta(days=(6-i)))
            completed = (i < int(7 * success_rate))  # 성공률 기반
            
            log = WorkoutLog(
                user_id="temp_user",
                date=workout_date.isoformat(),
                workout_completed=completed,
                difficulty=analysis["difficulty"],
                duration_minutes=analysis["duration_minutes"],
                condition_score=analysis["condition_score"]
            )
            recent_logs.append(log)
        
        # 로컬 AI 모델로 분석
        if self.local_coach:
            try:
                advice = self.local_coach.get_coaching_advice(
                    user_profile=temp_profile,
                    recent_logs=recent_logs,
                    current_condition=analysis["condition_score"]
                )
                
                return advice
            except Exception as e:
                print(f"AI 분석 오류: {e}")
        
        # 폴백 조언
        return self.generate_fallback_advice(analysis, similar_pattern)
    
    def generate_fallback_advice(self, analysis: dict, similar_pattern: dict) -> dict:
        """폴백 조언 생성"""
        
        if analysis["workout_completed"] is False:
            risk = "high"
            message = f"괜찮아요! {similar_pattern['name']}님도 비슷한 상황을 겪었어요. 오늘은 5분만 움직여봐요 😊"
        elif analysis["condition_score"] <= 2:
            risk = "medium"
            message = f"컨디션이 안 좋을 때는 무리하지 마세요. {similar_pattern['name']}님처럼 가볍게 시작해보세요!"
        else:
            risk = "low"
            message = f"좋은 흐름이에요! {similar_pattern['name']}님도 이런 패턴으로 {similar_pattern['success_rate']:.0f}% 성공률을 달성했어요 💪"
        
        return {
            "dropout_risk": risk,
            "recommended_difficulty": max(1, analysis["difficulty"] - 1) if risk != "low" else analysis["difficulty"],
            "ai_message": message,
            "similar_user": similar_pattern
        }
    
    def chat_loop(self):
        """실시간 채팅 루프"""
        
        print("🏃‍♂️ AI 피트니스 코치와 대화를 시작합니다!")
        print("💡 운동 상황이나 고민을 자유롭게 말해주세요.")
        print("💡 예시: '오늘 운동 30분 했는데 너무 힘들었어', '운동 못했어 우울해'")
        print("💡 종료하려면 'quit' 또는 '종료'를 입력하세요.\n")
        
        while True:
            try:
                user_input = input("😊 당신: ").strip()
                
                if user_input.lower() in ['quit', 'exit', '종료', '나가기']:
                    print("👋 운동 화이팅! 내일도 만나요!")
                    break
                
                if not user_input:
                    continue
                
                # 1. 사용자 입력 분석
                analysis = self.analyze_user_input(user_input)
                
                print(f"📊 분석 결과:")
                print(f"   운동 완료: {analysis['workout_completed']}")
                print(f"   예상 난이도: {analysis['difficulty']}/5")
                print(f"   예상 컨디션: {analysis['condition_score']}/5")
                print(f"   감정 상태: {analysis['emotional_state']}")
                
                # 2. 유사 패턴 찾기
                similar_pattern = self.get_similar_user_pattern(analysis)
                print(f"📈 유사 패턴: {similar_pattern['name']} (성공률 {similar_pattern['success_rate']:.0f}%)")
                
                # 3. AI 조언 생성
                advice = self.generate_personalized_advice(analysis, similar_pattern)
                
                print(f"\n🤖 AI 코치의 조언:")
                print(f"   위험도: {advice['dropout_risk']}")
                print(f"   추천 난이도: {advice['recommended_difficulty']}/5")
                print(f"   💬 메시지: {advice['ai_message']}")
                print(f"   📊 참고: {advice.get('similar_user', {}).get('name', '평균')} 사용자 패턴 기반")
                print("-" * 60)
                
            except KeyboardInterrupt:
                print("\n👋 운동 화이팅! 내일도 만나요!")
                break
            except Exception as e:
                print(f"❌ 오류 발생: {e}")
                print("다시 시도해주세요.")

if __name__ == "__main__":
    coach = RealTimeAICoach()
    coach.chat_loop()