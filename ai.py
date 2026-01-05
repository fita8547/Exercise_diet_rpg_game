# ai_fitness_coach.py
# 목적: 청소년 운동 지속을 위한 AI 코치 (포기 위험 예측 + 개인화 메시지)
# 실행:
#   python3 -m venv venv && source venv/bin/activate
#   pip install -r requirements.txt
#   python ai_fitness_coach.py

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
import random
import os
from typing import List, Dict, Any, Tuple, Optional

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.ensemble import RandomForestClassifier
import joblib
from openai import OpenAI
from dotenv import load_dotenv

# 환경변수 로드
load_dotenv()


# -----------------------------
# 1) 데이터 스키마 (로그 1개)
# -----------------------------
@dataclass
class WorkoutLog:
    user_id: str
    date: str  # YYYY-MM-DD
    workout_completed: bool
    difficulty: int  # 1~5
    duration_minutes: int
    condition_score: int  # 1~5


@dataclass
class UserProfile:
    user_id: str
    age: int
    name: str
    workout_goal: str  # "체력향상", "다이어트", "근력증가" 등
    personality_type: str  # "격려형", "도전형", "분석형" 등


# -----------------------------
# 2) OpenAI API 클래스
# -----------------------------
class FitnessAICoach:
    def __init__(self):
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.")
        
        self.client = OpenAI(api_key=api_key)
    
    def generate_personalized_message(
        self, 
        user_profile: UserProfile,
        dropout_risk: str,
        current_difficulty: int,
        recommended_difficulty: int,
        recent_performance: Dict[str, Any]
    ) -> str:
        """사용자 상황에 맞는 개인화된 메시지 생성"""
        
        # 상황 정보 정리
        context = f"""
사용자 정보:
- 이름: {user_profile.name}
- 나이: {user_profile.age}세
- 운동 목표: {user_profile.workout_goal}
- 성격 유형: {user_profile.personality_type}

현재 상황:
- 포기 위험도: {dropout_risk}
- 현재 난이도: {current_difficulty}
- 추천 난이도: {recommended_difficulty}
- 최근 성공률: {recent_performance.get('success_rate', 0):.1%}
- 연속 성공일: {recent_performance.get('streak', 0)}일
- 마지막 실패: {recent_performance.get('days_since_fail', 0)}일 전
"""

        # 위험도별 메시지 방향성
        message_direction = {
            "high": "매우 부드럽고 격려적으로, 부담을 덜어주는 방향",
            "medium": "친근하고 응원하는 톤으로, 작은 성취를 인정",
            "low": "긍정적이고 동기부여하는 방향으로, 성장을 격려"
        }

        prompt = f"""
당신은 청소년을 위한 AI 운동 코치입니다. 
핵심 철학: "실패는 정상이고, 5분도 성공이며, 비교하지 않는다"

{context}

메시지 방향: {message_direction[dropout_risk]}

다음 조건을 지켜서 메시지를 작성해주세요:
1. 청소년 친화적인 톤 (반말, 친근함)
2. 2-3문장으로 간결하게
3. 실패에 대한 부담감 없애기
4. 작은 성취도 인정하기
5. 내일에 대한 부담 없는 제안

메시지:"""

        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "당신은 청소년 운동 지속을 돕는 친근한 AI 코치입니다."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            print(f"OpenAI API 오류: {e}")
            # 폴백 메시지
            fallback_messages = {
                "high": f"{user_profile.name}아, 오늘은 여기까지도 충분해! 내일 3분만 같이 해보자 😊",
                "medium": f"{user_profile.name}아, 조금만 가볍게 해보자. 흐름만 이어가면 돼!",
                "low": f"{user_profile.name}아, 좋은 흐름이야! 오늘도 이어가보자 💪"
            }
            return fallback_messages[dropout_risk]


# -----------------------------
# 3) 더미 데이터 생성 (100명 x 30일)
#   - 사용자마다 "성향"을 만들어 성공/실패 패턴 다양화
# -----------------------------
def generate_user_profiles(n_users: int = 100) -> Dict[str, UserProfile]:
    """더미 사용자 프로필 생성"""
    profiles = {}
    
    names = ["민수", "지영", "현우", "서연", "준호", "예린", "태민", "소영", "동현", "하은"]
    goals = ["체력향상", "다이어트", "근력증가", "스트레스해소", "건강관리"]
    personalities = ["격려형", "도전형", "분석형", "친근형"]
    
    for i in range(n_users):
        uid = f"user_{i:03d}"
        profiles[uid] = UserProfile(
            user_id=uid,
            age=random.randint(14, 19),
            name=random.choice(names),
            workout_goal=random.choice(goals),
            personality_type=random.choice(personalities)
        )
    
    return profiles


def clamp(v: int, lo: int, hi: int) -> int:
    return max(lo, min(hi, v))


def generate_dummy_logs(
    n_users: int = 100,
    n_days: int = 30,
    start: date = date(2026, 1, 5),
    seed: int = 42,
) -> List[WorkoutLog]:
    random.seed(seed)
    np.random.seed(seed)

    logs: List[WorkoutLog] = []

    # 사용자별 "기본 성향" (0~1): 높을수록 꾸준함
    user_profile = {}
    for i in range(n_users):
        uid = f"user_{i:03d}"
        # 꾸준함 분포를 다양하게: 일부는 꾸준, 일부는 중간, 일부는 낮음
        base = np.clip(np.random.normal(loc=0.55, scale=0.20), 0.05, 0.95)
        # 컨디션 평균 (1~5)
        cond_mean = int(np.clip(np.random.normal(loc=3.3, scale=0.7), 1, 5))
        user_profile[uid] = (float(base), int(cond_mean))

    for uid, (base_consistency, cond_mean) in user_profile.items():
        streak = 0
        last_fail_days_ago = 7  # 임의 초기값

        for d in range(n_days):
            day = start + timedelta(days=d)
            weekday = day.weekday()  # 0=월 ... 6=일

            # 요일 효과: 월~금 약간 낮고, 주말 약간 높게(가정)
            weekday_bias = 0.03 if weekday in (5, 6) else -0.02

            # 컨디션: 평균 주변으로 랜덤
            condition = clamp(int(np.random.normal(cond_mean, 0.9)), 1, 5)

            # 난이도: streak가 쌓이면 조금 올라가려는 경향
            difficulty = clamp(2 + (streak // 3) + random.choice([-1, 0, 1]), 1, 5)

            # 운동 시간: 난이도/컨디션에 따라
            duration = clamp(int(5 + difficulty * 4 + (condition - 3) * 2 + random.choice([-3, 0, 3])), 5, 40)

            # 성공 확률: (기본 꾸준함 + 컨디션 + 요일 + 너무 높은 난이도 페널티 + 최근 실패 페널티)
            # - "중도 포기" 느낌을 주려고 최근 실패가 있으면 성공 확률이 더 내려가게 했음
            recent_fail_penalty = 0.06 if last_fail_days_ago == 0 else (0.03 if last_fail_days_ago <= 2 else 0.0)
            too_hard_penalty = 0.05 * max(0, difficulty - condition)  # 컨디션보다 난이도가 높으면 페널티

            p_success = (
                0.15
                + 0.55 * base_consistency
                + 0.08 * (condition - 3)
                + weekday_bias
                - too_hard_penalty
                - recent_fail_penalty
            )
            p_success = float(np.clip(p_success, 0.05, 0.95))

            workout_completed = (random.random() < p_success)

            if workout_completed:
                streak += 1
                last_fail_days_ago = min(last_fail_days_ago + 1, 30)
            else:
                streak = 0
                last_fail_days_ago = 0

            logs.append(
                WorkoutLog(
                    user_id=uid,
                    date=day.isoformat(),
                    workout_completed=workout_completed,
                    difficulty=difficulty,
                    duration_minutes=duration,
                    condition_score=condition,
                )
            )

    return logs


# -----------------------------
# 4) 특징(feature) 만들기 + 라벨 정의
#   라벨: "내일 실패(=중도포기 신호)" 예측
#   - 오늘 로그로 내일의 workout_completed를 예측
#   - 학습 데이터: day 0~n-2 (마지막 날은 라벨이 없음)
# -----------------------------
def build_dataset(logs: List[WorkoutLog]) -> Tuple[np.ndarray, np.ndarray]:
    # user_id별로 날짜 순 정렬
    by_user: Dict[str, List[WorkoutLog]] = {}
    for lg in logs:
        by_user.setdefault(lg.user_id, []).append(lg)

    X_list: List[List[float]] = []
    y_list: List[int] = []

    for uid, rows in by_user.items():
        rows.sort(key=lambda r: r.date)

        # 최근 7일 성공률을 빠르게 계산하기 위해 rolling window
        recent_window: List[int] = []  # 1=성공, 0=실패
        streak = 0
        last_failed_days_ago = 7

        for i in range(len(rows) - 1):
            today = rows[i]
            tomorrow = rows[i + 1]

            # 오늘 기준 rolling update
            s = 1 if today.workout_completed else 0
            recent_window.append(s)
            if len(recent_window) > 7:
                recent_window.pop(0)
            recent_success_rate = sum(recent_window) / len(recent_window)

            if today.workout_completed:
                streak += 1
                last_failed_days_ago = min(last_failed_days_ago + 1, 30)
            else:
                streak = 0
                last_failed_days_ago = 0

            # 요일(0~6)
            yyyy, mm, dd = map(int, today.date.split("-"))
            weekday = date(yyyy, mm, dd).weekday()

            # Feature 벡터 (서비스에서도 그대로 만들 수 있게 단순하게)
            feats = [
                recent_success_rate,                 # 0~1
                float(streak),                       # 0~
                float(last_failed_days_ago),          # 0~
                float(today.difficulty),              # 1~5
                float(today.duration_minutes),        # 5~40
                float(today.condition_score),         # 1~5
                float(weekday),                       # 0~6
            ]

            # 라벨: 내일 실패할지(1=실패/중도포기 위험, 0=성공)
            y = 1 if (tomorrow.workout_completed is False) else 0

            X_list.append(feats)
            y_list.append(y)

    X = np.array(X_list, dtype=np.float32)
    y = np.array(y_list, dtype=np.int64)
    return X, y


# -----------------------------
# 5) 모델 학습 + 저장
# -----------------------------
def train_and_save_model(
    X: np.ndarray,
    y: np.ndarray,
    out_path: str = "dropout_model.pkl",
    seed: int = 42,
) -> None:
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=seed, stratify=y
    )

    model = RandomForestClassifier(
        n_estimators=300,
        random_state=seed,
        max_depth=None,
        min_samples_leaf=2,
        n_jobs=-1,
        class_weight="balanced",
    )
    model.fit(X_train, y_train)

    # 평가
    proba = model.predict_proba(X_test)[:, 1]
    pred = (proba >= 0.5).astype(int)

    print("\n=== Evaluation (test) ===")
    print("ROC-AUC:", round(roc_auc_score(y_test, proba), 4))
    print(classification_report(y_test, pred, digits=4))

    joblib.dump(model, out_path)
    print(f"\n✅ Saved model to: {out_path}")


# -----------------------------
# 6) AI 코치 시스템 (ML + LLM 결합)
# -----------------------------
class SmartFitnessCoach:
    def __init__(self, model_path: str = "dropout_model.pkl"):
        self.ml_model = joblib.load(model_path)
        self.ai_coach = FitnessAICoach()
    
    def predict_dropout_risk(self, features: np.ndarray) -> Tuple[float, str]:
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
        
        # 최근 성과 분석
        if not recent_logs:
            return {"error": "운동 기록이 없습니다."}
        
        latest_log = recent_logs[-1]
        
        # 특징 벡터 생성 (기존 build_dataset 로직 활용)
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
        
        # 요일 계산
        yyyy, mm, dd = map(int, latest_log.date.split("-"))
        weekday = date(yyyy, mm, dd).weekday()
        
        # 특징 벡터
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


# -----------------------------
# 7) 로드 후 "AI decision" 테스트 (FastAPI 없이도 확인 가능)
#   - dropout_risk: low/medium/high
#   - recommended_difficulty: 정책 적용
# -----------------------------
def test_ai_coaching_system(model_path: str = "dropout_model.pkl") -> None:
    """AI 코칭 시스템 전체 테스트"""
    
    # 더미 사용자 프로필
    user_profile = UserProfile(
        user_id="user_001",
        age=16,
        name="민수",
        workout_goal="체력향상",
        personality_type="격려형"
    )
    
    # 더미 운동 기록 (최근 7일)
    recent_logs = [
        WorkoutLog("user_001", "2026-01-01", True, 2, 10, 4),
        WorkoutLog("user_001", "2026-01-02", False, 3, 5, 2),
        WorkoutLog("user_001", "2026-01-03", False, 2, 3, 2),
        WorkoutLog("user_001", "2026-01-04", True, 1, 8, 3),
        WorkoutLog("user_001", "2026-01-05", True, 2, 12, 4),
    ]
    
    try:
        coach = SmartFitnessCoach(model_path)
        advice = coach.get_coaching_advice(
            user_profile=user_profile,
            recent_logs=recent_logs,
            current_condition=3
        )
        
        print("\n=== 🤖 AI 피트니스 코치 결과 ===")
        print(f"👤 사용자: {user_profile.name} ({user_profile.age}세)")
        print(f"🎯 목표: {user_profile.workout_goal}")
        print(f"📊 포기 위험도: {advice['dropout_risk']} ({advice['dropout_probability']})")
        print(f"💪 현재 난이도: {advice['current_difficulty']} → 추천: {advice['recommended_difficulty']}")
        print(f"📈 최근 성공률: {advice['recent_performance']['success_rate']:.1%}")
        print(f"🔥 연속 성공: {advice['recent_performance']['streak']}일")
        print(f"\n💬 AI 메시지:")
        print(f"   {advice['ai_message']}")
        
    except Exception as e:
        print(f"❌ 오류 발생: {e}")
        print("OpenAI API 키가 올바르게 설정되었는지 확인해주세요.")


def proba_to_risk(p: float) -> str:
    # 기준은 너가 나중에 조절하면 됨
    if p >= 0.70:
        return "high"
    if p >= 0.40:
        return "medium"
    return "low"


def decide_policy(risk: str, current_difficulty: int) -> Dict[str, Any]:
    if risk == "high":
        return {
            "recommended_difficulty": max(1, current_difficulty - 2),
            "message": "오늘은 여기까지도 충분해. 내일 3분만 같이 해보자.",
        }
    if risk == "medium":
        return {
            "recommended_difficulty": max(1, current_difficulty - 1),
            "message": "조금만 가볍게 해보자. 흐름만 이어가면 돼.",
        }
    return {
        "recommended_difficulty": current_difficulty,
        "message": "좋은 흐름이야. 오늘도 이어가보자!",
    }


def test_single_decision(model_path: str = "dropout_model.pkl") -> None:
    model = joblib.load(model_path)

    # "서비스에서 들어올" 형태의 요약 로그 (features 생성 결과에 해당)
    # recent_success_rate, streak, last_failed_days_ago, difficulty, duration, condition, weekday
    sample = np.array([[0.25, 0.0, 0.0, 3.0, 15.0, 2.0, 0.0]], dtype=np.float32)
    p = float(model.predict_proba(sample)[0, 1])
    risk = proba_to_risk(p)
    policy = decide_policy(risk, current_difficulty=int(sample[0, 3]))

    print("\n=== Single AI Decision Test ===")
    print("dropout_probability:", round(p, 4))
    print("dropout_risk:", risk)
    print("recommended_difficulty:", policy["recommended_difficulty"])
    print("message:", policy["message"])


def main():
    print("🏃‍♂️ AI 피트니스 코치 시스템 시작")
    
    # 1. 더미 데이터로 모델 학습 (처음 실행시에만)
    if not os.path.exists("dropout_model.pkl"):
        print("📚 ML 모델 학습 중...")
        logs = generate_dummy_logs(n_users=100, n_days=30)
        X, y = build_dataset(logs)
        print(f"데이터: {len(logs)}개 로그, {len(X)}개 샘플, 실패율: {y.mean():.1%}")
        train_and_save_model(X, y, out_path="dropout_model.pkl")
    else:
        print("✅ 기존 모델 발견, 학습 생략")
    
    # 2. AI 코칭 시스템 테스트
    test_ai_coaching_system("dropout_model.pkl")


if __name__ == "__main__":
    main()
