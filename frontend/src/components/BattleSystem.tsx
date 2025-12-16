import React, { useState, useEffect } from 'react';
import { Swords, Shield, Trophy } from 'lucide-react';

interface Monster {
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  sprite: string;
}

interface Player {
  level: number;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  stamina: number;
}

interface BattleSystemProps {
  player: Player;
  dungeon: {
    dungeonId: string;
    name: string;
    monsterStats: {
      hp: number;
      attack: number;
      defense: number;
    };
    expReward: number;
    bossType?: string;
    difficulty?: string;
    isLegendary?: boolean;
  };
  onBattleEnd: (result: { result: 'win' | 'lose'; expGained: number }) => void;
  onClose: () => void;
}

// 몬스터 정보 매핑
const getMonsterInfo = (dungeonName: string, bossType?: string) => {
  const monsterData: { [key: string]: { name: string; sprite: string; title?: string } } = {
    // 기본 몬스터
    goblin: { name: '고블린 족장', sprite: '👹' },
    orc: { name: '오크 대장', sprite: '👺' },
    troll: { name: '고대 트롤', sprite: '👹' },
    wolf: { name: '늑대 우두머리', sprite: '🐺' },
    spider: { name: '거대 거미', sprite: '🕷️' },
    bat: { name: '뱀파이어 박쥐', sprite: '🦇' },
    skeleton: { name: '해골 대장', sprite: '💀' },
    ghost: { name: '원령', sprite: '👻' },
    elemental: { name: '상급 정령', sprite: '🔥' },
    
    // 새로운 몬스터
    minotaur: { name: '미노타우로스', sprite: '🐂', title: '미궁의 수호자' },
    berserker: { name: '광전사', sprite: '⚔️' },
    giant: { name: '산악 거인', sprite: '🗿', title: '대지의 지배자' },
    hawk: { name: '거대 매', sprite: '🦅' },
    assassin: { name: '그림자 암살자', sprite: '🥷', title: '어둠의 칼날' },
    ranger: { name: '숲의 수호자', sprite: '🏹' },
    lich: { name: '리치', sprite: '🧙‍♂️', title: '불사의 마법사' },
    demon: { name: '상급 악마', sprite: '😈' },
    wizard: { name: '대마법사', sprite: '🧙‍♀️', title: '지식의 수호자' },
    knight: { name: '성기사', sprite: '🛡️' },
    angel: { name: '타락한 천사', sprite: '😇' },
    
    // 중급 보스
    dragon_young: { name: '어린 드래곤', sprite: '🐲', title: '화염의 군주' },
    vampire_lord: { name: '뱀파이어 로드', sprite: '🧛‍♂️', title: '밤의 지배자' },
    phoenix: { name: '불사조', sprite: '🔥', title: '재생의 화신' },
    kraken: { name: '크라켄', sprite: '🐙', title: '심연의 공포' },
    
    // 최종 보스 (절대 못 깨는)
    ancient_dragon: { name: '고대 드래곤', sprite: '🐉', title: '멸망의 화신' },
    demon_king: { name: '마왕', sprite: '👹', title: '지옥의 황제' },
    god_of_war: { name: '전쟁의 신', sprite: '⚡', title: '파괴의 신' },
    void_lord: { name: '공허의 군주', sprite: '🌌', title: '무의 지배자' },
    chaos_emperor: { name: '혼돈의 황제', sprite: '👑', title: '질서의 파괴자' },
    infinity_beast: { name: '무한의 야수', sprite: '🌟', title: '존재의 종말' }
  };

  if (bossType && monsterData[bossType]) {
    return monsterData[bossType];
  }

  // 던전 이름에서 추출
  if (dungeonName.includes('고블린')) return monsterData.goblin;
  if (dungeonName.includes('오크')) return monsterData.orc;
  if (dungeonName.includes('트롤')) return monsterData.troll;
  if (dungeonName.includes('늑대')) return monsterData.wolf;
  if (dungeonName.includes('슬라임')) return monsterData.spider;
  if (dungeonName.includes('해골')) return monsterData.skeleton;
  if (dungeonName.includes('드래곤')) return monsterData.dragon_young;

  return { name: '알 수 없는 몬스터', sprite: '👾' };
};

const BattleSystem: React.FC<BattleSystemProps> = ({ 
  player, 
  dungeon, 
  onBattleEnd, 
  onClose 
}) => {
  const [monster, setMonster] = useState<Monster>(() => {
    // 던전 이름에서 몬스터 타입 추출
    const monsterInfo = getMonsterInfo(dungeon.name, dungeon.bossType);
    return {
      name: monsterInfo.name,
      level: Math.max(1, player.level - 1 + Math.floor(Math.random() * 3)),
      hp: dungeon.monsterStats.hp,
      maxHp: dungeon.monsterStats.hp,
      attack: dungeon.monsterStats.attack,
      defense: dungeon.monsterStats.defense,
      sprite: monsterInfo.sprite
    };
  });

  const [playerHp, setPlayerHp] = useState(player.hp);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'monster'>('player');
  const [battlePhase, setBattlePhase] = useState<'intro' | 'battle' | 'result'>('intro');
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  function getMonsterSprite(dungeonId: string): string {
    if (dungeonId.includes('goblin')) return '👹';
    if (dungeonId.includes('orc')) return '👺';
    if (dungeonId.includes('dragon')) return '🐉';
    if (dungeonId.includes('slime')) return '🟢';
    if (dungeonId.includes('skeleton')) return '💀';
    return '👾';
  }

  const calculateDamage = (attacker: { attack: number }, defender: { defense: number }) => {
    const baseDamage = Math.max(1, attacker.attack - defender.defense);
    const randomFactor = Math.floor(Math.random() * 5) + 1; // 1-5
    return baseDamage + randomFactor;
  };

  const addLog = (message: string) => {
    setBattleLog(prev => [...prev.slice(-4), message]);
  };

  const playerAttack = () => {
    if (currentTurn !== 'player' || isAnimating) return;
    
    setIsAnimating(true);
    const damage = calculateDamage(player, monster);
    
    setTimeout(() => {
      setMonster(prev => ({
        ...prev,
        hp: Math.max(0, prev.hp - damage)
      }));
      
      addLog(`⚔️ ${damage} 데미지를 입혔습니다!`);
      
      if (monster.hp - damage <= 0) {
        setBattlePhase('result');
        setBattleResult('win');
        addLog('🎉 승리했습니다!');
      } else {
        setCurrentTurn('monster');
      }
      setIsAnimating(false);
    }, 500);
  };

  const monsterAttack = () => {
    if (currentTurn !== 'monster') return;
    
    setIsAnimating(true);
    const damage = calculateDamage(monster, player);
    
    setTimeout(() => {
      setPlayerHp(prev => Math.max(0, prev - damage));
      addLog(`💥 ${damage} 데미지를 받았습니다!`);
      
      if (playerHp - damage <= 0) {
        setBattlePhase('result');
        setBattleResult('lose');
        addLog('💀 패배했습니다...');
      } else {
        setCurrentTurn('player');
      }
      setIsAnimating(false);
    }, 1000);
  };

  useEffect(() => {
    if (currentTurn === 'monster' && battlePhase === 'battle') {
      const timer = setTimeout(monsterAttack, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentTurn, battlePhase]);

  const startBattle = () => {
    setBattlePhase('battle');
    addLog('⚔️ 전투가 시작되었습니다!');
  };

  const handleBattleEnd = () => {
    const expGained = battleResult === 'win' ? dungeon.expReward : 0;
    onBattleEnd({ result: battleResult!, expGained });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-yellow-50 rounded-lg p-6 max-w-2xl w-full border-4 border-yellow-600 max-h-[90vh] overflow-y-auto">
        
        {/* 전투 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-black mb-2 flex items-center justify-center gap-2">
            <Swords className="w-6 h-6 text-yellow-600" />
            {dungeon.name}
          </h2>
          
          {/* 던전 난이도 표시 */}
          {dungeon.difficulty && (
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
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
            </div>
          )}
          
          {/* 전설 던전 표시 */}
          {dungeon.isLegendary && (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-full text-sm font-bold mb-2 animate-pulse">
              ⭐ 전설의 던전 ⭐
            </div>
          )}
          
          <div className="bg-yellow-200 px-4 py-2 rounded border-2 border-yellow-400">
            <span className="text-sm font-bold text-black">
              레벨 {player.level} 모험가 vs 레벨 {monster.level} {monster.name}
            </span>
          </div>
        </div>

        {/* 전투 화면 */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* 플레이어 */}
          <div className="text-center">
            <div className="text-6xl mb-2">⚔️</div>
            <div className="bg-white rounded-lg p-3 border-2 border-yellow-400">
              <div className="font-bold text-black mb-2">모험가 (Lv.{player.level})</div>
              
              {/* HP 바 */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-black mb-1">
                  <span>HP</span>
                  <span>{playerHp} / {player.maxHp}</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-3 border border-red-400">
                  <div
                    className="bg-red-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(playerHp / player.maxHp) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 스탯 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Swords className="w-3 h-3 text-yellow-600" />
                  <span>{player.attack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-yellow-600" />
                  <span>{player.defense}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 몬스터 */}
          <div className="text-center">
            <div className={`text-6xl mb-2 transition-transform duration-300 ${
              isAnimating && currentTurn === 'monster' ? 'scale-110' : ''
            } ${dungeon.isLegendary ? 'animate-pulse' : ''}`}>
              {monster.sprite}
            </div>
            
            {/* 보스 타이틀 표시 */}
            {dungeon.bossType && getMonsterInfo(dungeon.name, dungeon.bossType).title && (
              <div className="text-xs text-red-600 font-bold mb-1">
                {getMonsterInfo(dungeon.name, dungeon.bossType).title}
              </div>
            )}
            
            <div className={`bg-white rounded-lg p-3 border-2 ${
              dungeon.isLegendary ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-red-50' : 'border-red-400'
            }`}>
              <div className="font-bold text-black mb-2 flex items-center justify-center gap-1">
                {dungeon.isLegendary && <span className="text-purple-600">👑</span>}
                {monster.name} (Lv.{monster.level})
                {dungeon.isLegendary && <span className="text-purple-600">👑</span>}
              </div>
              
              {/* HP 바 */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-black mb-1">
                  <span>HP</span>
                  <span>{monster.hp} / {monster.maxHp}</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-3 border border-red-400">
                  <div
                    className="bg-red-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(monster.hp / monster.maxHp) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* 스탯 */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <Swords className="w-3 h-3 text-red-600" />
                  <span>{monster.attack}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-red-600" />
                  <span>{monster.defense}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 전투 로그 */}
        <div className="bg-black rounded-lg p-4 mb-4 h-24 overflow-y-auto">
          {battleLog.map((log, index) => (
            <div key={index} className="text-yellow-400 text-sm font-mono">
              {log}
            </div>
          ))}
        </div>

        {/* 전투 컨트롤 */}
        {battlePhase === 'intro' && (
          <div className="text-center space-y-4">
            <div className="bg-yellow-100 p-4 rounded border-2 border-yellow-300">
              <p className="text-black">
                <strong>{monster.name}</strong>이(가) 나타났다!<br/>
                전투를 시작하시겠습니까?
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={startBattle}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2"
              >
                <Swords className="w-5 h-5" />
                전투 시작
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-yellow-200 hover:bg-yellow-300 text-black font-bold py-3 px-4 rounded"
              >
                도망가기
              </button>
            </div>
          </div>
        )}

        {battlePhase === 'battle' && (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-sm text-black mb-2">
                {currentTurn === 'player' ? '당신의 턴입니다!' : '몬스터가 공격 준비 중...'}
              </div>
              {currentTurn === 'player' && (
                <button
                  onClick={playerAttack}
                  disabled={isAnimating}
                  className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white font-bold py-3 px-6 rounded flex items-center justify-center gap-2 mx-auto"
                >
                  <Swords className="w-5 h-5" />
                  공격하기
                </button>
              )}
            </div>
          </div>
        )}

        {battlePhase === 'result' && (
          <div className="text-center space-y-4">
            <div className={`p-6 rounded-lg border-4 ${
              battleResult === 'win' 
                ? 'bg-yellow-100 border-yellow-400' 
                : 'bg-red-100 border-red-400'
            }`}>
              <div className="text-6xl mb-4">
                {battleResult === 'win' ? '🎉' : '💀'}
              </div>
              <h3 className="text-2xl font-bold text-black mb-2">
                {battleResult === 'win' ? '승리!' : '패배...'}
              </h3>
              <p className="text-black">
                {battleResult === 'win' 
                  ? `${dungeon.expReward} 경험치를 획득했습니다!`
                  : '다음에는 더 강해져서 도전하세요!'
                }
              </p>
            </div>
            
            <button
              onClick={handleBattleEnd}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              결과 확인
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BattleSystem;