# main.py
# FastAPI 웹 서버 - AI 피트니스 코치 API

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import json
import os
from datetime import date, datetime
import uvicorn

from free_ai_coach import SmartFitnessCoach, UserProfile, WorkoutLog

app = FastAPI(
    title="AI 피트니스 코치",
    description="청소년을 위한 AI 기반 운동 지속 도우미",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 데이터 모델
class UserProfileCreate(BaseModel):
    name: str
    age: int
    workout_goal: str
    personality_type: str

class WorkoutLogCreate(BaseModel):
    workout_completed: bool
    difficulty: int
    duration_minutes: int
    condition_score: int

class CoachingRequest(BaseModel):
    current_condition: int

# 전역 변수
coach = None
users_db = {}  # 간단한 메모리 DB

def load_coach():
    """ML 모델 로드"""
    global coach
    if os.path.exists("dropout_model.pkl"):
        coach = SmartFitnessCoach("dropout_model.pkl")
        return True
    return False

def save_user_data():
    """사용자 데이터 저장"""
    with open("users_db.json", "w", encoding="utf-8") as f:
        # dataclass를 dict로 변환
        serializable_db = {}
        for user_id, data in users_db.items():
            serializable_db[user_id] = {
                "profile": {
                    "user_id": data["profile"].user_id,
                    "age": data["profile"].age,
                    "name": data["profile"].name,
                    "workout_goal": data["profile"].workout_goal,
                    "personality_type": data["profile"].personality_type
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
                    for log in data["logs"]
                ]
            }
        json.dump(serializable_db, f, ensure_ascii=False, indent=2)

def load_user_data():
    """사용자 데이터 로드"""
    global users_db
    if os.path.exists("users_db.json"):
        with open("users_db.json", "r", encoding="utf-8") as f:
            data = json.load(f)
            for user_id, user_data in data.items():
                users_db[user_id] = {
                    "profile": UserProfile(**user_data["profile"]),
                    "logs": [WorkoutLog(**log) for log in user_data["logs"]]
                }

@app.on_event("startup")
async def startup_event():
    """서버 시작시 초기화"""
    if not load_coach():
        print("❌ ML 모델을 찾을 수 없습니다. ai.py를 먼저 실행해주세요.")
    else:
        print("✅ AI 코치 모델 로드 완료")
    
    load_user_data()
    print(f"✅ 사용자 데이터 로드 완료 ({len(users_db)}명)")

# API 엔드포인트
@app.get("/")
async def root():
    """메인 페이지"""
    return {"message": "AI 피트니스 코치 API", "status": "running"}

@app.post("/users/{user_id}/profile")
async def create_user_profile(user_id: str, profile_data: UserProfileCreate):
    """사용자 프로필 생성"""
    profile = UserProfile(
        user_id=user_id,
        age=profile_data.age,
        name=profile_data.name,
        workout_goal=profile_data.workout_goal,
        personality_type=profile_data.personality_type
    )
    
    users_db[user_id] = {
        "profile": profile,
        "logs": []
    }
    
    save_user_data()
    
    return {
        "message": f"{profile_data.name}님의 프로필이 생성되었습니다!",
        "profile": {
            "user_id": user_id,
            "name": profile_data.name,
            "age": profile_data.age,
            "workout_goal": profile_data.workout_goal,
            "personality_type": profile_data.personality_type
        }
    }

@app.get("/users/{user_id}/profile")
async def get_user_profile(user_id: str):
    """사용자 프로필 조회"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    profile = users_db[user_id]["profile"]
    return {
        "user_id": profile.user_id,
        "name": profile.name,
        "age": profile.age,
        "workout_goal": profile.workout_goal,
        "personality_type": profile.personality_type
    }

@app.post("/users/{user_id}/workouts")
async def record_workout(user_id: str, workout_data: WorkoutLogCreate):
    """운동 기록 추가"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    today = date.today().isoformat()
    
    # 오늘 이미 기록했는지 확인
    for log in users_db[user_id]["logs"]:
        if log.date == today:
            raise HTTPException(status_code=400, detail="오늘은 이미 운동을 기록했습니다")
    
    workout_log = WorkoutLog(
        user_id=user_id,
        date=today,
        workout_completed=workout_data.workout_completed,
        difficulty=workout_data.difficulty,
        duration_minutes=workout_data.duration_minutes,
        condition_score=workout_data.condition_score
    )
    
    users_db[user_id]["logs"].append(workout_log)
    save_user_data()
    
    status = "성공! 🎉" if workout_data.workout_completed else "괜찮아요 😊"
    
    return {
        "message": f"운동 기록 완료: {status}",
        "date": today,
        "workout_completed": workout_data.workout_completed,
        "difficulty": workout_data.difficulty,
        "duration_minutes": workout_data.duration_minutes
    }

@app.get("/users/{user_id}/workouts")
async def get_workout_history(user_id: str, limit: int = 30):
    """운동 기록 조회"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    logs = users_db[user_id]["logs"][-limit:]
    
    return {
        "total_records": len(users_db[user_id]["logs"]),
        "recent_records": [
            {
                "date": log.date,
                "workout_completed": log.workout_completed,
                "difficulty": log.difficulty,
                "duration_minutes": log.duration_minutes,
                "condition_score": log.condition_score
            }
            for log in logs
        ]
    }

@app.post("/users/{user_id}/coaching")
async def get_ai_coaching(user_id: str, request: CoachingRequest):
    """AI 코칭 조언 받기"""
    if not coach:
        raise HTTPException(status_code=500, detail="AI 모델이 로드되지 않았습니다")
    
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    user_data = users_db[user_id]
    
    if len(user_data["logs"]) < 3:
        raise HTTPException(status_code=400, detail="최소 3일의 운동 기록이 필요합니다")
    
    try:
        advice = coach.get_coaching_advice(
            user_profile=user_data["profile"],
            recent_logs=user_data["logs"][-7:],  # 최근 7일
            current_condition=request.current_condition
        )
        
        return {
            "user_name": user_data["profile"].name,
            "analysis": {
                "dropout_probability": advice["dropout_probability"],
                "dropout_risk": advice["dropout_risk"],
                "current_difficulty": advice["current_difficulty"],
                "recommended_difficulty": advice["recommended_difficulty"]
            },
            "performance": advice["recent_performance"],
            "ai_message": advice["ai_message"],
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 분석 중 오류 발생: {str(e)}")

@app.get("/users/{user_id}/stats")
async def get_user_stats(user_id: str):
    """사용자 통계 조회"""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다")
    
    logs = users_db[user_id]["logs"]
    
    if not logs:
        return {"message": "아직 운동 기록이 없습니다"}
    
    # 통계 계산
    total_days = len(logs)
    success_count = sum(1 for log in logs if log.workout_completed)
    recent_7_days = logs[-7:] if len(logs) >= 7 else logs
    recent_success = sum(1 for log in recent_7_days if log.workout_completed)
    
    # 연속 성공일 계산
    current_streak = 0
    for log in reversed(logs):
        if log.workout_completed:
            current_streak += 1
        else:
            break
    
    return {
        "user_name": users_db[user_id]["profile"].name,
        "total_days": total_days,
        "total_success_rate": round(success_count / total_days * 100, 1) if total_days > 0 else 0,
        "recent_7_days_success": f"{recent_success}/{len(recent_7_days)}",
        "recent_success_rate": round(recent_success / len(recent_7_days) * 100, 1) if recent_7_days else 0,
        "current_streak": current_streak,
        "last_workout": logs[-1].date if logs else None
    }

# 웹 인터페이스용 HTML
@app.get("/web", response_class=HTMLResponse)
async def web_interface():
    """간단한 웹 인터페이스"""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>AI 피트니스 코치</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .container { background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 10px 0; }
            button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
            input, select { padding: 8px; margin: 5px; border: 1px solid #ddd; border-radius: 4px; }
            .result { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1>🏃‍♂️ AI 피트니스 코치</h1>
        
        <div class="container">
            <h2>사용자 등록</h2>
            <input type="text" id="userId" placeholder="사용자 ID" />
            <input type="text" id="userName" placeholder="이름" />
            <input type="number" id="userAge" placeholder="나이" min="10" max="25" />
            <select id="workoutGoal">
                <option value="체력향상">체력향상</option>
                <option value="다이어트">다이어트</option>
                <option value="근력증가">근력증가</option>
                <option value="스트레스해소">스트레스해소</option>
            </select>
            <select id="personalityType">
                <option value="격려형">격려형</option>
                <option value="도전형">도전형</option>
                <option value="분석형">분석형</option>
                <option value="친근형">친근형</option>
            </select>
            <button onclick="createProfile()">프로필 생성</button>
        </div>
        
        <div class="container">
            <h2>운동 기록</h2>
            <input type="text" id="recordUserId" placeholder="사용자 ID" />
            <label><input type="checkbox" id="workoutCompleted" /> 운동 완료</label>
            <input type="number" id="difficulty" placeholder="난이도 (1-5)" min="1" max="5" />
            <input type="number" id="duration" placeholder="운동 시간 (분)" min="0" />
            <input type="number" id="condition" placeholder="컨디션 (1-5)" min="1" max="5" />
            <button onclick="recordWorkout()">기록하기</button>
        </div>
        
        <div class="container">
            <h2>AI 코칭</h2>
            <input type="text" id="coachUserId" placeholder="사용자 ID" />
            <input type="number" id="currentCondition" placeholder="현재 컨디션 (1-5)" min="1" max="5" />
            <button onclick="getCoaching()">AI 조언 받기</button>
        </div>
        
        <div id="result" class="result" style="display:none;"></div>
        
        <script>
            const API_BASE = '';
            
            async function createProfile() {
                const userId = document.getElementById('userId').value;
                const data = {
                    name: document.getElementById('userName').value,
                    age: parseInt(document.getElementById('userAge').value),
                    workout_goal: document.getElementById('workoutGoal').value,
                    personality_type: document.getElementById('personalityType').value
                };
                
                try {
                    const response = await fetch(`/users/${userId}/profile`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    showResult(JSON.stringify(result, null, 2));
                } catch (error) {
                    showResult('오류: ' + error.message);
                }
            }
            
            async function recordWorkout() {
                const userId = document.getElementById('recordUserId').value;
                const data = {
                    workout_completed: document.getElementById('workoutCompleted').checked,
                    difficulty: parseInt(document.getElementById('difficulty').value),
                    duration_minutes: parseInt(document.getElementById('duration').value),
                    condition_score: parseInt(document.getElementById('condition').value)
                };
                
                try {
                    const response = await fetch(`/users/${userId}/workouts`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    showResult(JSON.stringify(result, null, 2));
                } catch (error) {
                    showResult('오류: ' + error.message);
                }
            }
            
            async function getCoaching() {
                const userId = document.getElementById('coachUserId').value;
                const data = {
                    current_condition: parseInt(document.getElementById('currentCondition').value)
                };
                
                try {
                    const response = await fetch(`/users/${userId}/coaching`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(data)
                    });
                    const result = await response.json();
                    showResult(`
                        <h3>🤖 ${result.user_name}님을 위한 AI 분석</h3>
                        <p><strong>포기 위험도:</strong> ${result.analysis.dropout_risk}</p>
                        <p><strong>추천 난이도:</strong> ${result.analysis.recommended_difficulty}</p>
                        <p><strong>최근 성공률:</strong> ${(result.performance.success_rate * 100).toFixed(1)}%</p>
                        <p><strong>연속 성공:</strong> ${result.performance.streak}일</p>
                        <div style="background: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0;">
                            <strong>💬 AI 메시지:</strong><br>
                            ${result.ai_message}
                        </div>
                    `);
                } catch (error) {
                    showResult('오류: ' + error.message);
                }
            }
            
            function showResult(content) {
                const resultDiv = document.getElementById('result');
                resultDiv.innerHTML = content;
                resultDiv.style.display = 'block';
            }
        </script>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)