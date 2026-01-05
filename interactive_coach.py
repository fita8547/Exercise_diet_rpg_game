# interactive_coach.py
# 대화형 AI 피트니스 코치 - 실시간 채팅으로 운동 상황 분석

import json
import os
from datetime import date, timedelta
from typing import List, Dict, Any
import joblib
import numpy as np
from ai import WorkoutLog, UserProfile, SmartFitnessCoach

class InteractiveFitnessCoach:
    def __init__(self):
        self.user_data_file = "user_data.json"
        self.load_user_data()
        
        # ML 모델 로드
        if os.path.exists("dropout_model.pkl"):
            self.coach = SmartFitnessCoach("dropout_model.pkl")
        else:
            print("❌ ML 모델이 없습니다. 먼저 ai.py를 실행해주세요.")
            return
    
    def load_user_data(self):
        """사용자 데이터 로드"""
        if os.path.exists(self.user_data_file):
            with open(self.user_data_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                self.user_profile = UserProfile(**data['profile'])
                self.workout_logs = [WorkoutLog(**log) for log in data['logs']]
        else:
            self.user_profile = None
            self.workout_logs = []
    
    def save_user_data(self):
        """사용자 데이터 저장"""
        data = {
            'profile': {
                'user_id': self.user_profile.user_id,
                'age': self.user_profile.age,
                'name': self.user_profile.name,
                'workout_goal': self.user_profile.workout_goal,
                'personality_type': self.user_profile.personality_type
            },
            'logs': [
                {
                    'user_id': log.user_id,
                    'date': log.date,
                    'workout_completed': log.workout_completed,
                    'difficulty': log.difficulty,
                    'duration_minutes': log.duration_minutes,
                    'condition_score': log.condition_score
                }
                for log in self.workout_logs
            ]
        }
        
        with open(self.user_data_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
    
    def setup_user_profile(self):
        """사용자 프로필 설정"""
        print("\n🏃‍♂️ AI 피트니스 코치에 오신 걸 환영해요!")
        print("먼저 간단한 정보를 알려주세요.\n")
        
        name = input("이름이 뭐예요? ")
        age = int(input("나이는? "))
        
        print("\n운동 목표를 선택해주세요:")
        goals = ["체력향상", "다이어트", "근력증가", "스트레스해소", "건강관리"]
        for i, goal in enumerate(goals, 1):
            print(f"{i}. {goal}")
        
        goal_idx = int(input("번호 선택: ")) - 1
        workout_goal = goals[goal_idx]
        
        print("\n어떤 스타일의 코칭을 원해요?")
        personalities = ["격려형 (따뜻하게 응원)", "도전형 (목표 지향적)", "분석형 (데이터 기반)", "친근형 (친구같이)"]
        for i, p in enumerate(personalities, 1):
            print(f"{i}. {p}")
        
        personality_idx = int(input("번호 선택: ")) - 1
        personality_type = ["격려형", "도전형", "분석형", "친근형"][personality_idx]
        
        self.user_profile = UserProfile(
            user_id="user_001",
            age=age,
            name=name,
            workout_goal=workout_goal,
            personality_type=personality_type
        )
        
        print(f"\n✅ {name}님의 프로필이 설정되었어요!")
        print(f"목표: {workout_goal}, 스타일: {personality_type}")
    
    def record_workout(self):
        """오늘 운동 기록"""
        today = date.today().isoformat()
        
        # 오늘 이미 기록했는지 확인
        for log in self.workout_logs:
            if log.date == today:
                print("❌ 오늘은 이미 운동을 기록했어요!")
                return
        
        print(f"\n📅 {today} 운동 기록")
        
        # 운동 완료 여부
        completed_input = input("오늘 운동했어요? (y/n): ").lower()
        workout_completed = completed_input in ['y', 'yes', '네', 'ㅇ']
        
        if workout_completed:
            difficulty = int(input("난이도는 어땠어요? (1-5, 5가 가장 힘듦): "))
            duration = int(input("몇 분 했어요? "))
            condition = int(input("오늘 컨디션은? (1-5, 5가 최고): "))
        else:
            # 실패한 경우 간단하게
            difficulty = int(input("시도하려던 난이도는? (1-5): "))
            duration = 0
            condition = int(input("오늘 컨디션은? (1-5): "))
        
        # 기록 저장
        log = WorkoutLog(
            user_id=self.user_profile.user_id,
            date=today,
            workout_completed=workout_completed,
            difficulty=difficulty,
            duration_minutes=duration,
            condition_score=condition
        )
        
        self.workout_logs.append(log)
        self.save_user_data()
        
        status = "성공! 🎉" if workout_completed else "괜찮아요 😊"
        print(f"\n✅ 기록 완료: {status}")
    
    def get_ai_advice(self):
        """AI 조언 받기"""
        if len(self.workout_logs) < 3:
            print("❌ 최소 3일의 기록이 필요해요. 더 기록해주세요!")
            return
        
        # 현재 컨디션 입력
        condition = int(input("지금 컨디션은? (1-5): "))
        
        # AI 분석
        advice = self.coach.get_coaching_advice(
            user_profile=self.user_profile,
            recent_logs=self.workout_logs[-7:],  # 최근 7일
            current_condition=condition
        )
        
        print(f"\n🤖 {self.user_profile.name}님을 위한 AI 분석")
        print("=" * 40)
        print(f"📊 포기 위험도: {advice['dropout_risk']}")
        print(f"💪 추천 난이도: {advice['recommended_difficulty']}")
        print(f"📈 최근 성공률: {advice['recent_performance']['success_rate']:.1%}")
        print(f"🔥 연속 성공: {advice['recent_performance']['streak']}일")
        print(f"\n💬 AI 코치의 한마디:")
        print(f"   {advice['ai_message']}")
        print("=" * 40)
    
    def show_progress(self):
        """진행상황 보기"""
        if not self.workout_logs:
            print("❌ 아직 기록이 없어요!")
            return
        
        print(f"\n📊 {self.user_profile.name}님의 운동 기록")
        print("=" * 40)
        
        # 최근 7일 기록
        recent_logs = self.workout_logs[-7:]
        success_count = sum(1 for log in recent_logs if log.workout_completed)
        
        print(f"📅 총 기록일: {len(self.workout_logs)}일")
        print(f"✅ 최근 7일 성공: {success_count}/{len(recent_logs)}일")
        print(f"📈 성공률: {success_count/len(recent_logs):.1%}")
        
        print("\n최근 기록:")
        for log in recent_logs[-5:]:  # 최근 5일만
            status = "✅" if log.workout_completed else "❌"
            print(f"  {log.date}: {status} 난이도{log.difficulty} {log.duration_minutes}분")
    
    def chat_interface(self):
        """채팅 인터페이스"""
        print("\n💬 AI 코치와 대화해보세요!")
        print("(운동 관련 질문이나 고민을 자유롭게 말해주세요)")
        
        while True:
            user_input = input(f"\n{self.user_profile.name}: ").strip()
            
            if user_input.lower() in ['quit', 'exit', '종료', '나가기']:
                break
            
            # 간단한 키워드 기반 응답 (API 없이)
            response = self.generate_simple_response(user_input)
            print(f"AI 코치: {response}")
    
    def generate_simple_response(self, user_input: str) -> str:
        """간단한 키워드 기반 응답 생성"""
        user_input = user_input.lower()
        
        if any(word in user_input for word in ['힘들', '어려', '포기', '그만']):
            return f"{self.user_profile.name}아, 힘든 건 당연해! 오늘은 5분만 해보자. 그것도 성공이야 💪"
        
        elif any(word in user_input for word in ['성공', '했어', '완료', '끝']):
            return f"와! {self.user_profile.name}님 정말 대단해요! 이런 작은 성공들이 모여서 큰 변화를 만들어요 🎉"
        
        elif any(word in user_input for word in ['못했', '실패', '안했', '빼먹']):
            return f"괜찮아요! 실패는 성공의 일부예요. 내일 다시 시작하면 돼요. {self.user_profile.name}님은 할 수 있어요 😊"
        
        elif any(word in user_input for word in ['동기', '의지', '목표']):
            return f"{self.user_profile.name}님의 목표는 '{self.user_profile.workout_goal}'이죠? 작은 걸음도 목표를 향한 진전이에요!"
        
        else:
            return f"{self.user_profile.name}님, 운동은 꾸준함이 핵심이에요. 오늘 컨디션은 어때요?"
    
    def run(self):
        """메인 실행"""
        if not self.user_profile:
            self.setup_user_profile()
            self.save_user_data()
        
        while True:
            print(f"\n🏃‍♂️ AI 피트니스 코치 - {self.user_profile.name}님")
            print("1. 오늘 운동 기록하기")
            print("2. AI 조언 받기")
            print("3. 진행상황 보기")
            print("4. AI와 채팅하기")
            print("5. 종료")
            
            choice = input("\n선택: ").strip()
            
            if choice == '1':
                self.record_workout()
            elif choice == '2':
                self.get_ai_advice()
            elif choice == '3':
                self.show_progress()
            elif choice == '4':
                self.chat_interface()
            elif choice == '5':
                print(f"👋 {self.user_profile.name}님, 내일도 화이팅!")
                break
            else:
                print("❌ 잘못된 선택입니다.")

if __name__ == "__main__":
    coach = InteractiveFitnessCoach()
    coach.run()