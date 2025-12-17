import React, { useState, useEffect } from 'react';
import { Swords, Play, Pause, AlertCircle, Trophy, Zap, Heart, Shield, LogOut, Brain, Crown, ShoppingBag, Medal } from 'lucide-react';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { characterAPI, encounterAPI, battleAPI } from '../services/api';
import { Character } from '../types';
import AIBodyAnalysis from './AIBodyAnalysis';
import BattleSystem from './BattleSystem';
import GameMap from './GameMap';
import DungeonShowcase from './DungeonShowcase';
import CostumeShop from './CostumeShop';
import Ranking from './Ranking';

interface RPGLocationSystemProps {
  onLogout: () => void;
  userEmail: string;
}

// RPG 캐릭터 상태 계산 (로컬용)
const calculateLocalRPGStats = (distance: number) => {
  const exp = Math.floor(distance / 10);
  const level = Math.floor(exp / 100) + 1;
  const currentExp = exp % 100;
  const nextLevelExp = 100;
  const hp = 100 + (level - 1) * 20;
  const atk = 10 + (level - 1) * 5;
  const def = 5 + (level - 1) * 3;
  
  return { exp, level, currentExp, nextLevelExp, hp, atk, def };
};

// 유틸리티 함수
const getBodyTypeIcon = (type: string) => {
  switch (type) {
    case 'warrior': return '⚔️';
    case 'mage': return '🔮';
    case 'archer': return '🏹';
    case 'paladin': return '🛡️';
    default: return '⚔️';
  }
};

const RPGLocationSystem: React.FC<RPGLocationSystemProps> = ({ onLogout, userEmail }) => {
  const {
    isTracking,
    permission,
    totalDistance,
    error,
    isSubmitting,
    startTracking,
    stopTracking,
    resetDistance
  } = useLocationTracker();

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState(true);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showBattle, setShowBattle] = useState(false);
  const [selectedDungeon, setSelectedDungeon] = useState<any>(null);
  const [nearbyDungeons, setNearbyDungeons] = useState<any[]>([]);
  const [bodyAnalysisResult, setBodyAnalysisResult] = useState<any>(null);
  const [encounterGauge, setEncounterGauge] = useState(0);
  const [randomEncounter, setRandomEncounter] = useState<any>(null);
  const [showRandomBattle, setShowRandomBattle] = useState(false);
  const [showDungeonShowcase, setShowDungeonShowcase] = useState(false);
  const [showCostumeShop, setShowCostumeShop] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [showDungeonList, setShowDungeonList] = useState(false);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // 서버에서 캐릭터 정보 가져오기
  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        const isDemoAccount = userEmail === 'demo@demo.com';
        if (isDemoAccount) {
          // 데모 계정용 기본 캐릭터 생성
          const demoCharacter: Character = {
            level: 1,
            exp: 0,
            requiredExp: 100,
            currentRegion: 'demo_region',
            lastActiveDate: new Date().toISOString(),
            stats: {
              hp: 100,
              attack: 10,
              defense: 5,
              stamina: 50
            }
          };
          setCharacter(demoCharacter);
          setIsLoadingCharacter(false);
          return;
        }

        const response = await characterAPI.getCharacter();
        setCharacter(response.character);
      } catch (error) {
        console.error('캐릭터 정보 로드 실패:', error);
      } finally {
        setIsLoadingCharacter(false);
      }
    };

    fetchCharacter();
  }, [userEmail]);

  // 캐릭터 정보 새로고침 (걸은 거리 업데이트 시)
  const refreshCharacter = async () => {
    if (userEmail === 'demo@demo.com') return;
    
    try {
      const response = await characterAPI.getCharacter();
      setCharacter(response.character);
    } catch (error) {
      console.error('캐릭터 정보 새로고침 실패:', error);
    }
  };

  // 걸은 거리가 변경될 때마다 캐릭터 정보 새로고침
  useEffect(() => {
    console.log(`🚶 현재 세션 걸은 거리: ${totalDistance}m`);
    console.log(`🏃 총 걸은 거리: ${(character?.totalWalkDistance || 0) + totalDistance}m`);
    
    if (totalDistance > 0 && totalDistance % 100 === 0) { // 100m마다
      console.log('🔄 100m 달성! 캐릭터 정보 새로고침 예약');
      setTimeout(() => refreshCharacter(), 2000); // 2초 후 새로고침
    }
  }, [totalDistance, userEmail]);

  // 던전 정보 로드
  useEffect(() => {
    const loadDungeons = async () => {
      console.log('🔍 던전 로딩 시작 - userEmail:', userEmail);
      console.log('🔍 현재 토큰:', localStorage.getItem('token') ? '있음' : '없음');
      const isDemoAccount = userEmail === 'demo@demo.com';
      console.log('🔍 데모 계정 여부:', isDemoAccount);
      
      if (isDemoAccount) {
        // 데모 계정 - 고블린 동굴만 열어주고 나머지는 로그인 필요
        const demoDungeons = [
          // 고블린 동굴만 접근 가능
          { dungeonId: 'goblin_cave_1', name: '고블린 동굴', requiredLevel: 1, requiredDistance: 0, monsterStats: { hp: 50, attack: 8, defense: 2 }, expReward: 25, canEnter: true, difficulty: 'easy', bossType: 'goblin' },
          
          // 나머지는 로그인 필요
          { dungeonId: 'slime_forest_1', name: '슬라임 숲', requiredLevel: 1, requiredDistance: 400, monsterStats: { hp: 30, attack: 5, defense: 1 }, expReward: 15, canEnter: false, difficulty: 'easy', bossType: 'spider', needsLogin: true },
          { dungeonId: 'orc_fortress_1', name: '오크 요새', requiredLevel: 3, requiredDistance: 800, monsterStats: { hp: 120, attack: 15, defense: 5 }, expReward: 75, canEnter: false, difficulty: 'normal', bossType: 'orc', needsLogin: true },
          { dungeonId: 'skeleton_tomb_1', name: '해골 무덤', requiredLevel: 5, requiredDistance: 1200, monsterStats: { hp: 200, attack: 25, defense: 8 }, expReward: 150, canEnter: false, difficulty: 'normal', bossType: 'skeleton', needsLogin: true },
          { dungeonId: 'wolf_den_1', name: '늑대 굴', requiredLevel: 4, requiredDistance: 1000, monsterStats: { hp: 150, attack: 20, defense: 3 }, expReward: 100, canEnter: false, difficulty: 'normal', bossType: 'wolf', needsLogin: true },
          { dungeonId: 'troll_bridge_1', name: '트롤 다리', requiredLevel: 8, requiredDistance: 2000, monsterStats: { hp: 300, attack: 35, defense: 12 }, expReward: 200, canEnter: false, difficulty: 'hard', bossType: 'troll', needsLogin: true }
        ];
        console.log('🎮 데모 계정: 고블린 동굴만 접근 가능, 나머지는 로그인 필요');
        console.log('🎮 데모 던전 수:', demoDungeons.length);
        setNearbyDungeons(demoDungeons);
        return;
      }

      // 서버에서 던전 정보 가져오기 (모든 던전 표시, 걷기 거리 기준 잠금)
      try {
        console.log('🌐 서버에서 던전 정보 요청 중...');
        const response = await battleAPI.getDungeons();
        console.log('🏰 서버 응답:', response);
        console.log('🏰 서버에서 받은 던전 수:', response.dungeons?.length || 0);
        console.log('🚶 총 걸은 거리:', response.totalWalkDistance || 0, 'm');
        
        if (response.dungeons && Array.isArray(response.dungeons)) {
          setNearbyDungeons(response.dungeons);
          console.log('✅ 던전 목록 설정 완료:', response.dungeons.length, '개');
        } else {
          console.error('❌ 던전 데이터가 올바르지 않음:', response);
          setNearbyDungeons([]);
        }
      } catch (error) {
        console.error('❌ 던전 정보 로드 실패:', error);
        // 서버 연결 실패 시 기본 던전들 표시
        const fallbackDungeons = [
          { dungeonId: 'goblin_cave_1', name: '고블린 동굴', requiredLevel: 1, requiredDistance: 0, monsterStats: { hp: 50, attack: 8, defense: 2 }, expReward: 25, canEnter: true },
          { dungeonId: 'orc_fortress_1', name: '오크 요새', requiredLevel: 3, requiredDistance: 800, monsterStats: { hp: 120, attack: 15, defense: 5 }, expReward: 75, canEnter: false }
        ];
        console.log('🔄 폴백 던전 사용:', fallbackDungeons.length, '개');
        setNearbyDungeons(fallbackDungeons);
      }
    };

    loadDungeons();
  }, [userEmail]);

  // 조우 게이지 로드
  useEffect(() => {
    const loadEncounterGauge = async () => {
      const isDemoAccount = userEmail === 'demo@demo.com';
      if (isDemoAccount) {
        // 데모 계정은 기본 게이지 0으로 시작
        setEncounterGauge(0);
        return;
      }

      try {
        const response = await encounterAPI.getGauge();
        setEncounterGauge(response.currentGauge);
      } catch (error) {
        console.error('조우 게이지 로드 실패:', error);
      }
    };

    loadEncounterGauge();
  }, [userEmail]);

  // 이동 거리 변화 감지하여 몬스터 조우 체크
  useEffect(() => {
    const checkEncounter = async () => {
      if (totalDistance > 0 && totalDistance % 100 === 0) { // 100m마다 체크
        const isDemoAccount = userEmail === 'demo@demo.com';
        if (isDemoAccount) {
          // 오프라인 모드
          const newGauge = Math.min(100, encounterGauge + 10);
          setEncounterGauge(newGauge);
          
          if (newGauge >= 100) {
            // 랜덤 몬스터 조우
            const monsters = [
              { name: '들쥐', level: 1, hp: 30, attack: 5, defense: 1 },
              { name: '고블린', level: 2, hp: 50, attack: 8, defense: 2 },
              { name: '늑대', level: 3, hp: 80, attack: 12, defense: 4 }
            ];
            const monster = monsters[Math.floor(Math.random() * monsters.length)];
            setRandomEncounter(monster);
            setShowRandomBattle(true);
            setEncounterGauge(0);
          }
          return;
        }

        try {
          const response = await encounterAPI.checkEncounter(100);
          setEncounterGauge(response.encounterGauge);
          
          if (response.encounterTriggered) {
            setRandomEncounter(response.monster);
            setShowRandomBattle(true);
          }
        } catch (error) {
          console.error('조우 체크 실패:', error);
        }
      }
    };

    checkEncounter();
  }, [totalDistance, encounterGauge, userEmail]);

  // 로컬 스탯 계산
  const localStats = calculateLocalRPGStats(totalDistance);
  const stats = character || {
    level: localStats.level,
    exp: localStats.exp,
    stats: {
      hp: localStats.hp,
      attack: localStats.atk,
      defense: localStats.def,
      stamina: 50 + (localStats.level - 1) * 10
    }
  };

  // 퀘스트 완료 체크
  useEffect(() => {
    if (totalDistance >= 1000 && !questCompleted) {
      setQuestCompleted(true);
      setTimeout(() => setQuestCompleted(false), 5000);
    }
  }, [totalDistance, questCompleted]);

  useEffect(() => {
    if (permission === 'prompt') {
      setShowPermissionModal(true);
    }
  }, [permission]);

  const handleRequestPermission = () => {
    setShowPermissionModal(false);
    startTracking();
  };

  const handleDenyPermission = () => {
    setShowPermissionModal(false);
  };

  const handleAIAnalysisComplete = (result: any) => {
    setBodyAnalysisResult(result);
    setShowAIAnalysis(false);
    
    const isDemoAccount = userEmail === 'demo@demo.com';
    if (isDemoAccount) {
      // 데모 계정은 AI 분석 결과를 임시로만 저장
      if (character) {
        const updatedCharacter = {
          ...character,
          stats: {
            hp: character.stats.hp + result.statBonus.hp,
            attack: character.stats.attack + result.statBonus.attack,
            defense: character.stats.defense + result.statBonus.defense,
            stamina: character.stats.stamina + result.statBonus.stamina
          }
        };
        setCharacter(updatedCharacter);
      }
    }
  };

  const handleBattleStart = (dungeon: any) => {
    if (dungeon.needsLogin) {
      setShowLoginPrompt(true);
      return;
    }
    
    // 거리 미달 시 전투 불가
    if (!dungeon.canEnter) {
      const totalWalked = (character?.totalWalkDistance || 0) + totalDistance;
      const requiredDistance = (dungeon.requiredDistance / 1000).toFixed(1);
      const currentDistance = (totalWalked / 1000).toFixed(1);
      const remainingDistance = (Math.max(0, dungeon.requiredDistance - totalWalked) / 1000).toFixed(1);
      alert(`이 던전에 입장하려면 ${requiredDistance}km를 걸어야 합니다.\n현재 걸은 거리: ${currentDistance}km\n남은 거리: ${remainingDistance}km`);
      return;
    }
    
    setSelectedDungeon(dungeon);
    setShowBattle(true);
  };



  const handleBattleEnd = (result: { result: 'win' | 'lose'; expGained: number; coinsGained?: number }) => {
    setShowBattle(false);
    setShowRandomBattle(false);
    
    if (result.result === 'win' && character) {
      const newExp = character.exp + result.expGained;
      const requiredExp = character.level * 100;
      
      let newLevel = character.level;
      let finalExp = newExp;
      
      if (newExp >= requiredExp) {
        newLevel += 1;
        finalExp = newExp - requiredExp;
      }
      
      const updatedCharacter = {
        ...character,
        level: newLevel,
        exp: finalExp,
        coins: ((character as any).coins || 0) + (result.coinsGained || 0),
        stats: newLevel > character.level ? {
          hp: character.stats.hp + 20,
          attack: character.stats.attack + 3,
          defense: character.stats.defense + 2,
          stamina: character.stats.stamina + 10
        } : character.stats
      };
      
      setCharacter(updatedCharacter);
      
      // 승리 보상 알림
      if (result.coinsGained && result.coinsGained > 0) {
        setTimeout(() => {
          alert(`🎉 승리! ${result.expGained} EXP와 ${result.coinsGained} 코인을 획득했습니다!`);
        }, 500);
      }
      
      const isDemoAccount = userEmail === 'demo@demo.com';
      if (isDemoAccount) {
        // 데모 계정은 캐릭터 정보를 임시로만 저장
        console.log('데모 계정 캐릭터 업데이트:', updatedCharacter);
      }
    }
  };

  const handleRandomBattleStart = () => {
    if (randomEncounter) {
      const dungeonData = {
        dungeonId: 'random_encounter',
        name: `야생의 ${randomEncounter.name}`,
        monsterStats: {
          hp: randomEncounter.hp,
          attack: randomEncounter.attack,
          defense: randomEncounter.defense
        },
        expReward: randomEncounter.level * 15
      };
      setSelectedDungeon(dungeonData);
      setShowBattle(true);
    }
  };

  if (isLoadingCharacter) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Swords className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
          <p className="text-black font-bold">캐릭터 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 던전 쇼케이스 표시
  if (showDungeonShowcase) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDungeonShowcase(false)}
          className="fixed top-4 right-4 z-50 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
        >
          ← 게임으로 돌아가기
        </button>
        <DungeonShowcase />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-yellow-50 p-4">
      {/* 권한 요청 모달 */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-4 border-yellow-400">
            <div className="flex items-center gap-3 mb-4">
              <Swords className="w-8 h-8 text-yellow-600" />
              <h2 className="text-2xl font-bold text-black">모험을 시작하시겠습니까?</h2>
            </div>
            <p className="text-black mb-4">
              걸으면서 경험치를 획득하고 레벨업하세요!
              GPS를 통해 실제 이동 거리를 측정하여 캐릭터를 성장시킬 수 있습니다.
            </p>
            <div className="bg-yellow-100 p-3 rounded mb-4 border-2 border-yellow-300">
              <p className="text-sm text-black">
                <strong>용사여!</strong> 위치 정보는 기기에만 저장되며, 
                배터리 소모를 최소화하도록 마법진이 설계되었습니다.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRequestPermission}
                className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 px-4 rounded"
              >
                모험 시작!
              </button>
              <button
                onClick={handleDenyPermission}
                className="flex-1 bg-yellow-200 hover:bg-yellow-300 text-black font-bold py-3 px-4 rounded"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 퀘스트 완료 알림 */}
      {questCompleted && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 border-4 border-yellow-600 rounded-lg p-4 shadow-lg z-40 animate-bounce">
          <div className="flex items-center gap-2 text-black font-bold">
            <Trophy className="w-6 h-6" />
            퀘스트 완료! 1km 걷기 달성!
          </div>
        </div>
      )}

      {/* 헤더 */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-yellow-400 rounded-lg p-6 mb-6 border-4 border-yellow-600">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Swords className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold text-black">
                  워킹 RPG 어드벤처
                </h1>
                <p className="text-black text-sm">{userEmail}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRanking(true)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded"
                title="랭킹"
              >
                <Medal className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowCostumeShop(true)}
                className="bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                title="코스튬 상점"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowDungeonShowcase(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded"
                title="전체 던전 보기"
              >
                <Crown className="w-5 h-5" />
              </button>
              <button
                onClick={onLogout}
                className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded"
                title="로그아웃"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-black">걸으면서 레벨업하고 강해지는 운동 RPG!</p>
        </div>

        {/* 오류 메시지 */}
        {error && (
          <div className="bg-yellow-200 border-2 border-yellow-600 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
            <p className="text-black">{error}</p>
          </div>
        )}

        {/* 권한 거부 안내 */}
        {permission === 'denied' && (
          <div className="bg-yellow-200 border-2 border-yellow-600 rounded-lg p-4 mb-6">
            <p className="text-black mb-2">
              <strong>위치 권한이 거부되었습니다.</strong>
            </p>
            <p className="text-sm text-black">
              브라우저 설정에서 위치 권한을 허용하거나,
              수동 모드로 운동을 기록할 수 있습니다.
            </p>
          </div>
        )}

        {/* 캐릭터 스탯 카드 */}
        <div className="bg-white rounded-lg p-6 mb-6 border-4 border-yellow-400">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                <Swords className="w-6 h-6 text-yellow-600" />
                레벨 {stats.level} {bodyAnalysisResult ? bodyAnalysisResult.playStyle.split(' - ')[0] : '워킹 워리어'}
              </h2>
              {bodyAnalysisResult && (
                <p className="text-sm text-gray-600 mt-1">
                  {bodyAnalysisResult.playStyle.split(' - ')[1]}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isTracking && (
                <div className="flex items-center gap-2 bg-yellow-100 px-3 py-1 rounded-full border-2 border-yellow-300">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                  <span className="text-sm font-bold text-black">모험 중</span>
                </div>
              )}
              {isSubmitting && (
                <div className="bg-yellow-200 px-2 py-1 rounded text-xs text-black">
                  전송 중...
                </div>
              )}
            </div>
          </div>

          {/* 경험치 바 */}
          {character && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-black mb-1">
                <span>EXP</span>
                <span>{character.exp} / {character.level * 100}</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-4 border-2 border-yellow-400">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(character.exp / (character.level * 100)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 스탯 */}
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-xs text-black">체력</div>
                <div className="text-lg font-bold text-black">{stats.stats.hp}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-xs text-black">공격력</div>
                <div className="text-lg font-bold text-black">{stats.stats.attack}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-xs text-black">방어력</div>
                <div className="text-lg font-bold text-black">{stats.stats.defense}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-xs text-black">코인</div>
                <div className="text-lg font-bold text-black">{((character as any)?.coins || 0).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>



        {/* 현재 퀘스트 */}
        <div className="bg-white rounded-lg p-4 mb-6 border-4 border-yellow-400">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <h3 className="font-bold text-black">진행 중인 퀘스트</h3>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm text-black mb-1">
                <span>⚔️ 첫 걸음: 1km 걷기</span>
                <span>{Math.min(100, (totalDistance / 1000) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-3 border-2 border-yellow-300">
                <div
                  className="bg-yellow-400 h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (totalDistance / 1000) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>



        {/* 지도 및 던전 버튼 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <GameMap
            totalWalkDistance={(character?.totalWalkDistance || 0) + totalDistance}
            nearbyDungeons={nearbyDungeons}
          />

          <div className="bg-white rounded-lg p-4 border-4 border-yellow-400">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-black">던전 탐험</h3>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => setShowDungeonList(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-4 rounded-lg flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" />
                  <span>근처 던전 목록</span>
                </div>
                <div className="bg-yellow-600 px-3 py-1 rounded-full text-sm">
                  {nearbyDungeons.length}개
                </div>
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-green-50 p-3 rounded border border-green-200 text-center">
                  <div className="text-sm text-green-600 font-bold">입장 가능</div>
                  <div className="text-lg font-bold text-green-700">
                    {nearbyDungeons.filter(d => d.canEnter).length}개
                  </div>
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-200 text-center">
                  <div className="text-sm text-red-600 font-bold">잠금됨</div>
                  <div className="text-lg font-bold text-red-700">
                    {nearbyDungeons.filter(d => !d.canEnter && !d.needsLogin).length}개
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <div className="text-xs text-gray-600 text-center">
                  더 많은 던전을 해금하려면 더 걸어보세요!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI 분석 */}
        {!bodyAnalysisResult && (
          <div className="bg-yellow-100 rounded-lg p-4 mb-6 border-2 border-yellow-300">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-black">AI 몸 상태 분석</h3>
            </div>
            <p className="text-sm text-black mb-3">
              당신에게 맞는 플레이 스타일을 찾아 맞춤형 보너스를 받으세요!
            </p>
            <button
              onClick={() => setShowAIAnalysis(true)}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
            >
              AI 분석 시작하기
            </button>
          </div>
        )}

        {bodyAnalysisResult && (
          <div className="bg-white rounded-lg p-4 mb-6 border-4 border-yellow-400">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-yellow-600" />
              <h3 className="font-bold text-black">AI 분석 결과</h3>
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200 mb-3">
              <div className="font-bold text-black mb-2">
                {getBodyTypeIcon(bodyAnalysisResult.bodyType)} {bodyAnalysisResult.playStyle}
              </div>
              <div className="text-sm text-black space-y-1">
                {bodyAnalysisResult.recommendations.map((rec: string, index: number) => (
                  <div key={index}>• {rec}</div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 컨트롤 버튼 */}
        <div className="space-y-3">
          {!isTracking ? (
            <button
              onClick={startTracking}
              disabled={permission === 'denied'}
              className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-yellow-200 disabled:cursor-not-allowed text-black font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 border-4 border-yellow-600 text-lg"
            >
              <Play className="w-6 h-6" />
              모험 시작하기
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-3 border-4 border-yellow-800 text-lg"
            >
              <Pause className="w-6 h-6" />
              모험 일시정지
            </button>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                resetDistance();
                // 서버의 걷기 거리도 초기화
                if (userEmail !== 'demo@demo.com') {
                  fetch('/api/location/reset', {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    }
                  }).then(() => {
                    console.log('✅ 서버 걷기 거리 초기화 완료');
                    // 던전 목록 다시 로드
                    window.location.reload();
                  }).catch(err => {
                    console.error('❌ 서버 걷기 거리 초기화 실패:', err);
                  });
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded border-2 border-red-700 text-sm"
            >
              🔄 전체 초기화
            </button>
            {bodyAnalysisResult && (
              <button
                onClick={() => setShowAIAnalysis(true)}
                className="bg-yellow-300 hover:bg-yellow-400 text-black font-bold py-2 px-4 rounded border-2 border-yellow-500 text-sm"
              >
                AI 재분석
              </button>
            )}
          </div>
        </div>

        {/* RPG 안내 */}
        <div className="mt-6 bg-white rounded-lg p-4 border-2 border-yellow-300">
          <h3 className="font-bold text-black mb-2">⚔️ 게임 가이드</h3>
          <ul className="text-sm text-black space-y-1">
            <li>• 10m 걸을 때마다 1 경험치를 획득합니다</li>
            <li>• 100m마다 서버에 자동으로 걷기 운동이 기록됩니다</li>
            <li>• 던전에서 몬스터를 물리치면 대량의 경험치를 얻습니다</li>
            <li>• AI 분석으로 당신만의 플레이 스타일을 발견하세요</li>
            <li>• 레벨업 시 체력, 공격력, 방어력이 증가합니다</li>
            <li>• 야외에서 사용하면 GPS 정확도가 높아집니다</li>
          </ul>
        </div>
      </div>

      {/* AI 분석 모달 */}
      {showAIAnalysis && (
        <AIBodyAnalysis
          onAnalysisComplete={handleAIAnalysisComplete}
          onClose={() => setShowAIAnalysis(false)}
        />
      )}

      {/* 랜덤 조우 알림 */}
      {showRandomBattle && randomEncounter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-4 border-red-400">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-black mb-4">몬스터 조우!</h2>
              <div className="bg-red-100 p-4 rounded border-2 border-red-300 mb-4">
                <div className="text-lg font-bold text-black">{randomEncounter.name}</div>
                <div className="text-sm text-gray-600">
                  레벨 {randomEncounter.level} | HP: {randomEncounter.hp}
                </div>
              </div>
              <p className="text-black mb-6">
                야생의 {randomEncounter.name}이(가) 갑자기 나타났습니다!
                전투를 시작하시겠습니까?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRandomBattleStart}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded"
                >
                  전투 시작!
                </button>
                <button
                  onClick={() => setShowRandomBattle(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded"
                >
                  도망가기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 전투 시스템 모달 */}
      {showBattle && selectedDungeon && character && (
        <BattleSystem
          player={{
            level: character.level,
            hp: character.stats.hp,
            maxHp: character.stats.hp,
            attack: character.stats.attack,
            defense: character.stats.defense,
            stamina: character.stats.stamina
          }}
          dungeon={selectedDungeon}
          onBattleEnd={handleBattleEnd}
          onClose={() => {
            setShowBattle(false);
            setShowRandomBattle(false);
          }}
        />
      )}

      {/* 코스튬 상점 */}
      {showCostumeShop && (
        <CostumeShop onClose={() => setShowCostumeShop(false)} />
      )}

      {/* 랭킹 */}
      {showRanking && (
        <Ranking onClose={() => setShowRanking(false)} />
      )}

      {/* 던전 목록 팝업 */}
      {showDungeonList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* 헤더 */}
            <div className="bg-yellow-400 p-6 border-b-4 border-yellow-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-black" />
                  <div>
                    <h2 className="text-2xl font-bold text-black">근처 던전 목록</h2>
                    <p className="text-black text-sm">총 {nearbyDungeons.length}개의 던전을 발견했습니다</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDungeonList(false)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 던전 목록 */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nearbyDungeons.map(dungeon => (
                  <div
                    key={dungeon.dungeonId}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      dungeon.canEnter 
                        ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100 hover:border-yellow-400' 
                        : dungeon.needsLogin
                        ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 hover:border-blue-400'
                        : 'bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400'
                    }`}
                    onClick={() => {
                      setShowDungeonList(false);
                      handleBattleStart(dungeon);
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-black text-lg mb-1">{dungeon.name}</div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            dungeon.difficulty === 'easy' ? 'bg-green-200 text-green-800' :
                            dungeon.difficulty === 'normal' ? 'bg-blue-200 text-blue-800' :
                            dungeon.difficulty === 'hard' ? 'bg-orange-200 text-orange-800' :
                            dungeon.difficulty === 'very_hard' ? 'bg-red-200 text-red-800' :
                            'bg-purple-200 text-purple-800'
                          }`}>
                            {dungeon.difficulty === 'easy' ? '쉬움' :
                             dungeon.difficulty === 'normal' ? '보통' :
                             dungeon.difficulty === 'hard' ? '어려움' :
                             dungeon.difficulty === 'very_hard' ? '매우 어려움' :
                             '악몽'}
                          </span>
                          {dungeon.isLegendary && (
                            <span className="px-2 py-1 rounded text-xs font-bold bg-purple-200 text-purple-800">
                              ⭐ 전설
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-3xl">
                        {dungeon.canEnter ? '⚔️' : dungeon.needsLogin ? '🔐' : '🚶‍♂️'}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {dungeon.needsLogin ? (
                        <div className="text-sm text-blue-600 font-bold">
                          🔐 로그인 후 이용 가능
                        </div>
                      ) : dungeon.canEnter ? (
                        <div className="space-y-1">
                          <div className="text-sm text-green-600 font-bold">
                            ✅ 입장 가능!
                          </div>
                          <div className="text-sm text-gray-600">
                            레벨 {dungeon.requiredLevel} | 보상: {dungeon.expReward} EXP + {Math.floor(dungeon.expReward / 5) + 10} 코인
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {(() => {
                            const totalWalked = (character?.totalWalkDistance || 0) + totalDistance;
                            return (
                              <div className="space-y-2">
                                <div className="text-sm text-red-600 font-bold">
                                  🚶‍♂️ 더 걸어야 해금됩니다
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>🚶 필요: {(dungeon.requiredDistance / 1000).toFixed(1)}km</div>
                                  <div>📍 현재: {(totalWalked / 1000).toFixed(1)}km</div>
                                </div>
                                <div className="text-xs text-center text-gray-600">
                                  남은 거리: {Math.max(0, (dungeon.requiredDistance - totalWalked) / 1000).toFixed(1)}km
                                </div>
                                
                                {/* 진행률 바 */}
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                  <div
                                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                                    style={{ 
                                      width: `${Math.min(100, (totalWalked / dungeon.requiredDistance) * 100)}%` 
                                    }}
                                  ></div>
                                </div>
                                <div className="text-center text-xs text-gray-600">
                                  진행률: {Math.min(100, Math.round((totalWalked / dungeon.requiredDistance) * 100))}%
                                </div>
                                
                                <div className="text-xs text-gray-600">
                                  🎁 보상: {dungeon.expReward} EXP + {Math.floor(dungeon.expReward / 5) + 10} 코인
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {nearbyDungeons.length === 0 && (
                <div className="text-center py-12">
                  <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">근처에 던전이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 로그인 필요 팝업 */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-4 border-blue-400">
            <div className="text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-black mb-4">로그인이 필요합니다</h2>
              <div className="bg-blue-100 p-4 rounded border-2 border-blue-300 mb-4">
                <p className="text-black mb-2">
                  <strong>더 많은 던전을 탐험하려면 로그인하세요!</strong>
                </p>
                <p className="text-sm text-gray-600">
                  • 21개의 다양한 던전 탐험<br/>
                  • 캐릭터 진행 상황 저장<br/>
                  • AI 몸 상태 분석<br/>
                  • 전설의 보스 도전<br/>
                  • 코스튬 상점 이용<br/>
                  • 랭킹 시스템 참여
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowLoginPrompt(false);
                    onLogout(); // 로그인 화면으로 돌아가기
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded"
                >
                  로그인하러 가기
                </button>
                <button
                  onClick={() => setShowLoginPrompt(false)}
                  className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded"
                >
                  나중에
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RPGLocationSystem;