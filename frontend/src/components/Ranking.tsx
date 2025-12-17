import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, MapPin, Footprints, X } from 'lucide-react';
import { rankingAPI } from '../services/api';

interface RankingEntry {
  rank: number;
  email: string;
  level: number;
  exp: number;
  totalWalkDistance: number;
  walkingExp: number;
  equippedCostumes: {
    head?: string;
    body?: string;
    weapon?: string;
    accessory?: string;
  };
}

interface RankingProps {
  onClose: () => void;
}

const Ranking: React.FC<RankingProps> = ({ onClose }) => {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [selectedType, setSelectedType] = useState<'level' | 'walkDistance' | 'walkingExp'>('level');
  const [isLoading, setIsLoading] = useState(true);

  const rankingTypes = [
    { id: 'level', name: '레벨 랭킹', icon: <Trophy className="w-5 h-5" />, color: 'bg-yellow-500' },
    { id: 'walkDistance', name: '걷기 랭킹', icon: <MapPin className="w-5 h-5" />, color: 'bg-green-500' },
    { id: 'walkingExp', name: '걷기 경험치 랭킹', icon: <Footprints className="w-5 h-5" />, color: 'bg-blue-500' }
  ];

  useEffect(() => {
    loadRankings();
  }, [selectedType]);

  const loadRankings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/ranking`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // 선택된 타입에 따라 적절한 랭킹 데이터 설정
        let rankingData = [];
        switch (selectedType) {
          case 'level':
            rankingData = data.levelRanking || [];
            break;
          case 'walkDistance':
            rankingData = data.walkRanking || [];
            break;
          case 'walkingExp':
            rankingData = data.walkingExpRanking || [];
            break;
        }
        setRankings(rankingData);
      }
    } catch (error) {
      console.error('랭킹 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-400';
      case 2:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400';
      case 3:
        return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-400';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const formatValue = (entry: RankingEntry) => {
    switch (selectedType) {
      case 'level':
        return `레벨 ${entry.level} (${entry.exp} EXP)`;
      case 'walkDistance':
        return `${(entry.totalWalkDistance / 1000).toFixed(2)} km`;
      case 'walkingExp':
        return `${entry.walkingExp.toLocaleString()} 걷기 경험치`;
      default:
        return '';
    }
  };

  const getCostumeIcon = (costumeId: string | undefined) => {
    const costumeIcons: { [key: string]: string } = {
      'warrior_helmet': '⛑️',
      'mage_hat': '🎩',
      'crown_of_kings': '👑',
      'leather_armor': '🦺',
      'steel_armor': '🛡️',
      'dragon_scale_armor': '🐲',
      'iron_sword': '⚔️',
      'magic_staff': '🪄',
      'excalibur': '🗡️',
      'power_ring': '💍',
      'health_amulet': '🔮',
      'infinity_pendant': '✨'
    };
    return costumeId ? costumeIcons[costumeId] || '❓' : '';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-yellow-600 animate-spin mx-auto mb-4" />
            <p className="text-black font-bold">랭킹 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="bg-yellow-400 p-6 border-b-4 border-yellow-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-black" />
              <div>
                <h2 className="text-2xl font-bold text-black">랭킹</h2>
                <p className="text-black text-sm">최고의 플레이어들을 확인해보세요!</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-yellow-600 hover:bg-yellow-700 text-white p-2 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 랭킹 타입 탭 */}
        <div className="bg-yellow-100 p-4 border-b-2 border-yellow-300">
          <div className="flex gap-2 overflow-x-auto">
            {rankingTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap ${
                  selectedType === type.id
                    ? `${type.color} text-white`
                    : 'bg-white text-black hover:bg-yellow-200'
                }`}
              >
                {type.icon}
                {type.name}
              </button>
            ))}
          </div>
        </div>

        {/* 랭킹 목록 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-3">
            {rankings.map((entry, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getRankBg(entry.rank)} transition-all hover:shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-gray-300">
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div>
                      <div className="font-bold text-black text-lg">{entry.email}</div>
                      <div className="text-sm text-gray-600">{formatValue(entry)}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* 장착된 코스튬 표시 */}
                    <div className="flex gap-1">
                      {entry.equippedCostumes.head && (
                        <span className="text-lg" title="머리 장비">
                          {getCostumeIcon(entry.equippedCostumes.head)}
                        </span>
                      )}
                      {entry.equippedCostumes.body && (
                        <span className="text-lg" title="몸 장비">
                          {getCostumeIcon(entry.equippedCostumes.body)}
                        </span>
                      )}
                      {entry.equippedCostumes.weapon && (
                        <span className="text-lg" title="무기">
                          {getCostumeIcon(entry.equippedCostumes.weapon)}
                        </span>
                      )}
                      {entry.equippedCostumes.accessory && (
                        <span className="text-lg" title="액세서리">
                          {getCostumeIcon(entry.equippedCostumes.accessory)}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-gray-500">레벨 {entry.level}</div>
                      <div className="text-xs text-gray-400">
                        {(entry.totalWalkDistance / 1000).toFixed(1)}km
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rankings.length === 0 && (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">아직 랭킹 데이터가 없습니다.</p>
            </div>
          )}
        </div>

        {/* 하단 정보 */}
        <div className="bg-gray-50 p-4 border-t-2 border-gray-200">
          <div className="text-center text-sm text-gray-600">
            <p>💡 더 많이 걷고, 던전을 클리어하여 랭킹을 올려보세요!</p>
            <p className="mt-1">🏆 상위 랭커들의 장비를 참고해보세요!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ranking;