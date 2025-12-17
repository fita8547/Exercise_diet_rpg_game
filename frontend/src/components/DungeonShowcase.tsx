import React from 'react';
import { Swords, Shield, Trophy, Crown, Skull, Clock, MapPin } from 'lucide-react';

interface Dungeon {
  dungeonId: string;
  name: string;
  requiredWalkTime: number; // 분 단위
  requiredDistance: number; // 미터 단위
  monsterStats: {
    hp: number;
    attack: number;
    defense: number;
  };
  expReward: number;
  difficulty: string;
  bossType: string;
  isLegendary?: boolean;
  description?: string;
}

const DungeonShowcase: React.FC = () => {
  const dungeons: Dungeon[] = [
    // 초급 던전 (즉시~30분)
    { dungeonId: 'goblin_cave_1', name: '고블린 동굴', requiredWalkTime: 0, requiredDistance: 0, monsterStats: { hp: 50, attack: 8, defense: 2 }, expReward: 25, difficulty: 'easy', bossType: 'goblin' },
    { dungeonId: 'slime_forest_1', name: '슬라임 숲', requiredWalkTime: 5, requiredDistance: 400, monsterStats: { hp: 30, attack: 5, defense: 1 }, expReward: 15, difficulty: 'easy', bossType: 'spider' },
    { dungeonId: 'orc_fortress_1', name: '오크 요새', requiredWalkTime: 10, requiredDistance: 800, monsterStats: { hp: 120, attack: 15, defense: 5 }, expReward: 75, difficulty: 'normal', bossType: 'orc' },
    { dungeonId: 'skeleton_tomb_1', name: '해골 무덤', requiredWalkTime: 15, requiredDistance: 1200, monsterStats: { hp: 200, attack: 25, defense: 8 }, expReward: 150, difficulty: 'normal', bossType: 'skeleton' },
    { dungeonId: 'wolf_den_1', name: '늑대 굴', requiredWalkTime: 12, requiredDistance: 1000, monsterStats: { hp: 150, attack: 20, defense: 3 }, expReward: 100, difficulty: 'normal', bossType: 'wolf' },
    { dungeonId: 'troll_bridge_1', name: '트롤 다리', requiredWalkTime: 25, requiredDistance: 2000, monsterStats: { hp: 300, attack: 35, defense: 12 }, expReward: 200, difficulty: 'hard', bossType: 'troll' },

    // 중급 던전 (30분~2시간)
    { dungeonId: 'minotaur_labyrinth_1', name: '미노타우로스 미궁', requiredWalkTime: 35, requiredDistance: 2800, monsterStats: { hp: 400, attack: 40, defense: 15 }, expReward: 350, difficulty: 'hard', bossType: 'minotaur' },
    { dungeonId: 'assassin_hideout_1', name: '암살자 은신처', requiredWalkTime: 45, requiredDistance: 3600, monsterStats: { hp: 300, attack: 55, defense: 8 }, expReward: 400, difficulty: 'hard', bossType: 'assassin' },
    { dungeonId: 'wizard_tower_1', name: '마법사의 탑', requiredWalkTime: 60, requiredDistance: 4800, monsterStats: { hp: 350, attack: 60, defense: 10 }, expReward: 500, difficulty: 'very_hard', bossType: 'wizard' },
    { dungeonId: 'giant_mountain_1', name: '거인의 산', requiredWalkTime: 90, requiredDistance: 7200, monsterStats: { hp: 600, attack: 45, defense: 20 }, expReward: 600, difficulty: 'very_hard', bossType: 'giant' },

    // 고급 던전 (2시간~5시간)
    { dungeonId: 'young_dragon_lair_1', name: '어린 드래곤의 둥지', requiredWalkTime: 120, requiredDistance: 9600, monsterStats: { hp: 800, attack: 70, defense: 25 }, expReward: 1000, difficulty: 'very_hard', bossType: 'dragon_young' },
    { dungeonId: 'vampire_castle_1', name: '뱀파이어 성', requiredWalkTime: 180, requiredDistance: 14400, monsterStats: { hp: 750, attack: 65, defense: 20 }, expReward: 1200, difficulty: 'very_hard', bossType: 'vampire_lord' },
    { dungeonId: 'phoenix_nest_1', name: '불사조의 둥지', requiredWalkTime: 240, requiredDistance: 19200, monsterStats: { hp: 700, attack: 80, defense: 18 }, expReward: 1500, difficulty: 'nightmare', bossType: 'phoenix' },
    { dungeonId: 'kraken_depths_1', name: '크라켄의 심연', requiredWalkTime: 300, requiredDistance: 24000, monsterStats: { hp: 900, attack: 75, defense: 30 }, expReward: 1800, difficulty: 'nightmare', bossType: 'kraken' },

    // 전설의 최종 던전 (10시간~100시간)
    { dungeonId: 'ancient_dragon_sanctum', name: '고대 드래곤 성역', requiredWalkTime: 600, requiredDistance: 48000, monsterStats: { hp: 2000, attack: 150, defense: 50 }, expReward: 5000, difficulty: 'nightmare', bossType: 'ancient_dragon', isLegendary: true, description: '전설 속의 고대 드래곤이 잠들어 있는 성역' },
    { dungeonId: 'demon_king_throne', name: '마왕의 왕좌', requiredWalkTime: 1200, requiredDistance: 96000, monsterStats: { hp: 2500, attack: 180, defense: 60 }, expReward: 8000, difficulty: 'nightmare', bossType: 'demon_king', isLegendary: true, description: '지옥의 마왕이 군림하는 어둠의 왕좌' },
    { dungeonId: 'war_god_arena', name: '전쟁신의 투기장', requiredWalkTime: 2400, requiredDistance: 192000, monsterStats: { hp: 5000, attack: 350, defense: 120 }, expReward: 12000, difficulty: 'nightmare', bossType: 'god_of_war', isLegendary: true, description: '전쟁의 신이 직접 상대하는 신성한 투기장 - 절대적 강자' },
    { dungeonId: 'void_lord_dimension', name: '공허군주의 차원', requiredWalkTime: 3600, requiredDistance: 288000, monsterStats: { hp: 6000, attack: 400, defense: 140 }, expReward: 15000, difficulty: 'nightmare', bossType: 'void_lord', isLegendary: true, description: '공허의 군주가 지배하는 무의 차원 - 현실을 초월한 존재' },
    { dungeonId: 'chaos_emperor_palace', name: '혼돈황제의 궁전', requiredWalkTime: 4800, requiredDistance: 384000, monsterStats: { hp: 8000, attack: 450, defense: 160 }, expReward: 20000, difficulty: 'nightmare', bossType: 'chaos_emperor', isLegendary: true, description: '혼돈의 황제가 현실을 왜곡시키는 궁전 - 질서의 파괴자' },
    { dungeonId: 'infinity_beast_realm', name: '무한야수의 영역', requiredWalkTime: 6000, requiredDistance: 480000, monsterStats: { hp: 10000, attack: 500, defense: 200 }, expReward: 50000, difficulty: 'nightmare', bossType: 'infinity_beast', isLegendary: true, description: '전설 속에서만 존재한다는 궁극의 던전 - 무한의 힘을 가진 야수' }
  ];

  const getBossInfo = (bossType: string) => {
    const bossData: { [key: string]: { name: string; sprite: string; title?: string } } = {
      goblin: { name: '고블린 족장', sprite: '👹' },
      orc: { name: '오크 대장', sprite: '👺' },
      troll: { name: '고대 트롤', sprite: '👹' },
      wolf: { name: '늑대 우두머리', sprite: '🐺' },
      spider: { name: '거대 거미', sprite: '🕷️' },
      skeleton: { name: '해골 대장', sprite: '💀' },
      minotaur: { name: '미노타우로스', sprite: '🐂', title: '미궁의 수호자' },
      assassin: { name: '그림자 암살자', sprite: '🥷', title: '어둠의 칼날' },
      wizard: { name: '대마법사', sprite: '🧙‍♀️', title: '지식의 수호자' },
      giant: { name: '산악 거인', sprite: '🗿', title: '대지의 지배자' },
      dragon_young: { name: '어린 드래곤', sprite: '🐲', title: '화염의 군주' },
      vampire_lord: { name: '뱀파이어 로드', sprite: '🧛‍♂️', title: '밤의 지배자' },
      phoenix: { name: '불사조', sprite: '🔥', title: '재생의 화신' },
      kraken: { name: '크라켄', sprite: '🐙', title: '심연의 공포' },
      ancient_dragon: { name: '고대 드래곤', sprite: '🐉', title: '멸망의 화신' },
      demon_king: { name: '마왕', sprite: '👹', title: '지옥의 황제' },
      god_of_war: { name: '전쟁의 신', sprite: '⚡', title: '파괴의 신' },
      void_lord: { name: '공허의 군주', sprite: '🌌', title: '무의 지배자' },
      chaos_emperor: { name: '혼돈의 황제', sprite: '👑', title: '질서의 파괴자' },
      infinity_beast: { name: '무한의 야수', sprite: '🌟', title: '존재의 종말' }
    };
    return bossData[bossType] || { name: '알 수 없는 보스', sprite: '👾' };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-200 text-green-800 border-green-300';
      case 'normal': return 'bg-blue-200 text-blue-800 border-blue-300';
      case 'hard': return 'bg-orange-200 text-orange-800 border-orange-300';
      case 'very_hard': return 'bg-red-200 text-red-800 border-red-300';
      case 'nightmare': return 'bg-purple-200 text-purple-800 border-purple-300';
      default: return 'bg-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '쉬움';
      case 'normal': return '보통';
      case 'hard': return '어려움';
      case 'very_hard': return '매우 어려움';
      case 'nightmare': return '악몽';
      default: return '알 수 없음';
    }
  };

  const formatWalkTime = (minutes: number) => {
    if (minutes === 0) return '즉시 해금';
    if (minutes < 60) return `${minutes}분 걷기`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours}시간 걷기`;
    return `${hours}시간 ${remainingMinutes}분 걷기`;
  };

  const formatDistance = (meters: number) => {
    if (meters === 0) return '';
    if (meters < 1000) return `${meters}m`;
    const km = (meters / 1000).toFixed(1);
    return `${km}km`;
  };

  const renderDungeonCard = (dungeon: Dungeon) => {
    const boss = getBossInfo(dungeon.bossType);
    const isLegendary = dungeon.isLegendary;

    return (
      <div key={dungeon.dungeonId} className={`rounded-lg p-6 shadow-lg border-4 ${
        isLegendary 
          ? 'bg-gradient-to-br from-purple-100 to-red-100 border-purple-500 relative overflow-hidden' 
          : 'bg-white border-yellow-400'
      }`}>
        
        {/* 전설 효과 */}
        {isLegendary && (
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-purple-400/20 animate-pulse"></div>
        )}
        
        <div className="relative z-10">
          <div className="text-center mb-4">
            <div className={`text-4xl mb-2 ${isLegendary ? 'animate-bounce' : ''}`}>
              {boss.sprite}
            </div>
            <h3 className={`text-xl font-bold text-black flex items-center justify-center gap-1 ${isLegendary ? 'text-purple-800' : ''}`}>
              {isLegendary && <Crown className="w-5 h-5 text-purple-600" />}
              {dungeon.name}
              {isLegendary && <Crown className="w-5 h-5 text-purple-600" />}
            </h3>
            {boss.title && (
              <div className={`text-xs font-bold mt-1 ${isLegendary ? 'text-purple-700' : 'text-orange-600'}`}>
                {boss.title}
              </div>
            )}
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mt-2 border-2 ${
              isLegendary 
                ? 'bg-gradient-to-r from-yellow-400 to-purple-600 text-white animate-pulse' 
                : getDifficultyColor(dungeon.difficulty)
            }`}>
              {isLegendary ? '⭐ 전설 ⭐' : getDifficultyText(dungeon.difficulty)}
            </div>
          </div>
          
          <div className="space-y-2 text-sm">
            {/* 해금 조건 */}
            <div className="flex justify-between items-center bg-green-50 p-2 rounded border">
              <span className="font-bold flex items-center gap-1">
                <Clock className="w-3 h-3 text-green-600" />
                해금 조건:
              </span>
              <span className="text-green-700 font-bold">
                {formatWalkTime(dungeon.requiredWalkTime)}
              </span>
            </div>
            
            {/* 필요 거리 */}
            {dungeon.requiredDistance > 0 && (
              <div className="flex justify-between items-center bg-blue-50 p-2 rounded border">
                <span className="font-bold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600" />
                  필요 거리:
                </span>
                <span className="text-blue-700 font-bold">
                  {formatDistance(dungeon.requiredDistance)}
                </span>
              </div>
            )}
            
            {/* 보스 정보 */}
            <div className="flex justify-between">
              <span className="font-bold">보스:</span>
              <span className={isLegendary ? 'text-purple-700 font-bold' : ''}>{boss.name}</span>
            </div>
            
            {/* 스탯 정보 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex justify-between items-center">
                <span className="font-bold flex items-center gap-1">
                  <Swords className="w-3 h-3" />
                  공격:
                </span>
                <span className={`font-bold ${isLegendary ? 'text-red-700 text-lg' : ''}`}>
                  {dungeon.monsterStats.attack}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  방어:
                </span>
                <span className={`font-bold ${isLegendary ? 'text-blue-700 text-lg' : ''}`}>
                  {dungeon.monsterStats.defense}
                </span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-bold flex items-center gap-1">
                <Skull className="w-3 h-3" />
                체력:
              </span>
              <span className={`font-bold ${isLegendary ? 'text-red-700 text-lg' : ''}`}>
                {dungeon.monsterStats.hp.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="font-bold flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                경험치:
              </span>
              <span className={`font-bold ${isLegendary ? 'text-green-700 text-lg' : 'text-green-600'}`}>
                {dungeon.expReward.toLocaleString()}
              </span>
            </div>
            
            {/* 전설 던전 설명 */}
            {dungeon.description && (
              <div className="mt-3 p-2 bg-black/20 rounded text-xs italic">
                {dungeon.description}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-yellow-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-4 flex items-center justify-center gap-3">
            <Swords className="w-10 h-10 text-yellow-600" />
            🏰 전체 던전 목록 🏰
            <Swords className="w-10 h-10 text-yellow-600" />
          </h1>
          <p className="text-lg text-gray-700">총 21개의 던전 - 걷기 시간에 따라 해금되는 모험!</p>
          <div className="bg-yellow-200 p-4 rounded-lg mt-4 border-2 border-yellow-400">
            <p className="text-black font-bold">💡 이제 레벨이 아닌 걷기 시간으로 던전이 해금됩니다!</p>
            <p className="text-sm text-gray-700 mt-1">더 많이 걸을수록 더 강력한 던전에 도전할 수 있어요!</p>
          </div>
        </div>

        {/* 초급 던전 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            🌱 초급 던전 (즉시~30분 걷기)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dungeons.slice(0, 6).map(renderDungeonCard)}
          </div>
        </div>

        {/* 중급 던전 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            ⚔️ 중급 던전 (30분~2시간 걷기)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dungeons.slice(6, 10).map(renderDungeonCard)}
          </div>
        </div>

        {/* 고급 던전 */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-black mb-6 flex items-center gap-2">
            🔥 고급 던전 (2시간~5시간 걷기) - 중급 보스
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dungeons.slice(10, 14).map(renderDungeonCard)}
          </div>
        </div>

        {/* 전설의 최종 던전 */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-black mb-6 flex items-center gap-2">
            <Crown className="w-8 h-8 text-purple-600" />
            👑 전설의 최종 던전 (10시간~100시간 걷기) - 절대 못 깨는 보스들 👑
            <Crown className="w-8 h-8 text-purple-600" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dungeons.slice(14).map(renderDungeonCard)}
          </div>
        </div>

        {/* 통계 요약 */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-center">
          <h3 className="text-2xl font-bold text-black mb-4">🎮 던전 통계</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-black">
            <div>
              <div className="text-3xl font-bold">21</div>
              <div className="text-sm">총 던전 수</div>
            </div>
            <div>
              <div className="text-3xl font-bold">6</div>
              <div className="text-sm">전설 보스</div>
            </div>
            <div>
              <div className="text-3xl font-bold">0~100시간</div>
              <div className="text-sm">걷기 시간 범위</div>
            </div>
            <div>
              <div className="text-3xl font-bold">480km</div>
              <div className="text-sm">최대 거리</div>
            </div>
          </div>
          
          <div className="mt-6 bg-black/20 rounded-lg p-4">
            <h4 className="font-bold mb-2">🚶‍♂️ 걷기 시간별 해금 던전</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>• 즉시: 고블린 동굴</div>
              <div>• 5분: 슬라임 숲</div>
              <div>• 1시간: 마법사의 탑</div>
              <div>• 2시간: 어린 드래곤의 둥지</div>
              <div>• 10시간: 고대 드래곤 성역</div>
              <div>• 100시간: 무한야수의 영역</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DungeonShowcase;