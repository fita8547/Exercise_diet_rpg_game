import React, { useState } from 'react';
import { Brain, Activity, Target, TrendingUp, Zap } from 'lucide-react';
import { aiAPI } from '../services/api';

interface BodyAnalysisData {
  height: number;
  weight: number;
  activityLevel: 'low' | 'moderate' | 'high';
  goal: 'strength' | 'maintenance' | 'habit' | 'endurance';
}

interface AnalysisResult {
  bodyType: 'warrior' | 'mage' | 'archer' | 'paladin';
  playStyle: string;
  recommendations: string[];
  statBonus: {
    hp: number;
    attack: number;
    defense: number;
    stamina: number;
  };
}

interface AIBodyAnalysisProps {
  onAnalysisComplete: (result: AnalysisResult) => void;
  onClose: () => void;
}

const AIBodyAnalysis: React.FC<AIBodyAnalysisProps> = ({ onAnalysisComplete, onClose }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BodyAnalysisData>({
    height: 170,
    weight: 70,
    activityLevel: 'moderate',
    goal: 'maintenance'
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBodyType = (data: BodyAnalysisData): AnalysisResult => {
    const bmi = data.weight / ((data.height / 100) ** 2);
    
    // AI 분석 로직 (체중 우열 판단 없이 상태 유형만 분류)
    let bodyType: AnalysisResult['bodyType'] = 'warrior';
    let playStyle = '';
    let recommendations: string[] = [];
    let statBonus = { hp: 0, attack: 0, defense: 0, stamina: 0 };

    // 활동량과 목표에 따른 플레이 스타일 결정
    if (data.goal === 'strength') {
      bodyType = 'warrior';
      playStyle = '전사형 - 근력 중심의 강력한 모험가';
      recommendations = [
        '근력 운동 퀘스트에서 추가 보상을 받습니다',
        '던전에서 높은 공격력을 발휘할 수 있습니다',
        '무거운 장비를 착용할 수 있는 체력을 가지고 있습니다'
      ];
      statBonus = { hp: 20, attack: 15, defense: 10, stamina: 5 };
    } else if (data.goal === 'endurance') {
      bodyType = 'archer';
      playStyle = '궁수형 - 지구력과 정확성의 달인';
      recommendations = [
        '걷기와 유산소 운동에서 뛰어난 성과를 보입니다',
        '장거리 이동 시 스태미나 소모가 적습니다',
        '연속 전투에서 지속력을 발휘합니다'
      ];
      statBonus = { hp: 10, attack: 5, defense: 5, stamina: 25 };
    } else if (data.goal === 'habit') {
      bodyType = 'mage';
      playStyle = '마법사형 - 지혜로운 습관의 마스터';
      recommendations = [
        '꾸준한 활동으로 마법력(경험치)을 축적합니다',
        '작은 운동도 큰 효과로 변환시킵니다',
        '규칙적인 패턴으로 안정적인 성장을 이룹니다'
      ];
      statBonus = { hp: 15, attack: 10, defense: 15, stamina: 10 };
    } else {
      bodyType = 'paladin';
      playStyle = '성기사형 - 균형잡힌 올라운더';
      recommendations = [
        '모든 종류의 운동에서 안정적인 성과를 보입니다',
        '팀 플레이와 개인 플레이 모두 뛰어납니다',
        '지속 가능한 건강한 라이프스타일을 추구합니다'
      ];
      statBonus = { hp: 15, attack: 10, defense: 10, stamina: 15 };
    }

    // 활동량에 따른 보너스 조정
    const activityMultiplier = {
      low: 0.8,
      moderate: 1.0,
      high: 1.2
    }[data.activityLevel];

    Object.keys(statBonus).forEach(key => {
      statBonus[key as keyof typeof statBonus] = Math.floor(
        statBonus[key as keyof typeof statBonus] * activityMultiplier
      );
    });

    return { bodyType, playStyle, recommendations, statBonus };
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      // 실제 API 호출
      const result = await aiAPI.analyzeBody(data);
      onAnalysisComplete(result);
    } catch (error) {
      console.error('AI 분석 실패:', error);
      // 오프라인 모드에서는 로컬 분석 사용
      const result = analyzeBodyType(data);
      onAnalysisComplete(result);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getBodyTypeIcon = (type: string) => {
    switch (type) {
      case 'warrior': return '⚔️';
      case 'mage': return '🔮';
      case 'archer': return '🏹';
      case 'paladin': return '🛡️';
      default: return '⚔️';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full border-4 border-yellow-400 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 mb-6">
          <Brain className="w-8 h-8 text-yellow-600" />
          <h2 className="text-2xl font-bold text-black">AI 몸 상태 분석</h2>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-yellow-100 p-3 rounded border-2 border-yellow-300">
              <p className="text-sm text-black">
                <strong>🤖 AI 분석 안내</strong><br/>
                체중의 우열을 판단하지 않고, 당신에게 맞는 플레이 스타일을 찾아드립니다.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                키 (cm)
              </label>
              <input
                type="number"
                value={data.height}
                onChange={(e) => setData({...data, height: parseInt(e.target.value) || 170})}
                className="w-full px-3 py-2 border-2 border-yellow-300 rounded focus:border-yellow-500 focus:outline-none"
                min="100"
                max="250"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-black mb-2">
                몸무게 (kg)
              </label>
              <input
                type="number"
                value={data.weight}
                onChange={(e) => setData({...data, weight: parseInt(e.target.value) || 70})}
                className="w-full px-3 py-2 border-2 border-yellow-300 rounded focus:border-yellow-500 focus:outline-none"
                min="30"
                max="200"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded"
            >
              다음 단계
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-3">
                <Activity className="w-4 h-4 inline mr-2" />
                일일 활동량
              </label>
              <div className="space-y-2">
                {[
                  { value: 'low', label: '낮음', desc: '주로 앉아서 생활, 가벼운 활동' },
                  { value: 'moderate', label: '보통', desc: '적당한 운동, 일상적인 활동' },
                  { value: 'high', label: '높음', desc: '규칙적인 운동, 활발한 생활' }
                ].map(option => (
                  <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="activity"
                      value={option.value}
                      checked={data.activityLevel === option.value}
                      onChange={(e) => setData({...data, activityLevel: e.target.value as any})}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-black">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-yellow-200 hover:bg-yellow-300 text-black font-bold py-3 px-4 rounded"
              >
                이전
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-black mb-3">
                <Target className="w-4 h-4 inline mr-2" />
                플레이 목표
              </label>
              <div className="space-y-2">
                {[
                  { value: 'strength', label: '체력 강화', desc: '근력과 파워 향상에 집중', icon: '💪' },
                  { value: 'endurance', label: '지구력 향상', desc: '스태미나와 지속력 개발', icon: '🏃' },
                  { value: 'habit', label: '습관 개선', desc: '꾸준한 운동 습관 만들기', icon: '📅' },
                  { value: 'maintenance', label: '현재 상태 유지', desc: '균형잡힌 건강 관리', icon: '⚖️' }
                ].map(option => (
                  <label key={option.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="goal"
                      value={option.value}
                      checked={data.goal === option.value}
                      onChange={(e) => setData({...data, goal: e.target.value as any})}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-bold text-black">
                        {option.icon} {option.label}
                      </div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-yellow-200 hover:bg-yellow-300 text-black font-bold py-3 px-4 rounded"
              >
                이전
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    AI 분석 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    분석 시작
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-black font-bold py-2 px-4 rounded text-sm"
        >
          나중에 하기
        </button>
      </div>
    </div>
  );
};

export default AIBodyAnalysis;