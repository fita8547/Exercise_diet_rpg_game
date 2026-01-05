# free_ai_coach.py
# 무료 AI API를 사용한 피트니스 코치

import os
import requests
import json
from typing import Dict, Any, List
from dataclasses import dataclass
import numpy as np
from dotenv import load_dotenv

load_dotenv()

@dataclass
class UserProfile:
    user_id: str
    age: int
    name: str
    workout_goal: str
    personality_type: str

@dataclass
class WorkoutLog:
    user_id: str
    date: str
    workout_completed: bool
    difficulty: int
    duration_minutes: int
    condition_score: int

class FreeAICoach:
    def __init__(self):
        # Hugging Face API 설정 (무료)
        self.hf_token = os.getenv('HUGGINGFACE_API_KEY')
        self.api_url = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium"
        
        # 로컬 모델 사용 (완전 무료)
        self.use_local = True
        
    def generate_message_with_hf(self, prompt: str) -> str:
        """Hugging Face API로 메시지 생성"""
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_length": 100,
                "temperature": 0.7,
                "do_sample": True
            }
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload)
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0].get('generated_text', '').replace(prompt, '').strip()
            return None
        except Exception as e:
            print(f"HF API 오류: {e}")
            return None
    
    def generate_local_message(
        self, 
        user_profile: UserProfile,
        dropout_risk: str,
        recent_performance: Dict[str, Any]
    ) -> str:
        """로컬 규칙 기반 메시지 생성 (완전 무료)"""
        
        name = user_profile.name
        age = user_profile.age
        goal = user_profile.workout_goal
        personality = user_profile.personality_type
        
        success_rate = recent_performance.get('success_rate', 0)
        streak = recent_performance.get('streak', 0)
        
        # 성격 유형별 기본 톤
        tone_map = {
            "격려형": ["힘내", "괜찮아", "잘하고 있어", "천천히"],
            "도전형": ["도전해보자", "목표를 향해", "더 강해지자", "성장하고 있어"],
            "분석형": ["데이터를 보면", "패턴을 보니", "통계적으로", "분석해보면"],
            "친근형": ["야", "어때", "같이", "우리"]
        }
        
        # 위험도별 메시지 템플릿
        if dropout_risk == "high":
            templates = [
                f"{name}아, 오늘은 정말 힘들었구나. 5분만 가볍게 움직여보자!",
                f"{name}님, 완벽하지 않아도 돼요. 오늘은 스트레칭만 해도 성공이에요 😊",
                f"힘들 때일수록 작은 것부터! {name}님만의 속도로 가면 돼요",
                f"{name}아, 쉬어가는 것도 전략이야. 내일을 위해 오늘은 가볍게!"
            ]
        elif dropout_risk == "medium":
            templates = [
                f"{name}님, 지금까지 {success_rate:.0%} 성공률이에요! 조금만 더 가볍게 해보죠",
                f"좋은 흐름이야 {name}아! 오늘은 난이도를 조금 낮춰서 꾸준함을 지켜보자",
                f"{name}님의 {goal} 목표를 위해 오늘도 한 걸음씩!",
                f"완벽하지 않아도 괜찮아요. {name}님은 이미 {streak}일 연속 도전하고 있어요!"
            ]
        else:  # low risk
            templates = [
                f"와! {name}님 정말 잘하고 있어요! 이 흐름 그대로 가봐요 💪",
                f"{name}아, {streak}일 연속 성공! 이제 조금 더 도전해볼까?",
                f"대단해요 {name}님! {goal} 목표에 한 발짝 더 가까워졌어요",
                f"꾸준함의 힘을 보여주고 있어요! {name}님 스타일 그대로 계속해요"
            ]
        
        # 성격 유형에 맞는 단어 추가
        import random
        base_message = random.choice(templates)
        tone_words = tone_map.get(personality, ["화이팅"])
        tone_word = random.choice(tone_words)
        
        # 나이대별 말투 조정
        if age <= 16:
            base_message = base_message.replace("님", "").replace("요", "")
        
        return f"{base_message} {tone_word}! 🔥"
    
    def generate_personalized_message(
        self,
        user_profile: UserProfile,
        dropout_risk: str,
        current_difficulty: int,
        recommended_difficulty: int,
        recent_performance: Dict[str, Any]
    ) -> str:
        """개인화된 메시지 생성"""
        
        # 먼저 로컬 메시지 생성
        local_message = self.generate_local_message(user_profile, dropout_risk, recent_performance)
        
        # HF API 사용 가능하면 개선된 메시지 시도
        if self.hf_token and self.hf_token != "hf_your_token_here":
            prompt = f"청소년 {user_profile.name}에게 운동 격려 메시지: {local_message}"
            hf_message = self.generate_message_with_hf(prompt)
            if hf_message and len(hf_message) > 10:
                return hf_message
        
        return local_message

class SmartFitnessCoach:
    def __init__(self, model_path: str = "dropout_model.pkl"):
        import joblib
        self.ml_model = joblib.load(model_path)
        self.ai_coach = FreeAICoach()
    
    def predict_dropout_risk(self, features: np.ndarray) -> tuple:
        """포기 위험도 예측"""
        proba = float(self.ml_model.predict_proba(features)[0, 1])
        
        if proba >= 0.70:
            risk = "high"
        elif proba >= 0.40:
            risk = "medium"
        else:
            risk = "low"
            
        return proba, risk
    
    def recommend_difficulty(self, risk: str, current_difficulty: int) -> int:
        """위험도에 따른 난이도 조절"""
        if risk == "high":
            return max(1, current_difficulty - 2)
        elif risk == "medium":
            return max(1, current_difficulty - 1)
        else:
            return current_difficulty
    
    def get_coaching_advice(
        self,
        user_profile: UserProfile,
        recent_logs: List[WorkoutLog],
        current_condition: int
    ) -> Dict[str, Any]:
        """종합적인 코칭 조언 생성"""
        
        if not recent_logs:
            return {"error": "운동 기록이 없습니다."}
        
        latest_log = recent_logs[-1]
        
        # 특징 벡터 생성
        recent_window = [1 if log.workout_completed else 0 for log in recent_logs[-7:]]
        recent_success_rate = sum(recent_window) / len(recent_window)
        
        streak = 0
        for log in reversed(recent_logs):
            if log.workout_completed:
                streak += 1
            else:
                break
        
        last_failed_days_ago = 0
        for i, log in enumerate(reversed(recent_logs)):
            if not log.workout_completed:
                last_failed_days_ago = i
                break
        else:
            last_failed_days_ago = min(len(recent_logs), 30)
        
        from datetime import date
        yyyy, mm, dd = map(int, latest_log.date.split("-"))
        weekday = date(yyyy, mm, dd).weekday()
        
        features = np.array([[
            recent_success_rate,
            float(streak),
            float(last_failed_days_ago),
            float(latest_log.difficulty),
            float(latest_log.duration_minutes),
            float(current_condition),
            float(weekday)
        ]], dtype=np.float32)
        
        # ML 예측
        dropout_proba, dropout_risk = self.predict_dropout_risk(features)
        recommended_difficulty = self.recommend_difficulty(dropout_risk, latest_log.difficulty)
        
        # 성과 정보
        recent_performance = {
            "success_rate": recent_success_rate,
            "streak": streak,
            "days_since_fail": last_failed_days_ago
        }
        
        # AI 메시지 생성
        ai_message = self.ai_coach.generate_personalized_message(
            user_profile=user_profile,
            dropout_risk=dropout_risk,
            current_difficulty=latest_log.difficulty,
            recommended_difficulty=recommended_difficulty,
            recent_performance=recent_performance
        )
        
        return {
            "dropout_probability": round(dropout_proba, 4),
            "dropout_risk": dropout_risk,
            "current_difficulty": latest_log.difficulty,
            "recommended_difficulty": recommended_difficulty,
            "ai_message": ai_message,
            "recent_performance": recent_performance
        }

if __name__ == "__main__":
    # 테스트
    coach = FreeAICoach()
    
    user = UserProfile(
        user_id="test",
        age=16,
        name="민수",
        workout_goal="체력향상",
        personality_type="격려형"
    )
    
    performance = {
        "success_rate": 0.6,
        "streak": 2,
        "days_since_fail": 1
    }
    
    message = coach.generate_personalized_message(
        user_profile=user,
        dropout_risk="medium",
        current_difficulty=3,
        recommended_difficulty=2,
        recent_performance=performance
    )
    
    print("🤖 AI 메시지:", message)